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
  Info
} from "lucide-react";
import { motion } from "framer-motion";

const steps = ["Architecture", "Identity", "Database", "Configuration"];

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

    // App Architecture
    appArchitecture: "monolith", // monolith, microservice

    // Database Add-on
    dbType: "none", // none, postgres, mariadb

    // Secrets
    appSecrets: [], 
    separateAppSecrets: false,
    dbSecrets: [],  
    separateDbSecrets: false,

    // Ingress
    ingressEnabled: false,
    ingressHost: "",
    tlsEnabled: false
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
  
  // --- Auto-Update DB_HOST when App Name/ID changes ---
  useEffect(() => {
    if (form.dbType === 'none') return;
    const dbHostValue = `svc-${form.appName || 'app'}-db-${form.appId || nextId}`;
    setForm(prev => {
        const newAppSecrets = [...prev.appSecrets];
        const hostIndex = newAppSecrets.findIndex(s => s.key === 'DB_HOST');
        if (hostIndex >= 0) {
             newAppSecrets[hostIndex] = { ...newAppSecrets[hostIndex], value: dbHostValue, valueProd: dbHostValue, valueTest: dbHostValue };
        } else {
             newAppSecrets.unshift({ key: "DB_HOST", value: dbHostValue, valueProd: dbHostValue, valueTest: dbHostValue });
        }
        return { ...prev, appSecrets: newAppSecrets };
    });
  }, [form.appName, form.appId, form.dbType, nextId]);

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
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'" ) && value.endsWith("'"))) value = value.slice(1, -1);
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
        const richParsed = parsed.map(p => ({ ...p, valueProd: p.value, valueTest: p.value }));
        setForm(prev => ({ ...prev, appSecrets: richParsed }));
        setAppFileName(file.name);
        setMessage({ text: `Loaded ${parsed.length} variables for App from ${file.name}`, type: 'success' });
      } catch (err) { setMessage({ text: 'Failed to read file', type: 'error' }); }
    };
    reader.readAsText(file);
  };
  const clearAppEnv = () => { setAppFileName(''); setForm(prev => ({ ...prev, appSecrets: [] })); };
  const addAppSecret = () => { setForm(prev => ({ ...prev, appSecrets: [...prev.appSecrets, { key: "", value: "", valueProd: "", valueTest: "" }] })); };
  const toggleSeparateAppSecrets = () => {
    setForm(prev => {
        const isSeparating = !prev.separateAppSecrets;
        const newSecrets = prev.appSecrets.map(s => isSeparating ? { ...s, valueProd: s.value, valueTest: s.value } : { ...s, value: s.valueProd });
        return { ...prev, separateAppSecrets: isSeparating, appSecrets: newSecrets };
    });
  };
  const updateAppSecret = (index, field, value) => {
    const updated = [...form.appSecrets];
    updated[index][field] = value;
    setForm(prev => ({ ...prev, appSecrets: updated }));
  };
  const removeAppSecret = (index) => { setForm(prev => ({ ...prev, appSecrets: prev.appSecrets.filter((_, i) => i !== index) })); };

  // DB Secrets
  const handleDbFile = (file) => {
    if (!file.name.endsWith('.env') && !file.name.startsWith('.env')) { setMessage({ text: 'Please upload a valid .env file', type: 'error' }); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = parseEnvFile(e.target.result);
        if (parsed.length === 0) { setMessage({ text: 'File is empty or invalid', type: 'error' }); return; }
        const richParsed = parsed.map(p => ({ ...p, valueProd: p.value, valueTest: p.value }));
        setForm(prev => ({ ...prev, dbSecrets: richParsed }));
        setDbFileName(file.name);
        setMessage({ text: `Loaded ${parsed.length} variables for DB from ${file.name}`, type: 'success' });
      } catch (err) { setMessage({ text: 'Failed to read file', type: 'error' }); }
    };
    reader.readAsText(file);
  };
  const clearDbEnv = () => { setDbFileName(''); setForm(prev => ({ ...prev, dbSecrets: [] })); };
  const addDbSecret = () => { setForm(prev => ({ ...prev, dbSecrets: [...prev.dbSecrets, { key: "", value: "", valueProd: "", valueTest: "" }] })); };
  const toggleSeparateDbSecrets = () => {
    setForm(prev => {
        const isSeparating = !prev.separateDbSecrets;
        const newSecrets = prev.dbSecrets.map(s => isSeparating ? { ...s, valueProd: s.value, valueTest: s.value } : { ...s, value: s.valueProd });
        return { ...prev, separateDbSecrets: isSeparating, dbSecrets: newSecrets };
    });
  };
  const updateDbSecret = (index, field, value) => {
    const updated = [...form.dbSecrets];
    updated[index][field] = value;
    setForm(prev => ({ ...prev, dbSecrets: updated }));
  };
  const removeDbSecret = (index) => { setForm(prev => ({ ...prev, dbSecrets: prev.dbSecrets.filter((_, i) => i !== index) })); };

  const handleDbTypeChange = (type) => {
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
     setDbFileName('');
     let newAppSecrets = [...form.appSecrets];
     if (type !== 'none') {
        const dbHostValue = `svc-${form.appName || 'app'}-db-${form.appId || nextId}`;
        newAppSecrets = newAppSecrets.filter(s => s.key !== 'DB_HOST');
        newAppSecrets.unshift({ key: "DB_HOST", value: dbHostValue, valueProd: dbHostValue, valueTest: dbHostValue });
     } else {
        newAppSecrets = newAppSecrets.filter(s => s.key !== 'DB_HOST');
     }
     setForm(prev => ({ ...prev, dbType: type, dbSecrets: newDbSecrets, appSecrets: newAppSecrets }));
  };

  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      setMessage({ text: 'Copied to clipboard!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 2000);
  };

  const validateStep = (currentStep) => {
      if (currentStep === 2) {
          if (!form.appName || !form.imageRepo || !form.imageTag) {
              setMessage({ text: 'Please fill in all required fields (Name, Image, Tag)', type: 'error' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Safety check: Prevent submission on earlier steps (e.g. via Enter key)
    if (step < 4) {
        nextStep();
        return;
    }

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

  // --- STEPS CONTENT ---
  const renderArchitectureStep = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-2 mb-4 text-[#FFA500]">
            <LayoutGrid size={24} />
            <h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">Application Architecture</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div onClick={() => setForm({...form, appArchitecture: 'monolith'})}
                className={`cursor-pointer rounded-xl border-2 p-6 flex items-start gap-4 transition-all ${form.appArchitecture === 'monolith' ? 'border-[#FFA500] bg-[#FFA500]/5 dark:bg-[#FFA500]/10' : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'}`}>
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <Box size={24} className="text-neutral-600 dark:text-neutral-400" />
                </div>
                <div>
                    <h3 className="font-bold text-neutral-800 dark:text-neutral-200">Monolith</h3>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">Single deployment unit. Ideal for standard web apps, simple APIs, or legacy systems.</p>
                </div>
                {form.appArchitecture === 'monolith' && <CheckCircle size={20} className="text-[#FFA500] ml-auto" />}
            </div>
            <div className="cursor-not-allowed opacity-60 rounded-xl border-2 border-neutral-200 dark:border-neutral-800 p-6 flex items-start gap-4 grayscale">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-800">
                    <LayoutGrid size={24} className="text-neutral-600 dark:text-neutral-400" />
                </div>
                <div>
                    <h3 className="font-bold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">Microservices <span className="text-[10px] bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 rounded text-neutral-500">SOON</span></h3>
                    <p className="text-xs text-neutral-500 mt-1 leading-relaxed">Distributed system with multiple services. Feature coming in future updates.</p>
                </div>
            </div>
        </div>
    </div>
  );

  const renderIdentityStep = () => (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-2 mb-4 text-[#FFA500]"><Box size={24} /><h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">Application Identity</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2"><label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Application Name</label><input required className="w-full p-3 text-sm border rounded-lg dark:bg-neutral-950 dark:border-neutral-800 focus:ring-2 focus:ring-[#FFA500] outline-none transition-all" placeholder="e.g. inventory-app" value={form.appName} onChange={e => setForm({...form, appName: e.target.value.toLowerCase().replace(/\s+/g, '-')})} /><p className="text-[10px] text-neutral-400 mt-1">Lowercase, no spaces. Will be used for DNS.</p></div>
            <div className="md:col-span-2"><label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Docker Image Repository</label><div className="relative"><input required className="w-full p-3 pl-10 text-sm border rounded-lg dark:bg-neutral-950 dark:border-neutral-800 focus:ring-2 focus:ring-[#FFA500] outline-none transition-all" placeholder="e.g. devopsnaratel/todo-app-php" value={form.imageRepo} onChange={e => setForm({...form, imageRepo: e.target.value})} /><Box className="absolute left-3 top-3 text-neutral-400" size={16} /></div></div>
            <div className="md:col-span-2"><label className="block text-xs font-bold text-neutral-500 uppercase mb-2">Image Tag / Version</label><input required className="w-full p-3 text-sm border rounded-lg dark:bg-neutral-950 dark:border-neutral-800 focus:ring-2 focus:ring-[#FFA500] outline-none transition-all" placeholder="e.g. v1.0.0 or latest" value={form.imageTag} onChange={e => setForm({...form, imageTag: e.target.value})} /></div>
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
        {form.dbType !== 'none' && <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-lg text-sm flex items-start gap-3"><Info size={18} className="mt-0.5 shrink-0" /><div><p className="font-bold">Database Credentials</p><p className="text-xs opacity-90 mt-1">We will automatically generate a StatefulSet for your database. You can configure passwords and secrets in the final step.</p></div></div>}
    </div>
  );

  const renderConfigStep = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
         <div className="flex items-center gap-2 mb-4 text-[#FFA500]"><Server size={24} /><h2 className="font-bold uppercase text-sm tracking-wider text-neutral-500 dark:text-neutral-400">Deployment Configuration</h2></div>
        <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Service Port</label><input type="number" required className="w-full p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none" value={form.servicePort} onChange={e => setForm({...form, servicePort: parseInt(e.target.value)})} /><p className="text-[10px] text-neutral-400 mt-1">Exposed internal port (e.g. 80)</p></div>
            <div><label className="block text-xs font-bold text-neutral-500 uppercase mb-1">Target Port</label><input type="number" required className="w-full p-2 text-sm border rounded dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none" value={form.targetPort} onChange={e => setForm({...form, targetPort: parseInt(e.target.value)})} /><p className="text-[10px] text-neutral-400 mt-1">Container listening port (e.g. 3000, 8080)</p></div>
        </div>
        {form.dbType !== 'none' && (
            <div className="p-4 rounded-xl bg-neutral-900 text-neutral-200 border border-neutral-700 shadow-inner">
                <div className="flex items-center gap-2 mb-2 text-green-400"><Database size={16} /><span className="text-xs font-bold uppercase tracking-wider">Internal Database DNS</span></div>
                <div className="flex items-center gap-2 bg-black/30 p-2 rounded border border-white/10"><code className="text-sm font-mono flex-1 text-white">svc-{form.appName}-db-{nextId}</code><button type="button" onClick={() => copyToClipboard(`svc-${form.appName}-db-${nextId}`)} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-neutral-400 hover:text-white" title="Copy DNS"><Copy size={14} /></button></div>
                <p className="text-[10px] text-neutral-500 mt-2">Use this hostname to connect to your database from within the cluster. Port: <strong>{form.dbType === 'postgres' ? '5432' : '3306'}</strong>.</p>
            </div>
        )}
        <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
             <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-sm text-neutral-600 dark:text-neutral-300">Application Secrets</h3><button type="button" onClick={addAppSecret} className="text-xs font-bold text-[#FFA500] flex items-center gap-1"><Plus size={12}/> Add</button></div>
             <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                 {form.appSecrets.map((secret, idx) => (<div key={idx} className="flex gap-2"><input className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono" value={secret.key} onChange={e => updateAppSecret(idx, 'key', e.target.value)} placeholder="KEY" /><input className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800" value={secret.value} onChange={e => updateAppSecret(idx, 'value', e.target.value)} placeholder="VALUE" /></div>))}
                 {form.appSecrets.length === 0 && <p className="text-xs text-neutral-400 italic">No secrets configured.</p>}
             </div>
        </div>
         {form.dbType !== 'none' && (
             <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4"><h3 className="font-bold text-sm text-neutral-600 dark:text-neutral-300 mb-2">Database Secrets</h3><div className="space-y-2">{form.dbSecrets.map((secret, idx) => (<div key={idx} className="flex gap-2"><input className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800 font-mono bg-neutral-100 dark:bg-neutral-800" value={secret.key} readOnly /><input className="flex-1 p-2 text-xs border rounded dark:bg-neutral-950 dark:border-neutral-800" value={secret.value} onChange={e => updateDbSecret(idx, 'value', e.target.value)} placeholder="VALUE" /></div>))}
</div></div>
         )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-neutral-900 w-full rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col relative overflow-hidden">
       <div className="bg-white dark:bg-neutral-900 px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex justify-between items-center z-10 sticky top-0"><div className="flex items-center gap-4"><button onClick={onClose} className="flex items-center gap-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors" title="Back to App List"><ChevronLeft size={20} /></button><div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800"></div><h2 className="text-lg font-bold flex items-center gap-2 text-neutral-800 dark:text-white"><FilePlus className="text-[#FFA500]" size={20} /> New App Wizard</h2></div></div>
       
       {/* Progress Bar (Framer Motion) */}
       <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900">
           <div className="flex items-center justify-between mb-2">
               <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Step {step} of 4: <span className="text-neutral-900 dark:text-white ml-1">{steps[step-1]}</span></span>
               <span className="text-xs font-mono font-bold text-[#FFA500]">{Math.round((step / 4) * 100)}%</span>
           </div>
           <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
               <motion.div className="h-full bg-[#FFA500]" initial={{ width: 0 }} animate={{ width: `${(step / 4) * 100}%` }} transition={{ duration: 0.4, ease: "easeInOut" }} />
           </div>
       </div>

       <div className="flex-1 overflow-y-auto p-8 relative">
            {message.text && (<div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 text-sm animate-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>{message.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}<span>{message.text}</span></div>)}
           <form id="wizard-form" onSubmit={handleSubmit}>
               {step === 1 && renderArchitectureStep()}
               {step === 2 && renderIdentityStep()}
               {step === 3 && renderDatabaseStep()}
               {step === 4 && renderConfigStep()}
           </form>
       </div>

       <div className="p-6 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center z-10">
           <button type="button" onClick={prevStep} disabled={step === 1} className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"><ChevronLeft size={16} /> Back</button>
           {step < 4 ? (<button type="button" onClick={nextStep} className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-bold bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 shadow-md transition-all transform active:scale-95">Next Step <ChevronRight size={16} /></button>) : (<button type="submit" form="wizard-form" disabled={loading} className="flex items-center gap-2 bg-[#FFA500] hover:bg-[#FFA500]/90 text-white font-bold py-2.5 px-8 rounded-lg shadow-lg shadow-orange-500/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">{loading ? (<><Loader2 size={18} className="animate-spin" />Creating...</>) : (<><Server size={18} />Deploy App</>)}</button>)}
       </div>
    </div>
  );
}
