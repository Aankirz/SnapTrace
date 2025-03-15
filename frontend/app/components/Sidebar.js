import React from 'react';

const Sidebar = ({ activeTab, setActiveTab, collapsed, setCollapsed }) => {
  const menuItems = [
    { id: "setup", icon: "fa-cogs", label: "Setup Guide" },
    { id: "dashboard", icon: "fa-chart-line", label: "Dashboard" },
    { id: "logs", icon: "fa-shield-alt", label: "Security Logs" },
    { id: "threats", icon: "fa-exclamation-triangle", label: "Threat Detection" },
    { id: "demotest", icon: "fa-vial", label: "Demo Test" },
    { id: "settings", icon: "fa-sliders-h", label: "Settings" },
  ];

  return (
    <nav 
      className={`bg-gray-950 border-r border-gray-800 fixed h-screen flex flex-col transition-all duration-300 ${
        collapsed ? 'w-20' : 'w-64'
      } z-10`}
    >
      <div className={`p-6 border-b border-gray-800 flex ${collapsed ? 'justify-center' : 'justify-between'} items-center`}>
        {collapsed ? (
          <div className="text-2xl font-bold text-cyan-500 glow-text">ST</div>
        ) : (
          <>
            <h1 className="text-2xl font-bold">
              <span className="text-cyan-500 glow-text">Snap</span>
              <span className="text-white">Trace</span>
            </h1>
            <button 
              onClick={() => setCollapsed(true)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          </>
        )}
      </div>

      <ul className="py-4 flex-grow">
        {menuItems.map(item => (
          <li 
            key={item.id}
            className={`px-6 py-3 flex items-center cursor-pointer transition-all ${
              activeTab === item.id 
                ? "bg-cyan-900/20 text-cyan-400 border-l-4 border-cyan-500" 
                : "text-gray-400 hover:bg-gray-800/30 hover:text-gray-200 border-l-4 border-transparent"
            }`}
            onClick={() => setActiveTab(item.id)}
          >
            <i className={`fas ${item.icon} ${collapsed ? 'text-lg' : 'mr-3'}`}></i>
            {!collapsed && <span>{item.label}</span>}
          </li>
        ))}
      </ul>

      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        {collapsed ? (
          <div className="flex justify-center">
            <button 
              onClick={() => setCollapsed(false)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <p>SnapTrace v1.0</p>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
              <span>Online</span>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Sidebar; 