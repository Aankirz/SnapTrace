import React from 'react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="w-64 bg-gray-950 border-r border-gray-800 fixed h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-cyan-500">SnapTrace</h1>
      </div>
      <ul className="py-4 flex-grow">
        <li 
          className={`px-6 py-3 flex items-center cursor-pointer transition-colors ${
            activeTab === "dashboard" 
              ? "bg-cyan-900/20 text-cyan-500 border-l-4 border-cyan-500" 
              : "text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("dashboard")}
        >
          <span className="mr-3">📊</span> Dashboard
        </li>
        <li 
          className={`px-6 py-3 flex items-center cursor-pointer transition-colors ${
            activeTab === "logs" 
              ? "bg-cyan-900/20 text-cyan-500 border-l-4 border-cyan-500" 
              : "text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("logs")}
        >
          <span className="mr-3">📜</span> Network Logs
        </li>
        <li 
          className={`px-6 py-3 flex items-center cursor-pointer transition-colors ${
            activeTab === "setup" 
              ? "bg-cyan-900/20 text-cyan-500 border-l-4 border-cyan-500" 
              : "text-gray-400 hover:bg-gray-800/30 hover:text-gray-200"
          }`}
          onClick={() => setActiveTab("setup")}
        >
          <span className="mr-3">⚙️</span> Setup Guide
        </li>
      </ul>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        <p>SnapTrace v1.0</p>
      </div>
    </nav>
  );
};

export default Sidebar; 