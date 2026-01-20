"use client";

import { useState } from "react";
import {
  Database,
  Loader2,
  CheckCircle,
  Box,
  Plus,
  Trash2,
  Key,
  Globe,
  Layout,
  Server,
  Activity,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Zap,
  ExternalLink as LinkIcon,
  ChevronDown,
  ChevronUp
} from "lucide-react";

function AppCard({ app, onDelete, isDeleting, onEditAppSecrets, onEditDbSecrets, onEditIngress }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
        className={`bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-sm transition-all overflow-hidden ${!isExpanded ? 'hover:shadow-md cursor-pointer hover:border-orange-200 dark:hover:border-orange-900' : ''}`}
        onClick={() => !isExpanded && setIsExpanded(true)}
    >
        {!isExpanded ? (
            <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                     <div className="p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg text-orange-500">
                        <Box size={20} />
                     </div>
                     <div className="flex flex-col min-w-0">
                        <h3 className="font-bold text-neutral-900 dark:text-white truncate">{app.name}</h3>
                        <p className="text-xs text-neutral-500 truncate font-mono" title={app.image}>{app.image}</p>
                     </div>
                </div>
                
                <div className="hidden md:flex flex-col items-end gap-1 text-right">
                     {app.liveIngressProd ? (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 dark:text-neutral-400">
                             <Globe size={12} />
                             <span className="truncate max-w-[200px]">{app.liveIngressProd}</span>
                        </div>
                     ) : (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-400">
                             <Server size={12} />
                             <span>ClusterIP</span>
                        </div>
                     )}
                </div>

                <div className="text-neutral-400">
                    <ChevronDown size={20} />
                </div>
            </div>
        ) : (
            <div className="relative">
                 <div 
                    className="absolute top-4 right-4 z-10 p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full cursor-pointer text-neutral-400 hover:text-neutral-600"
                    onClick={(e) => { e.stopPropagation(); setIsExpanded(false); }}
                 >
                    <ChevronUp size={20} />
                 </div>

                 <div className="p-6">
                    {/* Top Section: Title & Actions */}
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-700">
                                    ID: {app.id}
                                </span>
                                <span className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-900/10 text-neutral-500 dark:text-neutral-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-neutral-200 dark:border-neutral-800/50">
                                    <Zap size={10} className="text-neutral-400" /> ACTIVE
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                                <Box className="text-neutral-400" size={20} />
                                {app.name}
                            </h3>
                            <div className="flex items-center gap-2 text-neutral-400 text-xs mt-1 font-mono">
                                <span className="truncate max-w-[300px]" title={app.image}>{app.image}</span>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section: Components Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* 1. App Prod */}
                        <div className="p-4 py-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex flex-col justify-between h-full">
                            <div>
                                <p className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-3 flex justify-between">
                                    <span>App Production</span>
                                    <CheckCircle size={14} className="text-neutral-500" />
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Deployment</span>
                                </div>
                            </div>
                            
                            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                {app.liveIngressProd ? (
                                    <a href={`http://${app.liveIngressProd}`} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="group/link flex items-center gap-2 text-xs font-bold text-neutral-700 dark:text-neutral-300 hover:text-[#FFA500] hover:underline bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 transition-colors shadow-sm">
                                        <Globe size={12} className="text-neutral-500" />
                                        <span className="truncate" title={app.liveIngressProd}>{app.liveIngressProd}</span>
                                        <ExternalLink size={10} className="text-neutral-400 ml-auto opacity-50 group-hover/link:opacity-100" />
                                    </a>
                                ) : (
                                    <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg px-3 py-2">
                                        <Server size={12} className="text-neutral-400" />
                                        <span className="italic font-medium">ClusterIP Only</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 2. App Testing */}
                        <div className="p-4 py-5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex flex-col justify-between h-full">
                            <div>
                                <p className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-3 flex justify-between">
                                    <span>App Testing</span>
                                    <CheckCircle size={14} className="text-neutral-500" />
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Deployment</span>
                                </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 shadow-sm" title="Service Type: NodePort">
                                    <Server size={12} className="text-neutral-500" />
                                    <span className="truncate">NodePort Service</span>
                                </div>
                            </div>
                        </div>

                        {/* 3. DB Prod */}
                        <div className={`p-4 py-5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between h-full ${app.db !== 'none' ? 'bg-neutral-50/50 dark:bg-neutral-950/30' : 'opacity-50 grayscale bg-neutral-100/50 dark:bg-neutral-900/30'}`}>
                            <div>
                                <p className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-3 flex justify-between">
                                    <span>DB Production</span>
                                    {app.db !== 'none' && <CheckCircle size={14} className="text-neutral-500" />}
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                    <Database size={16} className="text-neutral-500" />
                                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{app.db !== 'none' ? 'StatefulSet' : 'Disabled'}</span>
                                </div>
                            </div>
                            
                            {app.db !== 'none' && (
                                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 shadow-sm" title="Internal Service DNS">
                                        <Server size={12} className="text-neutral-500" />
                                        <span className="truncate">svc-{app.name}-db-{app.id}</span>
                                        <span className="text-neutral-400 font-normal">:</span>
                                        <span className="text-neutral-600 dark:text-neutral-400 font-black">{app.db === 'postgres' ? '5432' : '3306'}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 4. DB Testing */}
                        <div className={`p-4 py-5 rounded-xl border border-neutral-200 dark:border-neutral-800 flex flex-col justify-between h-full ${app.db !== 'none' ? 'bg-neutral-50/50 dark:bg-neutral-950/30' : 'opacity-50 grayscale bg-neutral-100/50 dark:bg-neutral-900/30'}`}>
                            <div>
                                <p className="text-[11px] font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider mb-3 flex justify-between">
                                    <span>DB Testing</span>
                                    {app.db !== 'none' && <CheckCircle size={14} className="text-neutral-500" />}
                                </p>
                                <div className="flex items-center gap-2 mb-2">
                                    <Database size={16} className="text-neutral-500" />
                                    <span className="text-sm font-bold text-neutral-800 dark:text-neutral-200">{app.db !== 'none' ? 'StatefulSet' : 'Disabled'}</span>
                                </div>
                            </div>

                            {app.db !== 'none' && (
                                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-800">
                                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg px-3 py-2 shadow-sm" title="Internal Service DNS">
                                        <Server size={12} className="text-neutral-500" />
                                        <span className="truncate">svc-{app.name}-db-{app.id}</span>
                                        <span className="text-neutral-400 font-normal">:</span>
                                        <span className="text-neutral-600 dark:text-neutral-400 font-black">{app.db === 'postgres' ? '5432' : '3306'}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons & Status Section */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-neutral-100 dark:border-neutral-800">
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                            <button
                                onClick={(e) => { e.stopPropagation(); onEditIngress(app.name); }}
                                className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-sm"
                            >
                                Edit Ingress
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onEditAppSecrets(app.name); }}
                                className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-[#FFA500] text-white rounded-lg hover:bg-[#E69500] transition-all shadow-sm"
                            >
                                App Secrets
                            </button>
                            {app.db !== 'none' && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); onEditDbSecrets(app.name); }}
                                    className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-all shadow-sm"
                                >
                                    DB Secrets
                                </button>
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(app.id, app.name); }}
                                disabled={isDeleting === app.id}
                                className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isDeleting === app.id ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 size={12} className="animate-spin" /> Deleting...
                                    </span>
                                ) : (
                                    "Delete App"
                                )}
                            </button>
                        </div>

                        <div className="flex items-center gap-4 text-[10px] font-bold text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                            <div className="flex items-center gap-1">
                                <ShieldCheck size={12} className="text-neutral-400" /> GitOps Synced
                            </div>
                            <div className="flex items-center gap-1">
                                <Activity size={12} className="text-neutral-400" /> ArgoCD Monitored
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}

export default function AppList({ apps, onDelete, isDeleting, onCreate, onEditAppSecrets, onEditDbSecrets, onEditIngress }) {
  if (apps.length === 0) {
    return (
        <div className="col-span-full py-20 text-center flex flex-col items-center justify-center text-neutral-500 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl bg-white/50 dark:bg-neutral-900/50">
            <Box size={48} className="text-neutral-300 mb-4" />
            <p className="font-semibold text-lg">No applications found</p>
            <p className="text-sm max-w-sm mt-2">Get started by creating your first application manifest.</p>
            <button 
                onClick={onCreate}
                className="mt-6 flex items-center gap-2 bg-[#FFA500] hover:bg-[#FFA500]/90 text-white font-bold py-2 px-6 rounded-lg transition-all"
            >
                <Plus size={18} /> Create App
            </button>
        </div>
    );
  }

  return (
      <div className="flex flex-col gap-4">
        {apps.map((app) => (
            <AppCard 
                key={app.id} 
                app={app} 
                onDelete={onDelete} 
                isDeleting={isDeleting}
                onEditAppSecrets={onEditAppSecrets}
                onEditDbSecrets={onEditDbSecrets}
                onEditIngress={onEditIngress}
            />
        ))}
      </div>
  );
}