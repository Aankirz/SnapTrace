'use client';
import { useState, useEffect, useCallback } from 'react';

// Mock data to use as fallback when the API is unavailable
const mockGraphData = {
  "nodes": [
    {
      "id": "192.168.1.50",
      "label": "Source",
      "threat_level": "This traffic is **suspicious**."
    },
    {
      "id": "10.0.0.25",
      "label": "Destination",
      "threat_level": "This traffic is **malicious**."
    },
    {
      "id": "192.168.1.60",
      "label": "Source",
      "threat_level": "This traffic is **suspicious** and potentially **malicious**."
    },
    {
      "id": "10.0.0.30",
      "label": "Destination",
      "threat_level": "This traffic is **suspicious** and potentially **malicious**."
    },
    {
      "id": "172.16.5.100",
      "label": "Source",
      "threat_level": "This traffic is **malicious**."
    },
    {
      "id": "192.168.165.245",
      "label": "Source",
      "threat_level": "This traffic is **suspicious**."
    },
    {
      "id": "54.245.211.193",
      "label": "Destination",
      "threat_level": "This traffic is **suspicious**."
    },
    {
      "id": "192.168.165.134",
      "label": "Source",
      "threat_level": "This traffic is **suspicious** and could be part of a malicious activity."
    },
    {
      "id": "151.101.1.195",
      "label": "Source",
      "threat_level": "This traffic is **suspicious** and potentially **malicious**."
    },
    {
      "id": "104.18.18.125",
      "label": "Source",
      "threat_level": "This traffic is **suspicious**."
    }
  ],
  "links": [
    {
      "source": "192.168.1.50",
      "target": "10.0.0.25",
      "packets": 85,
      "bytes": "1.7M"
    },
    {
      "source": "192.168.1.60",
      "target": "10.0.0.30",
      "packets": 975,
      "bytes": "2.1M"
    },
    {
      "source": "172.16.5.100",
      "target": "10.0.0.25",
      "packets": 18000,
      "bytes": "32.4M"
    },
    {
      "source": "192.168.165.245",
      "target": "54.245.211.193",
      "packets": 10,
      "bytes": "0.0M"
    },
    {
      "source": "192.168.165.134",
      "target": "192.168.165.245",
      "packets": 10,
      "bytes": "0.0M"
    },
    {
      "source": "151.101.1.195",
      "target": "192.168.165.245",
      "packets": 10,
      "bytes": "0.0M"
    },
    {
      "source": "104.18.18.125",
      "target": "192.168.165.245",
      "packets": 10,
      "bytes": "0.0M"
    }
  ]
};

const useGraphData = () => {
  const [graphData, setGraphData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useFallback, setUseFallback] = useState(false);

  const fetchGraphData = useCallback(async () => {
    try {
      setLoading(true);
      
      // If we've already determined we need to use fallback data, don't try to fetch again
      if (useFallback) {
        console.log('Using fallback graph data due to previous fetch failure');
        setGraphData(mockGraphData);
        setError(null);
        setLoading(false);
        return;
      }
      
      try {
        const response = await fetch('https://snaptrace-incident.onrender.com/graph', {
          // Adding these headers might help with CORS issues
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          // Adding a cache-busting query parameter
          cache: 'no-cache',
          // Adding credentials might help if the API requires authentication
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setGraphData(data);
        setError(null);
      } catch (fetchErr) {
        console.error('Error fetching graph data, using fallback data:', fetchErr);
        // Use the mock data as fallback
        setGraphData(mockGraphData);
        // Set a user-friendly error message
        setError("Using demo data - couldn't connect to live data source");
        // Remember to use fallback data for future requests
        setUseFallback(true);
      }
    } catch (err) {
      console.error('Unexpected error in fetchGraphData:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [useFallback]);

  useEffect(() => {
    fetchGraphData();
    
    // Set up polling to refresh data every 30 seconds
    const intervalId = setInterval(fetchGraphData, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [fetchGraphData]);

  return { graphData, loading, error, fetchGraphData, useFallback };
};

export default useGraphData; 