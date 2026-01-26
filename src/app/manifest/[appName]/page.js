"use client";

import { useState, useEffect, use } from "react";
import {
    Server,
    Database,
    Globe,
    Lock,
    Network,
    Trash2,
    ChevronLeft,
    Loader2,
    Box,
    Copy,
    Check,
    ExternalLink,
    Info,
    ArrowRight,
    ArrowDown,
    GitGraph,
    AlertTriangle
} from "lucide-react";
import { useRouter } from "next/navigation";
import DashboardLayout from "../../components/DashboardLayout";
import ArgoStatusBadge from "../components/ArgoStatusBadge";
import EditAppSecretsForm from "../components/EditAppSecretsForm";
import EditDbSecretsForm from "../components/EditDbSecretsForm";
import EditIngressForm from "../components/EditIngressForm";
import JenkinsfileViewer from "../components/JenkinsfileViewer";
import { useApp, useRegistry } from "@/hooks/useRegistry";
import { useArgoStatus } from "@/hooks/useArgoStatus";

function DeploymentCard({ title, type, env, argoAppName, internalDns, domain, nodePort }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 transition-all hover:border-neutral-300 dark:hover:border-neutral-700 h-full flex flex-col justify-between group/card">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                        <div className="text-neutral-400 dark:text-neutral-500">
                            {type === 'db' ? <Database size={18} /> : <Server size={18} />}
                        </div>
                        <div>
                            <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{title}</h4>
                            <p className="text-xs text-neutral-500">{env}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <a
                            href={`${process.env.NEXT_PUBLIC_ARGOCD_URL || 'http://117.103.71.154:32081'}/applications/cicd/${argoAppName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-neutral-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            title="View ArgoCD Tree"
                        >
                            <GitGraph size={14} />
                        </a>
                        <ArgoStatusBadge appName={argoAppName} compact />
                    </div>
                </div>

                {/* Additional Info Section */}
                <div className="space-y-3">
                    {internalDns && (
                        <div>
                            <p className="text-[10px] font-medium text-neutral-400 mb-1.5 uppercase tracking-wide">Internal DNS</p>
                            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-950 px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-800 group">
                                <code className="text-xs font-mono text-neutral-600 dark:text-neutral-400 truncate flex-1">
                                    {internalDns}
                                </code>
                                <button
                                    onClick={() => handleCopy(internalDns)}
                                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    {copied ? <Check size={12} /> : <Copy size={12} />}
                                </button>
                            </div>
                        </div>
                    )}

                    {domain && (
                        <div>
                            <p className="text-[10px] font-medium text-neutral-400 mb-1.5 uppercase tracking-wide">External Access</p>
                            <a href={`http://${domain}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline bg-blue-50 dark:bg-blue-900/20 px-2 py-1.5 rounded border border-blue-100 dark:border-blue-800/50 transition-colors">
                                <Globe size={12} />
                                <span className="truncate flex-1">{domain}</span>
                                <ExternalLink size={10} />
                            </a>
                        </div>
                    )}

                    {nodePort && (
                        <div>
                            <p className="text-[10px] font-medium text-neutral-400 mb-1.5 uppercase tracking-wide">Service Type</p>
                            <div className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-950 px-2 py-1.5 rounded border border-neutral-200 dark:border-neutral-800">
                                <Network size={12} className="text-neutral-400" />
                                <span className="text-xs text-neutral-600 dark:text-neutral-400 font-mono">NodePort</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function AppDetailsPage({ params }) {
    const router = useRouter();

    // Unwrap params using React.use() for Next.js 15+
    const resolvedParams = use(params);
    const appName = resolvedParams.appName;
    const decodedName = decodeURIComponent(appName);

    // 🚀 SWR: Cached app data - instant on navigation back
    const { app: registryApp, isLoading: isLoadingRegistry, mutate } = useApp(appName);

    // 🚀 SWR: Check if testing environment exists (cached separately)
    const { exists: testEnvExists } = useArgoStatus(`${decodedName}-testing`);

    // 🚀 SWR: Fallback check for apps in ArgoCD but not in registry
    const { exists: prodExistsInArgo, isLoading: isLoadingArgo } = useArgoStatus(`${decodedName}-prod`);

    // Derived app state - use registry data, or create fallback if found in ArgoCD
    const app = registryApp || (prodExistsInArgo ? {
        id: 'Unknown',
        name: decodedName,
        image: 'Unknown (External)',
        db: 'unknown',
        liveIngressProd: null,
        createdAt: new Date().toISOString()
    } : null);

    const loading = isLoadingRegistry || (isLoadingArgo && !registryApp);

    const [message, setMessage] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('ingress'); // 'ingress', 'app-secrets', 'db-secrets'

    // Show warning if app found in ArgoCD but not in local registry
    useEffect(() => {
        if (!registryApp && prodExistsInArgo && !isLoadingRegistry && !isLoadingArgo) {
            setMessage({ text: "App found in ArgoCD but missing from local registry.", type: "warning" });
        }
    }, [registryApp, prodExistsInArgo, isLoadingRegistry, isLoadingArgo]);

    const confirmDelete = async () => {
        if (deleteConfirmationInput !== app.name) return;

        setIsDeleting(true);
        try {
            const res = await fetch("/api/manifest/delete", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ appId: app.id, appName: app.name })
            });

            if (res.ok) {
                mutate(); // 🚀 Invalidate cache before redirect
                router.push('/manifest?message=App deleted successfully');
            } else {
                throw new Error("Delete failed");
            }
        } catch (err) {
            alert(err.message);
            setIsDeleting(false);
            setIsDeleteModalOpen(false);
        }
    };

    const handleFormSuccess = (msg) => {
        alert(msg); // Or use a toast
    };

    if (loading) return (
        <DashboardLayout>
            <div className="h-[50vh] flex flex-col items-center justify-center text-neutral-500 gap-2">
                <Loader2 size={32} className="animate-spin text-[#FFA500]" />
                <p>Loading application details...</p>
            </div>
        </DashboardLayout>
    );

    if (!app) return (
        <DashboardLayout>
            <div className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">Application Not Found</h2>
                <p className="text-sm text-neutral-500 mb-6 max-w-xs mx-auto">{message?.text}</p>
                <button onClick={() => router.back()} className="text-[#FFA500] hover:underline">Go Back</button>
            </div>
        </DashboardLayout>
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 pb-20">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors text-neutral-500">
                            <ChevronLeft size={20} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-semibold text-neutral-900 dark:text-white tracking-tight">
                                    {app.name}
                                </h1>
                                <span className="text-[10px] font-mono text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded">
                                    {app.id}
                                </span>
                            </div>
                            <p className="text-sm text-neutral-500 mt-1 font-mono">{app.image}</p>
                        </div>
                    </div>

                    <button
                        onClick={() => { setDeleteConfirmationInput(""); setIsDeleteModalOpen(true); }}
                        className="text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md transition-colors flex items-center gap-2"
                    >
                        <Trash2 size={16} />
                        Delete Application
                    </button>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-1">
                    <div>
                        <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Public Access</h3>
                        {app.liveIngressProd ? (
                            <a href={`http://${app.liveIngressProd}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-neutral-900 dark:text-white hover:underline flex items-center gap-1.5">
                                {app.liveIngressProd}
                                <ExternalLink size={12} className="text-neutral-400" />
                            </a>
                        ) : (
                            <p className="text-sm text-neutral-400 italic">Not configured</p>
                        )}
                    </div>

                    <div>
                        <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Database</h3>
                        <p className="text-sm font-medium text-neutral-900 dark:text-white capitalize">
                            {app.db === 'none' ? 'None' : app.db}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wide mb-2">Created At</h3>
                        <p className="text-sm font-mono text-neutral-900 dark:text-white">
                            {new Date(app.createdAt || Date.now()).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                {/* Deployments Section */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">Environment Topology</h2>

                    <div className="grid grid-cols-1 gap-8">
                        {/* Production Card */}
                        <div className="bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Production Environment</h3>
                                </div>
                                <span className="text-[10px] font-bold text-neutral-400 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-2 py-1 rounded-md uppercase">Stable</span>
                            </div>

                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 relative z-10">
                                <div className="flex-1 min-w-0">
                                    <DeploymentCard
                                        title="Application"
                                        type="app"
                                        env="PRODUCTION"
                                        argoAppName={`${app.name}-prod`}
                                        domain={app.liveIngressProd}
                                    />
                                </div>

                                {app.db !== 'none' && (
                                    <>
                                        <div className="flex items-center justify-center text-neutral-300 dark:text-neutral-700">
                                            <ArrowRight size={20} strokeWidth={2} className="hidden md:block" />
                                            <ArrowDown size={20} strokeWidth={2} className="md:hidden" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <DeploymentCard
                                                title="Database"
                                                type="db"
                                                env="PRODUCTION"
                                                argoAppName={`${app.name}-db-prod`}
                                                internalDns={`svc-db-${app.name}-${app.id}.${app.id}-db-${app.name}-prod.svc.cluster.local`}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Testing Card */}
                        {testEnvExists && (
                            <div className="bg-neutral-50/50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 relative overflow-hidden animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                                        <h3 className="text-sm font-bold text-neutral-900 dark:text-white uppercase tracking-wider">Testing Environment</h3>
                                    </div>
                                    <span className="text-[10px] font-bold text-orange-500 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-800/50 px-2 py-1 rounded-md uppercase">Ephemeral</span>
                                </div>

                                <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 relative z-10">
                                    <div className="flex-1 min-w-0">
                                        <DeploymentCard
                                            title="Application"
                                            type="app"
                                            env="TESTING"
                                            argoAppName={`${app.name}-testing`}
                                            nodePort={true}
                                        />
                                    </div>

                                    {app.db !== 'none' && (
                                        <>
                                            <div className="flex items-center justify-center text-neutral-300 dark:text-neutral-700">
                                                <ArrowRight size={20} strokeWidth={2} className="hidden md:block" />
                                                <ArrowDown size={20} strokeWidth={2} className="md:hidden" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <DeploymentCard
                                                    title="Database"
                                                    type="db"
                                                    env="TESTING"
                                                    argoAppName={`${app.name}-db-testing`}
                                                    internalDns={`svc-db-${app.name}-${app.id}.${app.id}-db-${app.name}-testing.svc.cluster.local`}
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Jenkinsfile Section */}
                <JenkinsfileViewer appName={app.name} imageRepo={app.image?.split(':')[0]} />

                {/* Configuration Section (Tabs) */}
                <div>
                    <div className="flex gap-6 border-b border-neutral-200 dark:border-neutral-800 mb-6">
                        <button
                            onClick={() => setActiveTab('ingress')}
                            className={`pb-3 text-sm font-medium transition-all ${activeTab === 'ingress' ? 'text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                        >
                            Ingress
                        </button>
                        <button
                            onClick={() => setActiveTab('app-secrets')}
                            className={`pb-3 text-sm font-medium transition-all ${activeTab === 'app-secrets' ? 'text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                        >
                            App Secrets
                        </button>
                        {app.db !== 'none' && (
                            <button
                                onClick={() => setActiveTab('db-secrets')}
                                className={`pb-3 text-sm font-medium transition-all ${activeTab === 'db-secrets' ? 'text-neutral-900 dark:text-white border-b-2 border-neutral-900 dark:border-white' : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'}`}
                            >
                                DB Secrets
                            </button>
                        )}
                    </div>

                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6 min-h-[400px]">
                        {activeTab === 'ingress' && (
                            <EditIngressForm appName={app.name} onClose={() => { }} onSuccess={handleFormSuccess} />
                        )}
                        {activeTab === 'app-secrets' && (
                            <EditAppSecretsForm appName={app.name} onClose={() => { }} onSuccess={handleFormSuccess} />
                        )}
                        {activeTab === 'db-secrets' && app.db !== 'none' && (
                            <EditDbSecretsForm appName={app.name} onClose={() => { }} onSuccess={handleFormSuccess} />
                        )}
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                        <div className="bg-white dark:bg-neutral-900 w-full max-w-md rounded-xl shadow-2xl p-6 border border-neutral-200 dark:border-neutral-800">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-red-500 mb-4">
                                    <AlertTriangle size={24} />
                                </div>
                                <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Delete Application?</h3>
                                <p className="text-sm text-neutral-500 mt-2">
                                    This action cannot be undone. All deployments and secrets will be permanently removed.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-neutral-500 uppercase">
                                    Type <span className="text-neutral-900 dark:text-white select-all">{app.name}</span> to confirm:
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 text-sm border border-neutral-300 dark:border-neutral-700 rounded-lg dark:bg-neutral-950 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                                    placeholder={app.name}
                                    value={deleteConfirmationInput}
                                    onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    disabled={isDeleting}
                                    className="flex-1 py-2.5 text-sm font-bold text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteConfirmationInput !== app.name || isDeleting}
                                    className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-lg shadow-red-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isDeleting && <Loader2 size={16} className="animate-spin" />}
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </DashboardLayout>
    );
}
