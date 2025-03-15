'use client';
import React, { useRef, useEffect, useState } from 'react';
import SimpleNetworkGraph from './SimpleNetworkGraph';
// Remove the direct import of ForceGraph2D
// import { ForceGraph2D } from 'react-force-graph';

const NetworkGraph = ({ graphData }) => {
  const graphRef = useRef();
  // Change to use ForceGraphCanvas instead of ForceGraph2D
  const [ForceGraphCanvas, setForceGraphCanvas] = useState(null);
  const [graphError, setGraphError] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  // Dynamically import ForceGraphCanvas on client side only
  useEffect(() => {
    // Only import on client side
    import('react-force-graph').then(module => {
      // Use ForceGraphCanvas instead of ForceGraph2D to avoid A-Frame dependency
      setForceGraphCanvas(() => module.ForceGraphCanvas);
    }).catch(err => {
      console.error('Error loading ForceGraphCanvas:', err);
      setGraphError('Failed to load graph visualization library');
      setLoadFailed(true);
    });
  }, []);

  // Validate graph data
  useEffect(() => {
    if (graphData) {
      try {
        // Check if nodes and links are arrays
        if (!Array.isArray(graphData.nodes) || !Array.isArray(graphData.links)) {
          setGraphError('Invalid graph data format: nodes and links must be arrays');
          return;
        }
        
        // Check if all nodes have id and label
        const invalidNodes = graphData.nodes.filter(node => !node.id || !node.label);
        if (invalidNodes.length > 0) {
          setGraphError('Invalid node data: all nodes must have id and label properties');
          return;
        }
        
        // Check if all links have source and target
        const invalidLinks = graphData.links.filter(link => !link.source || !link.target);
        if (invalidLinks.length > 0) {
          setGraphError('Invalid link data: all links must have source and target properties');
          return;
        }
        
        // Clear any previous errors if validation passes
        setGraphError(null);
      } catch (err) {
        console.error('Error validating graph data:', err);
        setGraphError('Error processing graph data');
      }
    }
  }, [graphData]);

  useEffect(() => {
    // When the component mounts or graphData changes, adjust the graph
    if (graphRef.current && graphData && !graphError) {
      try {
        // Zoom a bit to see the graph better
        graphRef.current.zoom(1.5);
        // Center the graph
        graphRef.current.centerAt(0, 0);
      } catch (err) {
        console.error('Error adjusting graph view:', err);
      }
    }
  }, [graphData, ForceGraphCanvas, graphError]); // Update dependency

  // After all hooks are defined, now we can use conditionals for rendering
  
  // If loading failed or we have a graph error, use the simple graph
  if (loadFailed || graphError) {
    return <SimpleNetworkGraph graphData={graphData} />;
  }

  if (!graphData || !graphData.nodes || !graphData.links) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 text-center">
        <p className="text-gray-400">No graph data available</p>
      </div>
    );
  }

  // If ForceGraphCanvas is not loaded yet, show loading state
  if (!ForceGraphCanvas) {
    return (
      <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-cyan-400">
            <i className="fas fa-project-diagram mr-2"></i>
            Network Traffic Graph
          </h3>
        </div>
        <div className="p-2 h-[500px] flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
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

  // Safely get node and link data with error handling
  const safeGraphData = {
    nodes: graphData.nodes || [],
    links: graphData.links || []
  };

  try {
    return (
      <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-cyan-400">
            <i className="fas fa-project-diagram mr-2"></i>
            Network Traffic Graph
          </h3>
        </div>
        <div className="p-2 h-[500px]">
          <ForceGraphCanvas
            ref={graphRef}
            graphData={safeGraphData}
            nodeLabel={(node) => `${node.id} (${node.label})\n${node.threat_level || 'Unknown'}`}
            linkLabel={(link) => `Packets: ${link.packets || 'N/A'}, Bytes: ${link.bytes || 'N/A'}`}
            nodeColor={getNodeColor}
            nodeRelSize={6}
            linkWidth={link => Math.sqrt((link.packets || 1) / 100) || 1}
            linkDirectionalParticles={2}
            linkDirectionalParticleSpeed={d => (d.packets || 100) / 1000}
            backgroundColor="#1f2937"
            linkColor={() => '#6366f1'}
            nodeCanvasObject={(node, ctx, globalScale) => {
              try {
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
              } catch (err) {
                console.error('Error rendering node:', err);
              }
            }}
            onError={(err) => {
              console.error('ForceGraph error:', err);
              setGraphError('Error rendering graph visualization');
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
  } catch (err) {
    console.error('Error rendering ForceGraphCanvas:', err);
    return <SimpleNetworkGraph graphData={graphData} />;
  }
};

export default NetworkGraph; 