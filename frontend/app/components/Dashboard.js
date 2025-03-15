import React from 'react';

const Dashboard = ({ logs }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Security Dashboard</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <h3 className="text-sm text-gray-400 mb-2 font-medium">Total Sessions</h3>
          <p className="text-3xl font-bold text-cyan-500">{logs.length}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <h3 className="text-sm text-gray-400 mb-2 font-medium">Unique IPs</h3>
          <p className="text-3xl font-bold text-cyan-500">
            {new Set(logs.map(log => log["Source IP"])).size}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <h3 className="text-sm text-gray-400 mb-2 font-medium">Total Traffic</h3>
          <p className="text-3xl font-bold text-cyan-500">
            {logs.reduce((sum, log) => sum + (parseInt(log["Bytes Transferred"]) || 0), 0).toLocaleString()} bytes
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
          <h3 className="text-sm text-gray-400 mb-2 font-medium">Protocols</h3>
          <p className="text-3xl font-bold text-cyan-500">
            {new Set(logs.map(log => log.Protocol)).size}
          </p>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {logs.slice(0, 5).map((log, idx) => (
            <div key={idx} className="flex items-center p-3 bg-gray-900/50 rounded-md">
              <div className="text-xl mr-4">🔄</div>
              <div>
                <p className="font-medium mb-1">
                  {log["Source IP"]} → {log["Destination IP"]}
                </p>
                <p className="text-xs text-gray-400">
                  {log.Protocol} • {log["Bytes Transferred"]} bytes • {log.received_at || "N/A"}
                </p>
              </div>
            </div>
          ))}
          {logs.length === 0 && (
            <p className="text-center text-gray-400 py-8">No recent activity detected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 