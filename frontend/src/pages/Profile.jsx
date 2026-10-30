import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BackgroundGradientAnimation } from "../components/ui/background-gradient-animation";

const Field = ({ label, value }) => (
    <div className="flex justify-between items-center py-4 border-b border-zinc-100">
        <span className="text-sm text-zinc-400 font-medium">{label}</span>
        <span className="text-sm text-zinc-900 font-medium text-right max-w-[240px] break-words">
            {value || <span className="text-zinc-300">—</span>}
        </span>
    </div>
);

const SectionLabel = ({ children }) => (
    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-7 mb-1">
        {children}
    </p>
);

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) { navigate("/login"); return; }
                const res = await axios.get("http://localhost:5001/api/auth/me", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setUser(res.data.user);
                // Sync fresh user data (including isPro) back to localStorage
                localStorage.setItem("user", JSON.stringify(res.data.user));
            } catch {
                setError("Failed to load profile.");
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    const initials = user?.username
        ? user.username.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
        : "?";

    return (
        <div className="w-full flex bg-white font-sans">
            <div className="w-[45vw] h-screen px-10 py-8 flex justify-center items-center bg-zinc-950">
                <div className="w-full h-full rounded-xl text-center relative overflow-hidden">
                    <BackgroundGradientAnimation
                        size="80%"
                        containerClassName="w-full h-full rounded-xl !absolute !inset-0"
                        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center p-8"
                    >
                        <h2 className="text-4xl font-bold mb-2 text-white tracking-tight drop-shadow-md">ClientsMine</h2>
                        <p className="text-sm font-medium text-white/80 tracking-wide">Finds Your Perfect Client</p>
                    </BackgroundGradientAnimation>
                </div>
            </div>

            {/* Right Side: Profile details */}
            <div className="w-[55vw] h-screen overflow-y-auto px-12 py-12 pb-20 bg-gradient-to-tr from-yellow-50/20 via-white to-amber-50/10">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1.5 text-zinc-400 text-sm font-medium mb-9 hover:text-zinc-700 transition-colors"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                    Dashboard
                </button>

                {loading ? (
                    <div className="flex flex-col gap-4 animate-pulse">
                        {[...Array(7)].map((_, i) => (
                            <div key={i} className="h-4 bg-zinc-100 rounded-md" style={{ width: `${90 - i * 5}%` }} />
                        ))}
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-sm">{error}</p>
                ) : (
                    <>
                        <div className="flex items-center gap-4 mb-9">
                            <div className="w-14 h-14 rounded-full bg-zinc-900 text-white flex items-center justify-center text-lg font-bold shrink-0 tracking-tight">
                                {initials}
                            </div>
                            <div>
                                <p className="text-lg font-bold text-zinc-900 tracking-tight">{user.username}</p>
                                <p className="text-sm text-zinc-400 mt-0.5">{user.occupation}</p>
                            </div>
                        </div>

                        <SectionLabel>Account</SectionLabel>
                        <Field label="Full Name" value={user.username} />
                        <Field label="Email" value={user.email} />
                        <Field label="Phone" value={user.phone} />
                        <Field label="Occupation" value={user.occupation} />

                        <SectionLabel>Location</SectionLabel>
                        <Field label="City" value={user.city} />
                        <Field label="State" value={user.state} />
                        <Field label="Country" value={user.country} />

                        <SectionLabel>Membership</SectionLabel>
                        <Field
                            label="Member since"
                            value={user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                                : null}
                        />

                        <button
                            onClick={handleLogout}
                            className="mt-10 w-full py-3 rounded-xl border border-zinc-200 text-sm font-semibold text-red-500 bg-white hover:bg-red-50 hover:border-red-200 transition-colors"
                        >
                            Log out
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;