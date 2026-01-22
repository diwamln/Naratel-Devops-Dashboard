"use client";

import { useState, useEffect } from "react";
import {
  Network,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Globe
} from "lucide-react";

export default function EditIngressForm({ appName, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [enabled, setEnabled] = useState(false);
  const [host, setHost] = useState("");
  const [tls, setTls] = useState(false);

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch(`/api/manifest/ingress?appName=${appName}`);
            if (!res.ok) throw new Error("Failed to fetch ingress config");
            const data = await res.json();
            
            setEnabled(data.enabled);
            setHost(data.host || "");
            setTls(data.tls);
        } catch (e) {
            setMessage({ text: e.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [appName]);

  // --- Submit ---
  const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setMessage({ text: '', type: '' });

      try {
          const res = await fetch('/api/manifest/ingress', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  appName,
                  enabled,
                  host,
                  tls
              })
          });
          
          const result = await res.json();
          if (res.ok) {
              onSuccess(result.message);
          } else {
              throw new Error(result.error || "Failed to update ingress");
          }
      } catch (e) {
          setMessage({ text: e.message, type: 'error' });
          setSaving(false);
      }
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center p-8 text-neutral-400">
              <Loader2 size={24} className="animate-spin mb-2" />
              <p className="text-xs">Loading...</p>
          </div>
      );
  }

  return (
    <div className="w-full">
        {message.text && (
          <div className={`mb-6 p-3 rounded-md border text-sm flex items-center gap-2 ${ 
            message.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' 
              : 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
          }`}>
            {message.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="space-y-6">
               
               {/* Toggle Enable */}
               <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-4">
                  <div>
                      <h3 className="text-sm font-medium text-neutral-900 dark:text-white">Public Access</h3>
                      <p className="text-xs text-neutral-500 mt-0.5">Enable Ingress to expose this application to the internet.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
                    <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-none rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-neutral-600 peer-checked:bg-neutral-900 dark:peer-checked:bg-white"></div>
                  </label>
               </div>

               {/* Hostname Input */}
               <div className={`transition-all duration-300 ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                  <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">Hostname</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                        <Globe size={14} />
                    </div>
                    <input 
                        required={enabled}
                        disabled={!enabled}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 dark:border-neutral-800 rounded-md bg-white dark:bg-neutral-900 focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white outline-none transition-all placeholder-neutral-400"
                        placeholder="e.g. app.naratel.id"
                        value={host}
                        onChange={e => setHost(e.target.value)}
                    />
                  </div>
                  <p className="text-[10px] text-neutral-400 mt-1.5">
                      Testing env will automatically use <code>test-{host || '...'}</code>
                  </p>
               </div>

               {/* TLS Toggle */}
               <div className={`flex items-center gap-2 ${enabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                   <input 
                    type="checkbox" 
                    id="tls-check"
                    checked={tls}
                    disabled={!enabled}
                    onChange={(e) => setTls(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-900 dark:bg-neutral-800 dark:border-neutral-700"
                   />
                   <label htmlFor="tls-check" className="text-sm text-neutral-600 dark:text-neutral-400 select-none cursor-pointer">Enable HTTPS / TLS (Auto-Certificate)</label>
               </div>

            </div>

            <div className="pt-4">
              <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-white font-medium py-2 px-6 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Changes
                    </>
                  )}
                </button>
            </div>
        </form>
    </div>
  );
}
