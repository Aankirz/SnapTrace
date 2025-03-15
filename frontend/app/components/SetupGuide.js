import React from 'react';

const SetupGuide = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold mb-6">TraceAgent Setup Guide</h2>
      
      <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">1. Install TShark</h3>
        <div className="bg-gray-950 p-3 rounded mb-2 font-mono text-sm overflow-x-auto">
          <code>brew install wireshark</code> <span className="text-gray-500"># macOS</span>
        </div>
        <div className="bg-gray-950 p-3 rounded font-mono text-sm overflow-x-auto">
          <code>sudo apt-get install tshark</code> <span className="text-gray-500"># Linux</span>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">2. Clone the TraceAgent Repository</h3>
        <div className="bg-gray-950 p-3 rounded font-mono text-sm overflow-x-auto">
          <code>git clone https://github.com/YourOrg/TraceAgent.git</code>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">3. Install Dependencies</h3>
        <div className="bg-gray-950 p-3 rounded font-mono text-sm overflow-x-auto">
          <code>pip install -r requirements.txt</code>
        </div>
      </div>
      
      <div className="bg-gray-800 rounded-lg p-5 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">4. Run the Agent</h3>
        <div className="bg-gray-950 p-3 rounded font-mono text-sm overflow-x-auto">
          <code>sudo python3 logcollector.py</code>
        </div>
      </div>
      
      <div className="bg-cyan-900/20 border-l-4 border-cyan-500 p-4 rounded-r-md mt-6">
        <p className="leading-relaxed">
          <strong>Note:</strong> Once running, TraceAgent will start sending traffic logs to the SnapTrace 
          backend at <code className="bg-gray-950 px-2 py-1 rounded text-sm font-mono">http://localhost:4000/api/sessions</code>.
        </p>
      </div>
    </div>
  );
};

export default SetupGuide; 