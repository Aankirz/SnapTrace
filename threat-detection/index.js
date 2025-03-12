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

async function processMessage(message) {
    try {
        const logData = JSON.parse(message.content.toString());
        console.log("Received Log:", logData);

        const { source_ip, destination_ip, protocol, source_port, destination_port } = logData;

        // Step 1: Check if source already exists in Neo4j
        const result = await session.run(
            `MATCH (s:Source {ip: $source_ip}) RETURN s`,
            { source_ip }
        );

        if (result.records.length > 0) {
            console.log(`Existing Threat Found: ${source_ip}`);
        } else {
            console.log(`New Threat: Sending to LLM API`);

            // Step 2: Send Data to LLM
            const response = await axios.post(process.env.LLM_API, logData);
            const aiAnalysis = response.data;

            // Step 3: Store in Neo4j
            await session.run(
                `CREATE (s:Source {ip: $source_ip, threat_level: $threat_level, description: $desc})`,
                {
                    source_ip,
                    threat_level: aiAnalysis.threat_level || "unknown",
                    desc: aiAnalysis.description || "No details"
                }
            );

            console.log("Stored in Neo4j:", aiAnalysis);
        }
    } catch (error) {
        console.error("Error processing message:", error);
    }
}

async function startRabbitMQ() {
    try {
        const conn = await amqp.connect(process.env.RABBITMQ_URL);
        const channel = await conn.createChannel();

        const queue = "security_logs";
        await channel.assertQueue(queue, { durable: true });

        console.log(`Waiting for messages in ${queue}`);
        channel.consume(queue, (message) => {
            processMessage(message);
            channel.ack(message);
        });
    } catch (error) {
        console.error("RabbitMQ Connection Error:", error);
    }
}

app.listen(PORT, async () => {
    console.log(`Threat Detection Service running on port ${PORT}`);
    await startRabbitMQ();
});
