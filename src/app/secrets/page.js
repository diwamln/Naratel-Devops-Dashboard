'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Key, Plus, Trash2, Lock, Server, CheckCircle, AlertCircle, Loader2, Upload, FileText, X } from 'lucide-react';
import Navigation from '../components/Navigation';

export default function K8sSecretManager() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [existingSecrets, setExistingSecrets] = useState([]);
  const [loadingSecrets, setLoadingSecrets] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [namespaces, setNamespaces] = useState([]);
  const [loadingNamespaces, setLoadingNamespaces] = useState(true);

  const handlePageChange = (page) => {
    if (page === 'jenkins') {
      router.push('/');
    } else if (page === 'k8s-secret') {
      router.push('/secrets');
    } else if (page === 'manifest') {
      router.push('/manifest');
    } else if (page === 'tools') {
      router.push('/tools');
    }
  };

  // Form state
  const [isDualEnv, setIsDualEnv] = useState(false);
  const [form, setForm] = useState({
    secretName: '',
    namespace: 'default',
    secretType: 'Opaque',
    secretData: [{ key: '', value: '' }]
  });
  const [formProd, setFormProd] = useState({
    secretName: '',
    namespace: 'default',
    secretType: 'Opaque',
    secretData: [{ key: '', value: '' }]
  });

  // Fetch existing secrets
  const fetchSecrets = useCallback(async () => {
    setLoadingSecrets(true);
    try {
      const res = await fetch(`/api/k8s/secret?namespace=${form.namespace}`);
      const data = await res.json();
      if (data.success) {
        setExistingSecrets(data.secrets || []);
      }
    } catch (error) {
      console.error('Error fetching secrets:', error);
    } finally {
      setLoadingSecrets(false);
    }
  }, [form.namespace]);

  // Fetch available namespaces
  const fetchNamespaces = async () => {
    try {
      const res = await fetch('/api/k8s/namespaces');
      const data = await res.json();
      if (data.success) {
        setNamespaces(data.namespaces || []);
      }
    } catch (error) {
      console.error('Error fetching namespaces:', error);
      setNamespaces(['default']);
    } finally {
      setLoadingNamespaces(false);
    }
  };

  // Handle secret card click - AUTOFILL FORM
  const handleSecretClick = (secretName) => {
    setForm(prev => ({
      ...prev,
      secretName: secretName
    }));
    setMessage({ text: `Secret "${secretName}" dipilih - silakan edit dan submit untuk update`, type: 'success' });
  };

  useEffect(() => {
    fetchNamespaces();
  }, []);

  useEffect(() => {
    fetchSecrets();
  }, [fetchSecrets]);

  // Parse .env file
  const parseEnvFile = (content) => {
    const lines = content.split('\n');
    const parsed = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith('#')) return;

      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();

        if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        parsed.push({ key, value });
      }
    });

    return parsed;
  };

  // Handle file upload
  const handleFile = (file) => {
    if (!file.name.endsWith('.env') && !file.name.startsWith('.env')) {
      setMessage({ text: 'Harap upload file .env yang valid', type: 'error' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const parsed = parseEnvFile(content);

        if (parsed.length === 0) {
          setMessage({ text: 'File .env kosong atau format tidak valid', type: 'error' });
          return;
        }

        setForm(prev => ({
          ...prev,
          secretData: parsed
        }));
        setFileName(file.name);
        setMessage({ text: `${parsed.length} variabel berhasil dimuat dari ${file.name}`, type: 'success' });
      } catch (err) {
        setMessage({ text: 'Gagal membaca file .env', type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  // Drag & Drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const clearEnvFile = () => {
    setFileName('');
    setForm(prev => ({
      ...prev,
      secretData: [{ key: '', value: '' }]
    }));
    setShowValues({});
  };

  // Add new key-value pair
  const addSecretField = (target = 'dev') => {
    if (target === 'prod') {
      setFormProd({
        ...formProd,
        secretData: [...formProd.secretData, { key: '', value: '' }]
      });
    } else {
      setForm({
        ...form,
        secretData: [...form.secretData, { key: '', value: '' }]
      });
    }
  };

  // Remove key-value pair
  const removeSecretField = (index, target = 'dev') => {
    if (target === 'prod') {
      const newData = formProd.secretData.filter((_, i) => i !== index);
      setFormProd({ ...formProd, secretData: newData });
    } else {
      const newData = form.secretData.filter((_, i) => i !== index);
      setForm({ ...form, secretData: newData });
    }
  };

  // Update key-value pair
  const updateSecretField = (index, field, value, target = 'dev') => {
    if (target === 'prod') {
      const newData = [...formProd.secretData];
      newData[index][field] = value;
      setFormProd({ ...formProd, secretData: newData });
    } else {
      const newData = [...form.secretData];
      newData[index][field] = value;
      setForm({ ...form, secretData: newData });
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    setLoading(true);
    setMessage({ text: '', type: '' });

    const preparePayload = (formData) => {
      if (!formData.secretName || !formData.namespace) return null;
      const dataObject = {};
      formData.secretData.forEach(item => {
        if (item.key && item.value) {
          dataObject[item.key] = item.value;
        }
      });
      if (Object.keys(dataObject).length === 0) return null;

      return {
        secretName: formData.secretName,
        namespace: formData.namespace,
        secretType: formData.secretType,
        data: dataObject
      };
    };

    const payloadDev = preparePayload(form);
    if (!payloadDev) {
      setMessage({ text: 'Environment 1: Secret name, namespace, and at least one key-value pair are required', type: 'error' });
      setLoading(false);
      return;
    }

    let payloadProd = null;
    if (isDualEnv) {
      payloadProd = preparePayload(formProd);
      if (!payloadProd) {
        setMessage({ text: 'Environment 2: Secret name, namespace, and at least one key-value pair are required', type: 'error' });
        setLoading(false);
        return;
      }
    }

    try {
      // Send Dev
      const resDev = await fetch('/api/k8s/secret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadDev)
      });
      const dataDev = await resDev.json();

      if (!dataDev.success) {
        throw new Error(`Environment 1: ${dataDev.message}`);
      }

      if (isDualEnv && payloadProd) {
        // Send Prod
        const resProd = await fetch('/api/k8s/secret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadProd)
        });
        const dataProd = await resProd.json();

        if (!dataProd.success) {
          throw new Error(`Environment 2: ${dataProd.message}`);
        }
      }

      setMessage({ text: isDualEnv ? 'Both secrets created/updated successfully!' : dataDev.message, type: 'success' });

      const defaultState = {
        secretName: '',
        namespace: 'default',
        secretType: 'Opaque',
        secretData: [{ key: '', value: '' }]
      };

      setForm(defaultState);
      setFormProd(defaultState);
      setFileName('');
      setTimeout(fetchSecrets, 1000);
    } catch (error) {
      setMessage({ text: `Error: ${error.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const secretTypes = ['Opaque', 'kubernetes.io/tls', 'kubernetes.io/dockerconfigjson', 'kubernetes.io/basic-auth'];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors">
      <Navigation activePage="k8s-secret" onPageChange={handlePageChange} />

      {/* Main content dengan margin kiri untuk desktop */}
      <div className="md:ml-56 min-h-screen text-neutral-900 dark:text-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#FFA500]/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#FFA500]/5 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-800">
                <Lock size={18} className="text-neutral-900 dark:text-white" />
              </div>
              <h1 className="text-xl font-bold">Kubernetes Secret Manager</h1>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 ml-9">Kelola secrets di cluster Kubernetes Anda</p>
          </div>

          {/* Message Alert */}
          {message.text && (
            <div className={`mb-4 p-3 rounded-lg border flex items-center gap-2 text-sm animate-in fade-in slide-in-from-top-2 ${message.type === 'success'
                ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400'
              }`}>
              {message.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          <div className="flex flex-col gap-6">
            {/* Form Section */}
            <div className="w-full">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm dark:shadow-none">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Key size={16} className="text-[#FFA500]" />
                  Create New Secret
                </h2>

                <div className="mb-4 flex items-center gap-2 p-2.5 bg-[#FFA500]/10 border border-[#FFA500]/20 rounded-md">
                  <input
                    type="checkbox"
                    id="createDualEnv"
                    checked={isDualEnv}
                    onChange={(e) => setIsDualEnv(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#FFA500] rounded focus:ring-[#FFA500]"
                  />
                  <label htmlFor="createDualEnv" className="text-xs font-medium text-neutral-900 dark:text-neutral-200 cursor-pointer select-none">
                    Create 2 environments (Dev & Prod)
                  </label>
                </div>

                <div className="space-y-4">
                  {/* Drag & Drop Area */}
                  {form.secretData.length === 1 && !form.secretData[0].key && !form.secretData[0].value && !fileName && (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${isDragging
                          ? 'border-[#FFA500] bg-[#FFA500]/10'
                          : 'border-neutral-300 dark:border-neutral-700 bg-gray-50/50 dark:bg-neutral-950/50 hover:border-neutral-400 dark:hover:border-neutral-600'
                        }`}
                    >
                      <input
                        type="file"
                        accept=".env"
                        onChange={handleFileInput}
                        className="hidden"
                        id="env-file-input"
                      />
                      <label htmlFor="env-file-input" className="cursor-pointer">
                        <Upload className="mx-auto mb-2 text-neutral-400 dark:text-neutral-500" size={24} />
                        <p className="text-sm font-semibold text-neutral-600 dark:text-neutral-300 mb-0.5">
                          Drag & drop file .env di sini
                        </p>
                        <p className="text-xs text-neutral-500">
                          atau klik untuk memilih file
                        </p>
                      </label>
                    </div>
                  )}

                  {/* File Info */}
                  {fileName && (
                    <div className="flex items-center justify-between bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 p-3 rounded-md">
                      <div className="flex items-center gap-2">
                        <FileText className="text-green-500 dark:text-green-400" size={16} />
                        <div>
                          <p className="font-semibold text-xs text-neutral-900 dark:text-white">{fileName}</p>
                          <p className="text-[10px] text-neutral-500">
                            {form.secretData.length} variabel dimuat
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={clearEnvFile}
                        className="text-neutral-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  {/* Environments Grid */}
                  <div className={isDualEnv ? "grid grid-cols-1 xl:grid-cols-2 gap-4" : "space-y-4"}>
                    {/* Environment 1 */}
                    <div className={`p-3 rounded-lg border ${isDualEnv ? 'border-[#FFA500]/20 bg-[#FFA500]/5' : 'border-transparent'}`}>
                      {isDualEnv && <h3 className="font-bold text-sm text-[#FFA500] mb-3">Environment 1</h3>}

                      {/* Secret Name & Namespace */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">
                            Secret Name
                          </label>
                          <input
                            type="text"
                            value={form.secretName}
                            onChange={(e) => setForm({ ...form, secretName: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500] transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                            placeholder="my-secret"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">
                            Namespace
                          </label>
                          {loadingNamespaces ? (
                            <div className="w-full bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-1.5 flex items-center gap-2 text-neutral-500">
                              <Loader2 size={12} className="animate-spin" />
                              <span className="text-xs">Loading...</span>
                            </div>
                          ) : (
                            <select
                              value={form.namespace}
                              onChange={(e) => setForm({ ...form, namespace: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500] transition-all"
                            >
                              {namespaces.map(ns => (
                                <option key={ns} value={ns}>{ns}</option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>

                      {/* Secret Type */}
                      <div className="mb-3">
                        <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">
                          Secret Type
                        </label>
                        <select
                          value={form.secretType}
                          onChange={(e) => setForm({ ...form, secretType: e.target.value })}
                          className="w-full bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500] transition-all"
                        >
                          {secretTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>

                      {/* Secret Data */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                            Secret Data
                          </label>
                          <button
                            onClick={() => addSecretField('dev')}
                            className="flex items-center gap-1 text-[10px] text-[#FFA500] hover:text-[#FFA500]/80 transition-colors"
                          >
                            <Plus size={12} />
                            Add Field
                          </button>
                        </div>

                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                          {form.secretData.map((item, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={item.key}
                                onChange={(e) => updateSecretField(index, 'key', e.target.value, 'dev')}
                                className="flex-1 bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-3 py-1.5 focus:outline-none focus:border-[#FFA500] transition-all text-xs font-mono placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                                placeholder="Key"
                              />
                              <div className="flex-1 relative">
                                <input
                                  type="text"
                                  value={item.value}
                                  onChange={(e) => updateSecretField(index, 'value', e.target.value, 'dev')}
                                  className="w-full bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-3 py-1.5 focus:outline-none focus:border-[#FFA500] transition-all text-xs font-mono placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                                  placeholder="Value"
                                />
                              </div>
                              {form.secretData.length > 1 && (
                                <button
                                  onClick={() => removeSecretField(index, 'dev')}
                                  className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Environment 2 (Prod) */}
                    {isDualEnv && (
                      <div className="p-3 rounded-lg border border-[#FFA500]/20 bg-[#FFA500]/5">
                        <h3 className="font-bold text-sm text-[#FFA500] mb-3">Environment 2 (Production)</h3>

                        {/* Secret Name & Namespace */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">
                              Secret Name
                            </label>
                            <input
                              type="text"
                              value={formProd.secretName}
                              onChange={(e) => setFormProd({ ...formProd, secretName: e.target.value })}
                              className="w-full bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500] transition-all placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                              placeholder="my-secret-prod"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">
                              Namespace
                            </label>
                            {loadingNamespaces ? (
                              <div className="w-full bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md px-3 py-1.5 flex items-center gap-2 text-neutral-500">
                                <Loader2 size={12} className="animate-spin" />
                                <span className="text-xs">Loading...</span>
                              </div>
                            ) : (
                              <select
                                value={formProd.namespace}
                                onChange={(e) => setFormProd({ ...formProd, namespace: e.target.value })}
                                className="w-full bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500] transition-all"
                              >
                                {namespaces.map(ns => (
                                  <option key={ns} value={ns}>{ns}</option>
                                ))}
                              </select>
                            )}
                          </div>
                        </div>

                        {/* Secret Type */}
                        <div className="mb-3">
                          <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1 block">
                            Secret Type
                          </label>
                          <select
                            value={formProd.secretType}
                            onChange={(e) => setFormProd({ ...formProd, secretType: e.target.value })}
                            className="w-full bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-3 py-1.5 text-xs focus:outline-none focus:border-[#FFA500] focus:ring-1 focus:ring-[#FFA500] transition-all"
                          >
                            {secretTypes.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </div>

                        {/* Secret Data */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                              Secret Data
                            </label>
                            <button
                              onClick={() => addSecretField('prod')}
                              className="flex items-center gap-1 text-[10px] text-[#FFA500] hover:text-[#FFA500]/80 transition-colors"
                            >
                              <Plus size={12} />
                              Add Field
                            </button>
                          </div>

                          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                            {formProd.secretData.map((item, index) => (
                              <div key={index} className="flex gap-2">
                                <input
                                  type="text"
                                  value={item.key}
                                  onChange={(e) => updateSecretField(index, 'key', e.target.value, 'prod')}
                                  className="flex-1 bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-3 py-1.5 focus:outline-none focus:border-[#FFA500] transition-all text-xs font-mono placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                                  placeholder="Key"
                                />
                                <div className="flex-1 relative">
                                  <input
                                    type="text"
                                    value={item.value}
                                    onChange={(e) => updateSecretField(index, 'value', e.target.value, 'prod')}
                                    className="w-full bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white rounded-md px-3 py-1.5 focus:outline-none focus:border-[#FFA500] transition-all text-xs font-mono placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                                    placeholder="Value"
                                  />
                                </div>
                                {formProd.secretData.length > 1 && (
                                  <button
                                    onClick={() => removeSecretField(index, 'prod')}
                                    className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-[#FFA500] hover:bg-[#FFA500]/90 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm shadow-[#FFA500]/20 transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        {isDualEnv ? 'Creating Secrets...' : 'Creating Secret...'}
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        {isDualEnv ? 'Create / Update Secrets' : 'Create / Update Secret'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Existing Secrets List */}
            <div className="w-full">
              <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 shadow-sm dark:shadow-none">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-[#FFA500]" />
                    <h2 className="text-lg font-bold">Existing Secrets</h2>
                  </div>
                  <div className="text-[10px] text-neutral-500 bg-neutral-50 dark:bg-neutral-800 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-700">
                    Namespace: <span className="text-[#FFA500] font-semibold ml-1">{form.namespace}</span>
                  </div>
                </div>

                {loadingSecrets ? (
                  <div className="flex items-center justify-center py-12 text-neutral-500">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                ) : existingSecrets.length === 0 ? (
                  <div className="text-center py-12 text-neutral-500 text-xs">
                    <Lock size={32} className="mx-auto mb-2 opacity-50" />
                    Tidak ada secret di namespace ini
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
                    {existingSecrets.map((secret, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSecretClick(secret.name)}
                        className="bg-gray-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-md p-3 hover:border-[#FFA500] hover:bg-[#FFA500]/10 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <p className="font-semibold text-xs text-neutral-900 dark:text-white truncate group-hover:text-[#FFA500] transition-colors mb-1">{secret.name}</p>
                          <p className="text-[10px] text-neutral-500">{secret.type}</p>
                        </div>
                        <div className="flex items-center gap-1 mt-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
                          <Key size={10} className="text-neutral-400" />
                          <span className="text-[10px] text-neutral-500">
                            {secret.dataKeys.length} keys
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Info Footer */}
          <div className="mt-6 p-3 bg-white dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs text-neutral-500 dark:text-neutral-400 shadow-sm dark:shadow-none">
            <p className="mb-1.5"><strong className="text-neutral-900 dark:text-white">💡 Tips:</strong></p>
            <ul className="space-y-0.5 ml-4 list-disc">
              <li>Klik pada card secret di sebelah kanan untuk edit secret yang sudah ada</li>
              <li>Secret name harus huruf kecil dan dapat menggunakan dash (-)</li>
              <li>Data akan di-encode base64 secara otomatis</li>
              <li>Jika secret sudah ada, sistem akan melakukan update</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
