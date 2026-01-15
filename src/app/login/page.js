'use client';

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Lock, User, Terminal, Loader2 } from 'lucide-react';


const quotes = [
    "Developer bilang aman di prod… DevOps yang gak bisa tidur semalaman.",
    "Bug di prod itu fitur… di kepala developer. Di grafana keliatannya bencana.",
    "Developer: ‘udah dites kok’ — realita: dites di imajinasi, bukan di staging.",
    "Tidak ada yang mustahil bagi developer… kecuali nulis dokumentasi yang bener.",
    "DevOps merapikan apa yang developer yakini akan baik-baik saja tanpa bukti.",
    "Pull request: 20 baris kode + 200 baris penjelasan kenapa ini bukan salah dia.",
    "Deployment sukses adalah momen DevOps membuktikan developer terlalu optimis.",
    "Developer bikin aplikasinya jalan… DevOps bikin aplikasinya gak ngambek pas dipakai user.",
    "Kapan terakhir staging dipakai? Developer bilang ‘baru kok’ — log bilang ‘8 bulan lalu’.",
    "Developer bilang fitur ini kecil — monitoring bilang CPU udah 100% sejak tadi."
];


export default function LoginPage() {
    const router = useRouter();
    const [data, setData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [quote, setQuote] = useState('');

    useEffect(() => {
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                username: data.username,
                password: data.password,
            });

            if (result?.error) {
                setError('Invalid credentials.');
                setLoading(false);
            } else {
                router.push('/');
                router.refresh();
            }
        } catch (err) {
            setError('An unexpected error occurred.');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-200 font-sans selection:bg-[#FFA500]/30">

            {/* Left Side - Minimalist Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24 bg-white dark:bg-neutral-950">
                <div className="w-full max-w-sm space-y-8">

                    <div className="space-y-2">
                        <div className="mb-6">
                            <img
                                src="/Logo.png"
                                alt="Naratel Logo"
                                className="h-16 w-auto"
                            />
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Welcome back
                        </h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Enter your credentials to access the console.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Username</label>
                            <div className="relative group">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400 group-focus-within:text-[#FFA500] transition-colors" />
                                <input
                                    type="text"
                                    required
                                    value={data.username}
                                    onChange={(e) => setData({ ...data, username: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm placeholder:text-neutral-400 focus:border-[#FFA500] dark:focus:border-[#FFA500] focus:outline-none focus:ring-1 focus:ring-[#FFA500] transition-all"
                                    placeholder="admin"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400 group-focus-within:text-[#FFA500] transition-colors" />
                                <input
                                    type="password"
                                    required
                                    value={data.password}
                                    onChange={(e) => setData({ ...data, password: e.target.value })}
                                    className="block w-full pl-10 pr-3 py-2.5 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm placeholder:text-neutral-400 focus:border-[#FFA500] dark:focus:border-[#FFA500] focus:outline-none focus:ring-1 focus:ring-[#FFA500] transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-900/30 rounded-lg animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex items-center justify-center py-2.5 px-4 bg-[#FFA500] hover:bg-[#e69500] active:bg-[#cc8500] text-white font-bold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFA500] disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#FFA500]/20 active:scale-[0.98]"
                        >
                            {loading ? <Loader2 size={16} className="animate-spin" /> : "Sign in"}
                        </button>
                    </form>

                    {/* <p className="px-8 text-center text-xs text-neutral-400 dark:text-neutral-600">
                        Secure connection established. <br />All activities are monitored and logged.
                    </p> */}
                </div>
            </div>

            {/* Right Side - Decor & Quote */}
            <div className="hidden lg:flex w-1/2 bg-neutral-100 dark:bg-neutral-900 relative items-center justify-center p-12 overflow-hidden">
                {/* Subtle pattern or grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                <div className="absolute inset-0 border-l border-neutral-200 dark:border-neutral-800"></div>

                {/* Yellow Accent Blob */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#FFA500]/5 rounded-full blur-[120px] pointer-events-none"></div>

                <div className="relative z-10 max-w-lg">
                    <div className="mb-8">
                        <Terminal size={48} className="text-[#FFA500] mb-6" />
                        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white mb-4">
                            Naratel DevOps <br />Infrastructure
                        </h2>
                        <div className="h-1 w-20 bg-[#FFA500] rounded-full"></div>
                    </div>

                    <blockquote className="text-xl font-medium text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
                        "{quote}"
                    </blockquote>
                </div>

                {/* Decorative Grid/Lines */}
                <div className="absolute right-0 bottom-0 opacity-10 dark:opacity-5">
                    <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M400 0H0V400H400V0Z" fill="url(#paint0_radial)" />
                        <defs>
                            <radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(400 400) rotate(-90) scale(400)">
                                <stop stopColor="#FFA500" />
                                <stop offset="1" stopColor="#FFA500" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                    </svg>
                </div>
            </div>

        </div>
    );
}
