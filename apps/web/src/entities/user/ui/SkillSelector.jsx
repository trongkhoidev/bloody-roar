import React, { useState } from 'react';
import { Search, X, Code, Database, Globe, Smartphone, Terminal, Plus, ChevronDown, ChevronRight } from 'lucide-react';

const SKILL_CATEGORIES = [
    {
        id: 'frontend',
        label: 'Frontend',
        icon: <Globe size={18} />,
        groups: [
            {
                title: 'Languages',
                skills: ['JavaScript', 'TypeScript']
            },
            {
                title: 'Frameworks/Libraries',
                skills: ['React', 'Vue.js', 'Angular', 'Svelte', 'SolidJS', 'Preact']
            },
            {
                title: 'Meta-Frameworks',
                skills: ['Next.js', 'Nuxt.js', 'SvelteKit', 'Remix', 'Astro', 'Qwik']
            },
            {
                title: 'State Management',
                skills: ['Redux', 'Redux Toolkit', 'Zustand', 'Pinia', 'TanStack Query', 'Recoil', 'MobX']
            },
            {
                title: 'Styling',
                skills: ['CSS3', 'SCSS/SASS', 'Tailwind CSS', 'Styled Components', 'Emotion', 'CSS Modules', 'Bootstrap', 'DaisyUI', 'Shadcn/ui']
            },
            {
                title: 'Build Tools',
                skills: ['Vite', 'Webpack', 'Turborepo', 'Esbuild', 'Bun', 'Rollup']
            },
            {
                title: 'Testing',
                skills: ['Jest', 'Vitest', 'Cypress', 'Playwright', 'React Testing Library']
            }
        ]
    },
    {
        id: 'backend',
        label: 'Backend',
        icon: <Database size={18} />,
        groups: [
            {
                title: 'Languages & Frameworks',
                skills: [
                    'Node.js', 'Express.js', 'NestJS', 'Fastify', 'Hapi', 'Koa',
                    'Java', 'Spring Boot', 'Micronaut', 'Quarkus',
                    'C#', '.NET', 'ASP.NET Core', 'Minimal APIs',
                    'Python', 'Django', 'FastAPI', 'Flask', 'Pyramid',
                    'Go', 'Gin', 'Fiber', 'Echo', 'Beego',
                    'Rust', 'Actix-web', 'Axum', 'Rocket',
                    'PHP', 'Laravel', 'Symfony', 'Ruby', 'Ruby on Rails'
                ]
            },
            {
                title: 'Relational Database (SQL)',
                skills: ['PostgreSQL', 'MySQL', 'MS SQL Server', 'MariaDB', 'Oracle Database']
            },
            {
                title: 'NoSQL Database',
                skills: ['MongoDB', 'Cassandra', 'DynamoDB', 'CouchDB', 'Firebase Realtime DB']
            },
            {
                title: 'Caching & Search',
                skills: ['Redis', 'Memcached', 'Elasticsearch', 'Meilisearch', 'Algolia']
            },
            {
                title: 'API Protocols',
                skills: ['RESTful API', 'GraphQL', 'gRPC', 'tRPC', 'WebSockets', 'Socket.io']
            }
        ]
    },
    {
        id: 'blockchain',
        label: 'Blockchain',
        icon: <Code size={18} />,
        groups: [
            {
                title: 'Platforms (L1/L2)',
                skills: ['Ethereum', 'Solana', 'Aptos', 'Sui', 'Polygon', 'BSC', 'Polkadot', 'Avalanche', 'Arbitrum', 'Optimism']
            },
            {
                title: 'Languages',
                skills: ['Solidity', 'Rust (Solana)', 'Move', 'Vyper', 'Go']
            },
            {
                title: 'Frameworks & Tools',
                skills: ['Hardhat', 'Foundry', 'Truffle', 'Brownie', 'Anchor', 'Solana CLI', 'Aptos CLI']
            },
            {
                title: 'Libraries (Web3)',
                skills: ['Ethers.js', 'Web3.js', 'Solana Web3.js', 'Wagmi', 'Viem']
            },
            {
                title: 'Infrastructure',
                skills: ['IPFS', 'The Graph', 'Chainlink']
            }
        ]
    },
    {
        id: 'mobile',
        label: 'Mobile',
        icon: <Smartphone size={18} />,
        groups: [
            {
                title: 'Native iOS',
                skills: ['Swift', 'SwiftUI', 'Objective-C']
            },
            {
                title: 'Native Android',
                skills: ['Kotlin', 'Java', 'Jetpack Compose']
            },
            {
                title: 'Cross-platform',
                skills: ['Flutter', 'Dart', 'React Native', 'Kotlin Multiplatform', 'MAUI', 'Ionic', 'Capacitor']
            },
            {
                title: 'Mobile Backend',
                skills: ['Firebase', 'Supabase', 'Appwrite']
            }
        ]
    },
    {
        id: 'devops',
        label: 'DevOps & Tools',
        icon: <Terminal size={18} />,
        groups: [
            {
                title: 'Containerization & Orchestration',
                skills: ['Docker', 'Podman', 'Kubernetes', 'Docker Swarm', 'Nomad']
            },
            {
                title: 'CI/CD',
                skills: ['GitHub Actions', 'GitLab CI/CD', 'Jenkins', 'CircleCI', 'ArgoCD']
            },
            {
                title: 'Infrastructure as Code',
                skills: ['Terraform', 'Ansible', 'Pulumi', 'CloudFormation']
            },
            {
                title: 'Cloud Platforms',
                skills: ['AWS', 'Azure', 'Google Cloud (GCP)', 'DigitalOcean', 'Vercel', 'Netlify']
            },
            {
                title: 'Monitoring',
                skills: ['Prometheus', 'Grafana', 'ELK Stack', 'Datadog', 'New Relic']
            },
            {
                title: 'Tools',
                skills: ['Git', 'Postman', 'Insomnia', 'Swagger', 'Docker Desktop', 'SonarQube']
            }
        ]
    }
];

const SkillSelector = ({ selectedSkills = [], onChange }) => {
    const [activeCategory, setActiveCategory] = useState('frontend');
    const [searchQuery, setSearchQuery] = useState('');
    const [customSkill, setCustomSkill] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    const handleToggleSkill = (skill) => {
        const currentSkills = [...selectedSkills];
        if (currentSkills.includes(skill)) {
            onChange(currentSkills.filter(s => s !== skill));
        } else {
            if (currentSkills.length >= 15) return; // Limit max skills
            onChange([...currentSkills, skill]);
        }
    };

    const handleAddCustomSkill = (e) => {
        e.preventDefault();
        if (customSkill.trim()) {
            handleToggleSkill(customSkill.trim());
            setCustomSkill('');
            setIsAdding(false);
        }
    };

    const currentCategory = SKILL_CATEGORIES.find(c => c.id === activeCategory);

    // For Search: Flatten all skills
    const searchResults = searchQuery
        ? SKILL_CATEGORIES.flatMap(cat =>
            cat.groups.flatMap(g => g.skills)
        ).filter(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
        : [];

    return (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input
                    type="text"
                    placeholder="Search for any technology..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-[#0f172a] border border-[#334155] rounded-xl focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-text-primary placeholder-gray-500 text-sm transition-all"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-text-primary"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Selected Skills Chips */}
            {selectedSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20 min-h-[50px] animate-fade-in">
                    {selectedSkills.map(skill => (
                        <span key={skill} className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-500 text-text-primary border border-red-400 rounded-lg text-sm font-medium shadow-sm animate-scale-in">
                            {skill}
                            <button
                                type="button"
                                onClick={() => handleToggleSkill(skill)}
                                className="p-0.5 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={12} />
                            </button>
                        </span>
                    ))}
                    <div className="text-xs text-gray-400 flex items-center ml-auto">
                        {selectedSkills.length}/15
                    </div>
                </div>
            )}

            {/* Categories Tabs (Hidden when searching) */}
            {!searchQuery && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {SKILL_CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all border
                                ${activeCategory === cat.id
                                    ? 'bg-red-600 border-red-500 text-text-primary shadow-lg shadow-red-900/20 transform scale-105'
                                    : 'bg-[#0f172a] border-[#334155] text-gray-400 hover:bg-[#1e293b] hover:text-text-primary'
                                }`}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Skills Content Area */}
            <div className="bg-[#0f172a]/50 rounded-xl border border-[#334155] p-1 max-h-[400px] overflow-y-auto custom-scrollbar">

                {/* Search Results View */}
                {searchQuery ? (
                    <div className="p-3">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Search Results</h4>
                        <div className="flex flex-wrap gap-2">
                            {searchResults.map(skill => (
                                <button
                                    key={skill}
                                    type="button"
                                    onClick={() => handleToggleSkill(skill)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                                        ${selectedSkills.includes(skill)
                                            ? 'bg-red-500 text-text-primary border-red-500 shadow-sm'
                                            : 'bg-[#1e293b] border-[#334155] text-gray-300 hover:border-red-500 hover:text-text-primary'
                                        }`}
                                >
                                    {skill}
                                </button>
                            ))}
                            {searchResults.length === 0 && (
                                <div className="w-full text-center py-8 text-gray-500">
                                    No matching skills found.
                                    <button
                                        onClick={() => handleToggleSkill(searchQuery)}
                                        className="text-red-500 hover:underline ml-1 font-medium"
                                    >
                                        Add "{searchQuery}"?
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Category Groups View */
                    <div className="space-y-6 p-4">
                        {currentCategory.groups.map((group, idx) => (
                            <div key={idx} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                    {group.title}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {group.skills.map(skill => (
                                        <button
                                            key={skill}
                                            type="button"
                                            onClick={() => handleToggleSkill(skill)}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all border
                                                ${selectedSkills.includes(skill)
                                                    ? 'bg-red-500 text-text-primary border-red-500 shadow-sm'
                                                    : 'bg-[#1e293b] border-[#334155] text-gray-300 hover:border-red-500 hover:text-text-primary'
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Custom Skill Input at the bottom of category */}
                        <div className="pt-4 border-t border-[#334155]">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Other / Custom</h4>
                            {isAdding ? (
                                <form onSubmit={handleAddCustomSkill} className="flex gap-2">
                                    <input
                                        autoFocus
                                        type="text"
                                        value={customSkill}
                                        onChange={(e) => setCustomSkill(e.target.value)}
                                        onBlur={() => !customSkill && setIsAdding(false)}
                                        placeholder="Type skill & press Enter..."
                                        className="flex-1 px-4 py-2 rounded-lg border border-red-500 text-sm outline-none bg-[#1e293b] text-text-primary shadow-sm placeholder-gray-500"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-red-500 text-text-primary rounded-lg text-sm font-medium hover:bg-red-600"
                                    >
                                        Add
                                    </button>
                                </form>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setIsAdding(true)}
                                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all border border-dashed border-[#334155] text-gray-400 hover:border-red-500 hover:text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                    <Plus size={16} /> Add Custom Skill
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillSelector;
