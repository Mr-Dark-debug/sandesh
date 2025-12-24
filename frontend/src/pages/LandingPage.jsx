import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Shield, Users, Zap, Server, Lock, ArrowRight, Check, Github, BookOpen, ChevronRight, Star, GitFork, Heart } from 'lucide-react';

const GITHUB_REPO = 'Mr-Dark-debug/sandesh';
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;

export default function LandingPage() {
    const [githubStats, setGithubStats] = useState({ stars: 0, forks: 0, contributors: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch GitHub stats
        const fetchGithubStats = async () => {
            try {
                // Fetch repo info
                const repoRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`);
                if (repoRes.ok) {
                    const repoData = await repoRes.json();
                    setGithubStats(prev => ({
                        ...prev,
                        stars: repoData.stargazers_count || 0,
                        forks: repoData.forks_count || 0
                    }));
                }

                // Fetch contributors
                const contribRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contributors?per_page=6`);
                if (contribRes.ok) {
                    const contribData = await contribRes.json();
                    setGithubStats(prev => ({
                        ...prev,
                        contributors: contribData.slice(0, 6)
                    }));
                }
            } catch (error) {
                console.log('GitHub API error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGithubStats();
    }, []);

    return (
        <div className="min-h-screen bg-[#EFE8CE]">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 bg-[#EFE8CE]/95 backdrop-blur-sm border-b border-[#D7CE93]/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#A3A380] to-[#8B8B68] flex items-center justify-center shadow-sm">
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold text-[#3D3D3D]">सनdesh</span>
                        </Link>

                        {/* Nav Links */}
                        <div className="hidden md:flex items-center gap-8">
                            <a href="#features" className="text-sm font-medium text-[#6B6B6B] hover:text-[#3D3D3D] transition-colors">Features</a>
                            <a href="#how-it-works" className="text-sm font-medium text-[#6B6B6B] hover:text-[#3D3D3D] transition-colors">How it Works</a>
                            <a href="#use-cases" className="text-sm font-medium text-[#6B6B6B] hover:text-[#3D3D3D] transition-colors">Use Cases</a>
                            <Link to="/docs" className="text-sm font-medium text-[#6B6B6B] hover:text-[#3D3D3D] transition-colors">Docs</Link>

                            {/* GitHub Stars Badge */}
                            <a
                                href={GITHUB_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#3D3D3D] hover:bg-[#2D2D2D] text-white text-sm font-medium rounded-lg transition-colors"
                            >
                                <Github className="w-4 h-4" />
                                <Star className="w-3.5 h-3.5 fill-current text-[#D7CE93]" />
                                <span>{githubStats.stars}</span>
                            </a>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-3">
                            <Link
                                to="/login"
                                className="text-sm font-medium text-[#6B6B6B] hover:text-[#3D3D3D] px-4 py-2 transition-colors"
                            >
                                Sign in
                            </Link>
                            <Link
                                to="/login"
                                className="text-sm font-medium text-white bg-[#A3A380] hover:bg-[#8B8B68] px-4 py-2 rounded-lg transition-colors shadow-sm"
                            >
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-16 pb-24 lg:pt-24 lg:pb-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
                        {/* Left: Copy */}
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#D7CE93]/30 text-[#8B8B68] text-sm font-medium mb-6">
                                <Lock className="w-4 h-4" />
                                100% Local-First
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#3D3D3D] leading-tight mb-6">
                                Private email for
                                <span className="block text-[#A3A380]">your network</span>
                            </h1>

                            <p className="text-lg text-[#6B6B6B] leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                                सनdesh is a self-hosted email system that runs entirely on your infrastructure.
                                No cloud dependencies, no tracking, complete control.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#A3A380] hover:bg-[#8B8B68] text-white font-medium rounded-lg shadow-md transition-all hover:shadow-lg"
                                >
                                    Start Using सनdesh
                                    <ArrowRight className="w-4 h-4" />
                                </Link>
                                <a
                                    href={GITHUB_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#3D3D3D] hover:bg-[#2D2D2D] text-white font-medium rounded-lg shadow-md transition-all"
                                >
                                    <Github className="w-4 h-4" />
                                    Star on GitHub
                                </a>
                            </div>

                            {/* Trust indicators */}
                            <div className="mt-12 pt-8 border-t border-[#D7CE93]/30">
                                <div className="flex flex-wrap gap-6 justify-center lg:justify-start text-sm text-[#8B8B8B]">
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-[#A3A380]" />
                                        No internet required
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-[#A3A380]" />
                                        Self-hosted
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-[#A3A380]" />
                                        Open source
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Illustration */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                {/* Background decoration */}
                                <div className="absolute -top-8 -right-8 w-64 h-64 bg-[#D7CE93]/20 rounded-full blur-3xl" />
                                <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-[#A3A380]/10 rounded-full blur-2xl" />

                                {/* Email preview card */}
                                <div className="relative bg-white rounded-2xl shadow-xl p-6 border border-[#E5E8EB]">
                                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-[#E5E8EB]">
                                        <div className="w-10 h-10 rounded-full bg-[#D8A48F] flex items-center justify-center text-white font-bold">
                                            A
                                        </div>
                                        <div>
                                            <p className="font-medium text-[#3D3D3D]">Alice Johnson</p>
                                            <p className="text-xs text-[#8B8B8B]">alice@office</p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-[#F6F8FC] rounded-lg p-3">
                                            <p className="text-sm text-[#3D3D3D] font-medium">Project Update</p>
                                            <p className="text-xs text-[#8B8B8B]">The latest designs are ready for review...</p>
                                        </div>
                                        <div className="bg-[#F6F8FC] rounded-lg p-3">
                                            <p className="text-sm text-[#3D3D3D] font-medium">Team Sync</p>
                                            <p className="text-xs text-[#8B8B8B]">Meeting notes from today's standup...</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* GitHub Stats Section */}
            <section className="py-12 bg-white border-y border-[#E5E8EB]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        {/* Stats */}
                        <div className="flex items-center gap-8">
                            <a
                                href={GITHUB_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#F6F8FC] transition-colors"
                            >
                                <div className="w-10 h-10 rounded-lg bg-[#3D3D3D] flex items-center justify-center">
                                    <Github className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <p className="text-xs text-[#8B8B8B] uppercase tracking-wider">GitHub</p>
                                    <p className="text-lg font-bold text-[#3D3D3D]">Open Source</p>
                                </div>
                            </a>

                            <div className="h-12 w-px bg-[#E5E8EB]" />

                            <div className="flex items-center gap-2">
                                <Star className="w-5 h-5 text-[#D7CE93]" />
                                <div>
                                    <p className="text-xs text-[#8B8B8B]">Stars</p>
                                    <p className="text-lg font-bold text-[#3D3D3D]">{githubStats.stars}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <GitFork className="w-5 h-5 text-[#A3A380]" />
                                <div>
                                    <p className="text-xs text-[#8B8B8B]">Forks</p>
                                    <p className="text-lg font-bold text-[#3D3D3D]">{githubStats.forks}</p>
                                </div>
                            </div>
                        </div>

                        {/* Contributors */}
                        {githubStats.contributors.length > 0 && (
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <Heart className="w-4 h-4 text-[#D8A48F]" />
                                    <span className="text-sm text-[#6B6B6B]">Contributors</span>
                                </div>
                                <div className="flex -space-x-2">
                                    {githubStats.contributors.map((contributor, index) => (
                                        <a
                                            key={contributor.id || index}
                                            href={contributor.html_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title={contributor.login}
                                            className="relative"
                                        >
                                            <img
                                                src={contributor.avatar_url}
                                                alt={contributor.login}
                                                className="w-8 h-8 rounded-full border-2 border-white hover:scale-110 transition-transform"
                                            />
                                        </a>
                                    ))}
                                </div>
                                <a
                                    href={`${GITHUB_URL}/graphs/contributors`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-[#A3A380] hover:text-[#8B8B68]"
                                >
                                    View all →
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-sm font-medium text-[#A3A380] uppercase tracking-wider mb-3">Features</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#3D3D3D] mb-4">
                            Everything you need for private communication
                        </h2>
                        <p className="text-lg text-[#6B6B6B] max-w-2xl mx-auto">
                            Built for teams and organizations who value privacy and control.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB] hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-[#A3A380]/10 flex items-center justify-center mb-4">
                                <Shield className="w-6 h-6 text-[#A3A380]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">Complete Privacy</h3>
                            <p className="text-[#6B6B6B]">
                                Your data never leaves your network. No cloud sync, no external servers, no tracking.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB] hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-[#A3A380]/10 flex items-center justify-center mb-4">
                                <Users className="w-6 h-6 text-[#A3A380]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">User Management</h3>
                            <p className="text-[#6B6B6B]">
                                Create and manage users with clear roles. Admin controls for system-wide settings.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB] hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-[#A3A380]/10 flex items-center justify-center mb-4">
                                <Zap className="w-6 h-6 text-[#A3A380]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">Instant Delivery</h3>
                            <p className="text-[#6B6B6B]">
                                Local SMTP means emails arrive instantly. No queues, no spam filters, no delays.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB] hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-[#A3A380]/10 flex items-center justify-center mb-4">
                                <Server className="w-6 h-6 text-[#A3A380]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">Docker Ready</h3>
                            <p className="text-[#6B6B6B]">
                                Single container deployment. Easy to run, backup, and manage on any infrastructure.
                            </p>
                        </div>

                        {/* Feature 5 */}
                        <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB] hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-[#A3A380]/10 flex items-center justify-center mb-4">
                                <Mail className="w-6 h-6 text-[#A3A380]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">Modern Interface</h3>
                            <p className="text-[#6B6B6B]">
                                Clean, intuitive web interface. Compose, organize, and manage emails with ease.
                            </p>
                        </div>

                        {/* Feature 6 */}
                        <div className="p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB] hover:shadow-lg transition-shadow">
                            <div className="w-12 h-12 rounded-xl bg-[#A3A380]/10 flex items-center justify-center mb-4">
                                <Lock className="w-6 h-6 text-[#A3A380]" />
                            </div>
                            <h3 className="text-lg font-semibold text-[#3D3D3D] mb-2">Identity Model</h3>
                            <p className="text-[#6B6B6B]">
                                Clear identity rules. Username-based addressing with customizable display names.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="py-24 bg-[#EFE8CE]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-sm font-medium text-[#A3A380] uppercase tracking-wider mb-3">How it works</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#3D3D3D] mb-4">
                            Simple architecture, complete control
                        </h2>
                    </div>

                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-lg p-8 border border-[#E5E8EB]">
                            <div className="grid md:grid-cols-3 gap-8 text-center">
                                <div>
                                    <div className="w-16 h-16 rounded-2xl bg-[#A3A380]/10 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-[#A3A380]">1</span>
                                    </div>
                                    <h3 className="font-semibold text-[#3D3D3D] mb-2">Deploy Container</h3>
                                    <p className="text-sm text-[#6B6B6B]">Run a single Docker container on your network</p>
                                </div>

                                <div className="relative">
                                    <div className="hidden md:block absolute top-8 -left-4 w-8 h-px bg-[#D7CE93]" />
                                    <div className="w-16 h-16 rounded-2xl bg-[#A3A380]/10 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-[#A3A380]">2</span>
                                    </div>
                                    <h3 className="font-semibold text-[#3D3D3D] mb-2">Create Users</h3>
                                    <p className="text-sm text-[#6B6B6B]">Admin creates accounts with unique email addresses</p>
                                    <div className="hidden md:block absolute top-8 -right-4 w-8 h-px bg-[#D7CE93]" />
                                </div>

                                <div>
                                    <div className="w-16 h-16 rounded-2xl bg-[#A3A380]/10 flex items-center justify-center mx-auto mb-4">
                                        <span className="text-2xl font-bold text-[#A3A380]">3</span>
                                    </div>
                                    <h3 className="font-semibold text-[#3D3D3D] mb-2">Start Emailing</h3>
                                    <p className="text-sm text-[#6B6B6B]">Send and receive emails within your network</p>
                                </div>
                            </div>

                            {/* Architecture diagram */}
                            <div className="mt-12 pt-8 border-t border-[#E5E8EB]">
                                <div className="bg-[#F9FAFB] rounded-xl p-6 font-mono text-sm text-center text-[#6B6B6B]">
                                    <div className="flex items-center justify-center gap-4 flex-wrap">
                                        <span className="px-4 py-2 bg-white rounded-lg border border-[#E5E8EB]">Browser</span>
                                        <ChevronRight className="w-4 h-4 text-[#A3A380]" />
                                        <span className="px-4 py-2 bg-[#A3A380] text-white rounded-lg">सनdesh Server</span>
                                        <ChevronRight className="w-4 h-4 text-[#A3A380]" />
                                        <span className="px-4 py-2 bg-white rounded-lg border border-[#E5E8EB]">SQLite DB</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section id="use-cases" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <p className="text-sm font-medium text-[#A3A380] uppercase tracking-wider mb-3">Use Cases</p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-[#3D3D3D] mb-4">
                            Built for privacy-conscious teams
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Use Case 1 */}
                        <div className="flex gap-4 p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB]">
                            <div className="w-12 h-12 rounded-xl bg-[#D7CE93]/30 flex items-center justify-center flex-shrink-0">
                                🏢
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#3D3D3D] mb-2">Offices & Enterprises</h3>
                                <p className="text-[#6B6B6B] text-sm">
                                    Internal communication that stays internal. Perfect for sensitive business operations.
                                </p>
                            </div>
                        </div>

                        {/* Use Case 2 */}
                        <div className="flex gap-4 p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB]">
                            <div className="w-12 h-12 rounded-xl bg-[#D7CE93]/30 flex items-center justify-center flex-shrink-0">
                                🛠️
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#3D3D3D] mb-2">Home Labs & Developers</h3>
                                <p className="text-[#6B6B6B] text-sm">
                                    Test email workflows without internet. Great for development and staging environments.
                                </p>
                            </div>
                        </div>

                        {/* Use Case 3 */}
                        <div className="flex gap-4 p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB]">
                            <div className="w-12 h-12 rounded-xl bg-[#D7CE93]/30 flex items-center justify-center flex-shrink-0">
                                🎓
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#3D3D3D] mb-2">Hackathons & Events</h3>
                                <p className="text-[#6B6B6B] text-sm">
                                    Spin up for time-limited events. No accounts to manage after the event ends.
                                </p>
                            </div>
                        </div>

                        {/* Use Case 4 */}
                        <div className="flex gap-4 p-6 rounded-2xl bg-[#F9FAFB] border border-[#E5E8EB]">
                            <div className="w-12 h-12 rounded-xl bg-[#D7CE93]/30 flex items-center justify-center flex-shrink-0">
                                🔒
                            </div>
                            <div>
                                <h3 className="font-semibold text-[#3D3D3D] mb-2">Air-Gapped Networks</h3>
                                <p className="text-[#6B6B6B] text-sm">
                                    Works completely offline. Ideal for secure environments with no internet access.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-[#A3A380]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                        Ready to take control of your email?
                    </h2>
                    <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
                        Deploy सनdesh on your network today. No signup required, no cloud dependencies.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white hover:bg-[#F6F8FC] text-[#3D3D3D] font-medium rounded-lg shadow-lg transition-all"
                        >
                            Get Started Now
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                        <a
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-transparent hover:bg-white/10 text-white font-medium rounded-lg border-2 border-white/30 transition-all"
                        >
                            <Github className="w-5 h-5" />
                            Star on GitHub
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#3D3D3D] text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-[#A3A380] flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-white" />
                                </div>
                                <span className="text-xl font-bold">सनdesh</span>
                            </div>
                            <p className="text-[#8B8B8B] text-sm max-w-xs mb-4">
                                A local-first, self-hosted email platform for private networks and organizations.
                            </p>

                            {/* GitHub Social Proof */}
                            <div className="flex items-center gap-4 mt-4">
                                <a
                                    href={GITHUB_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4A4A4A] hover:bg-[#5A5A5A] rounded-lg text-sm transition-colors"
                                >
                                    <Star className="w-4 h-4 text-[#D7CE93]" />
                                    <span>{githubStats.stars} stars</span>
                                </a>
                                <a
                                    href={`${GITHUB_URL}/fork`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#4A4A4A] hover:bg-[#5A5A5A] rounded-lg text-sm transition-colors"
                                >
                                    <GitFork className="w-4 h-4 text-[#A3A380]" />
                                    <span>{githubStats.forks} forks</span>
                                </a>
                            </div>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-[#8B8B8B]">
                                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                                <li><a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a></li>
                                <li><a href="#use-cases" className="hover:text-white transition-colors">Use Cases</a></li>
                                <li><Link to="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-[#8B8B8B]">
                                <li>
                                    <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors inline-flex items-center gap-2">
                                        <Github className="w-4 h-4" />
                                        GitHub
                                    </a>
                                </li>
                                <li>
                                    <a href={`${GITHUB_URL}/issues`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                        Issues & Feedback
                                    </a>
                                </li>
                                <li><Link to="/docs#/docs/quick-start" className="hover:text-white transition-colors">Quick Start</Link></li>
                                <li><Link to="/docs#/docs/faq" className="hover:text-white transition-colors">FAQ</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-[#4A4A4A] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#8B8B8B]">
                        <p>© 2025 सनdesh. Open source under MIT license.</p>
                        <div className="flex items-center gap-4">
                            <span>Made with ❤️ by</span>
                            <a
                                href="https://github.com/Mr-Dark-debug"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#A3A380] hover:text-white transition-colors"
                            >
                                @Mr-Dark-debug
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
