require("dotenv").config();
const express = require("express");
const amqp = require("amqplib");
const neo4j = require("neo4j-driver");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 4000;

// Connect to Neo4j
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
const session = driver.session();

async function processMessage(message, channel) {
    try {
        const logData = JSON.parse(message.content.toString());
        console.log("🟢 Received Log:", logData);

        const { source_ip, destination_ip, protocol, source_port, destination_port } = logData;

        // Check if the source IP already exists in Neo4j
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

            // **STEP 1: Format Log Data as Input for LLM API**
            const formattedLogData = `
            - Source IP: ${source_ip}
            - Destination IP: ${destination_ip}
            - Protocol: ${protocol}
            - Source Port: ${source_port}
            - Destination Port: ${destination_port}
            - Packets: ${logData.packets}
            - Bytes Transferred: ${logData.bytes_transferred}
            - Flags: ${logData.flags.join(", ")}
            - Duration: ${logData.duration} seconds
            - Class: Unknown
            `;

            // **STEP 2: Send Formatted Log to LLM API**
            const response = await axios.post(process.env.LLM_API, { log_data: formattedLogData });
            const rawOutput = response.data.response;

            // ✅ **STEP 3: Parse LLM Output for Classification & Recommendations**
            console.log("🔍 LLM Response:", rawOutput);

            const classificationMatch = rawOutput.match(/### Classification:\s*(.*)/);
            const classification = classificationMatch ? classificationMatch[1].trim() : "unknown";

            const reasonMatch = rawOutput.match(/Here's the detailed analysis:\s*(.*)/s);
            const reason = reasonMatch ? reasonMatch[1].trim() : "No details available.";

            const recommendedActions = [];
            const actionsMatch = rawOutput.match(/recommended security measures:\s*(.*)/s);
            if (actionsMatch) {
                recommendedActions.push(...actionsMatch[1].split("\n").map(action => action.trim()));
            }

            aiAnalysis = {
                classification,
                description: reason,
                recommended_actions: recommendedActions.length ? recommendedActions : ["Monitor traffic"]
            };

            // ✅ **STEP 4: Store in Neo4j**
            await session.run(
                `CREATE (s:Source {ip: $source_ip, threat_level: $classification, description: $description})`,
                {
                    source_ip,
                    classification: aiAnalysis.classification,
                    description: aiAnalysis.description
                }
            );

            console.log("✅ Stored in Neo4j:", aiAnalysis);
        }

        // ✅ **STEP 5: Publish enriched threat data to `incident_queue`**
        const enrichedData = {
            source_ip,
            destination_ip,
            protocol,
            classification: aiAnalysis.classification,
            recommended_actions: aiAnalysis.recommended_actions
        };

        const incidentQueue = "incident_queue";
        await channel.assertQueue(incidentQueue, { durable: true });
        channel.sendToQueue(incidentQueue, Buffer.from(JSON.stringify(enrichedData)));

        console.log(`✅ Sent enriched data to ${incidentQueue}:`, enrichedData);
    } catch (error) {
        console.error("❌ Error processing message:", error);
    }
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
