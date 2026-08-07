import { createContext, useContext, useState, useEffect } from 'react';

const ViewerContext = createContext(null);

export const ViewerProvider = ({ children }) => {
  const [isViewer, setIsViewer] = useState(() => {
    return localStorage.getItem('amss_viewer_mode') === 'true';
  });

  const enableViewerMode = () => {
    setIsViewer(true);
    localStorage.setItem('amss_viewer_mode', 'true');
  };

  const disableViewerMode = () => {
    setIsViewer(false);
    localStorage.removeItem('amss_viewer_mode');
  };

  const toggleViewerMode = () => {
    if (isViewer) disableViewerMode();
    else enableViewerMode();
  };

  return (
    <ViewerContext.Provider value={{ isViewer, enableViewerMode, disableViewerMode, toggleViewerMode }}>
      {children}
    </ViewerContext.Provider>
  );
};

export const useViewer = () => {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error('useViewer must be inside ViewerProvider');
  return ctx;
};
