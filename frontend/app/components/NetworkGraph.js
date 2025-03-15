import React, { useRef, useEffect } from 'react';
import { ForceGraph2D } from 'react-force-graph';

const NetworkGraph = ({ graphData }) => {
  const graphRef = useRef();

  useEffect(() => {
    // When the component mounts or graphData changes, adjust the graph
    if (graphRef.current && graphData) {
      // Zoom a bit to see the graph better
      graphRef.current.zoom(1.5);
      // Center the graph
      graphRef.current.centerAt(0, 0);
    }
  }, [graphData]);

  if (!graphData || !graphData.nodes || !graphData.links) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 text-center">
        <p className="text-gray-400">No graph data available</p>
      </div>
    );
  }

  // Determine node colors based on threat level
  const getNodeColor = (node) => {
    if (!node.threat_level) return '#6366f1'; // Default indigo
    
    if (node.threat_level.includes('malicious')) {
      return '#ef4444'; // Red for malicious
    } else if (node.threat_level.includes('suspicious')) {
      return '#f59e0b'; // Amber for suspicious
    } else {
      return '#10b981'; // Green for normal
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <h3 className="text-xl font-semibold text-cyan-400">
          <i className="fas fa-project-diagram mr-2"></i>
          Network Traffic Graph
        </h3>
      </div>
      <div className="p-2 h-[500px]">
        <ForceGraph2D
          ref={graphRef}
          graphData={graphData}
          nodeLabel={(node) => `${node.id} (${node.label})\n${node.threat_level || 'Unknown'}`}
          linkLabel={(link) => `Packets: ${link.packets}, Bytes: ${link.bytes}`}
          nodeColor={getNodeColor}
          nodeRelSize={6}
          linkWidth={link => Math.sqrt(link.packets / 100) || 1}
          linkDirectionalParticles={2}
          linkDirectionalParticleSpeed={d => d.packets / 1000}
          backgroundColor="#1f2937"
          linkColor={() => '#6366f1'}
          nodeCanvasObject={(node, ctx, globalScale) => {
            const label = node.id;
            const fontSize = 12/globalScale;
            ctx.font = `${fontSize}px Sans-Serif`;
            const textWidth = ctx.measureText(label).width;
            const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2);

            // Node circle
            ctx.beginPath();
            ctx.arc(node.x, node.y, 5, 0, 2 * Math.PI, false);
            ctx.fillStyle = getNodeColor(node);
            ctx.fill();
            
            // Only render text labels if zoomed in enough
            if (globalScale >= 1) {
              // Text background
              ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
              ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y + 6,
                bckgDimensions[0],
                bckgDimensions[1]
              );
              
              // Text
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillStyle = '#fff';
              ctx.fillText(label, node.x, node.y + 6 + fontSize / 2);
            }
          }}
        />
      </div>
      <div className="p-4 bg-gray-900/30 border-t border-gray-700">
        <div className="flex items-center justify-center space-x-6">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span className="text-sm text-gray-300">Normal</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mr-2"></span>
            <span className="text-sm text-gray-300">Suspicious</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span className="text-sm text-gray-300">Malicious</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkGraph; 