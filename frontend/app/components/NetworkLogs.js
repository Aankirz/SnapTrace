import React, { useState, useEffect } from 'react';
import { showInfoToast, showSuccessToast, showWarningToast } from '../utils/toast';

const NetworkLogs = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProtocol, setFilterProtocol] = useState('');
  const [prevFilteredCount, setPrevFilteredCount] = useState(0);
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  
  // Filter logs based on search term and protocol filter
  const filteredLogs = logs.filter(log => {
    const matchesSearch = searchTerm === '' || 
      Object.values(log).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    const matchesProtocol = filterProtocol === '' || 
      log.Protocol === filterProtocol;
    
    return matchesSearch && matchesProtocol;
  });
  
  // Show toast when filter results change significantly
  useEffect(() => {
    if (logs.length > 0 && prevFilteredCount > 0) {
      // Only show toast if there's a significant change in results
      if (filteredLogs.length === 0 && prevFilteredCount > 0) {
        showWarningToast('No logs match your current filters');
      } else if (filteredLogs.length < prevFilteredCount / 2) {
        showInfoToast(`Filtered to ${filteredLogs.length} logs`);
      }
    }
    
    setPrevFilteredCount(filteredLogs.length);
  }, [filteredLogs.length, searchTerm, filterProtocol]);
  
  // Get unique protocols for filter dropdown
  const uniqueProtocols = [...new Set(logs.map(log => log.Protocol))];
  
  const handleExport = () => {
    // In a real app, this would export the data to CSV or JSON
    showSuccessToast('Logs exported successfully');
  };
  
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Show toast for empty search to clear filters
    if (value === '' && searchTerm !== '') {
      showInfoToast('Search filter cleared');
    }
  };
  
  const handleProtocolFilter = (e) => {
    const value = e.target.value;
    setFilterProtocol(value);
    
    if (value) {
      showInfoToast(`Filtered to ${value} protocol`);
    } else if (filterProtocol !== '') {
      showInfoToast('Protocol filter cleared');
    }
  };
  
  const handleFlagLog = (log) => {
    // In a real app, this would flag the log for review
    showWarningToast(`Log from ${log["Source IP"]} flagged for review`);
  };
  
  const handleBlockIP = (ip) => {
    // In a real app, this would add the IP to a blocklist
    showSuccessToast(`IP ${ip} added to blocklist`);
  };
  
  // Toggle sort order
  const toggleSortOrder = () => {
    setSortNewestFirst(!sortNewestFirst);
    showInfoToast(`Showing ${!sortNewestFirst ? 'newest' : 'oldest'} logs first`);
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">Network Traffic Logs</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-400">Total entries: </span>
          <span className="text-sm font-semibold text-cyan-400">{filteredLogs.length}</span>
        </div>
      </div>
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <i className="fas fa-search text-gray-500"></i>
          </div>
          <input
            type="text"
            className="bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full pl-10 p-2.5"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>
        
        <div className="sm:w-48">
          <select
            className="bg-gray-900 border border-gray-800 text-gray-300 text-sm rounded-lg focus:ring-cyan-500 focus:border-cyan-500 block w-full p-2.5"
            value={filterProtocol}
            onChange={handleProtocolFilter}
          >
            <option value="">All Protocols</option>
            {uniqueProtocols.map(protocol => (
              <option key={protocol} value={protocol}>{protocol}</option>
            ))}
          </select>
        </div>
        
        <button 
          className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 sm:w-auto"
          onClick={toggleSortOrder}
          title={`Sort by ${sortNewestFirst ? 'oldest' : 'newest'} first`}
        >
          <div className="flex items-center">
            <i className="fas fa-clock text-cyan-400 mr-1.5"></i>
            <span className="hidden sm:inline">Sort:</span>
            <span className="ml-1 text-cyan-300 font-medium">{sortNewestFirst ? 'Newest' : 'Oldest'}</span>
            <i className={`fas fa-chevron-${sortNewestFirst ? 'up' : 'down'} text-cyan-400 ml-1.5`}></i>
          </div>
        </button>
        
        <button 
          className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
          onClick={handleExport}
        >
          <i className="fas fa-download"></i>
          <span>Export</span>
        </button>
      </div>
      
      <div className="bg-gray-900/70 rounded-lg border border-gray-800 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-950">
                <th className="text-left p-4 font-medium text-gray-400">Timestamp</th>
                <th className="text-left p-4 font-medium text-gray-400">Source IP</th>
                <th className="text-left p-4 font-medium text-gray-400">Destination IP</th>
                <th className="text-left p-4 font-medium text-gray-400">Protocol</th>
                <th className="text-left p-4 font-medium text-gray-400">Port</th>
                <th className="text-left p-4 font-medium text-gray-400">Packets</th>
                <th className="text-left p-4 font-medium text-gray-400">Bytes</th>
                <th className="text-left p-4 font-medium text-gray-400">Flags</th>
                <th className="text-left p-4 font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center text-gray-400 py-12">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <i className="fas fa-search text-2xl text-gray-600"></i>
                      </div>
                      <p className="text-gray-400 mb-1">No matching logs found</p>
                      <p className="text-xs text-gray-600">Try adjusting your search filters</p>
                    </div>
                  </td>
                </tr>
              ) : (
                (sortNewestFirst ? [...filteredLogs].reverse() : filteredLogs).map((log, idx) => (
                  <tr key={idx} className="border-t border-gray-800 hover:bg-gray-800/50 transition-colors">
                    <td className="p-4 text-sm">
                      {log.received_at ? new Date(log.received_at).toLocaleString() : "N/A"}
                    </td>
                    <td className="p-4 text-sm font-mono">{log["Source IP"]}</td>
                    <td className="p-4 text-sm font-mono">{log["Destination IP"]}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        log.Protocol === 'HTTP' || log.Protocol === 'HTTPS' 
                          ? 'bg-blue-900/30 text-blue-400' 
                          : log.Protocol === 'SSH' 
                            ? 'bg-green-900/30 text-green-400'
                            : log.Protocol === 'DNS'
                              ? 'bg-purple-900/30 text-purple-400'
                              : 'bg-cyan-900/30 text-cyan-400'
                      }`}>
                        {log.Protocol}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{log["Destination Port"] || "N/A"}</td>
                    <td className="p-4 text-sm">{log.Packets || "N/A"}</td>
                    <td className="p-4 text-sm">{log["Bytes Transferred"]}</td>
                    <td className="p-4 text-sm pr-2">
                      {log.Flags ? (
                        <div className="flex flex-wrap gap-1">
                          {log.Flags.split(',').map((flag, i) => (
                            <span key={i} className="px-1.5 py-0.5 bg-gray-800 text-xs rounded-sm text-yellow-400 border border-yellow-900/50">
                              {flag}
                            </span>
                          ))}
                        </div>
                      ) : "N/A"}
                    </td>
                    <td className="p-4 pl-2">
                      <div className="flex space-x-3 justify-center">
                        <button 
                          className="text-gray-400 hover:text-cyan-400 transition-colors"
                          onClick={() => showInfoToast(`Log details: ${log["Source IP"]} → ${log["Destination IP"]}`)}
                          title="View details"
                        >
                          <i className="fas fa-info-circle"></i>
                        </button>
                        <button 
                          className="text-gray-400 hover:text-yellow-400 transition-colors"
                          onClick={() => handleFlagLog(log)}
                          title="Flag for review"
                        >
                          <i className="fas fa-flag"></i>
                        </button>
                        <button 
                          className="text-gray-400 hover:text-red-400 transition-colors"
                          onClick={() => handleBlockIP(log["Source IP"])}
                          title="Block IP"
                        >
                          <i className="fas fa-ban"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="bg-gray-950 px-4 py-3 flex items-center justify-between border-t border-gray-800">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium text-gray-400">{filteredLogs.length}</span> of <span className="font-medium text-gray-400">{logs.length}</span> entries
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors text-sm">Previous</button>
            <button className="px-3 py-1 bg-cyan-900/50 text-cyan-300 rounded text-sm">1</button>
            <button className="px-3 py-1 bg-gray-800 text-gray-400 rounded hover:bg-gray-700 transition-colors text-sm">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkLogs; 