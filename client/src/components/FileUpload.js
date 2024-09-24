import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import AnimatedTitle from './AnimatedTile';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const processImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          resolve(new File([blob], file.name, { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.6);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const processAudio = async (file) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const offlineContext = new OfflineAudioContext(
      1,
      audioBuffer.sampleRate * 10,
      audioBuffer.sampleRate
    );

    const source = offlineContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineContext.destination);
    source.start(0);

    const renderedBuffer = await offlineContext.startRendering();
    const sampleData = renderedBuffer.getChannelData(0);

    const wavBuffer = new ArrayBuffer(44 + sampleData.length * 2);
    const view = new DataView(wavBuffer);

    const writeString = (view, offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + sampleData.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, offlineContext.sampleRate, true);
    view.setUint32(28, offlineContext.sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, sampleData.length * 2, true);

    const floatTo16BitPCM = (output, offset, input) => {
      for (let i = 0; i < input.length; i++, offset += 2) {
        const s = Math.max(-1, Math.min(1, input[i]));
        output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      }
    };

    floatTo16BitPCM(view, 44, sampleData);

    return new File([wavBuffer], 'processed_audio.wav', { type: 'audio/wav' });
  };

  const processVideo = async (file) => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 320;
        canvas.height = 240;
        const ctx = canvas.getContext('2d');
        
        video.currentTime = 1; // Capture frame at 1 second
        
        video.onseeked = () => {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            resolve(new File([blob], 'video_frame.jpg', { type: 'image/jpeg' }));
          }, 'image/jpeg', 0.7);
        };
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;

    setLoading(true);

    try {
      let processedFile;
      if (file.type.startsWith('image/')) {
        processedFile = await processImage(file);
      } else if (file.type.startsWith('audio/')) {
        processedFile = await processAudio(file);
      } else if (file.type.startsWith('video/')) {
        processedFile = await processVideo(file);
      } else {
        throw new Error('Unsupported file type');
      }

      const formData = new FormData();
      formData.append('file', processedFile);
      formData.append('originalType', file.type);

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
            className="block w-full text-sm text-gray-300 bg-gray-700 border border-gray-600 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
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