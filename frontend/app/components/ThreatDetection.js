'use client';
import React from 'react';
import useSecurityData from '../hooks/useSecurityData';
import useGraphData from '../hooks/useGraphData';
import NetworkGraph from './NetworkGraph';

const ThreatDetection = () => {
  const { securityData, loading: securityLoading, error: securityError, fetchSecurityData } = useSecurityData();
  const { graphData, loading: graphLoading, error: graphError, fetchGraphData, useFallback } = useGraphData();

  // Combined loading state
  const loading = securityLoading || graphLoading;
  
  // Combined error state (prioritize security data error)
  const error = securityError || (graphError && !useFallback ? graphError : null);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 text-red-200">
        <h3 className="text-xl font-semibold mb-2">Error Loading Threat Data</h3>
        <p>{error}</p>
        <p className="mt-2">Please check your backend connection and try again.</p>
        <button 
          onClick={() => {
            fetchSecurityData();
            fetchGraphData();
          }} 
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 rounded-md transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!securityData) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <p>No security data available.</p>
      </div>
    );
  }

  const { 
    "LLM Security Analysis": llmAnalysis = {}, 
    "Neo4j Graph Insights": graphInsights = {} 
  } = securityData;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
          Threat Detection Analysis
        </h2>
        <button 
          onClick={() => {
            fetchSecurityData();
            fetchGraphData();
          }}
          className="px-4 py-2 bg-cyan-700 hover:bg-cyan-600 rounded-md transition-colors flex items-center"
        >
          <i className="fas fa-sync-alt mr-2"></i> Refresh
        </button>
      </div>

      {/* Fallback notification */}
      {useFallback && graphData && (
        <div className="bg-amber-900/20 border border-amber-800 rounded-lg p-4 text-amber-200 mb-4">
          <div className="flex items-start">
            <i className="fas fa-info-circle text-amber-400 mt-1 mr-3 text-lg"></i>
            <div>
              <h3 className="font-semibold">Using Demo Network Data</h3>
              <p className="mt-1">
                We&apos;re currently displaying demo network graph data because we couldn&apos;t connect to the live data source.
                The visualization below is based on sample data and may not reflect the current network state.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Network Graph Visualization */}
      <NetworkGraph graphData={graphData} />

      {/* Security Analysis Card */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-cyan-400">
            <i className="fas fa-shield-alt mr-2"></i>
            Security Analysis
          </h3>
        </div>
        <div className="p-6">
          {llmAnalysis.analysis ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="text-gray-400 mb-2">Source IP</h4>
                  <p className="text-lg font-mono">{llmAnalysis.analysis.source_ip || "N/A"}</p>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg">
                  <h4 className="text-gray-400 mb-2">Destination IP</h4>
                  <p className="text-lg font-mono">{llmAnalysis.analysis.destination_ip || "N/A"}</p>
                </div>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="text-gray-400 mb-2">Protocol</h4>
                <p className="text-lg">{llmAnalysis.analysis.protocol || "N/A"}</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="text-gray-400 mb-2">Classification</h4>
                <p className="text-lg">{llmAnalysis.analysis.classification || "Unknown"}</p>
              </div>
              
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <h4 className="text-gray-400 mb-2">Recommended Actions</h4>
                {llmAnalysis.analysis.recommended_actions && 
                 llmAnalysis.analysis.recommended_actions.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {llmAnalysis.analysis.recommended_actions.map((action, index) => (
                      <li key={index} className="text-yellow-400">{action}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No recommended actions</p>
                )}
              </div>
            </div>
          ) : (
            <p className="text-gray-400">No security analysis available</p>
          )}
        </div>
      </div>

      {/* Graph Insights Card */}
      <div className="bg-gray-800/50 rounded-lg overflow-hidden border border-gray-700">
        <div className="bg-gray-800 px-6 py-4 border-b border-gray-700">
          <h3 className="text-xl font-semibold text-cyan-400">
            <i className="fas fa-project-diagram mr-2"></i>
            Network Graph Insights
          </h3>
        </div>
        <div className="p-6">
          {/* Critical Nodes Section */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3 text-gray-300">Critical Nodes</h4>
            {graphInsights["Critical Nodes"] && 
             graphInsights["Critical Nodes"].length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-gray-900/30 rounded-lg">
                  <thead>
                    <tr className="bg-gray-800/80">
                      <th className="px-4 py-2 text-left text-gray-400">IP Address</th>
                      <th className="px-4 py-2 text-left text-gray-400">Risk Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {graphInsights["Critical Nodes"].map((node, index) => (
                      <tr key={index} className="border-t border-gray-800">
                        <td className="px-4 py-3 font-mono">{node.ip}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="w-full bg-gray-700 rounded-full h-2.5 mr-2">
                              <div 
                                className="bg-red-600 h-2.5 rounded-full" 
                                style={{ width: `${node.score * 100}%` }}
                              ></div>
                            </div>
                            <span>{(node.score * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-400">No critical nodes identified</p>
            )}
          </div>

          {/* Attack Paths Section */}
          <div>
            <h4 className="text-lg font-semibold mb-3 text-gray-300">Shortest Attack Paths</h4>
            {graphInsights["Shortest Attack Paths"] && 
             graphInsights["Shortest Attack Paths"].length > 0 ? (
              <div className="space-y-3">
                {graphInsights["Shortest Attack Paths"].map((path, index) => (
                  <div key={index} className="bg-gray-900/30 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-mono text-sm">{path.source}</div>
                      <div className="flex-1 mx-2 flex items-center justify-center">
                        <div className="h-0.5 bg-red-500 flex-1"></div>
                        <div className="mx-2 px-2 py-1 bg-gray-700 rounded-full text-xs">
                          {path.hops} hops
                        </div>
                        <div className="h-0.5 bg-red-500 flex-1"></div>
                      </div>
                      <div className="font-mono text-sm">{path.destination}</div>
                    </div>
                    <div className="text-xs text-gray-400 text-center">
                      Potential attack path detected
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No attack paths detected</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatDetection; 