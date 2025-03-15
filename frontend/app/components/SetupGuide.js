import React, { useState } from 'react';
import { showCopyToast, showSuccessToast } from '../utils/toast';

const SetupGuide = () => {
  const [activeStep, setActiveStep] = useState(1);
  
  const steps = [
    {
      id: 1,
      title: "Install TShark",
      description: "TShark is the terminal-based version of Wireshark and is required for packet capture.",
      commands: [
        { platform: "macOS", command: "brew install wireshark" },
        { platform: "Linux", command: "sudo apt-get install tshark" },
        { platform: "Windows", command: "choco install wireshark" }
      ]
    },
    {
      id: 2,
      title: "Clone the TraceAgent Repository",
      description: "Get the latest version of the TraceAgent from our GitHub repository.",
      commands: [
        { platform: "All", command: "git clone https://github.com/YourOrg/TraceAgent.git" },
        { platform: "All", command: "cd TraceAgent" }
      ]
    },
    {
      id: 3,
      title: "Install Dependencies",
      description: "Install the required Python packages for TraceAgent.",
      commands: [
        { platform: "All", command: "pip install -r requirements.txt" }
      ]
    },
    {
      id: 4,
      title: "Configure the Agent",
      description: "Set up the configuration for your environment.",
      commands: [
        { platform: "All", command: "cp config.example.json config.json" },
        { platform: "All", command: "nano config.json  # Edit with your settings" }
      ]
    },
    {
      id: 5,
      title: "Run the Agent",
      description: "Start the TraceAgent with administrative privileges to capture network traffic.",
      commands: [
        { platform: "Unix/Linux/macOS", command: "sudo python3 logcollector.py" },
        { platform: "Windows", command: "python logcollector.py  # Run as Administrator" }
      ]
    }
  ];
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showCopyToast(`Command copied: ${text.substring(0, 20)}${text.length > 20 ? '...' : ''}`);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  const handleStepCompletion = () => {
    if (activeStep === steps.length) {
      showSuccessToast('Setup completed successfully! 🎉');
    } else {
      setActiveStep(activeStep + 1);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-white">TraceAgent Setup Guide</h2>
        <a 
          href="#" 
          className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm flex items-center gap-1"
        >
          <i className="fas fa-book"></i>
          <span>Full Documentation</span>
        </a>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
        <div className="lg:col-span-1 bg-gray-900/70 rounded-lg border border-gray-800 p-4 shadow-lg">
          <h3 className="text-sm uppercase tracking-wider text-gray-400 mb-4 font-medium">Installation Steps</h3>
          <ul className="space-y-2">
            {steps.map(step => (
              <li 
                key={step.id}
                className={`px-3 py-2 rounded-md cursor-pointer transition-all flex items-center ${
                  activeStep === step.id 
                    ? "bg-cyan-900/30 text-cyan-400 border-l-2 border-cyan-500" 
                    : "text-gray-400 hover:bg-gray-800/50 hover:text-gray-200"
                }`}
                onClick={() => setActiveStep(step.id)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs ${
                  activeStep === step.id 
                    ? "bg-cyan-500 text-gray-900" 
                    : "bg-gray-800 text-gray-400"
                }`}>
                  {step.id}
                </div>
                <span>{step.title}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="lg:col-span-4">
          {steps.map(step => (
            <div 
              key={step.id} 
              className={`bg-gray-900/70 rounded-lg border border-gray-800 p-6 shadow-lg ${
                activeStep === step.id ? "block" : "hidden"
              }`}
            >
              <div className="flex items-start mb-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 bg-cyan-900/50 text-cyan-400`}>
                  <i className={`fas ${
                    step.id === 1 ? "fa-download" : 
                    step.id === 2 ? "fa-code-branch" : 
                    step.id === 3 ? "fa-box-open" : 
                    step.id === 4 ? "fa-cog" : "fa-play"
                  }`}></i>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">Step {step.id}: {step.title}</h3>
                  <p className="text-gray-400 mb-6">{step.description}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                {step.commands.map((cmd, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute top-0 left-0 bg-gray-800 px-2 py-1 text-xs text-gray-400 rounded-tl-md rounded-br-md">
                      {cmd.platform}
                    </div>
                    <div className="bg-gray-950 p-4 pt-8 rounded-md font-mono text-sm overflow-x-auto group">
                      <code className="text-gray-300">{cmd.command}</code>
                      <button 
                        className="absolute top-2 right-2 text-gray-500 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => copyToClipboard(cmd.command)}
                      >
                        <i className="fas fa-copy"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-8">
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    step.id === 1 
                      ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                      : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                  }`}
                  onClick={() => step.id > 1 && setActiveStep(step.id - 1)}
                  disabled={step.id === 1}
                >
                  <i className="fas fa-arrow-left mr-2"></i>
                  Previous
                </button>
                
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    step.id === steps.length 
                      ? "bg-green-600 text-white hover:bg-green-500" 
                      : "bg-cyan-600 text-white hover:bg-cyan-500"
                  }`}
                  onClick={handleStepCompletion}
                >
                  {step.id === steps.length ? (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Finish
                    </>
                  ) : (
                    <>
                      Next
                      <i className="fas fa-arrow-right ml-2"></i>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-gray-800 p-6 rounded-lg shadow-lg">
        <div className="flex items-start">
          <div className="bg-cyan-900/30 p-3 rounded-full text-cyan-400 mr-4">
            <i className="fas fa-info-circle text-xl"></i>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Need Help?</h3>
            <p className="text-gray-400 mb-4">
              If you encounter any issues during setup, check our troubleshooting guide or reach out to our support team.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2">
                <i className="fas fa-life-ring"></i>
                <span>Support Portal</span>
              </a>
              <a href="#" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2">
                <i className="fas fa-bug"></i>
                <span>Report Issue</span>
              </a>
              <a href="#" className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2">
                <i className="fas fa-question-circle"></i>
                <span>FAQ</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupGuide; 