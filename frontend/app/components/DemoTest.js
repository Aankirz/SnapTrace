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

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus('');
      setProgress(0);
      setLogs([]);
      setTransformedLogs([]);
      setApiResponse(null);
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
        'Source IP': item['Src IP Addr'] || '',
        'Destination IP': item['Dst IP Addr'] || '',
        'Protocol': (item['Proto'] || '').trim(),
        'Source Port': item['Src Pt'] || '',
        'Destination Port': item['Dst Pt'] || '',
        'Packets': packets,
        'Bytes Transferred': bytesTransferred,
        'Flags': item['Flags'] || '',
        'Duration': duration,
        'Class': item['class'] || 'Unknown'
      };
    });
  };

  const sendBatchToAPI = async (batch) => {
    try {
      // Create a session object with logs array as expected by the API
      const sessionData = {
        logs: batch
      };
      
      console.log('Sending data to API:', JSON.stringify(sessionData, null, 2));
      
      const response = await fetch('https://snaptrace.onrender.com/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      const responseText = await response.text();
      console.log('API Response:', responseText);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} - ${responseText}`);
      }

      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = { message: responseText };
      }
      
      setApiResponse(responseData);
      return responseData;
    } catch (error) {
      console.error('Error sending batch:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadStatus('Please select a file first');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Processing CSV file...');
    setApiResponse(null);
    
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
      
      // Send in batches of 5
      const batchSize = 5;
      const totalBatches = Math.ceil(limitedData.length / batchSize);
      
      for (let i = 0; i < limitedData.length; i += batchSize) {
        const batch = limitedData.slice(i, i + batchSize);
        const currentBatch = Math.floor(i / batchSize) + 1;
        
        setUploadStatus(`Sending batch ${currentBatch}/${totalBatches}...`);
        await sendBatchToAPI(batch);
        
        // Update progress
        const newProgress = Math.min(100, Math.round((currentBatch / totalBatches) * 100));
        setProgress(newProgress);
      }
      
      setUploadStatus('Upload complete! All logs have been processed.');
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus(`Upload failed: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">Demo Test - Network Log Upload</h2>
      
      <div className="mb-8">
        <p className="text-gray-300 mb-4">
          Upload a CSV file containing network logs. The system will convert it to JSON and send it to the API in batches of 5 logs (maximum 30 logs).
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
        </div>
      )}
      
      {apiResponse && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-cyan-400">API Response</h3>
          <div className="bg-gray-800 p-4 rounded-lg overflow-auto">
            <pre className="text-gray-300 text-sm">
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
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