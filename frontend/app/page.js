"use client";
import { useState } from "react";

// Import components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import NetworkLogs from './components/NetworkLogs';
import SetupGuide from './components/SetupGuide';

// Import custom hook
import useLogData from './hooks/useLogData';

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { logs, loading, fetchLogs } = useLogData();

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100 font-sans">
      {/* Navigation Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-grow ml-64 p-6">
        {/* Header with status indicators */}
        <Header fetchLogs={fetchLogs} loading={loading} />

        {/* Render the active tab content */}
        {activeTab === "dashboard" && <Dashboard logs={logs} />}
        {activeTab === "logs" && <NetworkLogs logs={logs} />}
        {activeTab === "setup" && <SetupGuide />}
      </main>
    </div>
  );
}