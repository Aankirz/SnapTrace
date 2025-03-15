require("dotenv").config();
const express = require("express");
const amqp = require("amqplib");
const neo4j = require("neo4j-driver");
const axios = require("axios");
const pLimit = require("p-limit").default; // Limit concurrent requests
const limit = pLimit(1);


const app = express();
const PORT = process.env.PORT || 4000;

// Connect to Neo4j
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
const session = driver.session();

async function processMessage(message, channel) {
    await limit(async () => {
        try {
            const rawLog = JSON.parse(message.content.toString());
            console.log("🟢 Received Raw Log:", rawLog);

            // **STEP 1: Convert log to the required format**
            const logData = transformLogFormat(rawLog);
            console.log("🔄 Converted Log Format:", logData);

            const { 
                source_ip, destination_ip, protocol, source_port, destination_port,
                packets, bytes_transferred, flags, duration, classification, device_info, received_at 
            } = logData;

            // **Check if the source IP already exists in Neo4j**
            const result = await session.run(
                `MATCH (s:Source {ip: $source_ip}) RETURN s`,
                { source_ip }
            );

            let aiAnalysis;
            if (result.records.length > 0) {
                console.log(`✅ Existing Threat Found in Neo4j: ${source_ip}`);
                aiAnalysis = { classification: "known", description: "Previously identified threat.", recommended_actions: ["Monitor traffic"] };
            } else {
                console.log(`🚨 New Threat Detected: Sending to LLM API`);

                // **STEP 2: Format Log Data for LLM API**
                const formattedLogData = `
                - Source IP: ${source_ip}
                - Destination IP: ${destination_ip}
                - Protocol: ${protocol}
                - Source Port: ${source_port}
                - Destination Port: ${destination_port}
                - Packets: ${packets}
                - Bytes Transferred: ${bytes_transferred}
                - Flags: ${flags.length > 0 ? flags.join(", ") : "None"}
                - Duration: ${duration} seconds
                - Class: ${classification}
                - Device Info:
                    - Hostname: ${device_info.hostname}
                    - OS: ${device_info.os}
                    - Agent Version: ${device_info.agent_version}
                `;

                // **STEP 3: Send Data to LLM API**
                const response = await axios.post(process.env.LLM_API, { log_data: formattedLogData });
                const rawOutput = response.data.response;

                // ✅ **STEP 4: Parse LLM Output**
                console.log("🔍 LLM Response:", rawOutput);

                const classificationMatch = rawOutput.match(/### Classification:\s*(.*)/);
                const classificationResult = classificationMatch ? classificationMatch[1].trim() : "unknown";

                // **Extract recommended actions**
                const recommendedActions = [];
                const actionsMatch = rawOutput.match(/recommended security measures:\s*(.*)/s);
                if (actionsMatch) {
                    recommendedActions.push(...actionsMatch[1].split("\n").map(action => action.trim()));
                }

                // Ensure recommended actions are not empty
                if (recommendedActions.length === 0) {
                    recommendedActions.push("Monitor traffic"); // Fallback in case LLM fails
                }

                aiAnalysis = {
                    classification: classificationResult,
                    description: `Analyzed by LLM: ${classificationResult}`,
                    recommended_actions: recommendedActions
                };

                // ✅ **STEP 5: Store in Neo4j**
                console.log(`📌 Storing in Neo4j: ${source_ip}, Classification: ${classificationResult}`);

                await session.run(
                    `MERGE (s:Source {ip: $source_ip})
                    ON CREATE SET s.threat_level = $classification, s.description = $description
                    RETURN s`,
                    { source_ip, classification: aiAnalysis.classification, description: aiAnalysis.description }
                );
            }

            // ✅ **STEP 6: Publish Enriched Threat Data to `incident_queue`**
            const enrichedData = { 
                source_ip, 
                destination_ip, 
                protocol, 
                classification: aiAnalysis.classification, 
                recommended_actions: aiAnalysis.recommended_actions 
            };

            await channel.assertQueue("incident_queue", { durable: true });
            channel.sendToQueue("incident_queue", Buffer.from(JSON.stringify(enrichedData)));

            console.log(`✅ Sent enriched data to incident_queue:`, enrichedData);
        } catch (error) {
        console.error("❌ Error processing message:", error);
        }
    });
}

function transformLogFormat(rawLog) {
    return {
        source_ip: rawLog["Source IP"] || "Unknown",
        destination_ip: rawLog["Destination IP"] || "Unknown",
        protocol: rawLog["Protocol"] || "Unknown",
        source_port: Number(rawLog["Source Port"]) || 0,
        destination_port: Number(rawLog["Destination Port"]) || 0,
        packets: Number(rawLog["Packets"]) || 0,
        bytes_transferred: rawLog["Bytes Transferred"] || "0.0M",
        flags: rawLog["Flags"] ? rawLog["Flags"].split(",") : [],
        duration: Number(rawLog["Duration"]) || 0,
        classification: rawLog["Class"] || "Unknown",
        device_info: rawLog["device_info"] || {
            device_id: "Unknown",
            hostname: "Unknown",
            ip_address: "Unknown",
            os: "Unknown",
            agent_version: "Unknown"
        },
        received_at: rawLog["received_at"] || new Date().toISOString()
    };
}

async function startRabbitMQ() {
    try {
        const conn = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await conn.createChannel();

        const queue = "security_logs";
        await channel.assertQueue(queue, { durable: true });

        console.log(`📡 Waiting for messages in ${queue}`);
        channel.consume(queue, (message) => {
            processMessage(message, channel);
            channel.ack(message);
        });
    } catch (error) {
        console.error("❌ RabbitMQ Connection Error:", error);
    }
}

app.listen(PORT, async () => {
    console.log(`Threat Detection Service running on port ${PORT}`);
    await startRabbitMQ();
});
