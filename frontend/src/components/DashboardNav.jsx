import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'

const DashboardNav = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const avatarRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                avatarRef.current && !avatarRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    
    const countryName = user ? user.country : "India";
    const username = user ? user.username : "User";
    const userInitial = username.charAt(0).toUpperCase();

    const getCountryCode = (name) => {
        if (!name) return 'in';
        const search = name.trim().toLowerCase();
        
        const countryMap = {
            'india': 'in',
            'ind': 'in',
            'united states': 'us',
            'united states of america': 'us',
            'us': 'us',
            'usa': 'us',
            'united kingdom': 'gb',
            'uk': 'gb',
            'great britain': 'gb',
            'canada': 'ca',
            'australia': 'au',
            'germany': 'de',
            'france': 'fr',
            'italy': 'it',
            'spain': 'es',
            'netherlands': 'nl',
            'switzerland': 'ch',
            'sweden': 'se',
            'norway': 'no',
            'denmark': 'dk',
            'finland': 'fi',
            'ireland': 'ie',
            'belgium': 'be',
            'austria': 'at',
            'japan': 'jp',
            'china': 'cn',
            'brazil': 'br',
            'russia': 'ru',
            'south africa': 'za',
            'singapore': 'sg',
            'south korea': 'kr',
            'korea': 'kr',
            'new zealand': 'nz',
            'mexico': 'mx',
            'argentina': 'ar',
            'turkey': 'tr',
            'saudi arabia': 'sa',
            'uae': 'ae',
            'united arab emirates': 'ae',
            'egypt': 'eg',
            'nigeria': 'ng',
            'kenya': 'ke',
            'indonesia': 'id',
            'malaysia': 'my',
            'thailand': 'th',
            'vietnam': 'vn',
            'philippines': 'ph',
            'pakistan': 'pk',
            'bangladesh': 'bd',
            'nepal': 'np',
            'sri lanka': 'lk',
            'ukraine': 'ua',
            'poland': 'pl'
        };
        
        return countryMap[search] || search.slice(0, 2);
    };

    const flagCode = getCountryCode(countryName);
    const avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(username)}`;

    return (
        <div className="relative">
            <div className="w-full h-15 border-zinc-200 border-b-2 flex justify-end items-center px-6 fixed backdrop-blur-md top-0 right-0 bg-white/75 z-50">
                <div className="flex items-center gap-4 relative">
                    {flagCode && (
                        <div className="flex items-center gap-1.5 py-1">
                            <img 
                                src={`https://flagcdn.com/${flagCode}.svg`} 
                                className="w-7 h-7 object-contain rounded-sm" 
                                alt={countryName} 
                                title={countryName}
                            />
                        </div>
                    )}
                    <div 
                        ref={avatarRef}
                        onClick={() => setIsOpen(!isOpen)}
                        className="w-10 h-10 border border-zinc-200 rounded-md bg-white overflow-hidden select-none flex items-center justify-center cursor-pointer hover:border-zinc-400 active:scale-95 transition-all shadow-sm"
                    >
                        <img src={avatarUrl} className="w-full h-full object-cover" alt={username} />
                    </div>

                    <div 
                        ref={dropdownRef}
                        className={`absolute top-17 right-0 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-xl p-2 flex flex-col w-44 z-[60] transition-all duration-200 origin-top-right ${
                            isOpen 
                                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
                                : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                        }`}
                    >
                        <Link 
                            to="/profile" 
                            className="text-sm font-semibold text-zinc-600  hover:bg-zinc-100/70 px-4 py-2.5 rounded-lg transition-colors duration-200 block w-full text-left"
                        >
                            Profile
                        </Link>
                        <Link
                            to="/history" 
                            className="text-sm font-semibold text-zinc-600  hover:bg-zinc-100/70 px-4 py-2.5 rounded-lg transition-colors duration-200 block w-full text-left"
                        >
                            History
                        </Link>
                        <Link
                            to="/pricing" 
                            className="text-sm font-semibold text-zinc-600  hover:bg-zinc-100/70 px-4 py-2.5 rounded-lg transition-colors duration-200 block w-full text-left"
                        >
                            Pricings
                        </Link>
                        <Link
                            to="/contact" 
                            className="text-sm font-semibold text-zinc-600  hover:bg-zinc-100/70 px-4 py-2.5 rounded-lg transition-colors duration-200 block w-full text-left"
                        >
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardNav;