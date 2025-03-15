"use client";
import { useState } from "react";

// Import components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import NetworkLogs from './components/NetworkLogs';
import SetupGuide from './components/SetupGuide';
import ThreatDetection from './components/ThreatDetection';
import DemoTest from './components/DemoTest';

// Import custom hook
import useLogData from './hooks/useLogData';

export default function Home() {
  const [activeTab, setActiveTab] = useState("setup");
  const { logs, loading, error, fetchLogs } = useLogData();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-950 to-gray-900 text-gray-100 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <main className={`flex-grow transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-64'} p-6`}>
        {/* Header with status indicators */}
        <Header 
          fetchLogs={fetchLogs} 
          loading={loading} 
          toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Animated transition between tabs */}
        <div className="mt-6 transition-all duration-300 ease-in-out">
          {activeTab === "dashboard" && <Dashboard logs={logs} />}
          {activeTab === "logs" && <NetworkLogs logs={logs} />}
          {activeTab === "threats" && <ThreatDetection />}
          {activeTab === "setup" && <SetupGuide />}
          {activeTab === "demotest" && <DemoTest />}
        </div>
        
        {/* Footer */}
        <footer className="mt-12 pt-4 border-t border-gray-800 text-gray-400 text-sm">
          <div className="flex justify-between items-center">
            <p>© 2025 SnapTrace Security</p>
            <div className="flex space-x-4">
              <span>Documentation</span>
              <span>Support</span>
              <span>Privacy Policy</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}