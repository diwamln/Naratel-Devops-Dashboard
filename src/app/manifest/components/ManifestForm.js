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
  GitBranch,
  FlaskConical
} from "lucide-react";
import { SiPostgresql, SiMariadb } from "react-icons/si";
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

  // UI State for Secret Tabs
  const [secretTab, setSecretTab] = useState('prod'); // 'prod' | 'test'

  const [form, setForm] = useState({
    appName: "",
    appId: "001",
    imageRepo: "",
    imageTag: "",
    servicePort: 80,
    targetPort: 3000,
    gitRepoUrl: "",
    appArchitecture: "monolith",
    dbType: "none",
    storageClass: "longhorn",
    
    // Secrets (Split Prod & Test)
    appSecrets: [],
    appSecretsTest: [],
    
    dbSecrets: [],
    dbSecretsTest: [],

    ingressEnabled: false,
    ingressHost: "",
    tlsEnabled: false,
    migrationEnabled: false,
    migrationCommand: "php artisan migrate --force"
  });

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
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'" ) && value.endsWith("'"))) value = value.slice(1, -1);
        parsed.push({ key, value });
      }
    });
    return parsed;
  };

  const handleAppFile = (file) => {
    if (!file.name.endsWith('.env') && !file.name.startsWith('.env')) { setMessage({ text: 'Please upload a valid .env file', type: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseEnvFile(e.target.result);
        if (parsed.length === 0) { setMessage({ text: 'File is empty or invalid', type: 'error' }); return; }
        // Populate BOTH Prod and Test
        setForm(prev => ({
            ...prev, 
            appSecrets: parsed,
            appSecretsTest: JSON.parse(JSON.stringify(parsed)) // Deep copy
        }));
        setAppFileName(file.name);
        setMessage({ text: `Loaded ${parsed.length} variables into Prod & Test config`, type: 'success' });
      } catch (err) { setMessage({ text: 'Failed to read file', type: 'error' }); }
    };
    reader.readAsText(file);
  };

  const handleDbFile = (file) => {
    if (!file.name.endsWith('.env') && !file.name.startsWith('.env')) { setMessage({ text: 'Please upload a valid .env file', type: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseEnvFile(e.target.result);
        if (parsed.length === 0) { setMessage({ text: 'File is empty or invalid', type: 'error' }); return; }
        setForm(prev => ({
            ...prev, 
            dbSecrets: parsed,
            dbSecretsTest: JSON.parse(JSON.stringify(parsed))
        }));
        setDbFileName(file.name);
        setMessage({ text: `Loaded ${parsed.length} DB variables into Prod & Test config`, type: 'success' });
      } catch (err) { setMessage({ text: 'Failed to read file', type: 'error' }); }
    };
    reader.readAsText(file);
  };

  const updateSecret = (type, env, index, field, value) => {
    const key = `${type}Secrets${env === 'test' ? 'Test' : ''}`;
    const updated = [...form[key]];
    updated[index][field] = value;
    setForm(prev => ({ ...prev, [key]: updated }));
  };

  const addSecret = (type, env) => {
    const key = `${type}Secrets${env === 'test' ? 'Test' : ''}`;
    setForm(prev => ({ ...prev, [key]: [...prev[key], { key: "", value: "" }] }));
  };

  const handleDbTypeChange = (type) => {
    let prod = [];
    let test = [];
    
    if (type === 'postgres') {
      const defaults = [
        { key: "POSTGRESQL_DATABASE", value: "" },
        { key: "POSTGRESQL_USERNAME", value: "" },
        { key: "POSTGRESQL_PASSWORD", value: "" }
      ];
      prod = JSON.parse(JSON.stringify(defaults));
      test = JSON.parse(JSON.stringify(defaults));
    } else if (type === 'mariadb') {
      const defaults = [
        { key: "MARIADB_DATABASE", value: "" },
        { key: "MARIADB_USER", value: "" },
        { key: "MARIADB_PASSWORD", value: "" },
        { key: "MARIADB_ROOT_PASSWORD", value: "" }
      ];
      prod = JSON.parse(JSON.stringify(defaults));
      test = JSON.parse(JSON.stringify(defaults));
    }
    setDbFileName('');
    setForm(prev => ({ ...prev, dbType: type, dbSecrets: prod, dbSecretsTest: test }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setMessage({ text: 'Copied!', type: 'success' });
    setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  };

  const validateStep = (currentStep) => {
    if (currentStep === 1) {
      if (!form.appName || !form.imageRepo || !form.imageTag) {
        setMessage({ text: 'Required: Name, Image, Tag', type: 'error' });
        return false;
      }
    }
    if (currentStep === 3) {
      if (!form.servicePort || !form.targetPort) {
        setMessage({ text: 'Required: Ports', type: 'error' });
        return false;
      }
    }
    setMessage({ text: '', type: '' });
    return true;
  };

  const nextStep = () => { if (validateStep(step)) setStep(prev => Math.min(prev + 1, 4)); };
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleDeploy = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/manifest/generate", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const result = await res.json();
      if (res.ok) { onSuccess(result.message); } else { throw new Error(result.error); }
    } catch (err) { setMessage({ text: err.message, type: 'error' }); } finally { setLoading(false); }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (step < 4) {
      nextStep();
    }
  };

  // --- STYLES (Replaced @apply with explicit classes) ---
  const labelClass = "block text-xs font-bold text-neutral-500 uppercase mb-2";
  const inputClass = "w-full p-3 text-sm border rounded-lg dark:bg-neutral-950 dark:border-neutral-800 focus:ring-2 focus:ring-[#FFA500] outline-none transition-all";
  const btnPrimaryClass = "flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-bold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 shadow-md transition-all";
  const btnSecondaryClass = "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 disabled:opacity-30 transition-all";

  // --- RENDERERS ---

  const renderIdentityStep = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-4 text-[#FFA500]"><Box size={24} /><h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500">Identity</h2></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2"><label className={labelClass}>Application Name</label><input required className={inputClass} placeholder="e.g. inventory-app" value={form.appName} onChange={e => setForm({ ...form, appName: e.target.value.toLowerCase().replace(/\s+/g, '-') })} /></div>
        <div className="md:col-span-2"><label className={labelClass}>Docker Image</label><input required className={inputClass} placeholder="devopsnaratel/app" value={form.imageRepo} onChange={e => setForm({ ...form, imageRepo: e.target.value })} /></div>
        <div className="md:col-span-2"><label className={labelClass}>Image Tag</label><input required className={inputClass} placeholder="v1.0.0" value={form.imageTag} onChange={e => setForm({ ...form, imageTag: e.target.value })} /></div>
        <div className="md:col-span-2"><label className={labelClass}>Git Repo URL</label><input className={inputClass} placeholder="https://github.com/..." value={form.gitRepoUrl} onChange={e => setForm({ ...form, gitRepoUrl: e.target.value })} /></div>
      </div>
    </div>
  );

  const renderDatabaseStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-4 text-[#FFA500]"><Database size={24} /><h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500">Database</h2></div>
      <div className="grid grid-cols-3 gap-4">
        {['none', 'postgres', 'mariadb'].map(type => (
          <div key={type} onClick={() => handleDbTypeChange(type)} className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col items-center gap-3 ${form.dbType === type ? 'border-[#FFA500] bg-[#FFA500]/5' : 'border-neutral-200 dark:border-neutral-800'}`}>
            {type === 'none' && <X size={32} className="text-neutral-400" />}
            {type === 'postgres' && <SiPostgresql size={32} className="text-blue-500" />}
            {type === 'mariadb' && <SiMariadb size={32} className="text-orange-600" />}
            <span className="capitalize font-bold text-sm">{type}</span>
          </div>
        ))}
      </div>
      {form.dbType !== 'none' && (
        <div><label className={labelClass}>Storage Class</label><input className={inputClass} value={form.storageClass} onChange={e => setForm({...form, storageClass: e.target.value})} /></div>
      )}
    </div>
  );

  const renderAccessStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-4 text-[#FFA500]"><Network size={24} /><h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500">Access</h2></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelClass}>Service Port</label><input type="number" className={inputClass} value={form.servicePort} onChange={e => setForm({...form, servicePort: parseInt(e.target.value)})} /></div>
        <div><label className={labelClass}>Target Port</label><input type="number" className={inputClass} value={form.targetPort} onChange={e => setForm({...form, targetPort: parseInt(e.target.value)})} /></div>
      </div>
      <div className="p-4 border rounded-xl bg-gray-50 dark:bg-neutral-900/50">
        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.ingressEnabled} onChange={e => setForm({...form, ingressEnabled: e.target.checked})} className="accent-[#FFA500] w-5 h-5" /><span className="font-bold text-sm">Enable Ingress</span></label>
        {form.ingressEnabled && <div className="mt-4"><label className={labelClass}>Hostname</label><input className={inputClass} placeholder="app.naratel.id" value={form.ingressHost} onChange={e => setForm({...form, ingressHost: e.target.value})} /></div>}
      </div>
    </div>
  );

  const renderSecretInputs = (type, env) => {
    const list = form[`${type}Secrets${env === 'test' ? 'Test' : ''}`];
    return (
      <div className="space-y-2 mt-3 max-h-[200px] overflow-y-auto pr-2">
        {list.map((s, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            {type === 'db' ? (
              <div className="flex-1 p-2 text-[10px] font-mono font-bold text-neutral-500 bg-neutral-100 dark:bg-neutral-800/50 rounded border border-transparent truncate">
                {s.key}
              </div>
            ) : (
              <input 
                className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono" 
                value={s.key} 
                onChange={e => updateSecret(type, env, idx, 'key', e.target.value)} 
                placeholder="KEY" 
              />
            )}
            <input className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800" value={s.value} onChange={e => updateSecret(type, env, idx, 'value', e.target.value)} placeholder="VALUE" />
          </div>
        ))}
        {list.length === 0 && <p className="text-xs text-neutral-400 italic">No secrets.</p>}
        {type === 'app' && (
          <button type="button" onClick={() => addSecret(type, env)} className="text-xs font-bold text-[#FFA500] flex items-center gap-1 mt-2"><Plus size={12} /> Add Variable</button>
        )}
      </div>
    );
  };

  const renderConfigStep = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-2 mb-4 text-[#FFA500]"><Server size={24} /><h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500">Configuration & Secrets</h2></div>

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

      {/* Migration Toggle */}
      <div className="bg-neutral-50 dark:bg-neutral-900/50 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
        <div><h4 className="font-bold text-sm">Auto-Migration</h4><p className="text-xs text-neutral-500">Run DB migration on deploy</p></div>
        <input type="checkbox" checked={form.migrationEnabled} onChange={e => setForm({...form, migrationEnabled: e.target.checked})} className="w-5 h-5 accent-[#FFA500]" />
      </div>
      {form.migrationEnabled && <input className={inputClass + " mt-2"} value={form.migrationCommand} onChange={e => setForm({...form, migrationCommand: e.target.value})} />}

      {/* Secrets Management Tabs */}
      <div className="border-t pt-6 border-neutral-200 dark:border-neutral-800">
        <div className="flex gap-4 border-b border-neutral-200 dark:border-neutral-800 mb-4">
          <button type="button" onClick={() => setSecretTab('prod')} className={`pb-2 text-sm font-bold border-b-2 transition-colors ${secretTab === 'prod' ? 'border-[#FFA500] text-[#FFA500]' : 'border-transparent text-neutral-500'}`}>Production Secrets</button>
          <button type="button" onClick={() => setSecretTab('test')} className={`pb-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${secretTab === 'test' ? 'border-orange-400 text-orange-400' : 'border-transparent text-neutral-500'}`}><FlaskConical size={14}/> Testing Secrets</button>
        </div>

        <div className="bg-neutral-50 dark:bg-neutral-900/30 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm">{secretTab === 'prod' ? 'Production Environment' : 'Testing Environment (Standby)'}</h3>
            {secretTab === 'prod' && !appFileName && (
               <div className="relative cursor-pointer">
                 <input type="file" accept=".env" onChange={(e) => { if (e.target.files.length) handleAppFile(e.target.files[0]); e.target.value = null; }} className="absolute inset-0 opacity-0" />
                 <span className="text-xs text-[#FFA500] font-bold flex items-center gap-1"><Upload size={12} /> Upload .env (Fills Both)</span>
               </div>
            )}
          </div>

          <div className="mb-6">
            <h4 className="text-xs font-bold text-neutral-500 uppercase mb-2">Application Variables</h4>
            {renderSecretInputs('app', secretTab)}
          </div>

          {form.dbType !== 'none' && (
            <div>
              <h4 className="text-xs font-bold text-neutral-500 uppercase mb-2">Database Credentials</h4>
              {renderSecretInputs('db', secretTab)}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-neutral-900 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col relative overflow-hidden h-[85vh]">
      <div className="bg-white dark:bg-neutral-900 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center z-10 sticky top-0"><div className="flex items-center gap-4"><button onClick={onClose} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"><ChevronLeft size={20} /></button><h2 className="text-lg font-bold flex items-center gap-2"><FilePlus className="text-[#FFA500]" size={20} /> New App Wizard</h2></div></div>
      <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Step {step} of 4: <span className="text-neutral-900 dark:text-white ml-1">{steps[step - 1]}</span></span>
          <span className="text-xs font-mono font-bold text-[#FFA500]">{Math.round((step / 4) * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden"><motion.div className="h-full bg-[#FFA500]" initial={{ width: 0 }} animate={{ width: `${(step / 4) * 100}%` }} /></div>
      </div>
      <div className="flex-1 overflow-y-auto p-8 relative">
        {message.text && <div className={`mb-6 p-4 rounded-lg border text-sm flex items-center gap-2 ${message.type === 'error' ? 'bg-red-50 border-red-200 text-red-600' : 'bg-green-50 border-green-200 text-green-600'}`}>{message.type === 'error' ? <AlertCircle size={16}/> : <CheckCircle size={16}/>}{message.text}</div>}
        <form id="wizard-form" onSubmit={handleFormSubmit}>
          {step === 1 && renderIdentityStep()}
          {step === 2 && renderDatabaseStep()}
          {step === 3 && renderAccessStep()}
          {step === 4 && renderConfigStep()}
        </form>
      </div>
      <div className="p-6 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center z-10">
        <button type="button" onClick={prevStep} disabled={step === 1} className={btnSecondaryClass}>Back</button>
        {step < 4 ? <button type="button" onClick={nextStep} className={btnPrimaryClass}>Next Step</button> : <button type="button" onClick={handleDeploy} disabled={loading} className={`${btnPrimaryClass} bg-[#FFA500] hover:bg-orange-600`}>{loading ? <Loader2 className="animate-spin" /> : 'Deploy App'}</button>}
      </div>
    </div>
  );
}