
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import {
    BarChart3,
    GitBranch,
    Settings,
    Ship,
    Database,
    HardDrive,
    Server,
    ExternalLink,
    ArrowRight,
    LayoutGrid,
    Pencil,
    X,
    Save
} from 'lucide-react';

// Default tools list
const initialTools = [
    {
        id: 'grafana',
        name: "Grafana",
        description: "Visualize and analyze your metrics and logs.",
        iconName: "BarChart3",
        url: "https://grafana.com", // Placeholder
        color: "text-orange-500",
        bg: "bg-orange-50 dark:bg-orange-900/10",
        border: "hover:border-orange-500/50"
    },
    {
        id: 'gitops',
        name: "GitOps",
        description: "Git-based continuous delivery and infrastructure.",
        iconName: "GitBranch",
        url: "#",
        color: "text-blue-500",
        bg: "bg-blue-50 dark:bg-blue-900/10",
        border: "hover:border-blue-500/50"
    },
    {
        id: 'jenkins',
        name: "Jenkins",
        description: "Build, test, and deploy with automation.",
        iconName: "Settings",
        url: "#",
        color: "text-red-500",
        bg: "bg-red-50 dark:bg-red-900/10",
        border: "hover:border-red-500/50"
    },
    {
        id: 'argocd',
        name: "ArgoCD",
        description: "Declarative continuous delivery for Kubernetes.",
        iconName: "Ship",
        url: "#",
        color: "text-teal-500",
        bg: "bg-teal-50 dark:bg-teal-900/10",
        border: "hover:border-teal-500/50"
    },
    {
        id: 'backup',
        name: "Backup",
        description: "Manage system backups and disaster recovery.",
        iconName: "Database",
        url: "#",
        color: "text-green-500",
        bg: "bg-green-50 dark:bg-green-900/10",
        border: "hover:border-green-500/50"
    },
    {
        id: 'longhorn',
        name: "Longhorn",
        description: "Cloud-native distributed block storage for K8s.",
        iconName: "HardDrive",
        url: "#",
        color: "text-yellow-500",
        bg: "bg-yellow-50 dark:bg-yellow-900/10",
        border: "hover:border-yellow-500/50"
    },
    {
        id: 'cloudbeaver',
        name: "CloudBeaver",
        description: "Universal database tool for developers.",
        iconName: "Server",
        url: "#",
        color: "text-purple-500",
        bg: "bg-purple-50 dark:bg-purple-900/10",
        border: "hover:border-purple-500/50"
    }
];

// Icon mapping helper
const iconMap = {
    BarChart3,
    GitBranch,
    Settings,
    Ship,
    Database,
    HardDrive,
    Server,
};

export default function ToolsPage() {
    const router = useRouter();
    const [tools, setTools] = useState(initialTools);
    const [hoveredTool, setHoveredTool] = useState(null);
    const [editingTool, setEditingTool] = useState(null);
    const [editForm, setEditForm] = useState({ url: '' });

    // Load from localStorage on mount
    useEffect(() => {
        const savedTools = localStorage.getItem('devops_tools_data');
        if (savedTools) {
            try {
                const parsed = JSON.parse(savedTools);
                // Merge with initial to ensure structure, but respect saved values
                // This is a simple overwrite for now
                setTools(parsed);
            } catch (e) {
                console.error("Failed to parse saved tools", e);
            }
        }
    }, []);

    const handleNavigation = (pageId) => {
        if (pageId === 'jenkins') router.push('/');
        if (pageId === 'k8s-secret') router.push('/secrets');
        if (pageId === 'manifest') router.push('/manifest');
        if (pageId === 'tools') router.push('/tools');
    };

    const startEdit = (e, tool) => {
        e.preventDefault(); // Prevent Link navigation
        e.stopPropagation();
        setEditingTool(tool.id);
        setEditForm({ url: tool.url });
    };

    const cancelEdit = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setEditingTool(null);
    };

    const saveEdit = (e, toolId) => {
        e.preventDefault();
        e.stopPropagation();

        const updatedTools = tools.map(t => {
            if (t.id === toolId) {
                return { ...t, url: editForm.url };
            }
            return t;
        });

        setTools(updatedTools);
        localStorage.setItem('devops_tools_data', JSON.stringify(updatedTools));
        setEditingTool(null);
    };

    const handleKeyDown = (e, toolId) => {
        if (e.key === 'Enter') {
            saveEdit(e, toolId);
        } else if (e.key === 'Escape') {
            cancelEdit(e);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-neutral-950 transition-colors">
            <Navigation activePage="tools" onPageChange={handleNavigation} />

            <div className="md:ml-60 min-h-screen text-neutral-900 dark:text-white p-6">
                <div className="max-w-7xl mx-auto">

                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <LayoutGrid className="text-[#FFA500]" />
                            DevOps Gateway
                        </h1>
                        <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                            Centralized access to your development operations & infrastructure tools.
                        </p>
                    </div>

                    {/* Tools Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {tools.map((tool) => {
                            const Icon = iconMap[tool.iconName] || Settings;
                            const isEditing = editingTool === tool.id;

                            return (
                                <div
                                    key={tool.id}
                                    className={`group relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6 overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${tool.border}`}
                                    onMouseEnter={() => setHoveredTool(tool.id)}
                                    onMouseLeave={() => setHoveredTool(null)}
                                >
                                    {/* Edit Mode Overlay */}
                                    {isEditing ? (
                                        <div className="flex flex-col h-full space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-neutral-900 dark:text-white">Edit Link</h3>
                                                <button onClick={cancelEdit} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200">
                                                    <X size={18} />
                                                </button>
                                            </div>
                                            <div className="flex-1 flex flex-col justify-center space-y-2">
                                                <label className="text-xs font-bold uppercase text-neutral-500">Destination URL</label>
                                                <input
                                                    type="text"
                                                    value={editForm.url}
                                                    onChange={(e) => setEditForm({ ...editForm, url: e.target.value })}
                                                    onKeyDown={(e) => handleKeyDown(e, tool.id)}
                                                    className="w-full p-2 text-sm border rounded bg-gray-50 dark:bg-neutral-950 dark:border-neutral-800 focus:ring-1 focus:ring-[#FFA500] outline-none"
                                                    placeholder="https://"
                                                    autoFocus
                                                    onClick={(e) => e.preventDefault()}
                                                />
                                            </div>
                                            <button
                                                onClick={(e) => saveEdit(e, tool.id)}
                                                className="w-full py-2 bg-[#FFA500] hover:bg-[#FFA500]/90 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                            >
                                                <Save size={16} /> Save Changes
                                            </button>
                                        </div>
                                    ) : (
                                        /* Normal View */
                                        <Link
                                            href={tool.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex flex-col h-full justify-between space-y-6"
                                        >
                                            <div className="flex items-start justify-between relative">
                                                <div className={`p-3 rounded-xl ${tool.bg} ${tool.color} ring-1 ring-inset ring-black/5 dark:ring-white/5 transition-all`}>
                                                    <Icon className="w-8 h-8" strokeWidth={1.5} />
                                                </div>

                                                {/* Edit Button - Visible on Hover */}
                                                <button
                                                    onClick={(e) => startEdit(e, tool)}
                                                    className={`absolute top-0 right-0 p-2 text-neutral-400 hover:text-[#FFA500] bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-800 transition-all ${hoveredTool === tool.id ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
                                                    title="Edit Link"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                            </div>

                                            <div className="space-y-2">
                                                <h2 className="text-lg font-bold text-neutral-900 dark:text-gray-100 group-hover:text-[#FFA500] transition-colors">
                                                    {tool.name}
                                                </h2>
                                                <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                                                    {tool.description}
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-neutral-400 group-hover:text-[#FFA500] transition-colors pt-2 border-t border-neutral-100 dark:border-neutral-800 mt-auto">
                                                <div className="flex items-center">
                                                    <span>Launch Tool</span>
                                                    <ArrowRight className="w-3.5 h-3.5 ml-2 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

