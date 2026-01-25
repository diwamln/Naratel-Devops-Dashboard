'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const SidebarContext = createContext();

export function SidebarProvider({ children }) {
  // Default false (expanded) untuk menghindari hydration mismatch
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Hanya berjalan di client side sekali saat mount
    const saved = localStorage.getItem('sidebar_collapsed');
    if (saved !== null) {
      // eslint-disable-next-line
      setIsCollapsed(JSON.parse(saved));
    }
    setIsInitialized(true);
  }, []);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const newState = !prev;
      localStorage.setItem('sidebar_collapsed', JSON.stringify(newState));
      return newState;
    });
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleCollapse, isInitialized }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
