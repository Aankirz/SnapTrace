import React from 'react';

const Header = ({ fetchLogs, loading }) => {
  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
      <div className="flex gap-4">
        <div className="flex items-center text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span> TraceAgent
        </div>
        <div className="flex items-center text-sm">
          <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2"></span> Backend API
        </div>
      </div>
      <div>
        <button 
          onClick={fetchLogs} 
          disabled={loading}
          className="bg-cyan-700 hover:bg-cyan-600 text-white px-4 py-2 rounded text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>
    </header>
  );
};

export default Header; 