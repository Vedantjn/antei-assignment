import React, { useEffect, useState } from 'react';
import FileUpload from './components/FileUpload';

const App = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-800 to-black text-white py-6 sm:py-12 px-4">
      <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold text-center mb-4 sm:mb-6 md:mb-8 transition-all duration-1000 ${isVisible ? 'filter-none opacity-100' : 'filter-blur-lg opacity-0'}`}>
          Deepfake Detection
        </h1>
        <FileUpload />
      </div>
    </div>
  );
};

export default App;
