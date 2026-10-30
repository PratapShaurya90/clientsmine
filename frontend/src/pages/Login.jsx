import { useState } from "react"
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";

const Login = () => {
    const toast = useToast();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post("http://localhost:5001/api/auth/login", formData);
            toast.success(res.data.message || "Logged in successfully!");
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("user", JSON.stringify(res.data.user));
            setTimeout(() => {
                navigate("/dashboard")
            }, 1500)
        } catch (err) {
            toast.error(err?.response?.data?.message || "Invalid Credentials!");
        } finally {
            setLoading(false);
        }
    }


    return (
        <div className="w-full min-h-screen bg-black">
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="w-[520px] bg-white border border-zinc-200 rounded p-12 flex flex-col space-y-8 shadow-sm">
                    <div className="space-y-2 text-center sm:text-left">
                        <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">Welcome Back</h2>
                        <p className="text-sm text-zinc-500">Sign in to access your workspace.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-zinc-700">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                autoComplete="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="name@company.com"
                                className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400 text-black"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-zinc-700">Password</label>
                                <a href="#" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">Forgot password?</a>
                            </div>
                            <input
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Enter your password"
                                className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-black text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400"
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? "Tranferring to Dashboard..." : "Login"}

                        </button>
                    </form>

                    <div className="flex justify-between items-center text-xs text-zinc-500 pt-2">
                        <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Secure Authentication
                        </span>
                        <Link to="/signup" className="hover:text-zinc-900 font-medium transition-colors">Create account</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login