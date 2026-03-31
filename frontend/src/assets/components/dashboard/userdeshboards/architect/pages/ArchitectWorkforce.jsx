import React, { useState, useEffect, useContext, Suspense, lazy } from 'react';
import API from '../../../../../api/api';
import { AuthContext } from '../../../../../context/AuthContext';
import { FaUserPlus, FaTasks, FaMoneyBillWave, FaMapMarkerAlt, FaChartBar, FaCheckCircle, FaExclamationCircle, FaTrash, FaClock, FaCalendarCheck, FaPlus, FaSearch, FaFilter, FaEye, FaTimes, FaSyncAlt, FaSatellite } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Dynamically load heavy charting libraries ONLY when needed to save mobile bandwidth
const DynamicChart = lazy(() => 
  import('recharts').then((module) => {
    const { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } = module;
    return {
      default: ({ data }) => (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip cursor={{fill: 'rgba(255,255,255,0.03)'}} contentStyle={{ backgroundColor: '#111', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', color: '#fff', fontSize: '13px' }} />
            <Bar dataKey="value" fill="url(#barGrad)" radius={[6, 6, 0, 0]} barSize={40} />
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
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
    const [tasks, setTasks] = useState([]);
    const [payments, setPayments] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [partnerLocations, setPartnerLocations] = useState([]);
    
    // Invite Partner State
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [isInviting, setIsInviting] = useState(false);
    const [inviteData, setInviteData] = useState({ 
        name: '', email: '', phone: '', password: '', baseWageType: 'Daily', baseWageAmount: '' 
    });

    // Create Task State
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isCreatingTask, setIsCreatingTask] = useState(false);
    const [taskData, setTaskData] = useState({
        title: '', description: '', partnerId: '', deadline: '', priority: 'Medium'
    });

    // Create Payment State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isRecordingPayment, setIsRecordingPayment] = useState(false);
    const [paymentData, setPaymentData] = useState({
        partnerId: '', amount: '', paymentType: 'Daily', description: '', status: 'Paid'
    });

    // Task Filter
    const [taskFilter, setTaskFilter] = useState('All');

    // Attendance Date Filter
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    // --- FETCH FUNCTIONS ---
    const fetchStats = async () => {
        try {
            const res = await API.get('/architect-workforce/stats');
            if(res.data.success) setStats(res.data.stats);
        } catch (err) { console.error("Stats error:", err); }
    };

    const fetchPartners = async () => {
        try {
            const res = await API.get('/architect-workforce/partners');
            if(res.data.success) setPartners(res.data.partners);
        } catch (err) { console.error("Partners error:", err); }
    };

    const fetchTasks = async () => {
        try {
            const res = await API.get('/architect-workforce/tasks');
            if(res.data.success) setTasks(res.data.tasks);
        } catch (err) { console.error("Tasks error:", err); }
    };

    const fetchPayments = async () => {
        try {
            const res = await API.get('/architect-workforce/payments');
            if(res.data.success) setPayments(res.data.payments);
        } catch (err) { console.error("Payments error:", err); }
    };

    const fetchAttendance = async (date) => {
        try {
            const res = await API.get(`/architect-workforce/attendance?date=${date}`);
            if(res.data.success) setAttendance(res.data.logs);
        } catch (err) { console.error("Attendance error:", err); }
    };

    const fetchLocations = async () => {
        try {
            const res = await API.get('/architect-workforce/locations');
            if(res.data.success) setPartnerLocations(res.data.locations);
        } catch (err) { console.error("Locations error:", err); }
    };

    // Fetch on tab change
    useEffect(() => {
        if (!token) return;
        if (activeTab === 'Overview') { fetchStats(); fetchPartners(); }
        if (activeTab === 'Directory') fetchPartners();
        if (activeTab === 'Task Board') { fetchTasks(); fetchPartners(); }
        if (activeTab === 'Payments') { fetchPayments(); fetchPartners(); }
        if (activeTab === 'Attendance') fetchAttendance(attendanceDate);
        if (activeTab === 'Live Map') fetchLocations();
    }, [activeTab, token]);

    // Auto-refresh location every 30 seconds when on Live Map tab
    useEffect(() => {
        if (activeTab !== 'Live Map' || !token) return;
        const interval = setInterval(fetchLocations, 30000);
        return () => clearInterval(interval);
    }, [activeTab, token]);

    // --- HANDLERS ---
    const handleInviteSubmit = async (e) => {
        e.preventDefault();
        setIsInviting(true);
        try {
            const payload = { ...inviteData };
            if (!payload.email) delete payload.email;
            const res = await API.post('/architect-workforce/register', payload);
            if (res.data.success) {
                alert('Partner invited successfully!');
                setIsInviteModalOpen(false);
                setPartners(prev => [res.data.partner, ...prev]);
                if (stats) setStats(prev => ({...prev, totalPartners: prev.totalPartners + 1}));
                setInviteData({ name: '', email: '', phone: '', password: '', baseWageType: 'Daily', baseWageAmount: '' });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to invite partner.');
        } finally {
            setIsInviting(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setIsCreatingTask(true);
        try {
            const res = await API.post('/architect-workforce/task', taskData);
            if (res.data.success) {
                alert('Task assigned successfully!');
                setIsTaskModalOpen(false);
                fetchTasks();
                setTaskData({ title: '', description: '', partnerId: '', deadline: '', priority: 'Medium' });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to create task.');
        } finally {
            setIsCreatingTask(false);
        }
    };

    const handleRecordPayment = async (e) => {
        e.preventDefault();
        setIsRecordingPayment(true);
        try {
            const res = await API.post('/architect-workforce/payment', paymentData);
            if (res.data.success) {
                alert('Payment recorded!');
                setIsPaymentModalOpen(false);
                fetchPayments();
                setPaymentData({ partnerId: '', amount: '', paymentType: 'Daily', description: '', status: 'Paid' });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to record payment.');
        } finally {
            setIsRecordingPayment(false);
        }
    };

    const handleUpdateTaskStatus = async (taskId, status) => {
        try {
            await API.put(`/architect-workforce/task/${taskId}`, { status });
            fetchTasks();
        } catch (err) {
            alert('Failed to update task status');
        }
    };

    const filteredTasks = taskFilter === 'All' ? tasks : tasks.filter(t => t.status === taskFilter);

    const tabs = [
        { name: 'Overview', icon: <FaChartBar /> },
        { name: 'Directory', icon: <FaUserPlus /> },
        { name: 'Task Board', icon: <FaTasks /> },
        { name: 'Attendance', icon: <FaCalendarCheck /> },
        { name: 'Payments', icon: <FaMoneyBillWave /> },
        { name: 'Live Map', icon: <FaSatellite /> },
    ];

    const totalPaidAmount = payments.filter(p => p.status === 'Paid').reduce((s, p) => s + p.amount, 0);
    const totalPendingAmount = payments.filter(p => p.status === 'Pending').reduce((s, p) => s + p.amount, 0);

    return (
        <div className="min-h-screen bg-[#090909] text-white p-4 md:p-8 relative">
            {/* Header */}
            <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 relative overflow-hidden bg-gradient-to-br from-[#1A1A1C] to-[#111] p-6 md:p-10 rounded-3xl border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                        Workforce <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Command Center</span>
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-2 font-medium">Manage partners, assign tasks, track attendance, and clear payments — all from one place.</p>
                </div>
            </motion.header>

            {/* Tabs */}
            <div className="flex overflow-x-auto gap-2 mb-8 pb-3 no-scrollbar">
                {tabs.map((tab) => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center gap-2 whitespace-nowrap px-5 py-3 rounded-xl transition-all duration-300 font-bold text-sm ${
                            activeTab === tab.name 
                            ? "bg-white text-black shadow-lg shadow-white/10" 
                            : "text-gray-500 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5"
                        }`}
                    >
                        {tab.icon} {tab.name}
                    </button>
                ))}
            </div>

            {/* Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25 }}
                >
                    {/* ============ OVERVIEW TAB ============ */}
                    {activeTab === 'Overview' && (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
                                <StatCard title="Total Partners" value={stats?.totalPartners || 0} icon={<FaUserPlus className="text-blue-400" />} color="blue" />
                                <StatCard title="Active Tasks" value={stats?.activeTasks || 0} icon={<FaTasks className="text-orange-400" />} color="orange" />
                                <StatCard title="Completed" value={stats?.completedTasks || 0} icon={<FaCheckCircle className="text-green-400" />} color="green" />
                                <StatCard title="Present Today" value={stats?.presentToday || 0} icon={<FaCalendarCheck className="text-cyan-400" />} color="cyan" />
                                <StatCard title="Total Paid" value={`₹${stats?.totalPaid || 0}`} icon={<FaMoneyBillWave className="text-yellow-400" />} color="yellow" />
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Chart */}
                                <div className="bg-[#111] p-6 rounded-3xl border border-white/5 shadow-xl">
                                    <h3 className="text-lg font-bold mb-6">Task Analytics</h3>
                                    <Suspense fallback={<div className="h-[300px] w-full flex items-center justify-center bg-white/5 rounded-xl animate-pulse text-gray-500 font-medium">Loading Chart...</div>}>
                                        <DynamicChart data={[
                                            { name: 'Active', value: stats?.activeTasks || 0 },
                                            { name: 'Completed', value: stats?.completedTasks || 0 },
                                            { name: 'Partners', value: stats?.totalPartners || 0 },
                                            { name: 'Present', value: stats?.presentToday || 0 }
                                        ]} />
                                    </Suspense>
                                </div>

                                {/* Quick Partner List */}
                                <div className="bg-[#111] p-6 rounded-3xl border border-white/5 shadow-xl">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="text-lg font-bold">Recent Partners</h3>
                                        <button onClick={() => setActiveTab('Directory')} className="text-xs text-blue-400 hover:text-blue-300 font-bold">View All →</button>
                                    </div>
                                    <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
                                        {partners.length === 0 ? (
                                            <p className="text-gray-500 text-center py-10 text-sm">No partners yet. Invite your first worker!</p>
                                        ) : partners.slice(0, 6).map(p => (
                                            <div key={p._id} className="flex items-center gap-4 bg-[#1A1A1C] p-4 rounded-xl border border-white/5 hover:border-white/15 transition-colors">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-sm font-black shrink-0">
                                                    {p.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-sm truncate">{p.name}</h4>
                                                    <p className="text-[11px] text-gray-500">{p.phone || p.email}</p>
                                                </div>
                                                <span className="text-[10px] bg-white/5 px-2 py-1 rounded-lg font-bold text-gray-400 uppercase shrink-0">
                                                    {p.architectPartnerDetails?.baseWageType}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ DIRECTORY TAB ============ */}
                    {activeTab === 'Directory' && (
                        <div className="bg-[#111] border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold">Partner Directory</h2>
                                    <p className="text-sm text-gray-500 mt-1">{partners.length} total members</p>
                                </div>
                                <button onClick={() => setIsInviteModalOpen(true)} className="bg-white text-black px-5 py-3 flex items-center gap-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                                    <FaUserPlus /> Invite Partner
                                </button>
                            </div>
                            {partners.length === 0 ? (
                                <EmptyState icon={<FaUserPlus />} title="No Partners Yet" desc="Invite your first labor partner to get started." />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {partners.map(p => (
                                        <motion.div key={p._id} whileHover={{ y: -3 }} className="bg-[#1A1A1C] border border-white/5 p-5 rounded-2xl hover:border-white/20 transition-all hover:shadow-lg hover:shadow-black/50">
                                            <div className="flex items-center gap-4 mb-4">
                                                <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-xl font-black shrink-0 shadow-lg shadow-blue-500/20">
                                                    {p.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-white truncate">{p.name}</h3>
                                                    <p className="text-xs text-gray-400 truncate">{p.phone || 'No phone'}</p>
                                                    {p.email && <p className="text-xs text-gray-500 truncate">{p.email}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                                <span className="text-xs bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg font-bold border border-blue-500/20 uppercase tracking-wider">
                                                    {p.architectPartnerDetails?.baseWageType || 'N/A'}
                                                </span>
                                                <span className="text-sm font-black text-white">
                                                    ₹{p.architectPartnerDetails?.baseWageAmount || 0}
                                                </span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============ TASK BOARD TAB ============ */}
                    {activeTab === 'Task Board' && (
                        <div className="space-y-6">
                            {/* Task Board Header */}
                            <div className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-xl">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold">Task Board</h2>
                                        <p className="text-sm text-gray-500 mt-1">{tasks.length} total tasks • {tasks.filter(t => t.status !== 'Completed').length} active</p>
                                    </div>
                                    <button onClick={() => setIsTaskModalOpen(true)} className="bg-white text-black px-5 py-3 flex items-center gap-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                                        <FaPlus /> Assign New Task
                                    </button>
                                </div>

                                {/* Filters */}
                                <div className="flex flex-wrap gap-2">
                                    {['All', 'Pending', 'In Progress', 'Completed'].map(f => (
                                        <button key={f} onClick={() => setTaskFilter(f)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${taskFilter === f ? 'bg-white text-black shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/5'}`}>
                                            {f === 'Pending' && '🕒 '}{f === 'In Progress' && '🚀 '}{f === 'Completed' && '✅ '}{f}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Task Cards */}
                            {filteredTasks.length === 0 ? (
                                <EmptyState icon={<FaTasks />} title="No Tasks Found" desc={taskFilter === 'All' ? "Assign your first task to a partner!" : `No ${taskFilter.toLowerCase()} tasks.`} />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {filteredTasks.map((task, index) => (
                                        <motion.div 
                                            key={task._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.05 * index }}
                                            whileHover={{ y: -4 }}
                                            className={`bg-[#111] p-6 rounded-2xl border transition-all shadow-xl ${
                                                task.status === 'Completed' ? 'border-green-500/20 opacity-70' : 'border-white/5 hover:border-white/15'
                                            }`}
                                        >
                                            {/* Task Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <h3 className="font-bold text-base leading-tight line-clamp-2 pr-2">{task.title}</h3>
                                                <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-md shrink-0 border tracking-wider ${
                                                    task.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                                    task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {task.priority}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-sm text-gray-400 mb-4 line-clamp-3">{task.description}</p>

                                            {/* Assigned Partner */}
                                            <div className="flex items-center gap-3 mb-4 bg-white/5 p-3 rounded-xl border border-white/5">
                                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-xs font-black shrink-0">
                                                    {task.partnerId?.name?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold truncate">{task.partnerId?.name || 'Unassigned'}</p>
                                                    <p className="text-[10px] text-gray-500 truncate">{task.partnerId?.phone || task.partnerId?.email || ''}</p>
                                                </div>
                                            </div>

                                            {/* Deadline */}
                                            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-gray-500 font-bold mb-5">
                                                <FaClock className="text-blue-400" /> 
                                                Due: {task.deadline ? new Date(task.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                                            </div>

                                            {/* Status Controller */}
                                            <div className="pt-4 border-t border-white/5">
                                                <select 
                                                    className="w-full bg-[#1A1A1C] border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-3 text-white outline-none appearance-none focus:border-blue-500 hover:border-white/20 transition-colors cursor-pointer"
                                                    value={task.status}
                                                    onChange={(e) => handleUpdateTaskStatus(task._id, e.target.value)}
                                                >
                                                    <option value="Pending">🕒 Pending</option>
                                                    <option value="In Progress">🚀 In Progress</option>
                                                    <option value="Completed">✅ Completed</option>
                                                </select>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============ ATTENDANCE TAB ============ */}
                    {activeTab === 'Attendance' && (
                        <div className="bg-[#111] border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold">Attendance Register</h2>
                                    <p className="text-sm text-gray-500 mt-1">GPS-verified attendance logs for your workforce</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="date" 
                                        value={attendanceDate} 
                                        onChange={(e) => { setAttendanceDate(e.target.value); fetchAttendance(e.target.value); }}
                                        className="bg-[#1A1A1C] border border-white/10 text-white rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                                    />
                                </div>
                            </div>

                            {attendance.length === 0 ? (
                                <EmptyState icon={<FaCalendarCheck />} title="No Records" desc="No attendance logs found for this date." />
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="py-4 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">Partner</th>
                                                <th className="py-4 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">Check In</th>
                                                <th className="py-4 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">Check Out</th>
                                                <th className="py-4 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">Duration</th>
                                                <th className="py-4 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">GPS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendance.map(log => {
                                                const dur = (log.checkInTime && log.checkOutTime) 
                                                    ? ((new Date(log.checkOutTime) - new Date(log.checkInTime)) / 3600000).toFixed(1) + 'h' 
                                                    : '—';
                                                return (
                                                    <tr key={log._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-600 to-blue-600 rounded-lg flex items-center justify-center text-xs font-black">
                                                                    {log.partnerId?.name?.charAt(0)?.toUpperCase() || '?'}
                                                                </div>
                                                                <span className="font-bold text-sm">{log.partnerId?.name || 'Unknown'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-sm">
                                                            {log.checkInTime ? (
                                                                <span className="text-green-400 font-bold">{new Date(log.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                            ) : <span className="text-gray-500">—</span>}
                                                        </td>
                                                        <td className="py-4 px-4 text-sm">
                                                            {log.checkOutTime ? (
                                                                <span className="text-red-400 font-bold">{new Date(log.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                                            ) : <span className="text-yellow-500 font-bold animate-pulse">On-Site</span>}
                                                        </td>
                                                        <td className="py-4 px-4 text-sm font-bold text-gray-300">{dur}</td>
                                                        <td className="py-4 px-4">
                                                            {log.checkInLocation?.lat ? (
                                                                <a href={`https://www.google.com/maps?q=${log.checkInLocation.lat},${log.checkInLocation.lng}`} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1">
                                                                    <FaMapMarkerAlt /> View
                                                                </a>
                                                            ) : <span className="text-gray-500 text-xs">—</span>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ============ PAYMENTS TAB ============ */}
                    {activeTab === 'Payments' && (
                        <div className="space-y-6">
                            {/* Payment Summary Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                                        <FaCheckCircle className="text-green-400 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Paid</p>
                                        <h3 className="text-2xl font-black text-green-400">₹{totalPaidAmount}</h3>
                                    </div>
                                </div>
                                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                        <FaClock className="text-yellow-400 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Pending</p>
                                        <h3 className="text-2xl font-black text-yellow-400">₹{totalPendingAmount}</h3>
                                    </div>
                                </div>
                                <div className="bg-[#111] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                        <FaMoneyBillWave className="text-blue-400 text-xl" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Records</p>
                                        <h3 className="text-2xl font-black">{payments.length}</h3>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Table */}
                            <div className="bg-[#111] border border-white/5 p-6 md:p-8 rounded-3xl shadow-xl">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                                    <h2 className="text-2xl font-bold">Payment Ledger</h2>
                                    <button onClick={() => setIsPaymentModalOpen(true)} className="bg-white text-black px-5 py-3 flex items-center gap-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors shadow-lg shadow-white/10">
                                        <FaPlus /> Record Payment
                                    </button>
                                </div>

                                {payments.length === 0 ? (
                                    <EmptyState icon={<FaMoneyBillWave />} title="No Payments" desc="Record your first payment to a partner." />
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-white/10">
                                                    <th className="py-4 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">Partner</th>
                                                    <th className="py-4 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">Amount</th>
                                                    <th className="py-4 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">Type</th>
                                                    <th className="py-4 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">Status</th>
                                                    <th className="py-4 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">Date</th>
                                                    <th className="py-4 px-4 text-xs text-gray-400 uppercase tracking-wider font-bold">Note</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {payments.map(pay => (
                                                    <tr key={pay._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-emerald-600 rounded-lg flex items-center justify-center text-xs font-black">
                                                                    {pay.partnerId?.name?.charAt(0)?.toUpperCase() || '?'}
                                                                </div>
                                                                <span className="font-bold text-sm">{pay.partnerId?.name || 'Unknown'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-4 text-sm font-black text-white">₹{pay.amount}</td>
                                                        <td className="py-4 px-4"><span className="text-xs bg-white/5 px-2 py-1 rounded-lg font-bold text-gray-400 uppercase">{pay.paymentType}</span></td>
                                                        <td className="py-4 px-4">
                                                            <span className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-wider border ${pay.status === 'Paid' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                                                {pay.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-4 text-sm text-gray-400">{new Date(pay.paymentDate).toLocaleDateString('en-GB')}</td>
                                                        <td className="py-4 px-4 text-sm text-gray-500 max-w-[150px] truncate">{pay.description || '—'}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ============ LIVE MAP TAB ============ */}
                    {activeTab === 'Live Map' && (
                        <div className="space-y-6">
                            <div className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-xl">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold flex items-center gap-3">
                                            <FaSatellite className="text-cyan-400" /> Live Partner Tracking
                                        </h2>
                                        <p className="text-sm text-gray-500 mt-1">{partnerLocations.length} partners reporting location • Auto-refreshes every 30s</p>
                                    </div>
                                    <button onClick={fetchLocations} className="bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 flex items-center gap-2 rounded-xl text-sm font-bold transition-colors">
                                        <FaSyncAlt /> Refresh Now
                                    </button>
                                </div>

                                {partnerLocations.length === 0 ? (
                                    <EmptyState icon={<FaSatellite />} title="No Live Locations" desc="Partners will appear here once they log in to their dashboard. Their GPS is pushed every 60 seconds automatically." />
                                ) : (
                                    <div className="rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ height: '500px' }}>
                                        <MapContainer
                                            center={[partnerLocations[0]?.lat || 20.5937, partnerLocations[0]?.lng || 78.9629]}
                                            zoom={13}
                                            style={{ height: '100%', width: '100%' }}
                                            scrollWheelZoom={true}
                                        >
                                            <TileLayer
                                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                            />
                                            {partnerLocations.map(loc => {
                                                const minutesAgo = Math.round((Date.now() - new Date(loc.lastUpdated).getTime()) / 60000);
                                                const isStale = minutesAgo > 10;
                                                const icon = L.divIcon({
                                                    className: '',
                                                    html: `<div style="background:${isStale ? '#ef4444' : '#22c55e'};width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:14px;box-shadow:0 0 15px ${isStale ? 'rgba(239,68,68,0.5)' : 'rgba(34,197,94,0.5)'};border:3px solid white;">${loc.partnerId?.name?.charAt(0)?.toUpperCase() || '?'}</div>`,
                                                    iconSize: [36, 36],
                                                    iconAnchor: [18, 18]
                                                });
                                                return (
                                                    <Marker key={loc._id} position={[loc.lat, loc.lng]} icon={icon}>
                                                        <Popup>
                                                            <div style={{minWidth:'180px',fontFamily:'system-ui'}}>
                                                                <p style={{fontWeight:800,fontSize:'15px',margin:'0 0 4px'}}>{loc.partnerId?.name || 'Unknown'}</p>
                                                                <p style={{color:'#666',fontSize:'12px',margin:'0 0 2px'}}>{loc.partnerId?.phone || loc.partnerId?.email || ''}</p>
                                                                <hr style={{margin:'8px 0',border:'none',borderTop:'1px solid #eee'}}/>
                                                                <p style={{fontSize:'12px',margin:'0 0 2px'}}><b>Accuracy:</b> ±{Math.round(loc.accuracy || 0)}m</p>
                                                                <p style={{fontSize:'12px',margin:'0',color: isStale ? '#ef4444' : '#22c55e'}}><b>Updated:</b> {minutesAgo < 1 ? 'Just now' : `${minutesAgo} min ago`}</p>
                                                            </div>
                                                        </Popup>
                                                    </Marker>
                                                );
                                            })}
                                        </MapContainer>
                                    </div>
                                )}
                            </div>

                            {/* Location List Below Map */}
                            {partnerLocations.length > 0 && (
                                <div className="bg-[#111] border border-white/5 p-6 rounded-3xl shadow-xl">
                                    <h3 className="text-lg font-bold mb-4">Location Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {partnerLocations.map(loc => {
                                            const minutesAgo = Math.round((Date.now() - new Date(loc.lastUpdated).getTime()) / 60000);
                                            const isStale = minutesAgo > 10;
                                            return (
                                                <div key={loc._id} className="bg-[#1A1A1C] p-5 rounded-2xl border border-white/5 hover:border-white/15 transition-colors">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black text-white ${isStale ? 'bg-red-600' : 'bg-green-600'}`}>
                                                            {loc.partnerId?.name?.charAt(0)?.toUpperCase() || '?'}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-sm truncate">{loc.partnerId?.name}</h4>
                                                            <p className="text-[11px] text-gray-500">{loc.partnerId?.phone || loc.partnerId?.email}</p>
                                                        </div>
                                                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-black uppercase border ${isStale ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                                                            {isStale ? '⚠️ Stale' : '🟢 Live'}
                                                        </span>
                                                    </div>
                                                    <div className="space-y-2 text-xs text-gray-400">
                                                        <p><b className="text-gray-300">Coordinates:</b> {loc.lat.toFixed(6)}, {loc.lng.toFixed(6)}</p>
                                                        <p><b className="text-gray-300">Accuracy:</b> ±{Math.round(loc.accuracy || 0)}m</p>
                                                        <p><b className="text-gray-300">Last Updated:</b> <span className={isStale ? 'text-red-400' : 'text-green-400'}>{minutesAgo < 1 ? 'Just now' : `${minutesAgo} min ago`}</span></p>
                                                    </div>
                                                    <a href={`https://www.google.com/maps?q=${loc.lat},${loc.lng}`} target="_blank" rel="noreferrer" className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors">
                                                        <FaMapMarkerAlt /> Open in Google Maps
                                                    </a>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* ============ MODAL: INVITE PARTNER ============ */}
            <ModalWrapper isOpen={isInviteModalOpen} onClose={() => setIsInviteModalOpen(false)} title="Invite New Partner">
                <form onSubmit={handleInviteSubmit} className="p-6 space-y-4">
                    <InputField label="Full Name *" required type="text" value={inviteData.name} onChange={v => setInviteData({...inviteData, name: v})} placeholder="e.g. Raju Mistry" />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Phone *" required type="tel" value={inviteData.phone} onChange={v => setInviteData({...inviteData, phone: v})} placeholder="9876543210" />
                        <InputField label="Email" type="email" value={inviteData.email} onChange={v => setInviteData({...inviteData, email: v})} placeholder="optional@work.com" />
                    </div>
                    <InputField label="Temporary Password *" required minLength={6} type="text" value={inviteData.password} onChange={v => setInviteData({...inviteData, password: v})} placeholder="e.g. Secure@123" />
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Wage Type" value={inviteData.baseWageType} onChange={v => setInviteData({...inviteData, baseWageType: v})} options={[{v:'Daily',l:'Daily'},{v:'Per Task',l:'Per Task'},{v:'Fixed',l:'Fixed Monthly'}]} />
                        <InputField label="Base Wage (₹) *" required type="number" min="0" value={inviteData.baseWageAmount} onChange={v => setInviteData({...inviteData, baseWageAmount: v})} placeholder="500" />
                    </div>
                    <SubmitBtn loading={isInviting} icon={<FaUserPlus />} text="Confirm & Create Invite" />
                </form>
            </ModalWrapper>

            {/* ============ MODAL: ASSIGN TASK ============ */}
            <ModalWrapper isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Assign New Task">
                <form onSubmit={handleCreateTask} className="p-6 space-y-4">
                    <InputField label="Task Title *" required type="text" value={taskData.title} onChange={v => setTaskData({...taskData, title: v})} placeholder="e.g. Foundation Excavation" />
                    <div>
                        <label className="block text-sm text-gray-400 mb-1 font-medium">Description *</label>
                        <textarea required value={taskData.description} onChange={(e) => setTaskData({...taskData, description: e.target.value})} rows={3} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors resize-none text-sm" placeholder="Describe the task clearly..." />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <SelectField label="Assign to Partner *" required value={taskData.partnerId} onChange={v => setTaskData({...taskData, partnerId: v})} options={partners.map(p => ({v: p._id, l: p.name}))} placeholder="Select partner" />
                        <SelectField label="Priority" value={taskData.priority} onChange={v => setTaskData({...taskData, priority: v})} options={[{v:'Low',l:'Low'},{v:'Medium',l:'Medium'},{v:'High',l:'High'}]} />
                    </div>
                    <InputField label="Deadline *" required type="date" value={taskData.deadline} onChange={v => setTaskData({...taskData, deadline: v})} />
                    <SubmitBtn loading={isCreatingTask} icon={<FaTasks />} text="Assign Task" />
                </form>
            </ModalWrapper>

            {/* ============ MODAL: RECORD PAYMENT ============ */}
            <ModalWrapper isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Record Payment">
                <form onSubmit={handleRecordPayment} className="p-6 space-y-4">
                    <SelectField label="Partner *" required value={paymentData.partnerId} onChange={v => setPaymentData({...paymentData, partnerId: v})} options={partners.map(p => ({v: p._id, l: p.name}))} placeholder="Select partner" />
                    <div className="grid grid-cols-2 gap-4">
                        <InputField label="Amount (₹) *" required type="number" min="1" value={paymentData.amount} onChange={v => setPaymentData({...paymentData, amount: v})} placeholder="500" />
                        <SelectField label="Payment Type" value={paymentData.paymentType} onChange={v => setPaymentData({...paymentData, paymentType: v})} options={[{v:'Daily',l:'Daily'},{v:'Per Task',l:'Per Task'},{v:'Fixed',l:'Fixed'}]} />
                    </div>
                    <SelectField label="Status" value={paymentData.status} onChange={v => setPaymentData({...paymentData, status: v})} options={[{v:'Paid',l:'✅ Paid'},{v:'Pending',l:'🕒 Pending'}]} />
                    <InputField label="Note / Description" type="text" value={paymentData.description} onChange={v => setPaymentData({...paymentData, description: v})} placeholder="e.g. Weekly wage for site work" />
                    <SubmitBtn loading={isRecordingPayment} icon={<FaMoneyBillWave />} text="Record Payment" />
                </form>
            </ModalWrapper>

            {/* Custom Scrollbar Styles */}
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
};

// --- REUSABLE SUB-COMPONENTS ---

const StatCard = ({ title, value, icon, color }) => (
    <motion.div whileHover={{ y: -3 }} className="bg-[#111] border border-white/5 p-5 rounded-2xl flex items-center gap-4 hover:border-white/15 transition-all shadow-lg shadow-black/50 cursor-default">
        <div className={`w-12 h-12 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center text-xl`}>
            {icon}
        </div>
        <div>
            <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">{title}</p>
            <h3 className="text-xl font-black mt-0.5 tracking-tight">{value}</h3>
        </div>
    </motion.div>
);

const EmptyState = ({ icon, title, desc }) => (
    <div className="flex flex-col items-center justify-center text-center py-16 opacity-60">
        <div className="text-5xl mb-4 text-gray-500 opacity-30">{icon}</div>
        <h3 className="text-xl font-bold text-gray-300">{title}</h3>
        <p className="text-sm text-gray-500 mt-2 max-w-xs">{desc}</p>
    </div>
);

const ModalWrapper = ({ isOpen, onClose, title, children }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-[#111] border border-white/10 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden max-h-[90vh] overflow-y-auto">
                    <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#111] z-10">
                        <h2 className="text-xl font-bold">{title}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10">&times;</button>
                    </div>
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm text-gray-400 mb-1 font-medium">{label}</label>
        <input {...props} onChange={(e) => props.onChange(e.target.value)} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors text-sm" />
    </div>
);

const SelectField = ({ label, options, placeholder, ...props }) => (
    <div>
        <label className="block text-sm text-gray-400 mb-1 font-medium">{label}</label>
        <select {...props} onChange={(e) => props.onChange(e.target.value)} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500 transition-colors appearance-none text-sm">
            {placeholder && <option value="">{placeholder}</option>}
            {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
    </div>
);

const SubmitBtn = ({ loading, icon, text }) => (
    <button disabled={loading} type="submit" className="w-full mt-4 bg-white text-black font-bold py-3.5 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10 disabled:opacity-50">
        {loading ? 'Processing...' : <>{icon} {text}</>}
    </button>
);

export default ArchitectWorkforce;
