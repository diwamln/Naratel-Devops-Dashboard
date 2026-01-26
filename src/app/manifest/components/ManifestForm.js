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
  Key,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Globe,
  Copy,
  Info,
  GitBranch
} from "lucide-react";
import { motion } from "framer-motion";

const steps = ["Identity", "Database", "Access", "Configuration"];

export default function ManifestForm({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [step, setStep] = useState(1);
  const [nextId, setNextId] = useState("001");

  // Drag & Drop States
  const [isDraggingApp, setIsDraggingApp] = useState(false);
  const [appFileName, setAppFileName] = useState('');
  const [isDraggingDb, setIsDraggingDb] = useState(false);
  const [dbFileName, setDbFileName] = useState('');

  const [form, setForm] = useState({
    // Application Details
    appName: "",
    appId: "001",
    imageRepo: "",
    imageTag: "",
    servicePort: 80,
    targetPort: 3000,

    // Git Repository for Jenkins CI/CD
    gitRepoUrl: "",

    // App Architecture
    appArchitecture: "monolith", // monolith, microservice

    // Database Add-on
    dbType: "none", // none, postgres, mariadb
    storageClass: "longhorn", // Default storage class

    // Secrets
    appSecrets: [],
    dbSecrets: [],

    // Ingress
    ingressEnabled: false,
    ingressHost: "",
    tlsEnabled: false,

    // Database Migration
    migrationEnabled: false,
    migrationCommand: "php artisan migrate --force"
  });

  // Fetch Next ID on Mount
  useEffect(() => {
    fetch("/api/manifest/next-id")
      .then(res => res.json())
      .then(data => {
        if (data.nextId) {
          setNextId(data.nextId);
          setForm(prev => ({ ...prev, appId: data.nextId }));
        }
      })
      .catch(err => console.error("Failed to fetch next ID:", err));
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
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
        parsed.push({ key, value });
      }
    });
    return parsed;
  };

  // --- Secrets Handlers ---
  const handleAppFile = (file) => {
    if (!file.name.endsWith('.env') && !file.name.startsWith('.env')) { setMessage({ text: 'Please upload a valid .env file', type: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseEnvFile(e.target.result);
        if (parsed.length === 0) { setMessage({ text: 'File is empty or invalid', type: 'error' }); return; }
        // Simplify: Just use key-value. Testing env will inherit these or be overridden by ephemeral logic if needed.
        setForm(prev => ({ ...prev, appSecrets: parsed }));
        setAppFileName(file.name);
        setMessage({ text: `Loaded ${parsed.length} variables for App from ${file.name}`, type: 'success' });
      } catch (err) { setMessage({ text: 'Failed to read file', type: 'error' }); }
    };
    reader.readAsText(file);
  };
  const clearAppEnv = () => { setAppFileName(''); setForm(prev => ({ ...prev, appSecrets: [] })); };
  const addAppSecret = () => { setForm(prev => ({ ...prev, appSecrets: [...prev.appSecrets, { key: "", value: "" }] })); };

  const updateAppSecret = (index, field, value) => {
    const updated = [...form.appSecrets];
    updated[index][field] = value;
    setForm(prev => ({ ...prev, appSecrets: updated }));
  };

  // DB Secrets
  const handleDbFile = (file) => {
    if (!file.name.endsWith('.env') && !file.name.startsWith('.env')) { setMessage({ text: 'Please upload a valid .env file', type: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseEnvFile(e.target.result);
        if (parsed.length === 0) { setMessage({ text: 'File is empty or invalid', type: 'error' }); return; }
        // Simplify for ephemeral flow
        setForm(prev => ({ ...prev, dbSecrets: parsed }));
        setDbFileName(file.name);
        setMessage({ text: `Loaded ${parsed.length} variables for DB from ${file.name}`, type: 'success' });
      } catch (err) { setMessage({ text: 'Failed to read file', type: 'error' }); }
    };
    reader.readAsText(file);
  };
  const clearDbEnv = () => { setDbFileName(''); setForm(prev => ({ ...prev, dbSecrets: [] })); };

  const updateDbSecret = (index, field, value) => {
    const updated = [...form.dbSecrets];
    updated[index][field] = value;
    setForm(prev => ({ ...prev, dbSecrets: updated }));
  };

  const handleDbTypeChange = (type) => {
    let newDbSecrets = [];
    if (type === 'postgres') {
      newDbSecrets = [
        { key: "POSTGRESQL_DATABASE", value: "" },
        { key: "POSTGRESQL_USERNAME", value: "postgres" }, // Default safer
        { key: "POSTGRESQL_PASSWORD", value: "" }
      ];
    } else if (type === 'mariadb') {
      newDbSecrets = [
        { key: "MARIADB_DATABASE", value: "" },
        { key: "MARIADB_USER", value: "app_user" },
        { key: "MARIADB_PASSWORD", value: "" },
        { key: "MARIADB_ROOT_PASSWORD", value: "" }
      ];
    }
    setDbFileName('');

    setForm(prev => ({ ...prev, dbType: type, dbSecrets: newDbSecrets }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ text: 'Copied to clipboard!', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!form.appName || !form.imageRepo || !form.imageTag) {
        setMessage({ text: 'Please fill in all required fields (Name, Image, Tag)', type: 'error' });
        return false;
      }
    }
    if (currentStep === 3) {
      if (!form.servicePort || !form.targetPort) {
        setMessage({ text: 'Please specify Service and Target ports', type: 'error' });
        return false;
      }
      if (form.ingressEnabled && !form.ingressHost) {
        setMessage({ text: 'Please specify Ingress Hostname', type: 'error' });
        return false;
      }
    }
    setMessage({ text: '', type: '' });
    return true;
  };

  const nextStep = () => {
    if (validateStep(step)) setStep(prev => Math.min(prev + 1, 4));
  };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleDeploy = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch("/api/manifest/generate", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (res.ok) { onSuccess(result.message); } else { throw new Error(result.error || "Failed to generate manifest"); }
    } catch (err) { setMessage({ text: err.message, type: 'error' }); } finally { setLoading(false); }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (step < 4) {
      nextStep();
    }
  };

  // --- STEPS CONTENT ---
  const renderIdentityStep = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-4 text-[#FFA500]"><Box size={24} /><h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">Application Identity</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2"><label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Application Name</label><input required className="w-full p-3 text-sm border rounded-lg dark:bg-neutral-950 dark:border-neutral-800 focus:ring-2 focus:ring-[#FFA500] outline-none transition-all" placeholder="e.g. inventory-app" value={form.appName} onChange={e => setForm({ ...form, appName: e.target.value.toLowerCase().replace(/\s+/g, '-') })} /><p className="text-[10px] text-neutral-400 mt-1">Lowercase, no spaces. Will be used for DNS.</p></div>
        <div className="md:col-span-2"><label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Docker Image Repository</label><div className="relative"><input required className="w-full p-3 pl-10 text-sm border rounded-lg dark:bg-neutral-950 dark:border-neutral-800 focus:ring-2 focus:ring-[#FFA500] outline-none transition-all" placeholder="e.g. devopsnaratel/todo-app-php" value={form.imageRepo} onChange={e => setForm({ ...form, imageRepo: e.target.value })} /><Box className="absolute left-3 top-3 text-neutral-400" size={16} /></div></div>
        <div className="md:col-span-2"><label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Image Tag / Version</label><input required className="w-full p-3 text-sm border rounded-lg dark:bg-neutral-950 dark:border-neutral-800 focus:ring-2 focus:ring-[#FFA500] outline-none transition-all" placeholder="e.g. v1.0.0 or latest" value={form.imageTag} onChange={e => setForm({ ...form, imageTag: e.target.value })} /></div>

        {/* Git Repository URL for Jenkins CI/CD */}
        <div className="md:col-span-2 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/50">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={16} className="text-neutral-500" />
            <label className="text-xs font-bold text-neutral-500 uppercase">Git Repository URL (for CI/CD)</label>
          </div>
          <div className="relative">
            <input
              className="w-full p-3 pl-10 text-sm border rounded-lg dark:bg-neutral-950 dark:border-neutral-800 focus:ring-2 focus:ring-[#FFA500] outline-none transition-all"
              placeholder="e.g. https://github.com/DevopsNaratel/my-app"
              value={form.gitRepoUrl}
              onChange={e => setForm({ ...form, gitRepoUrl: e.target.value })}
            />
            <GitBranch className="absolute left-3 top-3 text-neutral-400" size={16} />
          </div>
          <p className="text-[10px] text-neutral-400 mt-2">
            A Jenkins pipeline job will be automatically created for this repository.
          </p>
        </div>
      </div>
    </div>
  );

  const renderDatabaseStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-4 text-[#FFA500]"><Database size={24} /><h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">Database Configuration (Optional)</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['none', 'postgres', 'mariadb'].map((type) => (
          <div key={type} onClick={() => handleDbTypeChange(type)} className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center justify-center gap-3 transition-all ${form.dbType === type ? 'border-[#FFA500] bg-[#FFA500]/5 dark:bg-[#FFA500]/10' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'}`}>
            {type === 'none' && <X size={32} className="text-neutral-400" />}
            {type === 'postgres' && <Database size={32} className="text-blue-500" />}
            {type === 'mariadb' && <Database size={32} className="text-orange-600" />}
            <span className="font-bold capitalize text-sm text-neutral-700 dark:text-neutral-300">{type === 'none' ? 'No Database' : type === 'mariadb' ? 'MariaDB / MySQL' : 'PostgreSQL'}</span>
            {form.dbType === type && <CheckCircle size={16} className="text-[#FFA500]" />}
          </div>
        ))}
      </div>
      
      {form.dbType !== 'none' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Storage Class</label>
            <input 
              required 
              className="w-full p-3 text-sm border rounded-lg dark:bg-neutral-950 dark:border-neutral-800 focus:ring-2 focus:ring-[#FFA500] outline-none transition-all" 
              placeholder="e.g. longhorn, standard, gp2" 
              value={form.storageClass} 
              onChange={e => setForm({ ...form, storageClass: e.target.value })} 
            />
            <p className="text-[10px] text-neutral-400 mt-1">Specify the Kubernetes StorageClass for database persistence.</p>
          </div>
          
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm flex items-start gap-3">
            <Info size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Database Credentials</p>
              <p className="text-xs opacity-90 mt-1">We will automatically generate a StatefulSet for your database. You can configure passwords and secrets in the final step.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAccessStep = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-4 text-[#FFA500]"><Network size={24} /><h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">Network Access</h2></div>

      <div className="grid grid-cols-2 gap-4">
        <div><label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Service Port</label><input type="number" required className="w-full p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none" value={form.servicePort} onChange={e => setForm({ ...form, servicePort: parseInt(e.target.value) })} /><p className="text-[10px] text-neutral-400 mt-1">Exposed internal port (e.g. 80)</p></div>
        <div><label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Target Port</label><input type="number" required className="w-full p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none" value={form.targetPort} onChange={e => setForm({ ...form, targetPort: parseInt(e.target.value) })} /><p className="text-[10px] text-neutral-400 mt-1">Container listening port (e.g. 3000, 8080)</p></div>
      </div>

      <div className="p-6 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-gray-50/50 dark:bg-neutral-900/50 space-y-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-5 h-5 rounded border-neutral-300 text-[#FFA500] focus:ring-[#FFA500]" checked={form.ingressEnabled} onChange={e => setForm({ ...form, ingressEnabled: e.target.checked })} />
          <span className="font-bold text-sm text-neutral-700 dark:text-neutral-300">Enable Ingress (Public Access)</span>
        </label>

        <div className={`transition-all duration-300 space-y-4 ${form.ingressEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
          <div>
            <label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Hostname</label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 text-neutral-400" size={16} />
              <input required={form.ingressEnabled} disabled={!form.ingressEnabled} className="w-full pl-9 p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none" placeholder="e.g. app.naratel.id" value={form.ingressHost} onChange={e => setForm({ ...form, ingressHost: e.target.value })} />
            </div>
            <p className="text-[10px] text-neutral-400 mt-1">Testing env will automatically use <code>test-{form.ingressHost || '...'}</code></p>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.tlsEnabled} disabled={!form.ingressEnabled} onChange={e => setForm({ ...form, tlsEnabled: e.target.checked })} className="rounded border-neutral-300 text-[#FFA500] focus:ring-[#FFA500]" />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">Enable HTTPS / TLS</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfigStep = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-4 text-[#FFA500]"><Server size={24} /><h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">Deployment Configuration</h2></div>

      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-sm text-neutral-600 dark:text-neutral-300">Database Configuration</h3></div>

        {form.dbType !== 'none' && (
          <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200 flex items-center gap-2"><Database size={16} /> Internal Database DNS</h4>
                <p className="text-xs text-neutral-500 mt-1">Connection string for your application to reach the database.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 font-mono text-xs">
              <span className="text-[#FFA500]">$</span>
              <code className="flex-1 break-all">
                svc-db-{form.appName}-{form.appId}.{form.appId}-db-{form.appName}-prod.svc.cluster.local
              </code>
              <button type="button" onClick={() => copyToClipboard(`svc-db-${form.appName}-${form.appId}.${form.appId}-db-${form.appName}-prod.svc.cluster.local`)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-neutral-400 hover:text-white shrink-0" title="Copy DNS"><Copy size={14} /></button>
            </div>
            <p className="text-[10px] text-neutral-500">Use this hostname to connect to your database from your application.</p>
          </div>
        )}

        <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">Auto-Migration</h4>
              <p className="text-xs text-neutral-500 mt-1">Run database migration before every deployment.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.migrationEnabled} onChange={e => setForm({ ...form, migrationEnabled: e.target.checked })} />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-[#FFA500]"></div>
            </label>
          </div>

          {form.migrationEnabled && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Migration Command</label>
              <div className="flex items-center gap-2 bg-neutral-900 text-neutral-200 p-2 rounded-lg border border-neutral-700 font-mono text-xs">
                <span className="text-[#FFA500]">$</span>
                <input type="text" className="bg-transparent border-none outline-none w-full text-neutral-200 placeholder-neutral-600" value={form.migrationCommand} onChange={e => setForm({ ...form, migrationCommand: e.target.value })} placeholder="e.g. php artisan migrate --force" />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-sm text-neutral-600 dark:text-neutral-300">Application Secrets</h3><button type="button" onClick={addAppSecret} className="text-xs font-bold text-[#FFA500] flex items-center gap-1"><Plus size={12} /> Add</button></div>

        {!appFileName && (
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDraggingApp(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDraggingApp(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingApp(false);
              if (e.dataTransfer.files.length > 0) handleAppFile(e.dataTransfer.files[0]);
            }}
            className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${isDraggingApp
              ? 'border-[#FFA500] bg-[#FFA500]/10'
              : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600'
              }`}>
            <input type="file" accept=".env" onChange={(e) => { if (e.target.files.length) handleAppFile(e.target.files[0]); e.target.value = null; }} className="hidden" id="app-env-input" />
            <label htmlFor="app-env-input" className="cursor-pointer block">
              <Upload className="mx-auto mb-2 text-neutral-400 dark:text-neutral-500" size={24} />
              <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-0.5">Drag & drop .env or Click to select</p>
            </label>
          </div>
        )}

        {appFileName && (
          <div className="flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-md mb-4">
            <div className="flex items-center gap-2">
              <FileText className="text-green-500" size={16} />
              <div><p className="font-semibold text-xs text-neutral-900 dark:text-white">{appFileName}</p><p className="text-[10px] text-neutral-500">{form.appSecrets.length} variables loaded</p></div>
            </div>
            <button type="button" onClick={clearAppEnv} className="text-neutral-500 hover:text-red-500 transition-colors"><X size={14} /></button>
          </div>
        )}

        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
          {form.appSecrets.map((secret, idx) => (<div key={idx} className="flex gap-2"><input className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono" value={secret.key} onChange={e => updateAppSecret(idx, 'key', e.target.value)} placeholder="KEY" /><input className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800" value={secret.value} onChange={e => updateAppSecret(idx, 'value', e.target.value)} placeholder="VALUE" /></div>))}
          {form.appSecrets.length === 0 && !appFileName && <p className="text-xs text-neutral-400 italic">No secrets configured.</p>}
        </div>
      </div>

      {form.dbType !== 'none' && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
          <h3 className="font-bold text-sm text-neutral-600 dark:text-neutral-300 mb-4">Database Secrets</h3>

          {!dbFileName && (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDraggingDb(true); }}
              onDragLeave={(e) => { e.preventDefault(); setIsDraggingDb(false); }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingDb(false);
                if (e.dataTransfer.files.length > 0) handleDbFile(e.dataTransfer.files[0]);
              }}
              className={`mb-4 border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${isDraggingDb
                ? 'border-[#FFA500] bg-[#FFA500]/10'
                : 'border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 hover:border-neutral-400 dark:hover:border-neutral-600'
                }`}>
              <input type="file" accept=".env" onChange={(e) => { if (e.target.files.length) handleDbFile(e.target.files[0]); e.target.value = null; }} className="hidden" id="db-env-input" />
              <label htmlFor="db-env-input" className="cursor-pointer block">
                <Upload className="mx-auto mb-2 text-neutral-400 dark:text-neutral-500" size={24} />
                <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-0.5">Drag & drop .env or Click to select</p>
              </label>
            </div>
          )}

          {dbFileName && (
            <div className="flex items-center justify-between bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-3 rounded-md mb-4">
              <div className="flex items-center gap-2">
                <FileText className="text-green-500" size={16} />
                <div><p className="font-semibold text-xs text-neutral-900 dark:text-white">{dbFileName}</p><p className="text-[10px] text-neutral-500">{form.dbSecrets.length} variables loaded</p></div>
              </div>
              <button type="button" onClick={clearDbEnv} className="text-neutral-500 hover:text-red-500 transition-colors"><X size={14} /></button>
            </div>
          )}

          <div className="space-y-2">
            {form.dbSecrets.map((secret, idx) => (<div key={idx} className="flex gap-2"><input className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono bg-neutral-100 dark:bg-neutral-800" value={secret.key} readOnly /><input className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800" value={secret.value} onChange={e => updateDbSecret(idx, 'value', e.target.value)} placeholder="VALUE" /></div>))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-neutral-900 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col relative overflow-hidden">
      <div className="bg-white dark:bg-neutral-900 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center z-10 sticky top-0"><div className="flex items-center gap-4"><button onClick={onClose} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors" title="Back to App List"><ChevronLeft size={20} /></button><div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800"></div><h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800 dark:text-white"><FilePlus className="text-[#FFA500]" size={20} /> New App Wizard</h2></div></div>

      {/* Progress Bar (Framer Motion) */}
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Step {step} of 4: <span className="text-neutral-900 dark:text-white ml-1">{steps[step - 1]}</span></span>
          <span className="text-xs font-mono font-bold text-[#FFA500]">{Math.round((step / 4) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <motion.div className="h-full bg-[#FFA500]" initial={{ width: 0 }} animate={{ width: `${(step / 4) * 100}%` }} transition={{ duration: 0.4, ease: "easeInOut" }} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative">
        {message.text && (<div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 text-sm animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>{message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}<span>{message.text}</span></div>)}
        <form id="wizard-form" onSubmit={handleFormSubmit}>
          {step === 1 && renderIdentityStep()}
          {step === 2 && renderDatabaseStep()}
          {step === 3 && renderAccessStep()}
          {step === 4 && renderConfigStep()}
        </form>
      </div>

      <div className="p-6 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center z-10 flex-wrap gap-4">
        <button type="button" onClick={prevStep} disabled={step === 1} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft size={16} /> Back</button>

        {step === 4 && (
          <div className="text-xs text-neutral-500 max-w-xs text-right hidden md:block leading-tight">
            Generating <strong>Production</strong> manifests. Testing environments are ephemeral and created on-demand via Jenkins.
          </div>
        )}

        {step < 4 ? (<button type="button" onClick={nextStep} className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-bold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-md transition-all transform active:scale-95">Next Step <ChevronRight size={16} /></button>) : (<button type="button" onClick={handleDeploy} disabled={loading} className="flex items-center gap-2 bg-[#FFA500] hover:bg-[#FFA500]/90 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-orange-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? (<><Loader2 size={18} className="animate-spin" />Creating...</>) : (<><Server size={18} />Deploy App</>)}</button>)}
      </div>
    </div>
  );
}