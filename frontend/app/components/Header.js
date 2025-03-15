import React from 'react';
import { showLoadingToast, dismissToast, showSuccessToast, showErrorToast } from '../utils/toast';

const Header = ({ fetchLogs, loading, toggleSidebar }) => {
  const handleRefresh = async () => {
    if (loading) return;
    
    const toastId = showLoadingToast('Refreshing security data...');
    
    try {
      await fetchLogs();
      dismissToast(toastId);
      showSuccessToast('Security data refreshed successfully');
    } catch (error) {
      dismissToast(toastId);
      showErrorToast('Failed to refresh security data');
      console.error('Refresh error:', error);
    }
  };

  return (
    <header className="flex justify-between items-center mb-8 pb-4 border-b border-gray-800">
      <div className="flex items-center">
        <button 
          onClick={toggleSidebar}
          className="mr-4 text-gray-400 hover:text-primary transition-colors"
        >
          <i className="fas fa-bars"></i>
        </button>
        
        <div className="flex gap-4">
          <div className="flex items-center text-sm bg-gray-900 px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></span> 
            <span className="text-gray-300">TraceAgent</span>
            <span className="ml-2 text-xs text-gray-500">Active</span>
          </div>
          <div className="flex items-center text-sm bg-gray-900 px-3 py-1.5 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2 animate-pulse"></span> 
            <span className="text-gray-300">Backend API</span>
            <span className="ml-2 text-xs text-gray-500">Connected</span>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="relative">
          <button 
            className="text-gray-400 hover:text-white transition-colors"
            onClick={() => showSuccessToast('No new notifications')}
          >
            <i className="fas fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center">3</span>
          </button>
        </div>
        
        <button 
          onClick={handleRefresh} 
          disabled={loading}
          className="bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white px-4 py-2 rounded-md text-sm font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-cyan-500/20"
        >
          {loading ? (
            <>
              <i className="fas fa-circle-notch fa-spin"></i>
              <span>Refreshing...</span>
            </>
          ) : (
            <>
              <i className="fas fa-sync-alt"></i>
              <span>Refresh Data</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header; 