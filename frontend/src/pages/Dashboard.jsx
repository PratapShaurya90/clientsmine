import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import DashboardNav from "../components/DashboardNav";
import LeadsTable from "../components/LeadsTable";
import { useToast } from "../context/ToastContext";
const PROMPTS = [
    "I need a logo designer for my startup...",
    "Looking for a React developer for 3 months...",
    "Need a content writer for my tech blog...",
    "Searching for a UI/UX designer for mobile app...",
    "Want a video editor for YouTube channel...",
];

const TableSkeleton = () => {
    const rows = [
        { left: '55%', rightA: '30%', rightB: '10%' },
        { left: '40%', rightA: '25%', rightB: '10%' },
        { left: '65%', rightA: '35%', rightB: '10%' },
        { left: '50%', rightA: '28%', rightB: '10%' },
        { left: '60%', rightA: '32%', rightB: '10%' },
        { left: '45%', rightA: '22%', rightB: '10%' },
        { left: '70%', rightA: '30%', rightB: '10%' },
    ];

    return (
        <div style={{
            width: '100%',
            marginTop: '2rem',
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #f0f0f0',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: -600px 0; }
                    100% { background-position: 600px 0; }
                }
                .skeleton-bar {
                    background: linear-gradient(90deg, #f5f5f5 25%, #ebebeb 50%, #f5f5f5 75%);
                    background-size: 600px 100%;
                    animation: shimmer 1.4s ease-in-out infinite;
                    border-radius: 6px;
                }
            `}</style>

            {/* Header bar */}
            <div style={{
                padding: '20px 28px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
            }}>
                <div className="skeleton-bar" style={{ height: '14px', width: '52px' }} />
                <div className="skeleton-bar" style={{ height: '20px', width: '64px', borderRadius: '20px' }} />
            </div>

            {/* Rows */}
            {rows.map((row, i) => (
                <div
                    key={i}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 28px',
                        borderBottom: i < rows.length - 1 ? '1px solid #f5f5f5' : 'none',
                    }}
                >
                    {/* Left: avatar + bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                        <div className="skeleton-bar" style={{ width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0 }} />
                        <div style={{ flex: 1, maxWidth: '400px' }}>
                            <div className="skeleton-bar" style={{ height: '13px', width: row.left, marginBottom: '6px' }} />
                            <div className="skeleton-bar" style={{ height: '11px', width: '30%' }} />
                        </div>
                    </div>

                    {/* Right: contact + button */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>
                        <div className="skeleton-bar" style={{ height: '13px', width: row.rightA.replace('%', '') > 25 ? '130px' : '100px' }} />
                        <div className="skeleton-bar" style={{ height: '30px', width: '64px', borderRadius: '8px' }} />
                    </div>
                </div>
            ))}
        </div>
    );
};

const MoneyQuote = () => {
    return (
        <div className="w-full flex flex-col items-center justify-center py-4 px-6 text-center max-w-2xl mx-auto select-none mt-2">
            <span className="text-amber-500 text-5xl mb-2 font-serif leading-none">“</span>
            <p className="text-zinc-950 text-2xl font-normal leading-relaxed italic" 
               style={{ 
                   fontFamily: '"Anthropic Serif", Georgia, "Arial Hebrew", "Noto Sans Hebrew", "Times New Roman", Times, "Hiragino Sans", "Yu Gothic", Meiryo, "Noto Sans CJK JP", "PingFang TC", "Microsoft JhengHei", "Noto Sans CJK TC", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans CJK KR", serif',
                   fontWeight: 380
               }}>
                Wealth is the ability to fully experience life.
            </p>
            <p className="text-zinc-650 text-xs font-bold tracking-widest uppercase mt-4">
                — Henry David Thoreau
            </p>
        </div>
    );
};

const Dashboard = () => {
    const toast = useToast();
    const navigate = useNavigate();
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [loading, setLoading] = useState(false);         // true = waiting for FIRST batch
    const [isLoadingMore, setIsLoadingMore] = useState(false); // true = stream open, more coming
    const [scrapedLeads, setScrapedLeads] = useState([]);
    const [currentStatus, setCurrentStatus] = useState("");
    const [displayText, setDisplayText] = useState("");
    const [promptIndex, setPromptIndex] = useState(0);
    const [charIndex, setCharIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [userText, setUserText] = useState("");
    const intervalRef = useRef(null);
    const abortRef = useRef(null); // to cancel the stream if needed

    useEffect(() => {
        if (isFocused) return;

        intervalRef.current = setInterval(() => {
            const currentPrompt = PROMPTS[promptIndex];

            if (!isDeleting) {
                setDisplayText(currentPrompt.slice(0, charIndex + 1));
                setCharIndex(prev => prev + 1);

                if (charIndex + 1 === currentPrompt.length) {
                    setTimeout(() => setIsDeleting(true), 1500);
                }
            } else {
                setDisplayText(currentPrompt.slice(0, charIndex - 1));
                setCharIndex(prev => prev - 1);

                if (charIndex - 1 === 0) {
                    setIsDeleting(false);
                    setPromptIndex(prev => (prev + 1) % PROMPTS.length);
                }
            }
        }, isDeleting ? 30 : 55);

        return () => clearInterval(intervalRef.current);
    }, [charIndex, isDeleting, promptIndex, isFocused]);

    const handleChange = (e) => {
        setUserText(e.target.value);
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!userText.trim()) return;

        // Cancel any previous stream
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setIsLoadingMore(false);
        setScrapedLeads([]);
        setUserText("");
        setCurrentStatus("Connecting to AI Agent...");

        const token = localStorage.getItem("token");
        let firstBatchReceived = false;

        try {
            const response = await fetch("http://localhost:5001/api/ai/client", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ usermessage: userText }),
                signal: controller.signal
            });

            if (!response.ok) {
                const errJson = await response.json().catch(() => ({}));
                toast.error(errJson.message || "Request failed");
                setLoading(false);
                return;
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });

                // SSE messages are separated by double newlines
                const parts = buffer.split("\n\n");
                buffer = parts.pop(); // keep incomplete last chunk

                for (const part of parts) {
                    const lines = part.split("\n");
                    let eventName = "";
                    let dataStr = "";

                    for (const line of lines) {
                        if (line.startsWith("event:")) eventName = line.replace("event:", "").trim();
                        if (line.startsWith("data:")) dataStr = line.replace("data:", "").trim();
                    }

                    if (!dataStr) continue;

                    try {
                        const data = JSON.parse(dataStr);

                        if (eventName === "status") {
                            setCurrentStatus(data.message || "");
                        } else if (eventName === "leads") {
                            setScrapedLeads(prev => [...prev, ...data.leads]);
                            if (!firstBatchReceived) {
                                firstBatchReceived = true;
                                setLoading(false);       // hide skeleton
                                setIsLoadingMore(true);  // show "Fetching more..."
                                toast.success(`First ${data.count} leads from ${data.source}!`);
                            }
                        } else if (eventName === "done") {
                            setCurrentStatus("");
                            setIsLoadingMore(false);
                            if (data.total > 0) {
                                toast.success(`Done! ${data.total} leads found in total.`);
                            } else if (!firstBatchReceived) {
                                toast.info("No matching leads found for this search.");
                            }
                        } else if (eventName === "clarification") {
                            setCurrentStatus("");
                            toast.info(data.question);
                            setLoading(false);
                            setIsLoadingMore(false);
                        } else if (eventName === "error") {
                            setCurrentStatus("");
                            toast.error(data.message || "Scraping failed");
                            setLoading(false);
                            setIsLoadingMore(false);
                        }
                    } catch (parseErr) {
                        console.warn("[SSE] Failed to parse event data:", dataStr);
                    }
                }
            }
        } catch (err) {
            if (err.name === "AbortError") return; // user navigated away
            console.error("SSE stream error:", err);
            toast.error("Connection error. Please try again.");
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
            setCurrentStatus("");
        }
    };

    return (
        <div className="w-full min-h-screen relative overflow-hidden bg-gradient-to-tr from-emerald-100 via-green-50 to-teal-100" style={{ backgroundSize: '400% 400%', animation: 'gradient-xy 15s ease infinite' }}>

            {showUpgradeModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
                    <div className="w-[47vw] bg-white border border-zinc-200/80 rounded-md p-8 text-center shadow-2xl">
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">Upgrade Required</h2>
                        <p className="text-sm text-black mb-6">
                            You are not a Pro User. You need a Pro plan to view more leads.
                        </p>
                        <div className="flex justify-between items-center gap-2.5">
                            <button
                                onClick={() => navigate("/pricing")}
                                className="w-full py-2.5 bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-lg active:scale-98 transition-all"
                            >
                                Upgrade Plan
                            </button>
                            <button
                                onClick={() => setShowUpgradeModal(false)}
                                className="w-full py-2.5 border border-zinc-200 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes gradient-xy {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(-5deg); }
                    50% { transform: translateY(-30px) rotate(5deg); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0px) rotate(5deg) scale(1); }
                    50% { transform: translateY(-50px) rotate(-10deg) scale(1.05); }
                }
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
                .cursor::after {
                    content: '|';
                    animation: blink 0.8s ease-in-out infinite;
                    color: #71717a;
                    font-weight: 300;
                    margin-left: 1px;
                }
            `}</style>

            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-emerald-300/20 rounded-full blur-[120px] mix-blend-multiply" style={{ animation: 'float-slow 15s ease-in-out infinite' }}></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw] bg-green-200/20 rounded-full blur-[130px] mix-blend-multiply" style={{ animation: 'float-fast 18s ease-in-out infinite' }}></div>
                <div className="absolute top-[30%] left-[40%] w-[35vw] h-[35vw] bg-teal-100/20 rounded-full blur-[100px] mix-blend-multiply" style={{ animation: 'float-slow 20s ease-in-out infinite' }}></div>
                
                {/* Floating Dollar Signs */}
                <div className="absolute top-[15%] left-[10%] text-zinc-500/20 text-8xl font-serif" style={{ animation: 'float-slow 8s ease-in-out infinite' }}>$</div>
                <div className="absolute top-[60%] left-[20%] text-zinc-400/20 text-9xl font-serif" style={{ animation: 'float-fast 12s ease-in-out infinite' }}>$</div>
                <div className="absolute top-[25%] right-[15%] text-zinc-600/15 text-[10rem] font-serif" style={{ animation: 'float-slow 10s ease-in-out infinite' }}>$</div>
                <div className="absolute bottom-[20%] right-[25%] text-zinc-400/25 text-7xl font-serif" style={{ animation: 'float-fast 9s ease-in-out infinite' }}>$</div>
                <div className="absolute top-[10%] right-[40%] text-zinc-500/15 text-5xl font-serif" style={{ animation: 'float-slow 7s ease-in-out infinite' }}>$</div>
                <div className="absolute bottom-[10%] left-[40%] text-zinc-300/30 text-[12rem] font-serif" style={{ animation: 'float-fast 15s ease-in-out infinite' }}>$</div>
                <div className="absolute top-[40%] left-[5%] text-zinc-600/10 text-[14rem] font-serif" style={{ animation: 'float-slow 14s ease-in-out infinite' }}>$</div>
                <div className="absolute bottom-[35%] right-[35%] text-zinc-500/15 text-5xl font-serif" style={{ animation: 'float-fast 8.5s ease-in-out infinite' }}>$</div>
            </div>

            <div className="relative z-30 w-full h-15 ">
                <DashboardNav />
            </div>
            <div className="relative z-10 w-full min-h-screen">
                <div className="w-full h-60 flex items-center justify-center">
                    <div className="w-full h-full flex flex-col items-center justify-center">
                        <h1 className="text-2xl font-semibold text-zinc-900 tracking-tight mt-15 text-center"
                            style={{
                                fontFamily: '"Anthropic Serif", Georgia, "Arial Hebrew", "Noto Sans Hebrew", "Times New Roman", Times, "Hiragino Sans", "Yu Gothic", Meiryo, "Noto Sans CJK JP", "PingFang TC", "Microsoft JhengHei", "Noto Sans CJK TC", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans CJK KR", serif',
                                fontSize: '70px',
                                fontWeight: 290,
                                lineHeight: '100px',
                                color: 'black'
                            }}>
                            Find Your Clients Easily
                        </h1>
                    </div>
                </div>
                <div className="w-full h-auto pb-9">
                    <div className="max-w-6xl justify-center items-start h-full mx-auto flex">
                        <div className="w-5xl h-40 bg-yellow-50/90 rounded-xl border border-yellow-250 shadow-sm shadow-yellow-100/30 backdrop-blur-sm">
                            <form onSubmit={handleSubmit} className="w-full h-full px-5 py-5 flex flex-col justify-between">
                                {isFocused ? (
                                    <textarea
                                        autoFocus
                                        value={userText}
                                        onChange={handleChange}
                                        onBlur={() => { if (!userText) setIsFocused(false); }}
                                        className="w-full flex-1 bg-transparent resize-none text-zinc-900 font-medium text-sm focus:outline-none placeholder:text-zinc-400 tracking-tight"
                                        placeholder="Type in your requirements..."
                                    />
                                ) : (
                                    <div
                                        onClick={() => setIsFocused(true)}
                                        className={`w-full flex-1 text-zinc-500 font-medium text-md tracking-tight cursor-text ${displayText ? 'cursor' : ''}`}
                                    >
                                        {displayText || <span className="text-zinc-400">Type in your requirements...</span>}
                                    </div>
                                )}
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className={`w-9 h-9 rounded-full ${loading ? 'bg-zinc-400' : 'bg-black hover:bg-zinc-700'} flex items-center justify-center active:scale-95 transition-all`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                                {/* Live Agent Status Pill */}
                {currentStatus && (
                    <div className="flex items-center justify-center pb-6">
                        <div className="inline-flex items-center gap-3 py-2 px-5 bg-white/95 border border-emerald-300 rounded-full shadow-md text-xs font-semibold text-emerald-900 backdrop-blur-md">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                            </span>
                            <span className="tracking-tight">{currentStatus}</span>
                        </div>
                    </div>
                )}

                {/* Result Section */}
                <div className="px-8 w-full pb-12">
                    {loading ? (
                        <TableSkeleton />
                    ) : scrapedLeads.length > 0 ? (
                        <LeadsTable leads={scrapedLeads} isLoadingMore={isLoadingMore} setShowUpgradeModal={setShowUpgradeModal} />
                    ) : (
                        <MoneyQuote />
                    )}
                </div>
            </div>

        </div>
    )
}

export default Dashboard;
