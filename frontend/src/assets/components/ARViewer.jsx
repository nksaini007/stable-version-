import React, { useEffect, useRef } from 'react';

const ARViewer = ({ src, className, style }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    // Dynamically load the Clooned viewer script
    const scriptId = 'clooned-viewer-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = "https://studio.clooned.com/embed/viewer.js";
      script.async = true;
      document.body.appendChild(script);
    }

    // Force Clooned to re-initialize if the component remounts or src changes
    // Some embed scripts look for elements on load. If it's a SPA, we might need this.
    if (window.CloonedViewer && typeof window.CloonedViewer.init === 'function') {
      try {
        window.CloonedViewer.init();
      } catch (e) {
        console.error("CloonedViewer re-init failed", e);
      }
    }
  }, [src]);

  // Extract ID if the entire HTML snippet was passed in via props occasionally
  let modelId = src;
  if (modelId && modelId.includes('data-model=')) {
    const match = modelId.match(/data-model=["']([^"']+)["']/);
    if (match) modelId = match[1];
  }

  if (!modelId) return null;

  return (
    <div 
      ref={containerRef}
      className={`ar-viewer-container relative w-full h-full min-h-[400px] flex items-center justify-center bg-gray-50 overflow-hidden rounded-2xl border border-gray-100 ${className || ''}`} 
      style={style}
    >
      <div 
        className="clooned-3d" 
        data-model={modelId} 
        style={{ width: '100%', height: '100%', aspectRatio: '16/9' }}
      ></div>
    </div>
  );
};

export default ARViewer;
