import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const AnimatedTitle = ({ text }) => (
  <motion.h2
    className="text-lg sm:text-xl md:text-2xl font-bold mb-6 text-center"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    {text}
  </motion.h2>
);

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult(`The uploaded media is ${data.isDeepfake ? 'likely' : 'unlikely'} to be a deepfake.`);
    } catch (error) {
      console.error('Error:', error);
      setResult('An error occurred during analysis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto px-4 py-8 sm:px-6 md:px-8">
      <AnimatedTitle text="Upload Media for Deepfake Detection" />
      <form onSubmit={handleSubmit} className="flex flex-col items-stretch space-y-6 w-full">
        <div>
          <input
            type="file"
            id="mediaFile"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*,audio/*,video/*"
            className="block w-full text-sm text-gray-300 bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700"
          />
        </div>
        <motion.button
          type="submit"
          className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out shadow-md hover:shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={loading}
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 mr-3"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-2a8 8 0 1 0-8-8v2z" />
              </svg>
              Processing...
            </>
          ) : (
            'Analyze'
          )}
        </motion.button>
      </form>

      {result && (
        <motion.div
          className="mt-6 p-4 bg-gray-700 rounded-md w-full"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <h3 className="text-lg font-medium text-white">Result:</h3>
          <p className="mt-2 text-sm text-gray-300">{result}</p>
        </motion.div>
      )}
    </div>
  );
};

export default FileUpload;