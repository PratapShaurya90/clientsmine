import React from 'react';

const Grids = () => {
    return (
        <div className="w-full h-350 px-15 overflow-hidden">

            <style>
                {`
                @keyframes scroll-y {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(calc(-50% - 4px)); }
                }
                
                .carousel-track-top {
                    display: flex;
                    flex-direction: column;
                    width: 100%;
                    height: max-content;
                    animation: scroll-y 10s linear infinite;
                }
            `}
            </style>

            <div className="w-full h-full grid grid-cols-2 gap-4">

                {/* Left Column */}
                <div className="flex flex-col gap-4 h-full w-full overflow-hidden">
                    {/* Top Large Box */}
                    <div className="flex-[5] bg-lime-200 w-full rounded-sm"></div>

                    {/* Bottom Carousel (Vertical Scroll) */}
                    <div className="flex-[1.5] w-full overflow-hidden relative">
                        <div className="carousel-track-top gap-6 h-full">
                            {/* Original Set */}
                            <div className="bg-zinc-500 min-h-[80px] w-full shrink-0 rounded-sm  font-medium text-sm border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"></div>
                            <div className="bg-zinc-500 min-h-[80px] w-full shrink-0 rounded-sm font-medium text-sm border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm "></div>
                            <div className="bg-zinc-500 min-h-[80px] w-full shrink-0 rounded-sm font-medium text-sm border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"></div>

                            {/* Duplicated Set for infinite loop */}
                            <div className="bg-zinc-500 min-h-[80px] w-full shrink-0 rounded-sm font-medium text-sm border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"></div>
                            <div className="bg-zinc-500 min-h-[80px] w-full shrink-0 rounded-sm font-medium text-sm border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"></div>
                            <div className="bg-zinc-500 min-h-[80px] w-full shrink-0 rounded-sm font-medium text-sm border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"></div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4 h-full w-full">
                    <div className="flex-[1.25] bg-green-800 w-full rounded-sm"></div>
                    <div className="flex-[2.5] bg-green-900 w-full rounded-sm"></div>
                </div>

            </div>
        </div>
    );
};

export default Grids;
