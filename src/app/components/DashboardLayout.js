'use client';

import Navigation from './Navigation';
import TopBar from './TopBar';
import { useSidebar } from '../providers/SidebarProvider';

export default function DashboardLayout({ children }) {
  // Use global state from context to prevent flicker on navigation
  const { isCollapsed, toggleCollapse } = useSidebar();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors">
      <Navigation 
        isCollapsed={isCollapsed} 
        toggleCollapse={toggleCollapse}
      />

      {/* Main Content Wrapper with Dynamic Margin */}
      <main 
        className={`transition-all duration-300 ease-in-out min-h-screen p-6 text-neutral-900 dark:text-white ${
            isCollapsed ? 'md:ml-20' : 'md:ml-60'
        }`}
      >
        <TopBar />
        {children}
      </main>
    </div>
  );
}
