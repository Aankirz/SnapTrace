import { useState, useEffect } from 'react';

/**
 * Custom hook to fetch and manage log data
 * @param {number} refreshInterval - Interval in milliseconds to auto-refresh data
 * @returns {Object} - Object containing logs, loading state, and fetchLogs function
 */
export default function useLogData(refreshInterval = 30000) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch logs from Node.js backend
  async function fetchLogs() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:4000/api/get-logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Failed to fetch logs:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Fetch logs on initial load
    fetchLogs();
    
    // Set up auto-refresh at specified interval
    const interval = setInterval(fetchLogs, refreshInterval);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [refreshInterval]);

  return { logs, loading, fetchLogs };
} 