import React, { useState, useEffect, useContext, Suspense, lazy } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../../../context/AuthContext';
import { FaUserPlus, FaTasks, FaMoneyBillWave, FaMapMarkerAlt, FaChartBar, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

// Dynamically load heavy charting libraries ONLY when needed to save mobile bandwidth
const DynamicChart = lazy(() => 
  import('recharts').then((module) => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = module;
    return {
      default: ({ data }) => (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )
    };
  })
);

const ArchitectWorkforce = () => {
    const { token } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState('Overview');
    const [stats, setStats] = useState(null);
    const [partners, setPartners] = useState([]);
    
    // Invite Partner State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteData, setInviteData] = useState({ 
        name: '', email: '', phone: '', password: '', baseWageType: 'Daily', baseWageAmount: '' 
    });
    
    // Fetch data based on tab
    useEffect(() => {
        if (!token) return;
        
        const fetchStats = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/architect-workforce/stats', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if(res.data.success) {
                    setStats(res.data.stats);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            }
        };

        const fetchPartners = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/architect-workforce/partners', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if(res.data.success) {
                    setPartners(res.data.partners);
                }
            } catch (err) {
                console.error("Error fetching partners:", err);
            }
        };

        if (activeTab === 'Overview') fetchStats();
        if (activeTab === 'Directory' || activeTab === 'Overview') fetchPartners();

    }, [activeTab, token]);

    const tabs = [
        { name: 'Overview', icon: <FaChartBar /> },
        { name: 'Directory', icon: <FaUserPlus /> },
        { name: 'Task Board', icon: <FaTasks /> },
        { name: 'Payments', icon: <FaMoneyBillWave /> },
        { name: 'Location', icon: <FaMapMarkerAlt /> },
    ];

    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            const payload = { ...inviteData };
            // If email is empty, backend fails if it expects unique. 
            // Better to delete if empty, or just pass it as is.
            if (!payload.email) delete payload.email;

            const res = await axios.post('http://localhost:5000/api/architect-workforce/register', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                alert('Partner invited successfully!');
                setIsInviteModalOpen(false);
                setPartners(prev => [res.data.partner, ...prev]);
                if (stats) setStats(prev => ({...prev, totalPartners: prev.totalPartners + 1}));
                setInviteData({ name: '', email: '', phone: '', password: '', baseWageType: 'Daily', baseWageAmount: '' });
            }
        } catch (error) {
            console.error(error);
            alert(error.response?.data?.message || 'Failed to invite partner.');
        } finally {
            setIsInviting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#090909] text-white p-4 md:p-8 relative">
            <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                    Workforce Management
                </h1>
                <p className="text-sm md:text-base text-gray-400 mt-2">Manage your partners, assign tasks, track locations, and clear payments.</p>
            </header>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 md:gap-4 mb-8 pb-2 no-scrollbar border-b border-white/5">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center gap-2 whitespace-nowrap px-4 py-3 rounded-t-xl transition-all duration-300 font-medium ${
                            activeTab === tab.name 
                            ? "bg-white/10 text-white border-b-2 border-white" 
                            : "text-gray-500 hover:text-white hover:bg-white/5"
                        }`}
                    >
                        {tab.icon} {tab.name}
                    </button>
                ))}
            </div>

            {/* Content Display based on Tab */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'Overview' && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <StatCard title="Total Partners" value={stats?.totalPartners || 0} icon={<FaUserPlus className="text-blue-400" />} />
                                <StatCard title="Active Tasks" value={stats?.activeTasks || 0} icon={<FaTasks className="text-orange-400" />} />
                                <StatCard title="Completed Tasks" value={stats?.completedTasks || 0} icon={<FaCheckCircle className="text-green-400" />} />
                                <StatCard title="Total Paid" value={`₹${stats?.totalPaid || 0}`} icon={<FaMoneyBillWave className="text-yellow-400" />} />
                            </div>

                            {/* Lazy Loaded Chart */}
                            <div className="bg-[#111] p-6 rounded-2xl border border-white/5 shadow-xl">
                                <h3 className="text-lg font-bold mb-6 text-white">Task Completion Ratio</h3>
                                <Suspense fallback={<div className="h-[300px] w-full flex items-center justify-center bg-white/5 rounded-xl animate-pulse text-gray-500 font-medium">Loading Chart Data...</div>}>
                                    <DynamicChart data={[
                                        { name: 'Active Tasks', value: stats?.activeTasks || 0 },
                                        { name: 'Completed Tasks', value: stats?.completedTasks || 0 }
                                    ]} />
                                </Suspense>
                            </div>
                        </>
                    )}

                    {activeTab === 'Directory' && (
                        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Partner Directory</h2>
                                <button onClick={() => setIsInviteModalOpen(true)} className="bg-white text-black px-4 py-2 flex items-center gap-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                                    <FaUserPlus /> Invite Partner
                                </button>
                            </div>
                            {partners.length === 0 ? (
                                <p className="text-gray-500 text-center py-10">No partners found. Invite some members to your workforce.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {partners.map(p => (
                                        <div key={p._id} className="bg-[#1A1A1C] border border-white/5 p-4 rounded-xl flex items-center gap-4 hover:border-white/20 transition-colors">
                                            <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-lg font-bold">
                                                {p.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="font-medium text-white">{p.name}</h3>
                                                <p className="text-xs text-gray-400">{p.email}</p>
                                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">{p.architectPartnerDetails?.baseWageType} : ₹{p.architectPartnerDetails?.baseWageAmount}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'Task Board' && (
                        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-xl min-h-[400px] flex items-center justify-center">
                            <div className="text-center text-gray-400">
                                <FaTasks className="text-4xl mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">Task Board</h3>
                                <p className="text-sm mt-2">Kanban board loading... (Integration pending for UI)</p>
                            </div>
                        </div>
                    )}
                    
                    {activeTab === 'Payments' && (
                        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-xl min-h-[400px] flex items-center justify-center">
                            <div className="text-center text-gray-400">
                                <FaMoneyBillWave className="text-4xl mx-auto mb-4 opacity-50" />
                                <h3 className="text-lg font-medium">Ledger</h3>
                                <p className="text-sm mt-2">Loading financial module...</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'Location' && (
                        <div className="bg-[#111] border border-white/5 p-6 rounded-2xl shadow-xl min-h-[400px] flex flex-col">
                           <h2 className="text-xl font-semibold mb-4">Live Tracking & Geo-Fencing</h2>
                           <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                                <p className="text-gray-500 z-10 p-4 text-center bg-black/50 backdrop-blur-sm rounded-xl">Map Integration (Leaflet/Google Maps) Placeholder</p>
                           </div>
                        </div>
                    )}

                </motion.div>
            </AnimatePresence>

            {/* Invite Partner Modal */}
            <AnimatePresence>
                {isInviteModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold">Invite New Partner</h2>
                                <button onClick={() => setIsInviteModalOpen(false)} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">
                                    &times;
                                </button>
                            </div>
                            <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
                                    <input required type="text" value={inviteData.name} onChange={(e) => setInviteData({...inviteData, name: e.target.value})} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Raju Mistry" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Phone Number *</label>
                                        <input required type="tel" value={inviteData.phone} onChange={(e) => setInviteData({...inviteData, phone: e.target.value})} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 9876543210" />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                                        <input type="email" value={inviteData.email} onChange={(e) => setInviteData({...inviteData, email: e.target.value})} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors" placeholder="e.g. optional@work.com" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Set Temporary Password *</label>
                                    <input required minLength={6} type="text" value={inviteData.password} onChange={(e) => setInviteData({...inviteData, password: e.target.value})} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors" placeholder="e.g. Secure@123" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Wage Type</label>
                                        <select value={inviteData.baseWageType} onChange={(e) => setInviteData({...inviteData, baseWageType: e.target.value})} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors appearance-none">
                                            <option value="Daily">Daily</option>
                                            <option value="Per Task">Per Task</option>
                                            <option value="Fixed">Fixed Monthly</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Base Wage (₹) *</label>
                                        <input required type="number" min="0" value={inviteData.baseWageAmount} onChange={(e) => setInviteData({...inviteData, baseWageAmount: e.target.value})} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors" placeholder="e.g. 500" />
                                    </div>
                                </div>
                                <button disabled={isInviting} type="submit" className="w-full mt-6 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                                    {isInviting ? 'Sending Invite...' : <><FaUserPlus /> Confirm & Create Invite</>}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const StatCard = ({ title, value, icon }) => (
    <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex items-center gap-4 hover:border-white/20 transition-colors shadow-lg shadow-black/50">
        <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center text-2xl border border-white/10">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500 uppercase tracking-wider font-medium">{title}</p>
            <h3 className="text-2xl font-bold mt-1 tracking-tight">{value}</h3>
        </div>
    </div>
);

export default ArchitectWorkforce;
