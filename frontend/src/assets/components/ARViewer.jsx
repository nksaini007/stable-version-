import React from 'react';
import '@google/model-viewer';

const ARViewer = ({ src, alt = 'A 3D model', scale = '1 1 1', rotation = '0deg 0deg 0deg' }) => {
  if (!src) return null;

  return (
    <div className="ar-viewer-container relative w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 border border-purple-100 rounded-xl overflow-hidden">
      <model-viewer
        src={src}
        alt={alt}
        auto-rotate
        camera-controls
        ar
        ar-modes="webxr scene-viewer quick-look"
        shadow-intensity="1"
        scale={scale}
        orientation={rotation}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      >
        <button
          slot="ar-button"
          className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md text-purple-700 border border-purple-200 font-bold py-2 px-6 rounded-full shadow-lg transition-all text-sm flex items-center gap-2 hover:bg-purple-50 hover:scale-105 active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          View in your space (AR)
        </button>
      </model-viewer>
    </div>
  );
};

export default ARViewer;
