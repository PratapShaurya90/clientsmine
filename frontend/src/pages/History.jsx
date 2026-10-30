import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const statusColors = {
    COMPLETED: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    PROCESSING: "bg-amber-50 text-amber-700 border border-amber-200",
    ERROR: "bg-red-50 text-red-600 border border-red-200",
    CLARIFICATION_REQUIRED: "bg-blue-50 text-blue-700 border border-blue-200",
};

const tierDot = (tier) => {
    if (tier === 1) return "bg-emerald-500";
    if (tier === 2) return "bg-amber-400";
    return "bg-zinc-300";
};

const HistoryCard = ({ item }) => {
    const [open, setOpen] = useState(false);
    const date = new Date(item.createdAt).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric",
    });
    const time = new Date(item.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit",
    });

    return (
        <div className="border border-zinc-100 rounded-xl overflow-hidden transition-all duration-200 hover:border-zinc-200">
            {/* Card header */}
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-start justify-between px-5 py-4 bg-white hover:bg-zinc-50 transition-colors text-left gap-4"
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusColors[item.status] || statusColors.PROCESSING}`}>
                            {item.status}
                        </span>
                        <span className="text-[11px] text-zinc-400">{date} · {time}</span>
                    </div>
                    <p className="text-sm text-zinc-800 font-medium truncate">{item.message}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0 mt-1">
                    <span className="text-xs text-zinc-400 font-medium">
                        {item.leads.length} lead{item.leads.length !== 1 ? "s" : ""}
                    </span>
                    <svg
                        className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    >
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </div>
            </button>

            {/* Leads list — scrollable */}
            {open && (
                <div className="border-t border-zinc-100 bg-zinc-50 max-h-64 overflow-y-auto">
                    {item.leads.length === 0 ? (
                        <p className="px-5 py-4 text-sm text-zinc-400 italic">No leads found for this query.</p>
                    ) : (
                        item.leads.map((lead, i) => (
                            <div
                                key={lead._id || i}
                                className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 last:border-0 hover:bg-white transition-colors"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${tierDot(lead.tier)}`} />
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-zinc-800 truncate">
                                            {lead.company_name !== "NA" ? lead.company_name : "Unknown Company"}
                                        </p>
                                        <p className="text-xs text-zinc-400 truncate">
                                            {lead.job_title}
                                            {(lead.city && lead.city !== 'NA' || lead.country && lead.country !== 'NA') && (
                                                <span> • {lead.city !== 'NA' ? lead.city : ''}{(lead.city !== 'NA' && lead.country !== 'NA') ? ', ' : ''}{lead.country !== 'NA' ? lead.country : ''}</span>
                                            )}
                                        </p>
                                        {(lead.paying_amount && lead.paying_amount !== 'NA' || lead.domain && lead.domain !== 'NA') && (
                                            <p className="text-[11px] text-zinc-500 mt-0.5 truncate">
                                                {lead.paying_amount !== 'NA' ? <span className="font-medium text-emerald-600">{lead.paying_amount}</span> : null}
                                                {(lead.paying_amount !== 'NA' && lead.domain !== 'NA') ? ' • ' : ''}
                                                {lead.domain !== 'NA' ? `Domain: ${lead.domain}` : ''}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                    {lead.email !== "NA" && (
                                        <span className="text-xs text-zinc-500 hidden sm:block truncate max-w-[160px]">{lead.email}</span>
                                    )}
                                    {lead.source_url && lead.source_url !== "NA" && (
                                        <a
                                            href={lead.source_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={e => e.stopPropagation()}
                                            className="text-xs text-blue-600 hover:underline font-medium"
                                        >
                                            View Source
                                        </a>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

const History = () => {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Get user details
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    const isPro = user ? user.isPro : false;

    useEffect(() => {
        if (!isPro) {
            setLoading(false);
            return;
        }
        
        const fetchHistory = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) { navigate("/login"); return; }
                const res = await axios.get("http://localhost:5001/api/leads/history", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setHistory(res.data.data || []);
            } catch {
                setError("Failed to load history.");
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [navigate, isPro]);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = history.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(history.length / itemsPerPage);

    return (
        <div className="min-h-screen bg-white font-sans relative">
            {/* Modal for non-pro users */}
            {!isPro && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="w-[47vw] bg-white border border-zinc-200/80 rounded-md p-8  text-center shadow-2xl">
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight mb-2">Upgrade Required</h2>
                        <p className="text-sm text-black mb-6">
                            You are not a Pro User. You need a Pro plan to view search history.
                        </p>
                        <div className="flex justify-between items-center gap-2.5">
                            <button
                                onClick={() => navigate("/pricing")}
                                className="w-full py-2.5 bg-lime-600 hover:bg-lime-700 text-white font-semibold rounded-lg active:scale-98 transition-all"
                            >
                                Upgrade Plan
                            </button>
                            <button
                                onClick={() => navigate("/dashboard")}
                                className="w-full py-2.5 border border-zinc-200 bg-black text-white font-medium rounded-lg hover:bg-zinc-800 transition-all"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Top nav */}
            <div className="sticky top-0 z-40 h-14 border-b border-zinc-100 bg-white/90 backdrop-blur-md flex items-center justify-between px-8">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-1.5 text-zinc-400 text-sm font-medium hover:text-zinc-700 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Dashboard
                </button>
                <span className="text-sm font-bold text-zinc-900 tracking-tight">Search History</span>
                <div className="w-20" />
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-6 py-10">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Your Searches</h1>
                    <p className="text-sm text-zinc-400 mt-1">Every query you've sent and the leads it returned.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col gap-3 animate-pulse">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-16 bg-zinc-100 rounded-xl" />
                        ))}
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-sm">{error}</p>
                ) : history.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-4">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a1a1aa" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                        </div>
                        <p className="text-zinc-400 text-sm font-medium">No searches yet</p>
                        <p className="text-zinc-300 text-xs mt-1">Go to the dashboard and start finding clients.</p>
                        <button
                            onClick={() => navigate("/dashboard")}
                            className="mt-5 px-4 py-2 text-xs font-semibold text-white bg-zinc-900 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                            Go to Dashboard
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col gap-3 mb-8">
                            {currentItems.map((item) => (
                                <HistoryCard key={item._id} item={item} />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="flex items-center justify-between border-t border-zinc-100 pt-6">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-xs font-semibold border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>
                                <span className="text-xs text-zinc-400 font-medium">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-xs font-semibold border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default History;