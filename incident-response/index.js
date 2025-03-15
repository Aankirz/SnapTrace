require("dotenv").config();
const express = require("express");
const amqp = require("amqplib");
const neo4j = require("neo4j-driver");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Store the latest response for API access
let latestSecurityResponse = {
  "LLM Security Analysis": {
    analysis: {
      source_ip: "",
      destination_ip: "",
      protocol: "",
      classification: "No data yet",
      recommended_actions: ["Waiting for data"]
    }
  },
  "Neo4j Graph Insights": {
    "Critical Nodes": [],
    "Shortest Attack Paths": []
  }
};

// 1. Connect to Neo4j
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);
const session = driver.session();

/**
 * Example: Calculate a "risk score" using a basic heuristic.
 * You could improve this with a real ML model, or MITRE ATT&CK-based logic.
 */
function calculateRiskScore(log) {
  let score = 0;

  // Simple weighting based on ports / traffic volume
  if (log.destination_port === 8080) score += 1;
  if (log.source_port === 443) score += 1;
  if (log.packets && log.packets > 5000) score += 2;
  if (log.bytes_transferred && parseFloat(log.bytes_transferred) > 10) score += 2;

  // Could add more rules: suspicious IP ranges, known bad IP lists, etc.
  // e.g., if (knownBadIPs.includes(log.source_ip)) { score += 5; }

  return score;
}

/**
 * Example: Query Neo4j for additional context, like:
 * - Graph-based threat detection (shortest paths, central nodes).
 * - PageRank to find critical nodes (like a staging server).
 * - We return an example structure that you can expand.
 */
async function getGraphInsights(sourceIP, destinationIP) {
  const insights = {
    CriticalNodes: [],
    ShortestAttackPaths: []
  };

  try {
    // 1. Example: A PageRank or centrality query to identify critical nodes
    //    (Pseudo-code, adapt to your schema)
    //    Neo4j 4+ can run built-in graph algorithms with GDS plugin.
    /*
    const pagerankQuery = `
      CALL gds.pageRank.stream('myGraph')
      YIELD nodeId, score
      RETURN gds.util.asNode(nodeId).ip AS ip, score
      ORDER BY score DESC LIMIT 3
    `;
    */
    // For simplicity, we'll just do a MATCH and return dummy data
    /*
    const pagerankResult = await session.run(pagerankQuery);
    pagerankResult.records.forEach((record) => {
      insights.CriticalNodes.push({
        ip: record.get("ip"),
        score: record.get("score")
      });
    });
    */

    // 2. Example: Find shortest path from source to destination
    //    (Again, adapt to your actual graph schema.)
    /*
    const shortestPathQuery = `
      MATCH (src:Host {ip: $sourceIP}), (dst:Host {ip: $destinationIP}),
        p = shortestPath((src)-[*..5]-(dst))
      RETURN p
    `;
    const pathResult = await session.run(shortestPathQuery, { sourceIP, destinationIP });
    if (pathResult.records.length > 0) {
      const path = pathResult.records[0].get("p");
      // path length minus 1 = number of relationships
      insights.ShortestAttackPaths.push({
        source: sourceIP,
        destination: destinationIP,
        hops: path.segments.length
      });
    }
    */

    // For demonstration, we'll return a static set:
    insights.CriticalNodes = [
      { ip: destinationIP, score: 0.85 },
      { ip: sourceIP, score: 0.72 }
    ];
    insights.ShortestAttackPaths = [
      { source: sourceIP, destination: destinationIP, hops: 2 }
    ];

  } catch (err) {
    console.error("Neo4j error:", err);
  }

  return insights;
}

/**
 * Main logic to process each message from RabbitMQ:
 *  1. Parse the log from LLM or Microservice 2
 *  2. Apply additional detection/algorithms (risk scoring, graph analysis, etc.)
 *  3. Publish result to another RabbitMQ queue (or store in DB).
 */
async function processLogMessage(msg, channel) {
  try {
    const logData = JSON.parse(msg.content.toString());
    console.log("Received from LLM/Threat-Detection Microservice:", logData);

    // Extract fields for convenience
    const { source_ip, destination_ip, protocol, classification } = logData;

    // 1. Calculate risk score (example, you can expand as you see fit)
    const riskScore = calculateRiskScore(logData);

    // 2. Query Neo4j for additional graph-based insights
    const graphInsights = await getGraphInsights(source_ip, destination_ip);

    // 3. Decide recommended actions (example logic)
    let recommendedActions = ["Monitor traffic"];
    if (riskScore > 3) {
      recommendedActions = [
        "Block suspicious traffic",
        "Inspect logs for anomalies",
        "Enable deep packet inspection"
      ];
    }

    // 4. Construct the final JSON response
    const finalResponse = {
      "LLM Security Analysis": {
        analysis: {
          source_ip,
          destination_ip,
          protocol,
          classification: classification || "Unknown",
          recommended_actions: recommendedActions
        }
      },
      "Neo4j Graph Insights": {
        "Critical Nodes": graphInsights.CriticalNodes,
        "Shortest Attack Paths": graphInsights.ShortestAttackPaths
      }
    };

    // Store the latest response for API access
    latestSecurityResponse = finalResponse;

    // 5. Send this JSON to the next queue or back to microservice 2
    const responseQueue = process.env.RESPONSE_QUEUE || "security_responses";
    await channel.assertQueue(responseQueue, { durable: true });
    channel.sendToQueue(responseQueue, Buffer.from(JSON.stringify(finalResponse)));

    console.log("Sent final response to queue:", responseQueue);
    console.log(JSON.stringify(finalResponse, null, 2));
  } catch (error) {
    console.error("Error processing log message:", error);
  }
}

/** Start listening to RabbitMQ */
async function startRabbitMQ() {
  try {
      const conn = await amqp.connect(process.env.RABBITMQ_URL);
      const channel = await conn.createChannel();

      const queue = process.env.INCIDENT_QUEUE || "incident_queue";
      await channel.assertQueue(queue, { durable: true });

      console.log(`📡 Listening on RabbitMQ queue: ${queue}`);

      channel.consume(queue, async (msg) => {
          console.log("✅ Received message from incident_queue:", msg.content.toString());
          await processLogMessage(msg, channel);
          channel.ack(msg);
      });
  } catch (err) {
      console.error("❌ RabbitMQ Connection Error:", err);
  }
}


// Optional: A simple health endpoint
app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// New endpoint to get the latest security analysis for the frontend
app.get("/api/security-analysis", (req, res) => {
  // Add CORS headers if needed
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  
  // Return the latest security response
  res.json(latestSecurityResponse);
});

app.listen(PORT, () => {
  console.log(`Incident Response Microservice running on port ${PORT}`);
  startRabbitMQ();
});
