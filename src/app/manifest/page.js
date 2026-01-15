"use client";

import { useState, useEffect } from "react";
import {
  FilePlus,
  Server,
  Database,
  Loader2,
  CheckCircle,
  AlertCircle,
  Box,
  Plus,
  Trash2,
  Lock,
  Network,
  Upload,
  FileText,
  X,
  Key
} from "lucide-react";
import Navigation from "../components/Navigation";
import { useRouter } from "next/navigation";

export default function ManifestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Drag & Drop States
  const [isDraggingApp, setIsDraggingApp] = useState(false);
  const [appFileName, setAppFileName] = useState('');
  const [isDraggingDb, setIsDraggingDb] = useState(false);
  const [dbFileName, setDbFileName] = useState('');

  const [form, setForm] = useState({
    // Application Details
    appName: "",
    appId: "005",
    imageRepo: "",
    imageTag: "",
    servicePort: 80,
    targetPort: 3000,

    // Database Add-on
    dbType: "none", // none, postgres, mariadb

    // Secrets
    appSecrets: [], // { key: "", value: "" }
    separateAppSecrets: false,
    dbSecrets: [],  // { key: "", value: "" }
    separateDbSecrets: false,

    // Ingress
    ingressEnabled: false,
    ingressHost: "",
    tlsEnabled: false
  });

  const [existingApps, setExistingApps] = useState([]);
  const [isDeleting, setIsDeleting] = useState(null); // stores appId being deleted

  const fetchRegistry = () => {
    fetch("/api/manifest/next-id")
      .then(res => res.json())
      .then(data => {
        if (data.nextId) {
            setForm(prev => ({ ...prev, appId: data.nextId }));
        }
        if (data.registry) {
            setExistingApps(data.registry.sort((a,b) => parseInt(b.id) - parseInt(a.id)));
        }
      })
      .catch(err => console.error("Failed to fetch registry:", err));
  };

  useEffect(() => {
    fetchRegistry();
  }, []);


  // --- Helper: Parse .env ---
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
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'" ) && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        parsed.push({ key, value });
      }
    });
    return parsed;
  };

  // --- App Secrets Handlers ---
  const handleAppFile = (file) => {
    if (!file.name.endsWith('.env') && !file.name.startsWith('.env')) {
      setMessage({ text: 'Please upload a valid .env file', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseEnvFile(e.target.result);
        if (parsed.length === 0) {
          setMessage({ text: 'File is empty or invalid', type: 'error' });
          return;
        }
        // Map to include Prod/Test values for future toggling
        const richParsed = parsed.map(p => ({
            ...p,
            valueProd: p.value,
            valueTest: p.value
        }));
        
        setForm(prev => ({ ...prev, appSecrets: richParsed }));
        setAppFileName(file.name);
        setMessage({ text: `Loaded ${parsed.length} variables for App from ${file.name}`, type: 'success' });
      } catch (err) {
        setMessage({ text: 'Failed to read file', type: 'error' });
      }
    };
    reader.readAsText(file);
  };
  
  const clearAppEnv = () => {
    setAppFileName('');
    setForm(prev => ({ ...prev, appSecrets: [] }));
  };

  const addAppSecret = () => {
    setForm(prev => ({ ...prev, appSecrets: [...prev.appSecrets, { key: "", value: "", valueProd: "", valueTest: "" }] }));
  };
  
  const toggleSeparateAppSecrets = () => {
    setForm(prev => {
        const isSeparating = !prev.separateAppSecrets;
        const newSecrets = prev.appSecrets.map(s => {
            if (isSeparating) {
                // Switching from Single to Split: Copy value to Prod/Test
                return { ...s, valueProd: s.value, valueTest: s.value };
            } else {
                // Switching from Split to Single: Copy Prod value to common
                return { ...s, value: s.valueProd };
            }
        });
        return { ...prev, separateAppSecrets: isSeparating, appSecrets: newSecrets };
    });
  };

  const updateAppSecret = (index, field, value) => {
    const updated = [...form.appSecrets];
    updated[index][field] = value;
    setForm(prev => ({ ...prev, appSecrets: updated }));
  };

  const removeAppSecret = (index) => {
    setForm(prev => ({ ...prev, appSecrets: prev.appSecrets.filter((_, i) => i !== index) }));
  };

  // --- DB Secrets Handlers ---
  const handleDbFile = (file) => {
    if (!file.name.endsWith('.env') && !file.name.startsWith('.env')) {
      setMessage({ text: 'Please upload a valid .env file', type: 'error' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseEnvFile(e.target.result);
        if (parsed.length === 0) {
          setMessage({ text: 'File is empty or invalid', type: 'error' });
          return;
        }
        // Map to include Prod/Test values
        const richParsed = parsed.map(p => ({
            ...p,
            valueProd: p.value,
            valueTest: p.value
        }));

        setForm(prev => ({ ...prev, dbSecrets: richParsed }));
        setDbFileName(file.name);
        setMessage({ text: `Loaded ${parsed.length} variables for DB from ${file.name}`, type: 'success' });
      } catch (err) {
        setMessage({ text: 'Failed to read file', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  const clearDbEnv = () => {
    setDbFileName('');
    setForm(prev => ({ ...prev, dbSecrets: [] }));
  };

  const addDbSecret = () => {
    setForm(prev => ({ ...prev, dbSecrets: [...prev.dbSecrets, { key: "", value: "", valueProd: "", valueTest: "" }] }));
  };
  
  const toggleSeparateDbSecrets = () => {
    setForm(prev => {
        const isSeparating = !prev.separateDbSecrets;
        const newSecrets = prev.dbSecrets.map(s => {
            if (isSeparating) {
                // Switching from Single to Split: Copy value to Prod/Test
                return { ...s, valueProd: s.value, valueTest: s.value };
            } else {
                // Switching from Split to Single: Copy Prod value to common
                return { ...s, value: s.valueProd };
            }
        });
        return { ...prev, separateDbSecrets: isSeparating, dbSecrets: newSecrets };
    });
  };

  const updateDbSecret = (index, field, value) => {
    const updated = [...form.dbSecrets];
    updated[index][field] = value;
    setForm(prev => ({ ...prev, dbSecrets: updated }));
  };

  const removeDbSecret = (index) => {
    setForm(prev => ({ ...prev, dbSecrets: prev.dbSecrets.filter((_, i) => i !== index) }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch("/api/manifest/generate", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const result = await res.json();
      
      if (res.ok) {
        setMessage({ text: result.message, type: 'success' });
        fetchRegistry(); // Refresh list
      } else {
        throw new Error(result.error || "Failed to generate manifest");
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (appId, appName) => {
    if(!confirm(`Are you sure you want to delete ${appName} (ID: ${appId})? This will remove all manifests from the repository.`)) return;
    
    setIsDeleting(appId);
    setMessage({ text: '', type: '' });

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

  const handleNavigation = (pageId) => {
    if (pageId === 'jenkins') router.push('/');
    if (pageId === 'k8s-secret') router.push('/secrets');
    if (pageId === 'manifest') router.push('/manifest');
  };

  const handleDbTypeChange = (e) => {
     const type = e.target.value;
     let newDbSecrets = [];
     
     if (type === 'postgres') {
        newDbSecrets = [
           { key: "POSTGRES_DB", value: "", valueProd: "", valueTest: "" },
           { key: "POSTGRES_USER", value: "", valueProd: "", valueTest: "" },
           { key: "POSTGRES_PASSWORD", value: "", valueProd: "", valueTest: "" }
        ];
     } else if (type === 'mariadb') {
        newDbSecrets = [
           { key: "MYSQL_DATABASE", value: "", valueProd: "", valueTest: "" },
           { key: "MYSQL_USER", value: "", valueProd: "", valueTest: "" },
           { key: "MYSQL_PASSWORD", value: "", valueProd: "", valueTest: "" },
           { key: "MYSQL_ROOT_PASSWORD", value: "", valueProd: "", valueTest: "" }
        ];
     }

     // Auto-inject DB_HOST into App Secrets
     let newAppSecrets = [...form.appSecrets];
     if (type !== 'none') {
        const dbHostValue = `svc-${form.appName || 'app'}-db-${form.appId || '000'}`;
        // Remove existing DB_HOST if present to avoid duplicates
        newAppSecrets = newAppSecrets.filter(s => s.key !== 'DB_HOST');
        // Add to top
        newAppSecrets.unshift({ key: "DB_HOST", value: dbHostValue, valueProd: dbHostValue, valueTest: dbHostValue });
     } else {
        // Optional: Remove DB_HOST if DB is disabled
        newAppSecrets = newAppSecrets.filter(s => s.key !== 'DB_HOST');
     }
     
     setForm(prev => ({ ...prev, dbType: type, dbSecrets: newDbSecrets, appSecrets: newAppSecrets }));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors">
      <Navigation activePage="manifest" onPageChange={handleNavigation} />

      <div className="md:ml-60 min-h-screen text-neutral-900 dark:text-white p-6">
        <div className="max-w-4xl mx-auto">
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FilePlus className="text-[#FFA500]" />
              WebUI Generator System
            </h1>
            <p className="text-neutral-500 dark:text-neutral-400 mt-1">
              Generate encrypted Helm values for Production & Testing environments.
            </p>
          </div>

          {/* Feedback Message */}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left: Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Application Details */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-[#FFA500]">
                    <Box size={20} />
                    <h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">Application Details</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">App Name</label>
                      <input required 
                        className="w-full p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none"
                        placeholder="e.g. inventory-app"
                        value={form.appName}
                        onChange={e => setForm({...form, appName: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">App ID</label>
                      <input required 
                        className="w-full p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none"
                        placeholder="e.g. 005"
                        value={form.appId}
                        onChange={e => setForm({...form, appId: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Image Repository</label>
                      <input required 
                        className="w-full p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none"
                        placeholder="e.g. devopsnaratel/todo-app-php (without https://)"
                        value={form.imageRepo}
                        onChange={e => setForm({...form, imageRepo: e.target.value})}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Image Tag</label>
                      <input required 
                        className="w-full p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none"
                        placeholder="e.g. v1.2.0"
                        value={form.imageTag}
                        onChange={e => setForm({...form, imageTag: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Service Port</label>
                      <input type="number" required 
                        className="w-full p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none"
                        value={form.servicePort}
                        onChange={e => setForm({...form, servicePort: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Target Port</label>
                      <input type="number" required 
                        className="w-full p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none"
                        value={form.targetPort}
                        onChange={e => setForm({...form, targetPort: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>
                </div>

                {/* 3. App Secrets */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-[#FFA500]">
                    <Lock size={20} />
                    <h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">App Deployment Secrets</h2>
                  </div>
                  <p className="text-xs text-neutral-500 mb-4">
                    These values will be encrypted using <strong>SOPS/Age</strong> in the App Manifest.
                  </p>

                  {/* Drag & Drop App Secrets */}
                  {!appFileName && (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDraggingApp(true); }}
                      onDragLeave={(e) => { e.preventDefault(); setIsDraggingApp(false); }}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingApp(false);
                        if(e.dataTransfer.files.length > 0) handleAppFile(e.dataTransfer.files[0]);
                      }}
                      className={`mb-4 border border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${ 
                        isDraggingApp
                          ? 'border-[#FFA500] bg-[#FFA500]/10'
                          : 'border-neutral-300 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-950/50 hover:border-neutral-400 dark:hover:border-neutral-600'
                      }`}
                    >
                      <input
                        type="file"
                        accept=".env"
                        onChange={(e) => { if(e.target.files.length) handleAppFile(e.target.files[0]) }}
                        className="hidden"
                        id="app-env-input"
                      />
                      <label htmlFor="app-env-input" className="cursor-pointer block">
                        <Upload className="mx-auto mb-2 text-neutral-400 dark:text-neutral-500" size={24} />
                        <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-0.5">
                          Drag & drop .env for App
                        </p>
                      </label>
                    </div>
                  )}

                                {/* App File Info */}
                                {appFileName && (
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-3 rounded-md mb-4">
                                      <div className="flex items-center gap-2">
                                        <FileText className="text-green-500" size={16} />
                                        <div>
                                          <p className="font-semibold text-xs text-neutral-900 dark:text-white">{appFileName}</p>
                                          <p className="text-[10px] text-neutral-500">{form.appSecrets.length} variables loaded</p>
                                        </div>
                                      </div>
                                      <button type="button" onClick={clearAppEnv} className="text-neutral-500 hover:text-red-500 transition-colors">
                                        <X size={14} />
                                      </button>
                                    </div>
                                )}
                  
                                {/* Split Toggle */}
                                <div className="flex items-center gap-2 mb-4">
                                   <input 
                                      type="checkbox" 
                                      id="splitAppSecrets"
                                      checked={form.separateAppSecrets}
                                      onChange={toggleSeparateAppSecrets}
                                      className="rounded border-neutral-300 text-[#FFA500] focus:ring-[#FFA500]"
                                   />
                                   <label htmlFor="splitAppSecrets" className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 cursor-pointer">
                                      Separate Production & Testing Values
                                   </label>
                                </div>
                  
                                <div className="space-y-3">
                                  {form.appSecrets.map((secret, idx) => (
                                    <div key={idx} className="flex gap-2 items-start">
                                      <input placeholder="KEY (e.g. API_KEY)" 
                                        className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono"
                                        value={secret.key}
                                        onChange={e => updateAppSecret(idx, 'key', e.target.value)}
                                      />
                                      
                                      {!form.separateAppSecrets ? (
                                          <input placeholder="VALUE" 
                                            className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800"
                                            value={secret.value}
                                            onChange={e => updateAppSecret(idx, 'value', e.target.value)}
                                          />
                                      ) : (
                                          <div className="flex-1 flex flex-col gap-2">
                                              <input placeholder="VALUE (PRODUCTION)" 
                                                className="w-full p-2 text-xs border border-orange-200 dark:border-orange-900/50 rounded dark:bg-neutral-950"
                                                value={secret.valueProd}
                                                onChange={e => updateAppSecret(idx, 'valueProd', e.target.value)}
                                              />
                                              <input placeholder="VALUE (TESTING)" 
                                                className="w-full p-2 text-xs border border-blue-200 dark:border-blue-900/50 rounded dark:bg-neutral-950"
                                                value={secret.valueTest}
                                                onChange={e => updateAppSecret(idx, 'valueTest', e.target.value)}
                                              />
                                          </div>
                                      )}
                  
                                      <button type="button" onClick={() => removeAppSecret(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded h-[34px]">
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  ))}
                                  
                                  <button type="button" onClick={addAppSecret} className="text-sm flex items-center gap-1 text-[#FFA500] font-bold mt-2 hover:opacity-80">
                                    <Plus size={16} /> Add App Secret
                                  </button>
                                </div>                </div>

                {/* 2. Database Add-on */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-[#FFA500]">
                    <Database size={20} />
                    <h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">Database Add-on</h2>
                  </div>
                  
                  <div className="flex gap-6 mb-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="dbType" value="none" 
                        checked={form.dbType === 'none'}
                        onChange={handleDbTypeChange}
                        className="text-[#FFA500] focus:ring-[#FFA500]"
                      />
                      <span className="text-sm">None</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="dbType" value="postgres" 
                        checked={form.dbType === 'postgres'}
                        onChange={handleDbTypeChange}
                        className="text-[#FFA500] focus:ring-[#FFA500]"
                      />
                      <span className="text-sm">PostgreSQL</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="dbType" value="mariadb" 
                        checked={form.dbType === 'mariadb'}
                        onChange={handleDbTypeChange}
                        className="text-[#FFA500] focus:ring-[#FFA500]"
                      />
                      <span className="text-sm">MariaDB / MySQL</span>
                    </label>
                  </div>

                  {/* DB Secrets (Conditional) */}
                  {form.dbType !== 'none' && (
                    <div className="animate-in fade-in slide-in-from-top-2 border-t border-neutral-100 dark:border-neutral-800 pt-6">
                        <div className="flex items-center gap-2 mb-4 text-[#FFA500]">
                            <Key size={18} />
                            <h3 className="font-bold uppercase text-xs tracking-wider text-neutral-500 dark:text-neutral-400">Database Secrets (Optional)</h3>
                        </div>
                        <p className="text-xs text-neutral-500 mb-4">
                            Add extra secrets for the DB (e.g. POSTGRES_PASSWORD). System generates defaults if empty.
                        </p>

                        {/* Drag & Drop DB Secrets */}
                        {!dbFileName && (
                            <div
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingDb(true); }}
                            onDragLeave={(e) => { e.preventDefault(); setIsDraggingDb(false); }}
                            onDrop={(e) => {
                                e.preventDefault();
                                setIsDraggingDb(false);
                                if(e.dataTransfer.files.length > 0) handleDbFile(e.dataTransfer.files[0]);
                            }}
                            className={`mb-4 border border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${ 
                                isDraggingDb
                                ? 'border-[#FFA500] bg-[#FFA500]/10'
                                : 'border-neutral-300 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-950/50 hover:border-neutral-400 dark:hover:border-neutral-600'
                            }`}
                            >
                            <input
                                type="file"
                                accept=".env"
                                onChange={(e) => { if(e.target.files.length) handleDbFile(e.target.files[0]) }}
                                className="hidden"
                                id="db-env-input"
                            />
                            <label htmlFor="db-env-input" className="cursor-pointer block">
                                <Upload className="mx-auto mb-2 text-neutral-400 dark:text-neutral-500" size={24} />
                                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-0.5">
                                    Drag & drop .env for Database
                                </p>
                            </label>
                            </div>
                        )}

                                            {/* DB File Info */}
                                            {dbFileName && (
                                                <div className="flex items-center justify-between bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-3 rounded-md mb-4">
                                                    <div className="flex items-center gap-2">
                                                    <FileText className="text-green-500" size={16} />
                                                    <div>
                                                        <p className="font-semibold text-xs text-neutral-900 dark:text-white">{dbFileName}</p>
                                                        <p className="text-[10px] text-neutral-500">{form.dbSecrets.length} variables loaded</p>
                                                    </div>
                                                    </div>
                                                    <button type="button" onClick={clearDbEnv} className="text-neutral-500 hover:text-red-500 transition-colors">
                                                    <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                        
                                            {/* Split Toggle */}
                                            <div className="flex items-center gap-2 mb-4">
                                                <input 
                                                    type="checkbox" 
                                                    id="splitDbSecrets"
                                                    checked={form.separateDbSecrets}
                                                    onChange={toggleSeparateDbSecrets}
                                                    className="rounded border-neutral-300 text-[#FFA500] focus:ring-[#FFA500]"
                                                />
                                                <label htmlFor="splitDbSecrets" className="text-xs font-semibold text-neutral-600 dark:text-neutral-400 cursor-pointer">
                                                    Separate Production & Testing Values
                                                </label>
                                            </div>
                        
                                            <div className="space-y-3">
                                                {form.dbSecrets.map((secret, idx) => (
                                                <div key={idx} className="flex gap-2 items-start">
                                                    <input placeholder="KEY" 
                                                    className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono"
                                                    value={secret.key}
                                                    onChange={e => updateDbSecret(idx, 'key', e.target.value)}
                                                    />
                        
                                                                                {!form.separateDbSecrets ? (
                                                                                    <input placeholder="VALUE" 
                                                                                    className={`flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800 ${
                                                                                        (secret.key === 'POSTGRES_PASSWORD' || secret.key === 'MYSQL_ROOT_PASSWORD') && !secret.value
                                                                                        ? 'border-red-500 ring-1 ring-red-500' 
                                                                                        : ''
                                                                                    }`}
                                                                                    value={secret.value}
                                                                                    onChange={e => updateDbSecret(idx, 'value', e.target.value)}
                                                                                    />
                                                                                ) : (
                                                                                    <div className="flex-1 flex flex-col gap-2">
                                                                                        <input placeholder="VALUE (PRODUCTION)" 
                                                                                          className={`w-full p-2 text-xs border rounded dark:bg-neutral-950 ${
                                                                                              (secret.key === 'POSTGRES_PASSWORD' || secret.key === 'MYSQL_ROOT_PASSWORD') && !secret.valueProd
                                                                                              ? 'border-red-500 ring-1 ring-red-500'
                                                                                              : 'border-orange-200 dark:border-orange-900/50'
                                                                                          }`}
                                                                                          value={secret.valueProd}
                                                                                          onChange={e => updateDbSecret(idx, 'valueProd', e.target.value)}
                                                                                        />
                                                                                        <input placeholder="VALUE (TESTING)" 
                                                                                          className={`w-full p-2 text-xs border rounded dark:bg-neutral-950 ${
                                                                                              (secret.key === 'POSTGRES_PASSWORD' || secret.key === 'MYSQL_ROOT_PASSWORD') && !secret.valueTest
                                                                                              ? 'border-red-500 ring-1 ring-red-500'
                                                                                              : 'border-blue-200 dark:border-blue-900/50'
                                                                                          }`}
                                                                                          value={secret.valueTest}
                                                                                          onChange={e => updateDbSecret(idx, 'valueTest', e.target.value)}
                                                                                        />
                                                                                    </div>
                                                                                )}                        
                                                    <button type="button" onClick={() => removeDbSecret(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded h-[34px]">
                                                    <Trash2 size={16} />
                                                    </button>
                                                </div>
                                                ))}
                                                
                                                <button type="button" onClick={addDbSecret} className="text-sm flex items-center gap-1 text-[#FFA500] font-bold mt-2 hover:opacity-80">
                                                <Plus size={16} /> Add DB Secret
                                                </button>
                                            </div>                    </div>
                  )}
                </div>

                {/* 4. Ingress / Domain Access */}
                <div className="bg-white dark:bg-neutral-900 p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 text-[#FFA500]">
                    <Network size={20} />
                    <h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">Ingress / Domain Access</h2>
                  </div>

                  <label className="flex items-center gap-2 mb-4 cursor-pointer">
                    <input type="checkbox" 
                      checked={form.ingressEnabled}
                      onChange={e => setForm({...form, ingressEnabled: e.target.checked})}
                      className="rounded border-neutral-300 text-[#FFA500] focus:ring-[#FFA500]"
                    />
                    <span className="font-semibold text-sm">Enable Public Access?</span>
                  </label>

                  {form.ingressEnabled && (
                    <div className="pl-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <div>
                        <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Hostname</label>
                        <input required={form.ingressEnabled}
                          className="w-full p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none"
                          placeholder="e.g. inventory.naratel.id"
                          value={form.ingressHost}
                          onChange={e => setForm({...form, ingressHost: e.target.value})}
                        />
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" 
                          checked={form.tlsEnabled}
                          onChange={e => setForm({...form, tlsEnabled: e.target.checked})}
                          className="rounded border-neutral-300 text-[#FFA500] focus:ring-[#FFA500]"
                        />
                        <span className="text-sm">Enable HTTPS/TLS?</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center gap-2 bg-[#FFA500] hover:bg-[#FFA500]/90 text-white font-bold py-3 px-8 rounded-lg shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Server size={20} />
                          Generate Manifests
                        </>
                      )}
                    </button>
                </div>
              </form>
            </div>

            {/* Right: Existing Apps List */}
            <div>
               <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm sticky top-6">
                 <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-2">
                   <Server size={16} className="text-[#FFA500]" />
                   <h2 className="font-bold text-sm uppercase text-neutral-600 dark:text-neutral-300">Registered Apps</h2>
                 </div>
                 <div className="max-h-[80vh] overflow-y-auto">
                    {existingApps.length === 0 ? (
                      <div className="p-8 text-center text-neutral-500 text-sm">
                        No apps registered yet.
                      </div>
                    ) : (
                      <ul className="divide-y divide-neutral-100 dark:divide-neutral-800">
                        {existingApps.map((app) => (
                          <li key={app.id} className="p-4 hover:bg-gray-50 dark:hover:bg-neutral-800/50 transition-colors group">
                             <div className="flex justify-between items-start">
                                <div>
                                   <div className="flex items-center gap-2">
                                     <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-[10px] font-mono px-1.5 py-0.5 rounded">
                                       #{app.id}
                                     </span>
                                     <span className="font-semibold text-sm text-neutral-900 dark:text-white">
                                       {app.name}
                                     </span>
                                   </div>
                                   <p className="text-[10px] text-neutral-400 mt-1 font-mono truncate max-w-[180px]" title={app.image}>
                                     {app.image}
                                   </p>
                                   <div className="flex gap-2 mt-2">
                                      {app.db !== 'none' && (
                                        <span className="text-[10px] flex items-center gap-1 text-blue-500 bg-blue-50 dark:bg-blue-900/20 px-1.5 py-0.5 rounded">
                                          <Database size={10} /> {app.db}
                                        </span>
                                      )}
                                   </div>
                                </div>
                                <button
                                  onClick={() => handleDelete(app.id, app.name)}
                                  disabled={isDeleting === app.id}
                                  className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                  title="Delete App & Manifests"
                                >
                                  {isDeleting === app.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                </button>
                             </div>
                          </li>
                        ))}
                      </ul>
                    )}
                 </div>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
