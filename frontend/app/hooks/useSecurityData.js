import { useState, useEffect, useCallback } from 'react';

const useSecurityData = () => {
  const [securityData, setSecurityData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSecurityData = useCallback(async () => {
    try {
      setLoading(true);
      // Replace with your actual backend URL or use environment variable
      const response = await fetch('https://snaptrace-incident.onrender.com/api/security-analysis');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setSecurityData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching security data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSecurityData();
    
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(fetchSecurityData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchSecurityData]);

  return { securityData, loading, error, fetchSecurityData };
};

export default useSecurityData; 