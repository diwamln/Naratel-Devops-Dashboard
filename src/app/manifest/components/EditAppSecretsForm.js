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
  AlertTriangle
} from "lucide-react";

export default function EditAppSecretsForm({ appName, onClose, onSuccess }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const [appSecrets, setAppSecrets] = useState([]);

  const [isDraggingApp, setIsDraggingApp] = useState(false);
  const [appFileName, setAppFileName] = useState('');

  // --- Fetch Initial Data ---
  useEffect(() => {
    const fetchData = async () => {
        try {
            const res = await fetch(`/api/manifest/secrets?appName=${appName}`);
            if (!res.ok) throw new Error("Failed to fetch secrets");
            const data = await res.json();
            setAppSecrets(data.appSecrets || []);
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
      const newSecrets = parsed.map(p => ({ key: p.key, valueProd: p.value, valueTest: p.value }));
      setAppSecrets(prev => {
          const merged = [...prev];
          newSecrets.forEach(ns => {
              const idx = merged.findIndex(m => m.key === ns.key);
              if (idx >= 0) merged[idx] = ns;
              else merged.push(ns);
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
    setAppSecrets(updated);
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setSaving(true);
      setMessage({ text: '', type: '' });

      try {
          // Only send appSecrets
          const res = await fetch('/api/manifest/secrets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ appName, appSecrets }) 
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
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-xl shadow-2xl flex flex-col items-center justify-center min-w-[300px]">
              <Loader2 size={32} className="animate-spin text-[#FFA500] mb-4" />
              <p className="text-sm font-semibold text-neutral-500">Reading config...</p>
          </div>
      );
  }

  return (
    <div className="bg-white dark:bg-neutral-900 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative flex flex-col">
       {/* Header */}
       <div className="sticky top-0 z-10 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm p-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Lock className="text-[#FFA500]" /> App Secrets: <span className="text-neutral-500">{appName}</span>
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
             <X size={20} />
          </button>
       </div>

       <div className="p-6">        
        {/* Warning Banner */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 rounded-lg mb-6 flex items-start gap-3">
            <AlertTriangle className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" size={20} />
            <div className="text-sm text-amber-800 dark:text-amber-200">
                <p className="font-bold">Write-Only Mode (Secure)</p>
                <p>Values are encrypted. Enter new values to overwrite. Empty fields will be skipped/unchanged.</p>
            </div>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 text-sm ${ 
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' 
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'
          }`}>
            {message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* APP SECRETS */}
            <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-950/50">
               <div className="flex items-center gap-2 mb-4 text-[#FFA500]">
                  <Key size={20} />
                  <h3 className="font-bold uppercase text-sm tracking-wider text-neutral-500">Application Environment Variables</h3>
               </div>

                {/* Drag & Drop */}
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingApp(true); }}
                    onDragLeave={(e) => { e.preventDefault(); setIsDraggingApp(false); }}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingApp(false);
                        if(e.dataTransfer.files.length > 0) handleAppFile(e.dataTransfer.files[0]);
                    }}
                    className={`mb-4 border border-dashed rounded-lg p-4 text-center transition-all cursor-pointer ${ 
                    isDraggingApp
                        ? 'border-[#FFA500] bg-[#FFA500]/10'
                        : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:border-neutral-400'
                    }`}
                >
                    <input type="file" accept=".env" className="hidden" id="edit-app-env" onChange={(e) => e.target.files.length && handleAppFile(e.target.files[0])} />
                    <label htmlFor="edit-app-env" className="cursor-pointer block">
                         <div className="flex items-center justify-center gap-2 text-sm text-neutral-500">
                             <Upload size={16} /> <span>Import .env to Populate</span>
                         </div>
                         {appFileName && <p className="text-xs text-green-600 mt-1">{appFileName} loaded</p>}
                    </label>
                </div>

               <div className="space-y-3">
                  {appSecrets.map((secret, idx) => (
                      <div key={idx} className="flex gap-2 items-start">
                          <input 
                             placeholder="KEY"
                             className="flex-[0.5] p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono font-bold text-neutral-600 dark:text-neutral-400"
                             value={secret.key}
                             readOnly
                             title="Key cannot be changed in Edit Mode (delete and add new if needed)"
                             autoComplete="off"
                             name={`edit-app-key-${idx}`}
                          />
                          <div className="flex-1 flex flex-col gap-1">
                             <input 
                                placeholder="New Value (Production)"
                                className="w-full p-2 text-xs border border-orange-200 dark:border-orange-900/50 rounded dark:bg-neutral-950"
                                value={secret.valueProd}
                                onChange={e => updateAppSecret(idx, 'valueProd', e.target.value)}
                                autoComplete="off"
                                name={`edit-app-prod-${idx}`}
                             />
                             <input 
                                placeholder="New Value (Testing)"
                                className="w-full p-2 text-xs border border-blue-200 dark:border-blue-900/50 rounded dark:bg-neutral-950"
                                value={secret.valueTest}
                                onChange={e => updateAppSecret(idx, 'valueTest', e.target.value)}
                                autoComplete="off"
                                name={`edit-app-test-${idx}`}
                             />
                          </div>
                          <button type="button" onClick={() => setAppSecrets(prev => prev.filter((_, i) => i !== idx))} className="p-2 text-red-500 hover:bg-red-500/10 rounded">
                              <Trash2 size={16} />
                          </button>
                      </div>
                  ))}
                  <button type="button" onClick={() => setAppSecrets([...appSecrets, {key: "NEW_KEY", valueProd: "", valueTest: ""}])} className="text-sm flex items-center gap-1 text-[#FFA500] font-bold mt-2 hover:opacity-80">
                      <Plus size={16} /> Add New Key
                  </button>
               </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-[#FFA500] hover:bg-[#FFA500]/90 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Encrypting...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Save App Secrets
                    </>
                  )}
                </button>
            </div>
        </form>
       </div>
    </div>
  );
}
