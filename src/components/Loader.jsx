import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#334155]"></div>
                <div className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-indigo-500 border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-slate-400 font-medium animate-pulse">{text}</p>
        </div>
    );
};

export default Loader;
