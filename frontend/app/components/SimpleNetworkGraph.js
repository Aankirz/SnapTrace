'use client';
import React from 'react';

// A simple network graph component that doesn't rely on external libraries
const SimpleNetworkGraph = ({ graphData }) => {
  if (!graphData || !graphData.nodes || !graphData.links) {
    return (
      <div className="bg-gray-800/50 rounded-lg p-6 text-center">
        <p className="text-gray-400">No graph data available</p>
      </div>
    );
  }

  // Get node threat level color
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

  // Group nodes by type for better organization
  const sourceNodes = graphData.nodes.filter(node => node.label === 'Source');
  const destinationNodes = graphData.nodes.filter(node => node.label === 'Destination');

  return (
    <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
      <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
        <h3 className="text-xl font-semibold text-cyan-400">
          <i className="fas fa-project-diagram mr-2"></i>
          Network Traffic Graph (Simple View)
        </h3>
      </div>
      <div className="p-6 space-y-6">
        {/* Network connections table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-gray-900/30 rounded-lg">
            <thead>
              <tr className="bg-gray-800/80">
                <th className="px-4 py-2 text-left text-gray-400">Source</th>
                <th className="px-4 py-2 text-center text-gray-400">Traffic</th>
                <th className="px-4 py-2 text-right text-gray-400">Destination</th>
              </tr>
            </thead>
            <tbody>
              {graphData.links.map((link, index) => {
                const sourceNode = graphData.nodes.find(n => n.id === link.source);
                const targetNode = graphData.nodes.find(n => n.id === link.target);
                
                return (
                  <tr key={index} className="border-t border-gray-800">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span 
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: sourceNode ? getNodeColor(sourceNode) : '#6366f1' }}
                        ></span>
                        <span className="font-mono">{link.source}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col items-center">
                        <div className="text-xs text-gray-400">
                          {link.packets} packets
                        </div>
                        <div className="text-xs text-gray-400">
                          {link.bytes}
                        </div>
                        <div className="w-full flex items-center justify-center my-1">
                          <div className="h-0.5 bg-gray-700 w-12"></div>
                          <i className="fas fa-arrow-right text-gray-500 mx-1"></i>
                          <div className="h-0.5 bg-gray-700 w-12"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end">
                        <span className="font-mono">{link.target}</span>
                        <span 
                          className="inline-block w-3 h-3 rounded-full ml-2"
                          style={{ backgroundColor: targetNode ? getNodeColor(targetNode) : '#6366f1' }}
                        ></span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Node information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Source nodes */}
          <div className="bg-gray-900/30 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-gray-300">Source Nodes</h4>
            <div className="space-y-2">
              {sourceNodes.map((node, index) => (
                <div key={index} className="flex items-start p-2 bg-gray-800/50 rounded">
                  <span 
                    className="inline-block w-3 h-3 rounded-full mt-1 mr-2"
                    style={{ backgroundColor: getNodeColor(node) }}
                  ></span>
                  <div>
                    <div className="font-mono text-sm">{node.id}</div>
                    <div className="text-xs text-gray-400 mt-1">{node.threat_level}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Destination nodes */}
          <div className="bg-gray-900/30 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-gray-300">Destination Nodes</h4>
            <div className="space-y-2">
              {destinationNodes.map((node, index) => (
                <div key={index} className="flex items-start p-2 bg-gray-800/50 rounded">
                  <span 
                    className="inline-block w-3 h-3 rounded-full mt-1 mr-2"
                    style={{ backgroundColor: getNodeColor(node) }}
                  ></span>
                  <div>
                    <div className="font-mono text-sm">{node.id}</div>
                    <div className="text-xs text-gray-400 mt-1">{node.threat_level}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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

export default SimpleNetworkGraph; 