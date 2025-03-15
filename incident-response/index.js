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

  // High-risk ports (common attack targets)
  const highRiskPorts = [22, 3389, 445, 8080, 53, 3306];
  const criticalRiskPorts = [3389, 445]; // RDP & SMB are commonly exploited

  // Known malicious IPs (this could be replaced with a real threat intelligence API)
  const knownMaliciousIPs = new Set(["185.220.101.45", "192.168.1.21"]);

  // Increase score based on high-risk ports
  if (highRiskPorts.includes(log.destination_port)) score += 2;
  if (criticalRiskPorts.includes(log.destination_port)) score += 3;
  if (log.source_port === 443) score += 1; // HTTPS can be used for C2

  // Increase score if the source or destination is known malicious
  if (knownMaliciousIPs.has(log.source_ip)) score += 5;
  if (knownMaliciousIPs.has(log.destination_ip)) score += 5;

  // Increase score based on high traffic activity
  if (log.packets && log.packets > 5000) score += 2;
  if (log.bytes_transferred && parseFloat(log.bytes_transferred) > 10) score += 2;
  if (log.packets > 10000) score += 3; // High packet volume = possible attack

  // If the connection duration is unusually long, increase risk score
  if (log.duration > 300) score += 2; // More than 5 minutes
  if (log.duration > 1800) score += 3; // More than 30 minutes (C2 beaconing)

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
    // ✅ Fetch actual critical nodes using PageRank (or another centrality measure)
    const pagerankQuery = `
      CALL gds.pageRank.stream('myGraph')
      YIELD nodeId, score
      RETURN gds.util.asNode(nodeId).ip AS ip, score
      ORDER BY score DESC LIMIT 3
    `;
    const pagerankResult = await session.run(pagerankQuery);
    pagerankResult.records.forEach((record) => {
      insights.CriticalNodes.push({
        ip: record.get("ip"),
        score: record.get("score")
      });
    });

    // ✅ Find shortest attack paths dynamically
    const shortestPathQuery = `
      MATCH (src:Source {ip: $sourceIP}), (dst:Destination {ip: $destinationIP}),
      p = shortestPath((src)-[*..5]-(dst))
      RETURN p
    `;
    const pathResult = await session.run(shortestPathQuery, { sourceIP, destinationIP });
    if (pathResult.records.length > 0) {
      const path = pathResult.records[0].get("p");
      insights.ShortestAttackPaths.push({
        source: sourceIP,
        destination: destinationIP,
        hops: path.segments.length
      });
    }
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
app.get("/graph", async (req, res) => {
  try {
    const result = await session.run(
      `MATCH (src)-[r:SENDS_TO]->(dst)
       RETURN src.ip AS source, dst.ip AS destination, src.threat_level AS source_threat, dst.threat_level AS destination_threat, r.packets AS packets, r.bytes_transferred AS bytes`
    );

    const graphData = {
      nodes: [],
      links: []
    };

    const nodesSet = new Set();

    result.records.forEach((record) => {
      const sourceIp = record.get("source");
      const destinationIp = record.get("destination");
      const sourceThreat = record.get("source_threat");
      const destinationThreat = record.get("destination_threat");
      const packets = record.get("packets");
      const bytes = record.get("bytes");

      // Add nodes only once
      if (!nodesSet.has(sourceIp)) {
        graphData.nodes.push({ id: sourceIp, label: "Source", threat_level: sourceThreat });
        nodesSet.add(sourceIp);
      }

      if (!nodesSet.has(destinationIp)) {
        graphData.nodes.push({ id: destinationIp, label: "Destination", threat_level: destinationThreat });
        nodesSet.add(destinationIp);
      }

      // Add edges
      graphData.links.push({
        source: sourceIp,
        target: destinationIp,
        packets,
        bytes
      });
    });

    res.json(graphData);
  } catch (error) {
    console.error("❌ Error fetching graph data:", error);
    res.status(500).json({ error: "Failed to fetch graph data" });
  }
});



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
