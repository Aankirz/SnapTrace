import { useState, useEffect } from 'react';
import { showErrorToast } from '../utils/toast';

/**
 * Custom hook to fetch and manage log data
 * @param {number} refreshInterval - Interval in milliseconds to auto-refresh data
 * @returns {Object} - Object containing logs, loading state, and fetchLogs function
 */
export default function useLogData(refreshInterval = 30000) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch logs from Node.js backend
  async function fetchLogs() {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch("https://snaptrace.onrender.com/api/get-logs");
      
      if (!res.ok) {
        throw new Error(`Server responded with status: ${res.status}`);
      }
      
      const data = await res.json();
      setLogs(data.logs || []);
      return data.logs; // Return logs for promise chaining
    } catch (error) {
      console.error("Failed to fetch logs:", error);
      setError(error.message);
      showErrorToast(`Failed to fetch security logs: ${error.message}`);
      throw error; // Re-throw for promise chaining
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Fetch logs on initial load
    fetchLogs().catch(err => {
      // Error is already handled in fetchLogs
      console.log('Initial fetch failed:', err.message);
    });
    
    // Set up auto-refresh at specified interval
    const interval = setInterval(() => {
      fetchLogs().catch(err => {
        // Silent fail for background refreshes
        console.log('Background refresh failed:', err.message);
      });
    }, refreshInterval);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { logs, loading, error, fetchLogs };
} 