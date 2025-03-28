"use client";
import { useState } from 'react';
import { parse } from 'papaparse';

const DemoTest = () => {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [transformedLogs, setTransformedLogs] = useState([]);
  const [apiResponse, setApiResponse] = useState(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [errorDetails, setErrorDetails] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus('');
      setProgress(0);
      setLogs([]);
      setTransformedLogs([]);
      setApiResponse(null);
      setSuccessCount(0);
      setFailCount(0);
      setErrorDetails(null);
    }
  };

  const processCSV = async (file) => {
    return new Promise((resolve, reject) => {
      parse(file, {
        header: true,
        complete: (results) => {
          resolve(results.data);
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  };

  // Transform data to match the required format based on the actual CSV structure
  const transformData = (data) => {
    return data.map(item => {
      // Clean and parse numeric values
      const packets = parseInt(item['Packets'] ? item['Packets'].trim() : '0', 10);
      
      // Parse bytes value (e.g., "2.1 M" to "2.1M")
      let bytesTransferred = '0.0M';
      if (item['Bytes']) {
        const bytesStr = item['Bytes'].trim();
        bytesTransferred = bytesStr.replace(/\s+/g, '');
      }
      
      // Parse duration to float
      const duration = parseFloat(item['Duration'] || '0');
      
      // Create a properly formatted object
      return {
        'Source IP': item['Src IP Addr'] || '192.168.1.1', // Default IP if empty
        'Destination IP': item['Dst IP Addr'] || '10.0.0.1', // Default IP if empty
        'Protocol': (item['Proto'] || 'TCP').trim(),
        'Source Port': item['Src Pt'] || '0',
        'Destination Port': item['Dst Pt'] || '0',
        'Packets': packets,
        'Bytes Transferred': bytesTransferred,
        'Flags': item['Flags'] || '',
        'Duration': duration,
        'Class': item['class'] || 'Unknown'
      };
    });
  };

  const sendLogToAPI = async (log) => {
    try {
      // Wrap the log in the expected format with a sessions array
      const formattedData = {
        device_info: {
          app_version: "1.0.0",
          device_type: "Demo Test",
          os_version: "Web Browser"
        },
        timestamp: new Date().toISOString(),
        sessions: [log]
      };
      
      console.log('Sending data to API:', JSON.stringify(formattedData, null, 2));
      
      const response = await fetchWithTimeout('https://snaptrace.onrender.com/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      }, 15000); // 15 second timeout

      const responseText = await response.text();
      console.log('API Response:', responseText);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.warn('Could not parse API response as JSON:', responseText);
        responseData = { message: responseText };
      }
      
      setApiResponse(responseData);
      return responseData;
    } catch (error) {
      console.error('Error sending log:', error);
      // Log more details about the error
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
      } else if (error.request) {
        console.error('No response received. Request details:', error.request);
      }
      
      setErrorDetails({
        message: error.message,
        type: 'Individual Log Upload Error',
        time: new Date().toISOString(),
        logData: JSON.stringify(log).substring(0, 200) + '...' // First 200 chars of the log
      });
      
      throw error;
    }
  };

  const sendBatchToAPI = async (logs) => {
    try {
      // Wrap all logs in the expected format with a sessions array
      const formattedData = {
        device_info: {
          app_version: "1.0.0",
          device_type: "Demo Test",
          os_version: "Web Browser"
        },
        timestamp: new Date().toISOString(),
        sessions: logs
      };
      
      console.log(`Sending batch of ${logs.length} logs to API`);
      
      const response = await fetchWithTimeout('https://snaptrace.onrender.com/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      }, 30000); // 30 second timeout for batch

      const responseText = await response.text();
      console.log('API Response:', responseText);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.warn('Could not parse API response as JSON:', responseText);
        responseData = { message: responseText };
      }
      
      setApiResponse(responseData);
      return responseData;
    } catch (error) {
      console.error('Error sending batch:', error);
      setErrorDetails({
        message: error.message,
        type: 'Batch Upload Error',
        time: new Date().toISOString()
      });
      throw error;
    }
  };

  // Helper function to add timeout to fetch
  const fetchWithTimeout = async (url, options, timeout = 30000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(id);
    return response;
  };

  const checkAPIConnection = async () => {
    try {
      // Simple ping to check if the API is reachable
      const response = await fetchWithTimeout('https://snaptrace.onrender.com/api/get-logs', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }, 10000); // 10 second timeout
      
      if (response.ok) {
        console.log('API connection successful');
        return true;
      } else {
        console.error('API connection failed with status:', response.status);
        return false;
      }
    } catch (error) {
      console.error('API connection check failed:', error);
      return false;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Checking API connection...');
    
    // Check API connection first
    const isConnected = await checkAPIConnection();
    if (!isConnected) {
      setUploadStatus('Cannot connect to API. Please try again later.');
      setIsUploading(false);
      return;
    }
    
    setUploadStatus('Processing CSV file...');
    setApiResponse(null);
    setSuccessCount(0);
    setFailCount(0);
    
    try {
      // Parse CSV to JSON
      const parsedData = await processCSV(file);
      setLogs(parsedData);
      
      // Transform data to match required format
      const formattedData = transformData(parsedData);
      setTransformedLogs(formattedData);
      
      // Limit to max 30 logs
      const limitedData = formattedData.slice(0, 30);
      setUploadStatus(`Parsed ${limitedData.length} logs (max 30). Sending to API...`);
      
      // Try batch upload first
      try {
        setUploadStatus(`Sending all ${limitedData.length} logs as a batch...`);
        await sendBatchToAPI(limitedData);
        setSuccessCount(limitedData.length);
        setProgress(100);
      } catch (batchError) {
        console.error('Batch upload failed, falling back to individual uploads:', batchError);
        setUploadStatus('Batch upload failed. Trying individual uploads...');
        
        // Fall back to individual uploads if batch fails
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < limitedData.length; i++) {
          const log = limitedData[i];
          const currentLog = i + 1;
          
          setUploadStatus(`Sending log ${currentLog}/${limitedData.length}...`);
          
          try {
            await sendLogToAPI(log);
            successCount++;
            setSuccessCount(successCount);
          } catch (error) {
            console.error(`Failed to send log ${currentLog}:`, error);
            failCount++;
            setFailCount(failCount);
          }
          
          // Update progress
          const newProgress = Math.min(100, Math.round(((i + 1) / limitedData.length) * 100));
          setProgress(newProgress);
        }
      }
      
      setUploadStatus(`Upload complete! ${successCount} logs processed successfully, ${failCount} failed.`);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
      setErrorDetails({
        message: error.message,
        type: 'General Upload Error',
        time: new Date().toISOString(),
        stack: error.stack
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">Demo Test - Network Log Upload</h2>
      
      <div className="mb-8">
        <p className="text-gray-300 mb-4">
          Upload a CSV file containing network logs. The system will convert it to JSON and send it to the API (maximum 30 logs).
        </p>
        
        <div className="flex flex-col space-y-4">
          <div className="flex items-center space-x-4">
            <label className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-4 rounded cursor-pointer transition-colors">
              <span>Select CSV File</span>
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="hidden" 
                disabled={isUploading}
              />
            </label>
            <span className="text-gray-400">{file ? file.name : 'No file selected'}</span>
          </div>
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`py-2 px-4 rounded font-medium transition-colors ${
              !file || isUploading
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload and Process'}
          </button>
        </div>
      </div>
      
      {uploadStatus && (
        <div className="mb-6">
          <p className="text-gray-300 mb-2">{uploadStatus}</p>
          {isUploading && (
            <div className="w-full bg-gray-800 rounded-full h-2.5">
              <div 
                className="bg-cyan-500 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          )}
          {(successCount > 0 || failCount > 0) && (
            <div className="mt-2 flex space-x-4">
              <span className="text-green-400">Success: {successCount}</span>
              <span className="text-red-400">Failed: {failCount}</span>
            </div>
          )}
        </div>
      )}
      
      {apiResponse && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-cyan-400">Latest API Response</h3>
          <div className="bg-gray-800 p-4 rounded-lg overflow-auto">
            <pre className="text-gray-300 text-sm">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {errorDetails && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-red-400">Error Details</h3>
          <div className="bg-gray-800 p-4 rounded-lg overflow-auto border border-red-500">
            <div className="text-red-400 mb-2">Type: {errorDetails.type}</div>
            <div className="text-red-400 mb-2">Time: {errorDetails.time}</div>
            <div className="text-red-400 mb-2">Message: {errorDetails.message}</div>
            {errorDetails.logData && (
              <div className="mt-2">
                <div className="text-gray-400 mb-1">Problematic Log Data:</div>
                <pre className="text-gray-300 text-sm">{errorDetails.logData}</pre>
              </div>
            )}
            {errorDetails.stack && (
              <div className="mt-2">
                <div className="text-gray-400 mb-1">Stack Trace:</div>
                <pre className="text-gray-300 text-sm">{errorDetails.stack}</pre>
              </div>
            )}
          </div>
        </div>
      )}
      
      {transformedLogs.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-cyan-400">Processed Logs (Transformed Format)</h3>
          <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-auto">
            <pre className="text-gray-300 text-sm">
              {JSON.stringify(transformedLogs.slice(0, 30), null, 2)}
            </pre>
          </div>
        </div>
      )}
      
      {logs.length > 0 && transformedLogs.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-3 text-cyan-400">Original CSV Data</h3>
          <div className="bg-gray-800 p-4 rounded-lg max-h-96 overflow-auto">
            <pre className="text-gray-300 text-sm">
              {JSON.stringify(logs.slice(0, 30), null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default DemoTest; 