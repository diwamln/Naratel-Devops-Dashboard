"use client";

import { useState } from "react";
import useSWR from "swr";
import { 
  FileCode, 
  Copy, 
  Check, 
  Download, 
  ChevronDown, 
  ChevronUp,
  Loader2,
  ExternalLink
} from "lucide-react";

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function JenkinsfileViewer({ appName, imageRepo }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data, isLoading, error } = useSWR(
    appName ? `/api/jenkins/generate-file?appName=${appName}&imageRepo=${encodeURIComponent(imageRepo || '')}` : null,
    fetcher,
    { revalidateOnFocus: false }
  );

  const handleCopy = () => {
    if (data?.jenkinsfile) {
      navigator.clipboard.writeText(data.jenkinsfile);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (data?.jenkinsfile) {
      const blob = new Blob([data.jenkinsfile], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Jenkinsfile';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
      {/* Header */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
            <FileCode size={18} className="text-neutral-500" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-sm text-neutral-900 dark:text-white">
              Jenkinsfile Template
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              Copy this to your repository root
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp size={16} className="text-neutral-400" />
          ) : (
            <ChevronDown size={16} className="text-neutral-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-top-2 duration-200">
          {/* Action Bar */}
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 flex items-center justify-between gap-2 flex-wrap">
            <p className="text-xs text-neutral-500">
              Pre-configured for <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300">{appName}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={isLoading || !data?.jenkinsfile}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-50 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-green-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    Copy
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                disabled={isLoading || !data?.jenkinsfile}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-50 transition-colors"
              >
                <Download size={12} />
                Download
              </button>
            </div>
          </div>

          {/* Code Block */}
          <div className="relative">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-neutral-400" />
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center text-sm text-red-500">
                Failed to generate Jenkinsfile
              </div>
            ) : (
              <pre className="p-4 text-xs font-mono text-neutral-700 dark:text-neutral-300 bg-neutral-950 overflow-x-auto max-h-[400px] overflow-y-auto">
                <code>{data?.jenkinsfile}</code>
              </pre>
            )}
          </div>

          {/* Footer Hint */}
          <div className="px-4 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-[10px] text-neutral-400 leading-relaxed">
              <span className="font-bold">Instructions:</span> Place this file at the root of your Git repository as <code className="bg-neutral-200 dark:bg-neutral-700 px-1 py-0.5 rounded">Jenkinsfile</code>. 
              The pipeline will automatically build, test, and deploy your application.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
