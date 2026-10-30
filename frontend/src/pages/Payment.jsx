import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Payment = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpgrade = async (wantsPro) => {
        if (!wantsPro) {
            navigate("/dashboard");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem("token");
            const res = await axios.post("http://localhost:5001/api/auth/upgrade", {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data && res.data.user) {
                // Update local storage so frontend state updates immediately
                localStorage.setItem("user", JSON.stringify(res.data.user));
                navigate("/dashboard");
            } else {
                setError("Failed to upgrade. Please try again.");
            }
        } catch (err) {
            console.error("Upgrade error:", err);
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-50/40 via-white to-amber-50/30 font-sans p-6">
            <div className="w-full max-w-md bg-white rounded-2xl border border-yellow-200/80 shadow-xl shadow-yellow-100/40 p-8 text-center">
                <h1 className="text-2xl font-bold text-zinc-900 tracking-tight mb-2">Dummy Payment Area</h1>
                <p className="text-zinc-500 text-sm mb-8">Thank you for your interest in ClientsMine! Press Continue to Upgrade the Plan Thankyou!</p>

                {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => handleUpgrade(true)}
                        disabled={loading}
                        className="w-full py-3 bg-lime-600 hover:bg-lime-700 text-white font-bold rounded-xl active:scale-98 transition-all shadow-md shadow-amber-200/40 disabled:bg-zinc-350"
                    >
                        {loading ? "Processing..." : "Yes, Upgrade Me to Pro"}
                    </button>
                    <button
                        onClick={() => handleUpgrade(false)}
                        disabled={loading}
                        className="w-full py-3 border border-zinc-200 hover:bg-zinc-200 text-zinc-650 font-semibold rounded-xl transition-all"
                    >
                        No, Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Payment;
