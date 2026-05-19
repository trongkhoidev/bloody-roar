import React from 'react';
import {
    FolderPlus, GitBranch, GitCommit, GitPullRequest,
    CheckCircle, DollarSign, Clock, AlertCircle
} from 'lucide-react';

const events = [
    { key: 'workspace_created', icon: FolderPlus, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { key: 'branch_created', icon: GitBranch, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { key: 'commits', icon: GitCommit, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { key: 'pr_created', icon: GitPullRequest, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { key: 'pr_merged', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { key: 'payment', icon: DollarSign, color: 'text-teal-400', bg: 'bg-teal-500/10' },
];

const ActivityTimeline = ({ workspace }) => {
    if (!workspace) return null;

    const timeline = [];

    // 1. Workspace created
    timeline.push({
        type: 'workspace_created',
        title: 'Workspace Created',
        detail: workspace.name,
        time: workspace.createdAt,
        icon: FolderPlus,
        color: 'text-indigo-400',
        bg: 'bg-indigo-500/10',
    });

    // 2. Branch created
    if (workspace.branch?.name) {
        timeline.push({
            type: 'branch_created',
            title: 'Branch Created',
            detail: `${workspace.branch.name} from ${workspace.branch.baseBranch}`,
            time: workspace.branch.createdAt,
            icon: GitBranch,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
        });
    }

    // 3. Commits
    workspace.commits?.forEach((commit) => {
        timeline.push({
            type: 'commit',
            title: commit.message,
            detail: `${commit.sha?.slice(0, 7)} by ${commit.author}`,
            time: commit.timestamp,
            icon: GitCommit,
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
        });
    });

    // 4. PR created
    if (workspace.pullRequest?.number) {
        timeline.push({
            type: 'pr_created',
            title: `PR #${workspace.pullRequest.number} Created`,
            detail: workspace.pullRequest.url,
            time: null,
            icon: GitPullRequest,
            color: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            link: workspace.pullRequest.url,
        });
    }

    // 5. PR merged
    if (workspace.pullRequest?.state === 'merged') {
        timeline.push({
            type: 'pr_merged',
            title: 'PR Merged',
            detail: 'Work accepted and merged',
            time: workspace.pullRequest.mergedAt,
            icon: CheckCircle,
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
        });
    }

    // 6. Payment
    if (workspace.paymentStatus === 'RELEASED') {
        timeline.push({
            type: 'payment',
            title: 'Payment Released',
            detail: `Tx: ${workspace.releaseTxHash?.slice(0, 10)}...`,
            time: null,
            icon: DollarSign,
            color: 'text-teal-400',
            bg: 'bg-teal-500/10',
        });
    }

    // Sort by time
    timeline.sort((a, b) => {
        if (!a.time) return 1;
        if (!b.time) return 1;
        return new Date(a.time) - new Date(b.time);
    });

    return (
        <div className="h-full overflow-y-auto bg-[#0f172a] p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Clock size={16} className="text-indigo-400" />
                Activity Timeline
            </h3>

            {timeline.length === 0 ? (
                <div className="text-center py-12">
                    <AlertCircle size={32} className="mx-auto text-slate-600 mb-2" />
                    <p className="text-sm text-slate-500">No activity yet</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Vertical line */}
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-[#334155]" />

                    <div className="space-y-4">
                        {timeline.map((event, idx) => {
                            const Icon = event.icon;
                            return (
                                <div key={idx} className="relative flex items-start gap-3 pl-1">
                                    <div className={`w-7 h-7 rounded-full ${event.bg} flex items-center justify-center flex-shrink-0 relative z-10`}>
                                        <Icon size={14} className={event.color} />
                                    </div>
                                    <div className="flex-1 bg-[#1e293b] rounded-lg border border-[#334155] p-3 min-w-0">
                                        <p className="text-xs font-semibold text-text-primary">{event.title}</p>
                                        {event.link ? (
                                            <a
                                                href={event.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-[10px] text-indigo-400 hover:underline truncate block"
                                            >
                                                {event.detail}
                                            </a>
                                        ) : (
                                            <p className="text-[10px] text-slate-500 truncate">{event.detail}</p>
                                        )}
                                        {event.time && (
                                            <p className="text-[10px] text-slate-600 mt-1">
                                                {new Date(event.time).toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityTimeline;
