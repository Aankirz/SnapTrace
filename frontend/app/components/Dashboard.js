import React, { useEffect } from 'react';
import { showSecurityAlertToast, showInfoToast, showWarningToast } from '../utils/toast';

const Dashboard = ({ logs }) => {
  // Calculate some statistics
  const uniqueIPs = new Set(logs.map(log => log["Source IP"])).size;
  const totalTraffic = logs.reduce((sum, log) => sum + (parseInt(log["Bytes Transferred"]) || 0), 0);
  const protocols = new Set(logs.map(log => log.Protocol)).size;
  
  // Threat level calculation (mock)
  const threatLevel = logs.length > 10 ? 'Medium' : 'Low';
  
  // Show security alert toast when threat level changes
  useEffect(() => {
    if (logs.length > 0) {
      if (threatLevel === 'Medium') {
        showSecurityAlertToast('Medium threat level detected. Unusual network activity observed.', 'medium');
      } else if (threatLevel === 'High') {
        showSecurityAlertToast('High threat level detected! Multiple suspicious connections.', 'high');
      }
    }
  }, [threatLevel]);
  
  // Show welcome toast on first load
  useEffect(() => {
    showInfoToast('Welcome to SnapTrace Security Dashboard');
  }, []);
  
  const handleTimeRangeClick = (range) => {
    showInfoToast(`Viewing data for the last ${range}`);
  };
  
  const handleActivityClick = (log) => {
    showInfoToast(`Connection details: ${log["Source IP"]} → ${log["Destination IP"]}`);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Security Dashboard</h2>
        <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 rounded-lg">
          <span className="text-sm text-gray-400">Threat Level:</span>
          <span className={`text-sm font-semibold ${
            threatLevel === 'Low' ? 'text-green-400' : 
            threatLevel === 'Medium' ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {threatLevel}
          </span>
          <span className={`w-2.5 h-2.5 rounded-full ${
            threatLevel === 'Low' ? 'bg-green-400' : 
            threatLevel === 'Medium' ? 'bg-yellow-400' : 'bg-red-400'
          } animate-pulse`}></span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900/70 rounded-lg p-5 border border-gray-800 hover:border-cyan-800 transition-all shadow-lg hover:shadow-cyan-900/20">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm text-gray-400 font-medium">Total Sessions</h3>
            <div className="bg-cyan-500/10 p-2 rounded-md text-cyan-400">
              <i className="fas fa-network-wired"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{logs.length}</p>
          <p className="text-xs text-gray-500 mt-2">
            <span className="text-green-400"><i className="fas fa-arrow-up mr-1"></i>12%</span> from last period
          </p>
        </div>
        
        <div className="bg-gray-900/70 rounded-lg p-5 border border-gray-800 hover:border-cyan-800 transition-all shadow-lg hover:shadow-cyan-900/20">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm text-gray-400 font-medium">Unique IPs</h3>
            <div className="bg-purple-500/10 p-2 rounded-md text-purple-400">
              <i className="fas fa-globe"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{uniqueIPs}</p>
          <p className="text-xs text-gray-500 mt-2">
            <span className="text-green-400"><i className="fas fa-arrow-up mr-1"></i>5%</span> from last period
          </p>
        </div>
        
        <div className="bg-gray-900/70 rounded-lg p-5 border border-gray-800 hover:border-cyan-800 transition-all shadow-lg hover:shadow-cyan-900/20">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm text-gray-400 font-medium">Total Traffic</h3>
            <div className="bg-blue-500/10 p-2 rounded-md text-blue-400">
              <i className="fas fa-exchange-alt"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">
            {totalTraffic > 1000000 
              ? `${(totalTraffic / 1000000).toFixed(2)} MB` 
              : totalTraffic > 1000 
                ? `${(totalTraffic / 1000).toFixed(2)} KB` 
                : `${totalTraffic} B`}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            <span className="text-red-400"><i className="fas fa-arrow-down mr-1"></i>3%</span> from last period
          </p>
        </div>
        
        <div className="bg-gray-900/70 rounded-lg p-5 border border-gray-800 hover:border-cyan-800 transition-all shadow-lg hover:shadow-cyan-900/20">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm text-gray-400 font-medium">Protocols</h3>
            <div className="bg-green-500/10 p-2 rounded-md text-green-400">
              <i className="fas fa-sitemap"></i>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{protocols}</p>
          <p className="text-xs text-gray-500 mt-2">
            <span className="text-gray-400"><i className="fas fa-minus mr-1"></i>No change</span> from last period
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gray-900/70 rounded-lg p-5 border border-gray-800 shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Network Activity</h3>
            <div className="flex gap-2">
              <button 
                className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-300 transition-colors"
                onClick={() => handleTimeRangeClick('24 hours')}
              >
                24h
              </button>
              <button 
                className="text-xs bg-cyan-900/50 px-2 py-1 rounded text-cyan-300"
                onClick={() => handleTimeRangeClick('7 days')}
              >
                7d
              </button>
              <button 
                className="text-xs bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded text-gray-300 transition-colors"
                onClick={() => handleTimeRangeClick('30 days')}
              >
                30d
              </button>
            </div>
          </div>
          <div className="h-64 flex items-center justify-center">
            {/* Placeholder for chart */}
            <div className="w-full h-full bg-gray-800/50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Network activity chart would go here</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-900/70 rounded-lg p-5 border border-gray-800 shadow-lg">
          <h3 className="text-lg font-semibold mb-4 text-white">Top Protocols</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">HTTP/HTTPS</span>
                <span className="text-sm text-gray-400">65%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">DNS</span>
                <span className="text-sm text-gray-400">20%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">SSH</span>
                <span className="text-sm text-gray-400">10%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-gray-400">Other</span>
                <span className="text-sm text-gray-400">5%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '5%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-900/70 rounded-lg p-5 border border-gray-800 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
          <button 
            className="text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded text-gray-300 transition-colors flex items-center gap-1"
            onClick={() => showInfoToast('Filter options would appear here')}
          >
            <i className="fas fa-filter"></i> Filter
          </button>
        </div>
        <div className="space-y-3">
          {logs.slice(0, 5).map((log, idx) => (
            <div 
              key={idx} 
              className="flex items-center p-4 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
              onClick={() => handleActivityClick(log)}
            >
              <div className="text-xl mr-4 bg-gray-700 w-10 h-10 rounded-full flex items-center justify-center">
                {log.Protocol === 'HTTP' || log.Protocol === 'HTTPS' ? (
                  <i className="fas fa-globe text-blue-400"></i>
                ) : log.Protocol === 'SSH' ? (
                  <i className="fas fa-terminal text-green-400"></i>
                ) : log.Protocol === 'DNS' ? (
                  <i className="fas fa-server text-purple-400"></i>
                ) : (
                  <i className="fas fa-exchange-alt text-cyan-400"></i>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex justify-between">
                  <p className="font-medium text-gray-200 mb-1">
                  {log["Source IP"]} → {log["Destination IP"]}
                </p>
                  <span className="text-xs text-gray-500">
                    {new Date(log.received_at || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-xs text-gray-400 flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-gray-700 rounded text-cyan-400">{log.Protocol}</span>
                  <span>{log["Bytes Transferred"]} bytes</span>
                  <span>Port: {log["Destination Port"]}</span>
                </p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-800 border-dashed">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-4">
                <i className="fas fa-shield-alt text-2xl text-gray-600"></i>
              </div>
              <p className="text-gray-400 mb-2">No recent activity detected</p>
              <p className="text-xs text-gray-600">Your network is quiet at the moment</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 