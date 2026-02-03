import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin text-red-600 mb-3" size={48} />
            <p className="font-medium animate-pulse">{text}</p>
        </div>
    );
};

export default Loader;
