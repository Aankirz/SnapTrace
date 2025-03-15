import { useState, useEffect, useCallback } from 'react';

const useGraphData = () => {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://snaptrace-incident.onrender.com/graph');
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setGraphData(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching graph data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGraphData();
    
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(fetchGraphData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchGraphData]);

  return { graphData, loading, error, fetchGraphData };
};

export default useGraphData; 