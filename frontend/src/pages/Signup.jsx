import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import { useToast } from "../context/ToastContext";

const Signup = () => {
    const toast = useToast();
    const navi = useNavigate();
    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
        country: "",
        state: "",
        city: "",
        phone: "",
        occupation: "",
    });

    const [selectedCountryCode, setSelectedCountryCode] = useState("");
    const [selectedStateCode, setSelectedStateCode] = useState("");

    // State to track if "Other" city is selected
    const [isOtherCity, setIsOtherCity] = useState(false);

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleCountryChange = (e) => {
        const countryCode = e.target.value;
        setSelectedCountryCode(countryCode);
        const countryName = Country.getCountryByCode(countryCode)?.name || "";

        setForm({ ...form, country: countryName, state: "", city: "" });
        setSelectedStateCode("");
        setIsOtherCity(false);
    };

    const handleStateChange = (e) => {
        const stateCode = e.target.value;
        setSelectedStateCode(stateCode);
        const stateName = State.getStateByCodeAndCountry(stateCode, selectedCountryCode)?.name || "";

        setForm({ ...form, state: stateName, city: "" });
        setIsOtherCity(false);
    };

    const handleCityChange = (e) => {
        const value = e.target.value;
        if (value === "other") {
            setIsOtherCity(true);
            setForm({ ...form, city: "" });
        } else {
            setIsOtherCity(false);
            setForm({ ...form, city: value });
        }
    };

    const handleGoogleSignup = () => {
        window.location.href = "http://localhost:5001/api/auth/google";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:5001/api/auth/signup", form);
            if (!response) {
                toast.error("Service Down. Check After SomeTime");
                setLoading(false);
                return;
            }
            toast.success("Account Created Successfully! Redirecting to login...");
            setTimeout(() => {
                navi("/login");
            }, 3000);
        } catch (err) {
            toast.error(err?.response?.data?.message || err?.message || "Something Went Wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full min-h-screen bg-white flex items-center justify-center px-4 py-2 relative overflow-hidden">

            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(-5deg); }
                    50% { transform: translateY(-30px) rotate(5deg); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0px) rotate(5deg) scale(1); }
                    50% { transform: translateY(-50px) rotate(-10deg) scale(1.05); }
                }
            `}</style>

            {/* Floating $ Background — same as Landing Page */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-black">

            </div>

            <div className="relative z-10 w-full max-w-lg">
                <div className="bg-white rounded shadow-lg border border-zinc-100 p-10 flex flex-col space-y-6">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold text-zinc-900 tracking-tight">Create your account</h2>
                        <p className="text-sm text-zinc-500">Sign up to start finding clients.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {/* Horizontal Grid Layout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Username Field */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">Username</label>
                                <input
                                    type="text"
                                    name="username"
                                    placeholder="alanturing"
                                    value={form.username}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400 text-black bg-white"
                                />
                            </div>

                            {/* Email Field */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="name@company.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400 text-black bg-white"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    placeholder="Minimum 8 characters"
                                    value={form.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400 text-black bg-white"
                                />
                            </div>

                            {/* Phone Field */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">Phone</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="+1 234 567 8900"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400 text-black bg-white"
                                />
                            </div>

                            {/* Country Field */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">Country</label>
                                <select
                                    name="country"
                                    value={selectedCountryCode}
                                    onChange={handleCountryChange}
                                    required
                                    className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-black bg-white"
                                >
                                    <option value="">Select your country</option>
                                    {Country.getAllCountries().map((country) => (
                                        <option key={country.isoCode} value={country.isoCode}>
                                            {country.flag} {country.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* State Field */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">State / Province</label>
                                <select
                                    name="state"
                                    value={selectedStateCode}
                                    onChange={handleStateChange}
                                    required
                                    disabled={!selectedCountryCode}
                                    className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-black bg-white disabled:bg-zinc-100 disabled:text-zinc-400"
                                >
                                    <option value="">Select your state</option>
                                    {selectedCountryCode && State.getStatesOfCountry(selectedCountryCode).map((state) => (
                                        <option key={state.isoCode} value={state.isoCode}>
                                            {state.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* City Field */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">City</label>
                                {!isOtherCity ? (
                                    <select
                                        name="city"
                                        value={form.city}
                                        onChange={handleCityChange}
                                        required
                                        disabled={!selectedStateCode}
                                        className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-black bg-white disabled:bg-zinc-100 disabled:text-zinc-400"
                                    >
                                        <option value="">Select your city</option>
                                        {selectedStateCode && City.getCitiesOfState(selectedCountryCode, selectedStateCode).map((city) => (
                                            <option key={city.name} value={city.name}>
                                                {city.name}
                                            </option>
                                        ))}
                                        <option value="other">Other (Type manually)</option>
                                    </select>
                                ) : (
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="city"
                                            placeholder="Enter your city"
                                            value={form.city}
                                            onChange={handleChange}
                                            required
                                            className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all placeholder:text-zinc-400 text-black bg-white pr-20"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setIsOtherCity(false); setForm({ ...form, city: "" }); }}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-medium text-zinc-500 hover:text-zinc-800"
                                        >
                                            Select List
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Occupation Field */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-zinc-700">Occupation</label>
                                <select
                                    name="occupation"
                                    value={form.occupation}
                                    onChange={handleChange}
                                    required
                                    className="w-full border border-zinc-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-black bg-white"
                                >
                                    <option value="">Select your occupation</option>
                                    <option value="student">Student</option>
                                    <option value="swe">Software Engineer</option>
                                    <option value="designer">Designer</option>
                                    <option value="founder">Founder / Entrepreneur</option>
                                    <option value="marketer">Marketer</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2 mt-2 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 active:scale-[0.98] transition-all disabled:bg-zinc-400"
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-zinc-200"></div>
                            <span className="text-xs text-zinc-400 font-medium">OR</span>
                            <div className="flex-1 h-px bg-zinc-200"></div>
                        </div>

                        {/* Google Signup Button */}
                        <button
                            type="button"
                            onClick={handleGoogleSignup}
                            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-zinc-300 rounded-lg text-sm font-medium text-zinc-700 bg-white hover:bg-zinc-50 active:scale-[0.98] transition-all"
                        >
                            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M47.532 24.5528C47.532 22.9214 47.3997 21.2811 47.1175 19.6761H24.48V28.9181H37.4434C36.9055 31.8988 35.177 34.5356 32.6461 36.2111V42.2078H40.3801C44.9217 38.0278 47.532 31.8547 47.532 24.5528Z" fill="#4285F4" />
                                <path d="M24.48 48.0016C30.9529 48.0016 36.4116 45.8764 40.3888 42.2078L32.6549 36.2111C30.5031 37.675 27.7252 38.5039 24.4888 38.5039C18.2275 38.5039 12.9187 34.2798 11.0139 28.6006H3.03296V34.7825C7.10718 42.8868 15.4056 48.0016 24.48 48.0016Z" fill="#34A853" />
                                <path d="M11.0051 28.6006C9.99973 25.6199 9.99973 22.3922 11.0051 19.4115V13.2296H3.03298C-0.371021 20.0112 -0.371021 28.0009 3.03298 34.7825L11.0051 28.6006Z" fill="#FBBC04" />
                                <path d="M24.48 9.49932C27.9016 9.44641 31.2086 10.7339 33.6866 13.0973L40.5387 6.24523C36.2 2.17101 30.4414 -0.068932 24.48 0.00161733C15.4055 0.00161733 7.10718 5.11644 3.03296 13.2296L11.005 19.4115C12.901 13.7235 18.2187 9.49932 24.48 9.49932Z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </form>

                    <div className="flex justify-between items-center text-xs text-zinc-500 pt-4 border-t border-zinc-100">
                        <span>Already have an account?</span>
                        <Link to="/login" className="hover:text-zinc-900 font-medium transition-colors">Sign in</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
