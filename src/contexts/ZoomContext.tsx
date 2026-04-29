import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ZoomContextType {
  zoom: number;
  setZoom: (zoom: number) => void;
  resetZoom: () => void;
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export const ZoomProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [zoom, setZoomState] = useState(1);

  const setZoom = (value: number) => {
    setZoomState(Math.min(2, Math.max(0.5, value)));
  };

  const resetZoom = () => setZoomState(1);

  return (
    <ZoomContext.Provider value={{ zoom, setZoom, resetZoom }}>
      {children}
    </ZoomContext.Provider>
  );
};

export const useZoom = () => {
  const context = useContext(ZoomContext);
  if (context === undefined) {
    throw new Error('useZoom must be used within a ZoomProvider');
  }
  return context;
};
