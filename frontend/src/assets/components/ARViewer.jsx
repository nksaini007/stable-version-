import React, { useState, useRef, useEffect } from 'react';
import '@google/model-viewer';

const ARViewer = ({ src, alt = "3D Product Model", scale = "1 1 1", rotation = "0deg 0deg 0deg", className, style }) => {
  const [error, setError] = useState(false);
  const viewerRef = useRef(null);

  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const handleError = (e) => {
      console.error("Error loading 3D model:", e);
      setError(true);
    };

    viewer.addEventListener('error', handleError);
    return () => viewer.removeEventListener('error', handleError);
  }, []);

  if (!src) return null;

  if (error) {
    return (
      <div className={`ar-viewer-container relative w-full h-full min-h-[400px] rounded-2xl border border-red-100 bg-red-50 flex flex-col items-center justify-center p-6 text-center ${className || ''}`} style={style}>
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3">
          <svg xmlns="http://www.w3.org/-2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
        </div>
        <p className="text-red-600 font-semibold mb-1">Failed to load 3D model</p>
        <p className="text-red-500 text-sm">The external link might be broken or unsupported.</p>
      </div>
    );
  }

  return (
    <div className={`ar-viewer-container relative w-full h-full min-h-[400px] overflow-hidden rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-center ${className || ''}`} style={style}>
      <model-viewer
        ref={viewerRef}
        src={src}
        alt={alt}
        ar
        ar-modes="webxr scene-viewer quick-look"
        camera-controls
        auto-rotate
        shadow-intensity="1"
        scale={scale}
        orientation={rotation}
        style={{ width: '100%', height: '100%', outline: 'none' }}
      >
        <div slot="poster" className="absolute inset-0 flex items-center justify-center bg-gray-50">
          <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
        </div>
        
        <button slot="ar-button" className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg font-bold text-gray-800 flex items-center gap-2 hover:bg-white transition-colors border border-gray-200">
          <svg xmlns="http://www.w3.org/-2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          View in AR
        </button>
      </model-viewer>
    </div>
  );
};

export default ARViewer;
