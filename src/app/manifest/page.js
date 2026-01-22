"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Loader2,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ManifestForm from "./components/ManifestForm";
import AppList from "./components/AppList";

export default function ManifestPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const action = searchParams.get('action');
  const messageParam = searchParams.get('message');

  const [existingApps, setExistingApps] = useState([]);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(true);
  
  // Feedback Message
  const [message, setMessage] = useState(null);

  // View State
  const isCreating = action === 'create';

  const handleCloseCreate = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('action');
    router.push(`${pathname}?${params.toString()}`);
  };

  const fetchRegistry = () => {
    setIsLoadingRegistry(true);
    fetch("/api/manifest/next-id")
      .then(res => res.json())
      .then(data => {
        if (data.registry) {
            setExistingApps(data.registry.sort((a,b) => parseInt(b.id) - parseInt(a.id)));
        }
      })
      .catch(err => console.error("Failed to fetch registry:", err))
      .finally(() => setIsLoadingRegistry(false));
  };

  useEffect(() => {
    fetchRegistry();
    if (messageParam) {
        setMessage({ text: messageParam, type: 'success' });
        // Clean URL
        const params = new URLSearchParams(searchParams);
        params.delete('message');
        window.history.replaceState(null, '', `${pathname}?${params.toString()}`);
    }
  }, [messageParam]);

  const filteredApps = existingApps.filter(app => 
    app.name.toLowerCase().includes(searchQuery) ||
    app.id.toString().includes(searchQuery) ||
    (app.image && app.image.toLowerCase().includes(searchQuery)) ||
    (app.liveIngressProd && app.liveIngressProd.toLowerCase().includes(searchQuery))
  );

  const handleFormSuccess = (msg) => {
    handleCloseCreate();
    setMessage({ text: msg, type: 'success' });
    fetchRegistry();
  };

  return (
    <DashboardLayout>
        <div className="w-full h-full flex flex-col">
          
          {/* Feedback Message (Page Level) */}
          {message && !isCreating && (
            <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 text-sm animate-in fade-in slide-in-from-top-2 ${ 
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
            }`}>
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
              <span>{message.text}</span>
              <button onClick={() => setMessage(null)} className="ml-auto hover:opacity-70"><X size={16}/></button>
            </div>
          )}

          {isCreating ? (
              /* Create App View (Replaces AppList) */
              <div className="animate-in fade-in slide-in-from-bottom-4">
                  <ManifestForm 
                      onClose={handleCloseCreate} 
                      onSuccess={handleFormSuccess} 
                  />
              </div>
          ) : (
            <>
              {/* Apps Grid */}
              {isLoadingRegistry ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                  <Loader2 size={48} className="animate-spin text-[#FFA500] mb-4" />
                  <p>Loading application registry...</p>
                </div>
              ) : (
                <AppList 
                    apps={filteredApps}
                />
              )}
            </>
          )}
        </div>
    </DashboardLayout>
  );
}
