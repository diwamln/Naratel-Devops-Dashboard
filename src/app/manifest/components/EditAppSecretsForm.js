"use client";

import { useState, useEffect } from "react";
import {
  Lock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Upload,
  X,
  Plus,
  Trash2,
  Key,
  Save,
  AlertTriangle,
  FlaskConical
} from "lucide-react";

export default function EditAppSecretsForm({ appName, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Structure: { key: string, valueProd: string, valueTest: string }
  const [appSecrets, setAppSecrets] = useState([]);
  const [activeTab, setActiveTab] = useState('prod'); // 'prod' | 'test'

  const [appFileName, setAppFileName] = useState('');

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch(`/api/manifest/secrets?appName=${appName}`);
            if (!res.ok) throw new Error("Failed to fetch secrets");
            const data = await res.json();
            
            // Transform API data to local state
            // The API returns existing keys. Values are effectively empty/masked.
            // We assume the API returns a merged list of keys from prod/test if possible, 
            // or just the keys found in the prod secrets file.
            const loadedSecrets = (data.appSecrets || []).map(s => ({
                key: s.key,
                valueProd: "", // Always empty for security (Write-Only)
                valueTest: ""
            }));
            
            setAppSecrets(loadedSecrets);
        } catch (e) {
            setMessage({ text: e.message, type: 'error' });
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, [appName]);

  // --- Parse .env ---
  const parseEnvFile = (content) => {
    const lines = content.split('\n');
    const parsed = [];
    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        if ((value.startsWith("'" ) && value.endsWith("'")) || (value.startsWith('"') && value.endsWith('"'))) {
          value = value.slice(1, -1);
        }
        parsed.push({ key, value });
      }
    });
    return parsed;
  };

  // --- Handlers ---
  const handleAppFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const parsed = parseEnvFile(e.target.result);
      const newSecrets = parsed.map(p => ({ key: p.key, valueProd: p.value, valueTest: p.value })); // Fill both
      
      setAppSecrets(prev => {
          const merged = [...prev];
          newSecrets.forEach(ns => {
              const idx = merged.findIndex(m => m.key === ns.key);
              if (idx >= 0) {
                  // Update both values if key exists
                  merged[idx].valueProd = ns.valueProd;
                  merged[idx].valueTest = ns.valueTest;
              } else {
                  merged.push(ns);
              }
          });
          return merged;
      });
      setAppFileName(file.name);
    };
    reader.readAsText(file);
  };

  const updateAppSecret = (index, field, value) => {
    const updated = [...appSecrets];
    updated[index][field] = value;
    
    // Auto-sync Prod -> Test if typing in Prod
    if (field === 'valueProd') {
        // Only if Test value is empty or same as old Prod value? 
        // Simple logic: If user types in Prod, and Test is not explicitly different (handled by user switching tab),
        // we might want to sync. But here, explicit is better.
        // Let's implement the same convenience auto-sync as Wizard
        // BUT, since values are masked initially, we don't know if they were same.
        // Let's just update the specific field.
        // User can use "Import .env" to bulk update both.
    }
    
    setAppSecrets(updated);
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setMessage({ text: '', type: '' });

      try {
          // Prepare payload: split into prod and test objects
          // We need to send ALL keys that have at least one value set, or all keys to maintain structure.
          // The API expects: { appName, appSecrets: [{key, value}], appSecretsTest: [{key, value}] }
          
          const payloadProd = appSecrets.map(s => ({ key: s.key, value: s.valueProd })).filter(s => s.value !== "");
          const payloadTest = appSecrets.map(s => ({ key: s.key, value: s.valueTest })).filter(s => s.value !== "");

          const res = await fetch('/api/manifest/secrets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  appName,
                  appSecrets: payloadProd,
                  appSecretsTest: payloadTest
              }) 
          });
          
          const result = await res.json();
          if (res.ok) {
              onSuccess(result.message);
          } else {
              throw new Error(result.error || "Failed to update secrets");
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

  const currentField = activeTab === 'prod' ? 'valueProd' : 'valueTest';

  return (
    <div className="w-full">
        {/* Helper Text */}
        <div className="mb-6 flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-900 rounded-md border border-neutral-100 dark:border-neutral-800">
            <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={16} />
            <div className="text-xs text-neutral-500">
                <span className="font-semibold text-neutral-700 dark:text-neutral-300">Secure Write-Only Mode:</span> Values are encrypted. Entering a new value overwrites the existing one. Empty fields preserve the current encrypted value.
            </div>
        </div>

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
            
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-800">
                        <button 
                            type="button" 
                            onClick={() => setActiveTab('prod')} 
                            className={`pb-2 text-sm font-bold border-b-2 transition-colors ${activeTab === 'prod' ? 'border-[#FFA500] text-[#FFA500]' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                        >
                            Production Secrets
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setActiveTab('test')} 
                            className={`pb-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'test' ? 'border-orange-400 text-orange-400' : 'border-transparent text-neutral-500 hover:text-neutral-700'}`}
                        >
                            <FlaskConical size={14}/> Testing Secrets
                        </button>
                    </div>
                    
                    {/* Import Button / Area (Context Sensitive) */}
                    <div className="relative">
                        <input type="file" accept=".env" className="hidden" id="edit-app-env" onChange={(e) => e.target.files.length && handleAppFile(e.target.files[0])} />
                        <label 
                            htmlFor="edit-app-env" 
                            className="cursor-pointer flex items-center gap-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 px-3 py-1.5 rounded transition-all"
                        >
                            <Upload size={12} /> 
                            {appFileName ? <span>Loaded</span> : <span>Import .env</span>}
                        </label>
                    </div>
                </div>

               <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {appSecrets.map((secret, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-2 items-start md:items-center p-3 rounded-md bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors">
                          <div className="w-full md:w-1/3 flex items-center gap-2">
                              <Key size={14} className="text-neutral-300 shrink-0" />
                              <input 
                                 placeholder="KEY_NAME"
                                 className="w-full bg-transparent text-xs font-mono font-medium text-neutral-700 dark:text-neutral-300 outline-none"
                                 value={secret.key}
                                 onChange={e => updateAppSecret(idx, 'key', e.target.value)} // Allow renaming keys? Yes.
                                 // title="Key Name"
                              />
                          </div>
                          <div className="w-full md:w-2/3 flex flex-col md:flex-row gap-2">
                             <input 
                                placeholder={activeTab === 'prod' ? "Value (Production)" : "Value (Testing)"}
                                className={`flex-1 p-2 text-xs border border-neutral-300 dark:border-neutral-800 rounded-lg bg-neutral-50 dark:bg-neutral-950 focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500] outline-none transition-all placeholder-neutral-400`}
                                value={secret[currentField]}
                                onChange={e => updateAppSecret(idx, currentField, e.target.value)}
                                autoComplete="off"
                             />
                             <button type="button" onClick={() => setAppSecrets(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded transition-colors">
                                <Trash2 size={14} />
                             </button>
                          </div>
                      </div>
                  ))}
                  
                  {appSecrets.length === 0 && (
                      <div className="text-center py-8 text-neutral-400 text-xs italic border border-dashed border-neutral-200 dark:border-neutral-800 rounded-md">
                          No secrets defined.
                      </div>
                  )}

                  <button 
                    type="button" 
                    onClick={() => setAppSecrets([...appSecrets, {key: "NEW_KEY", valueProd: "", valueTest: ""}])} 
                    className="w-full py-2 flex items-center justify-center gap-2 text-xs font-medium text-neutral-500 hover:text-neutral-900 dark:hover:text-white border border-dashed border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-600 rounded-md transition-all"
                  >
                      <Plus size={14} /> Add Variable
                  </button>
               </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
              <button
                  type="submit"
                  disabled={saving}
                  className="w-full md:w-auto flex items-center justify-center gap-2 bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 text-white font-medium py-2 px-6 rounded-md transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm ml-auto"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Encrypting & Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      Save Changes
                    </>
                  )}
                </button>
            </div>
        </form>
    </div>
  );
}