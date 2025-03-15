import React from 'react';

const NetworkLogs = ({ logs }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Network Traffic Logs</h2>
      
      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-900/50">
                <th className="text-left p-4 font-medium text-gray-400">Timestamp</th>
                <th className="text-left p-4 font-medium text-gray-400">Source IP</th>
                <th className="text-left p-4 font-medium text-gray-400">Destination IP</th>
                <th className="text-left p-4 font-medium text-gray-400">Protocol</th>
                <th className="text-left p-4 font-medium text-gray-400">Packets</th>
                <th className="text-left p-4 font-medium text-gray-400">Bytes</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center text-gray-400 py-8">
                    No logs available
                  </td>
                </tr>
              ) : (
                logs.map((log, idx) => (
                  <tr key={idx} className="border-t border-gray-700 hover:bg-gray-700/30">
                    <td className="p-4">{log.received_at || "N/A"}</td>
                    <td className="p-4">{log["Source IP"]}</td>
                    <td className="p-4">{log["Destination IP"]}</td>
                    <td className="p-4">{log.Protocol}</td>
                    <td className="p-4">{log.Packets}</td>
                    <td className="p-4">{log["Bytes Transferred"]}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NetworkLogs; 