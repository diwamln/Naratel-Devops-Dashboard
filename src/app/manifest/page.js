"use client";

import { useState, useEffect } from "react";
import {
  Server,
  CheckCircle,
  AlertCircle,
  Plus,
  X,
  Loader2
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import ManifestForm from "./components/ManifestForm";
import AppList from "./components/AppList";
import EditAppSecretsForm from "./components/EditAppSecretsForm";
import EditDbSecretsForm from "./components/EditDbSecretsForm";
import EditIngressForm from "./components/EditIngressForm";

export default function ManifestPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const action = searchParams.get('action');

  const [existingApps, setExistingApps] = useState([]);
  const [isLoadingRegistry, setIsLoadingRegistry] = useState(true);
  const [isDeleting, setIsDeleting] = useState(null);
  
  // View State
  const isCreating = action === 'create';

  const handleCloseCreate = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('action');
    router.push(`${pathname}?${params.toString()}`);
  };
  
  const [isEditAppSecretsOpen, setIsEditAppSecretsOpen] = useState(false);
  const [isEditDbSecretsOpen, setIsEditDbSecretsOpen] = useState(false);
  const [editingAppName, setEditingAppName] = useState(null);

  const [isIngressModalOpen, setIsIngressModalOpen] = useState(false);
  const [ingressAppName, setIngressAppName] = useState(null);

  const [message, setMessage] = useState(null);

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
  }, []);

  const filteredApps = existingApps.filter(app => 
    app.name.toLowerCase().includes(searchQuery) ||
    app.id.toString().includes(searchQuery) ||
    (app.image && app.image.toLowerCase().includes(searchQuery)) ||
    (app.liveIngressProd && app.liveIngressProd.toLowerCase().includes(searchQuery))
  );

  const handleDelete = async (appId, appName) => {
    if(!confirm(`Are you sure you want to delete ${appName} (ID: ${appId})? This will remove all manifests from the repository.`)) return;
    
    setIsDeleting(appId);
    setMessage(null);

    try {
        const res = await fetch("/api/manifest/delete", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ appId, appName })
        });
        const result = await res.json();

        if (res.ok) {
            setMessage({ text: result.message, type: 'success' });
            fetchRegistry();
        } else {
            throw new Error(result.error || "Failed to delete app");
        }
    } catch (err) {
        setMessage({ text: err.message, type: 'error' });
    } finally {
        setIsDeleting(null);
    }
  };

  const handleFormSuccess = (msg) => {
    handleCloseCreate();
    setMessage({ text: msg, type: 'success' });
    fetchRegistry();
  };

  const handleEditAppSecrets = (appName) => {
      setEditingAppName(appName);
      setIsEditAppSecretsOpen(true);
  };

  const handleEditDbSecrets = (appName) => {
      setEditingAppName(appName);
      setIsEditDbSecretsOpen(true);
  };

  const handleEditAppSecretsSuccess = (msg) => {
      setIsEditAppSecretsOpen(false);
      setEditingAppName(null);
      setMessage({ text: msg, type: 'success' });
  };

  const handleEditDbSecretsSuccess = (msg) => {
      setIsEditDbSecretsOpen(false);
      setEditingAppName(null);
      setMessage({ text: msg, type: 'success' });
  };

  const handleEditIngress = (appName) => {
      setIngressAppName(appName);
      setIsIngressModalOpen(true);
  };

  const handleIngressSuccess = (msg) => {
      setIsIngressModalOpen(false);
      setIngressAppName(null);
      setMessage({ text: msg, type: 'success' });
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
                    onDelete={handleDelete}
                    onEditAppSecrets={handleEditAppSecrets}
                    onEditDbSecrets={handleEditDbSecrets}
                    onEditIngress={handleEditIngress}
                    isDeleting={isDeleting}
                    onCreate={() => {
                        const params = new URLSearchParams(searchParams);
                        params.set('action', 'create');
                        router.push(`${pathname}?${params.toString()}`);
                    }}
                />
              )}
            </>
          )}
        </div>

        {/* Modal Edit App Secrets Overlay */}
        {isEditAppSecretsOpen && editingAppName && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
                <EditAppSecretsForm 
                    appName={editingAppName}
                    onClose={() => { setIsEditAppSecretsOpen(false); setEditingAppName(null); }} 
                    onSuccess={handleEditAppSecretsSuccess} 
                />
            </div>
        )}

        {/* Modal Edit DB Secrets Overlay */}
        {isEditDbSecretsOpen && editingAppName && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
                <EditDbSecretsForm 
                    appName={editingAppName}
                    onClose={() => { setIsEditDbSecretsOpen(false); setEditingAppName(null); }} 
                    onSuccess={handleEditDbSecretsSuccess} 
                />
            </div>
        )}

        {/* Modal Edit Ingress Overlay */}
        {isIngressModalOpen && ingressAppName && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-in fade-in">
                <EditIngressForm
                    appName={ingressAppName}
                    onClose={() => { setIsIngressModalOpen(false); setIngressAppName(null); }} 
                    onSuccess={handleIngressSuccess} 
                />
            </div>
        )}

    </DashboardLayout>
  );
}