import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Terminal, Play, Square, Trash2, Loader2, ChevronRight } from 'lucide-react';

const PRESET_COMMANDS = [
    { label: 'Install', cmd: 'npm install', icon: '📦' },
    { label: 'Test', cmd: 'npm test', icon: '🧪' },
    { label: 'Build', cmd: 'npm run build', icon: '🔨' },
    { label: 'Lint', cmd: 'npm run lint', icon: '🔍' },
    { label: 'Dev', cmd: 'npm run dev', icon: '⚡' },
];

const ScriptRunner = ({ workspaceId, isLite = false }) => {
    const [output, setOutput] = useState([
        { type: 'system', text: '🖥️  Simplified Terminal — Run predefined scripts or custom commands' },
        { type: 'system', text: 'Note: Commands run in a sandboxed workspace environment' },
    ]);
    const [customCmd, setCustomCmd] = useState('');
    const [running, setRunning] = useState(false);
    const outputRef = useRef(null);
    const token = localStorage.getItem('token');

    useEffect(() => {
        if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, [output]);

    const runCommand = async (cmd) => {
        setRunning(true);
        setOutput(prev => [...prev, { type: 'input', text: `$ ${cmd}` }]);

        try {
            const { data } = await axios.post(`/api/workspace/${workspaceId}/run`, { command: cmd }, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (data.data?.output) {
                data.data.output.split('\n').forEach(line => {
                    setOutput(prev => [...prev, { type: 'output', text: line }]);
                });
            }
            if (data.data?.error) {
                setOutput(prev => [...prev, { type: 'error', text: data.data.error }]);
            }
            setOutput(prev => [...prev, { type: 'system', text: `✅ Exit code: ${data.data?.exitCode ?? 0}` }]);
        } catch (err) {
            setOutput(prev => [...prev, {
                type: 'error',
                text: err.response?.data?.message || 'Command execution failed. This feature requires the script runner API endpoint.'
            }]);
        } finally {
            setRunning(false);
        }
    };

    const handleCustomRun = (e) => {
        e.preventDefault();
        if (!customCmd.trim() || running) return;
        runCommand(customCmd.trim());
        setCustomCmd('');
    };

    return (
        <div className="h-full flex flex-col bg-[#0d1117] font-mono">
            {/* Toolbar */}
            <div className={`flex items-center gap-2 px-4 py-2 bg-[#161b22] border-b border-[#30363d] flex-shrink-0 ${isLite ? 'flex-wrap' : ''}`}>
                <Terminal size={14} className="text-emerald-400" />
                {!isLite && <span className="text-xs text-slate-400 font-semibold">Script Runner</span>}
                <div className={`flex gap-1 ${isLite ? 'w-full order-last mt-2 justify-center' : 'ml-auto'}`}>
                    {PRESET_COMMANDS.map(({ label, cmd, icon }) => (
                        <button
                            key={cmd}
                            onClick={() => runCommand(cmd)}
                            disabled={running}
                            className={`px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded text-[10px] text-slate-300 transition-colors disabled:opacity-40 flex items-center gap-1 ${isLite ? 'flex-1 justify-center' : ''}`}
                            title={cmd}
                        >
                            <span>{icon}</span> {!isLite && label}
                        </button>
                    ))}
                    <button
                        onClick={() => setOutput([{ type: 'system', text: '🖥️  Terminal cleared' }])}
                        className="px-2 py-1 text-slate-500 hover:text-text-primary transition-colors"
                        title="Clear"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>


            {/* Output */}
            <div ref={outputRef} className="flex-1 overflow-y-auto px-4 py-3 text-xs leading-relaxed">
                {output.map((line, idx) => (
                    <div key={idx} className={`py-0.5 ${line.type === 'input' ? 'text-emerald-400 font-semibold' :
                        line.type === 'error' ? 'text-red-400' :
                            line.type === 'system' ? 'text-slate-500 italic' :
                                'text-slate-300'
                        }`}>
                        {line.text}
                    </div>
                ))}
                {running && (
                    <div className="flex items-center gap-2 py-1 text-amber-400">
                        <Loader2 size={12} className="animate-spin" />
                        Running...
                    </div>
                )}
            </div>

            {/* Custom command input */}
            <form onSubmit={handleCustomRun} className="flex items-center gap-2 px-4 py-2 bg-[#161b22] border-t border-[#30363d] flex-shrink-0">
                <ChevronRight size={14} className="text-emerald-400 flex-shrink-0" />
                <input
                    type="text"
                    value={customCmd}
                    onChange={(e) => setCustomCmd(e.target.value)}
                    placeholder="Type a command..."
                    disabled={running}
                    className="flex-1 bg-transparent text-xs text-text-primary placeholder-slate-600 outline-none disabled:opacity-50"
                />
                <button type="submit" disabled={running || !customCmd.trim()}
                    className="text-emerald-400 hover:text-emerald-300 disabled:opacity-30 transition-colors">
                    {running ? <Square size={14} /> : <Play size={14} />}
                </button>
            </form>
        </div>
    );
};

export default ScriptRunner;
