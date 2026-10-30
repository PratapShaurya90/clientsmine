import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <div className="w-full h-171 bg-white flex flex-col justify-center items-center px-6 relative overflow-hidden ">

            <style>
                {`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(-5deg); }
                    50% { transform: translateY(-30px) rotate(5deg); }
                }
                @keyframes float-fast {
                    0%, 100% { transform: translateY(0px) rotate(5deg) scale(1); }
                    50% { transform: translateY(-50px) rotate(-10deg) scale(1.05); }
                }
            `}
            </style>

            {/* Floating Money Background (Sharp & Lime Only) */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-[15%] left-[10%] text-lime-400/40 text-8xl font-serif" style={{ animation: 'float-slow 8s ease-in-out infinite' }}>$</div>
                <div className="absolute top-[60%] left-[20%] text-lime-500/20 text-9xl font-serif" style={{ animation: 'float-fast 12s ease-in-out infinite' }}>$</div>
                <div className="absolute top-[25%] right-[15%] text-lime-500/20 text-[10rem] font-serif" style={{ animation: 'float-slow 10s ease-in-out infinite' }}>$</div>
                <div className="absolute bottom-[20%] right-[25%] text-lime-400/50 text-7xl font-serif" style={{ animation: 'float-fast 9s ease-in-out infinite' }}>$</div>
                <div className="absolute top-[10%] right-[40%] text-lime-300/40 text-5xl font-serif" style={{ animation: 'float-slow 7s ease-in-out infinite' }}>$</div>
                <div className="absolute bottom-[10%] left-[40%] text-lime-400/20 text-[12rem] font-serif" style={{ animation: 'float-fast 15s ease-in-out infinite' }}>$</div>
                <div className="absolute top-[40%] left-[5%] text-lime-600/10 text-[14rem] font-serif" style={{ animation: 'float-slow 14s ease-in-out infinite' }}>$</div>
                <div className="absolute bottom-[35%] right-[35%] text-lime-300/35 text-5xl font-serif" style={{ animation: 'float-fast 8.5s ease-in-out infinite' }}>$</div>
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center mt-12">


                <h1
                    style={{
                        fontFamily: '"Anthropic Serif", Georgia, "Arial Hebrew", "Noto Sans Hebrew", "Times New Roman", Times, "Hiragino Sans", "Yu Gothic", Meiryo, "Noto Sans CJK JP", "PingFang TC", "Microsoft JhengHei", "Noto Sans CJK TC", "PingFang SC", "Microsoft YaHei", "Noto Sans CJK SC", "Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans CJK KR", serif',
                        fontSize: '80px',
                        fontWeight: 290,
                        lineHeight: '100px',
                        color: 'black'
                    }}
                    className="mb-6 tracking-tight"
                >
                    Worried About Finding <br className="hidden md:block" />
                    Clients For Your Business
                </h1>

                <p className="max-w-xl text-lg text-gray-500 mb-10 leading-relaxed font-light">
                    We Find You Clinet Throughout The Internet Ensuring that your business get More and More Clients
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
                    <Link
                        to="/login"
                        className="px-8 py-3.5 rounded-md bg-black text-white font-medium text-sm hover:bg-gray-800 transition-colors shadow-lg shadow-black/10"
                    >
                        Explore Now
                    </Link>
                    <Link
                        to="/signup"
                        className="px-8 py-3.5 rounded-md bg-white text-black font-medium text-sm border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                    >
                        Ready To Launch
                    </Link>
                </div>

            </div>

        </div>
    )
}

export default LandingPage;