'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  FilePlus,
  ChevronRight,
  LayoutGrid,
  PanelLeftClose,
  PanelRightClose,
  GitBranch
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useTheme } from 'next-themes';
import Image from "next/image";
import Logo from '@/assets/Logo.png';

export default function Navigation({ isCollapsed = false, toggleCollapse }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Mencegah hydration mismatch
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  const menuItems = [
    {
      label: 'App List',
      href: '/',
      icon: LayoutGrid,
    },
    {
      label: 'Approval Gateway',
      href: '/approval',
      icon: GitBranch,
    },
    {
      label: 'Tools & Services',
      href: '/tools',
      icon: Activity,
    }
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <>
      {/* Mobile Top Navigation */}
      <nav className="md:hidden bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50 backdrop-blur-sm bg-white/95 dark:bg-neutral-900/95 transition-colors">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="h-8 w-auto">
                <Image
                  src={Logo}
                  alt="Logo"
                  className="h-full w-auto object-contain"
                  priority
                />
              </div>
              <span className="text-lg font-bold text-neutral-900 dark:text-white">DevOps</span>
            </div>

            <div className="flex items-center gap-2">
              {mounted && (
                <button
                  onClick={toggleTheme}
                  className="p-2 text-neutral-500 dark:text-neutral-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-neutral-500 dark:text-neutral-400 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="py-4 space-y-2 border-t border-neutral-200 dark:border-neutral-800">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold transition-all ${isActive
                      ? 'bg-[#FFA500] text-white shadow-md'
                      : 'text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight size={16} />}
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-semibold hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-50 transition-all duration-300 ease-in-out ${isCollapsed ? 'md:w-20' : 'md:w-60'
          }`}
      >
        {/* Logo Section */}
        <div className={`flex items-center p-6 mb-2 ${isCollapsed ? 'justify-center px-2' : 'justify-start px-6 gap-3'}`}>
          <div className="h-10 w-auto min-w-[40px]">
            <Image
              src={Logo}
              alt="Logo"
              className="h-full w-auto object-contain"
              priority
            />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col animate-in fade-in duration-300">
              <span className="text-sm font-black text-neutral-900 dark:text-white leading-none uppercase">Naratel</span>
              <span className="text-[10px] font-bold text-[#FFA500] uppercase tracking-widest">DevOps</span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="flex-1 px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                title={isCollapsed ? item.label : ''}
                className={`w-full group flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-[#FFA500] text-white shadow-lg shadow-[#FFA500]/20'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
              >
                <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : ''}`}>
                  <Icon size={18} className={isActive ? 'text-white' : 'group-hover:text-[#FFA500]'} />
                  {!isCollapsed && <span className="text-sm font-bold truncate">{item.label}</span>}
                </div>
                {(!isCollapsed && isActive) && <ChevronRight size={14} className="animate-pulse" />}
              </Link>
            );
          })}
        </div>

        {/* Bottom Section: Theme & Logout */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-800 space-y-1">
          {mounted && (
            <button
              onClick={toggleTheme}
              title={isCollapsed ? (theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode') : ''}
              className={`w-full flex items-center px-4 py-3 text-neutral-500 dark:text-neutral-400 hover:text-[#FFA500] rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${isCollapsed ? 'justify-center px-0' : 'gap-3'
                }`}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              {!isCollapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
            </button>
          )}

          <button
            onClick={handleLogout}
            title={isCollapsed ? "Logout" : ""}
            className={`w-full flex items-center px-4 py-3 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all text-xs font-bold uppercase tracking-wider ${isCollapsed ? 'justify-center px-0' : 'gap-3'
              }`}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Logout System</span>}
          </button>
        </div>

        {/* Floating Sidebar Toggle (Bottom) */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-800/50 flex justify-center">
          <button
            onClick={toggleCollapse}
            className="flex items-center justify-center w-full py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-[#FFA500] hover:border-[#FFA500]/50 transition-all duration-300 shadow-sm group"
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? (
              <PanelRightClose size={20} className="group-hover:scale-110 transition-transform" />
            ) : (
              <div className="flex items-center gap-2">
                <PanelLeftClose size={20} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-bold uppercase tracking-tighter">Hide Sidebar</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
