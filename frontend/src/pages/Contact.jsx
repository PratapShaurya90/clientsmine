import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../context/ToastContext";

const Contact = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email || !message) {
            toast.error("Please fill in all fields.");
            return;
        }

        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            toast.success("Message sent successfully! We will get back to you soon.");
            setName("");
            setEmail("");
            setMessage("");
            navigate("/dashboard");
        }, 1000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-tr from-yellow-50/40 via-white to-amber-50/30 font-sans">
            {/* Nav */}
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
                <span className="text-sm font-bold text-zinc-900 tracking-tight">Contact Us</span>
                <div className="w-20" />
            </div>

            {/* Content */}
            <div className="max-w-md mx-auto px-6 py-16">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-extrabold text-zinc-900 tracking-tight mb-2">Get in touch</h1>
                    <p className="text-sm text-zinc-550">Have questions or feedback? Drop us a line.</p>
                </div>

                <div className="bg-white rounded-2xl border border-yellow-200/80 shadow-xl shadow-yellow-100/40 p-8">
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your full name"
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-amber-400 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@company.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-amber-400 text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Tell us how we can help..."
                                rows="4"
                                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:border-amber-400 text-sm resize-none"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl active:scale-98 transition-all shadow-md shadow-amber-200/30"
                        >
                            {loading ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;
