import React, { useState, useEffect, useContext } from 'react';
import API from '../../../../api/api';
import { AuthContext } from '../../../../context/AuthContext';
import { FaClock, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaUpload, FaKey, FaSignOutAlt, FaCalendarCheck, FaHardHat, FaTasks } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

const PartnerDashboard = () => {
    const { user, token } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    // Password Update State
    const [isPwdModalOpen, setIsPwdModalOpen] = useState(false);
    const [isChangingPwd, setIsChangingPwd] = useState(false);
    const [pwdData, setPwdData] = useState({ currentPassword: '', newPassword: '' });
    
    // Quick fetch functions
    const fetchTasks = async () => {
        try {
            const res = await API.get('/architect-workforce/tasks');
            if (res.data.success) setTasks(res.data.tasks);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAttendance = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await API.get(`/architect-workforce/attendance?date=${today}`);
            // We only care if they checked in today
            if (res.data.success && res.data.logs.length > 0) {
                setAttendance(res.data.logs[0]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (token) {
            fetchTasks();
            fetchAttendance();
        }

        const handleOnline = () => {
            setIsOnline(true);
            syncOfflineData();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Run sync on initial load if online
        if (navigator.onLine) syncOfflineData();

        // --- CONTINUOUS GPS TRACKING via watchPosition ---
        // Uses the device's native continuous GPS stream for maximum accuracy.
        // Pushes to server at most once every 30 seconds to avoid flooding.
        let watchId = null;
        let lastPushTime = 0;

        if (navigator.geolocation && token) {
            watchId = navigator.geolocation.watchPosition(
                (pos) => {
                    const now = Date.now();
                    // Throttle: only push to server every 30 seconds
                    if (now - lastPushTime < 30000) return;
                    lastPushTime = now;

                    if (navigator.onLine) {
                        API.post('/architect-workforce/location', {
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude,
                            accuracy: pos.coords.accuracy
                        }).catch(() => {}); // Silent — never interrupt the user
                    }
                },
                () => {}, // Silently ignore errors
                {
                    enableHighAccuracy: true,  // Force GPS hardware, not cell towers
                    timeout: 20000,
                    maximumAge: 0              // Never use cached position — always fresh
                }
            );
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [token]);

    const syncOfflineData = async () => {
        const offlineData = JSON.parse(localStorage.getItem('offlineAttendance')) || [];
        if (offlineData.length > 0 && token) {
            let syncedCount = 0;
            for (let record of offlineData) {
                try {
                    const endpoint = record.action === 'checkin' ? '/attendance/checkin' : '/attendance/checkout';
                    await API.post(`/architect-workforce${endpoint}`, {
                        lat: record.lat, 
                        lng: record.lng, 
                        timestamp: record.timestamp
                    });
                    syncedCount++;
                } catch (e) {
                    console.error('Sync error', e);
                }
            }
            if (syncedCount === offlineData.length) {
                localStorage.removeItem('offlineAttendance');
            } else {
                // Keep the ones that failed
                localStorage.setItem('offlineAttendance', JSON.stringify(offlineData.slice(syncedCount)));
            }
            fetchAttendance();
            alert(`${syncedCount} offline attendance records synced successfully!`);
        }
    };

    const handleAttendanceAction = (action) => {
        if(!navigator.geolocation) return alert('Geolocation is not supported by your browser');
        
        setLoading(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            const timestamp = new Date().toISOString();

            if (!isOnline) {
                const offlineData = JSON.parse(localStorage.getItem('offlineAttendance')) || [];
                offlineData.push({ action, lat: latitude, lng: longitude, timestamp });
                localStorage.setItem('offlineAttendance', JSON.stringify(offlineData));

                if (action === 'checkin') {
                    setAttendance(prev => ({ ...prev, checkInTime: timestamp }));
                } else {
                    setAttendance(prev => ({ ...prev, checkOutTime: timestamp }));
                }
                
                alert(`You are offline. ${action === 'checkin' ? 'Check-In' : 'Check-Out'} logged locally and will automatically sync when connection is restored!`);
                setLoading(false);
                return;
            }

            try {
                const endpoint = action === 'checkin' ? '/attendance/checkin' : '/attendance/checkout';
                const res = await API.post(`/architect-workforce${endpoint}`, {
                    lat: latitude, lng: longitude, timestamp
                });
                
                if (res.data.success) {
                    alert(`${action === 'checkin' ? 'Checked In' : 'Checked Out'} Successfully!`);
                    fetchAttendance();
                }
            } catch (err) {
                console.error(err);
                alert(err.response?.data?.message || 'Error processing attendance');
            } finally {
                setLoading(false);
            }
        }, (error) => {
            let msg = 'Unable to retrieve your location.';
            if (error.code === 1) msg = 'Location Permission Denied. Please enable GPS permissions for this site.';
            else if (error.code === 2) msg = 'Location Unavailable (Poor GPS Signal). Move to an open area.';
            else if (error.code === 3) msg = 'Location Request Timed Out. Try again.';
            alert(msg);
            setLoading(false);
        }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }); // High-Accuracy strict parameters against spoofing
    };

    const updateTaskStatus = async (taskId, status) => {
        try {
            const res = await API.put(`/architect-workforce/task/${taskId}`, 
            { status });
            
            if (res.data.success) {
                fetchTasks(); // Refresh tasks
            }
        } catch (err) {
            console.error(err);
            alert('Error updating task');
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setIsChangingPwd(true);
        try {
            await API.put('/users/me/password', pwdData);
            alert('Password updated successfully!');
            setIsPwdModalOpen(false);
            setPwdData({ currentPassword: '', newPassword: '' });
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to change password');
        } finally {
            setIsChangingPwd(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 relative min-h-screen bg-[#090909] text-white">
            
            {/* Premium Header Banner */}
            <motion.div 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-[#1A1A1C] to-[#111] p-6 md:p-10 rounded-3xl border border-white/5 shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <FaHardHat className="text-3xl text-yellow-500" />
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Partner'}</span>
                            </h1>
                        </div>
                        <p className="text-gray-400 font-medium tracking-wide">Ready to log your site attendance and crush today's tasks?</p>
                    </div>
                    
                    <button onClick={() => setIsPwdModalOpen(true)} className="group flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-lg backdrop-blur-sm self-start md:self-auto">
                        <FaKey className="text-gray-400 group-hover:text-blue-400 transition-colors" /> Set Personal Password
                    </button>
                </div>
            </motion.div>
            
            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                
                {/* Left Column: Digital Punch Clock & Offline Warnings */}
                <div className="col-span-1 lg:col-span-4 space-y-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        className="bg-[#111] p-6 md:p-8 rounded-3xl border border-white/5 shadow-xl relative overflow-hidden h-full flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-500/20 rounded-xl">
                                    <FaCalendarCheck className="text-xl text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold">Punch Card</h2>
                                    <p className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                                </div>
                            </div>
                            {!isOnline && (
                                <span className="text-[10px] bg-red-500/20 text-red-500 px-3 py-1 rounded-full font-black animate-pulse border border-red-500/50">
                                    🔴 OFFLINE
                                </span>
                            )}
                        </div>

                        {!attendance?.checkInTime ? (
                            <div className="text-center mt-auto mb-auto">
                                <div className="inline-block relative w-full max-w-xs mx-auto">
                                    <div className="absolute inset-0 bg-green-500 rounded-3xl blur-xl opacity-20 animate-pulse" />
                                    <button 
                                        disabled={loading}
                                        onClick={() => handleAttendanceAction('checkin')}
                                        className="relative bg-gradient-to-b from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white w-full px-8 py-5 rounded-3xl font-black text-xl shadow-[0_10px_40px_rgba(34,197,94,0.3)] hover:shadow-[0_10px_50px_rgba(34,197,94,0.5)] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                       {loading ? <FaSpinner className="animate-spin text-2xl" /> : <><FaMapMarkerAlt className="text-2xl" /> PUNCH IN (GPS)</>}
                                    </button>
                                </div>
                                <p className="text-[11px] text-gray-500 mt-6 font-semibold uppercase tracking-widest">Verify your location before punching in.</p>
                            </div>
                        ) : (
                            <div className="space-y-4 mt-auto">
                                {/* Success Status */}
                                <div className="bg-green-500/10 border border-green-500/20 p-5 rounded-2xl flex items-center justify-between shadow-inner">
                                    <div className="flex items-center gap-4">
                                        <FaCheckCircle className="text-green-500 text-2xl" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Checked In</p>
                                            <p className="font-black text-green-400 text-lg">{new Date(attendance.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                {!attendance?.checkOutTime ? (
                                    <div className="pt-4 mt-4 border-t border-white/5">
                                        <button 
                                            disabled={loading}
                                            onClick={() => handleAttendanceAction('checkout')}
                                            className="bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 text-red-500 hover:text-white w-full px-6 py-4 rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-3 group"
                                        >
                                           {loading ? <FaSpinner className="animate-spin text-xl" /> : <><FaSignOutAlt className="text-xl group-hover:scale-110 transition-transform" /> PUNCH OUT</>}
                                        </button>
                                        <p className="text-[10px] text-gray-500 mt-4 text-center font-bold uppercase tracking-wider">Don't forget to punch out before leaving the site!</p>
                                    </div>
                                ) : (
                                    <div className="bg-gray-500/10 border border-gray-500/20 p-5 rounded-2xl flex items-center gap-4 shadow-inner">
                                        <FaClock className="text-gray-400 text-2xl" />
                                        <div>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Checked Out</p>
                                            <p className="font-black text-gray-300 text-lg">{new Date(attendance.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Right Column: Dynamic Task Board */}
                <div className="col-span-1 lg:col-span-8">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-[#111] p-6 md:p-8 rounded-3xl border border-white/5 shadow-xl h-full flex flex-col"
                    >
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <span className="bg-white/5 p-2.5 rounded-xl border border-white/10"><FaTasks className="text-purple-400" /></span> Task Board
                            </h2>
                            <span className="bg-[#1A1A1C] px-4 py-1.5 rounded-full text-sm font-bold border border-white/10 text-gray-300">
                                {tasks.filter(t => t.status !== 'Completed').length} Active
                            </span>
                        </div>
                        
                        {tasks.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-50">
                                <FaCheckCircle className="text-5xl mb-4 text-gray-500 opacity-30" />
                                <h3 className="text-xl font-bold text-gray-300">No Tasks Assigned</h3>
                                <p className="text-sm mt-2">You're all caught up for now.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {tasks.map((task, index) => (
                                        <motion.div 
                                            key={task._id}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.1 * index }}
                                            whileHover={{ y: -4 }}
                                            className={`bg-[#1A1A1C] p-6 rounded-2xl border transition-all ${task.status === 'Completed' ? 'border-green-500/20 opacity-60' : 'border-white/5 hover:border-white/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:bg-[#1f1f22]'}`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <h3 className="font-bold text-lg leading-tight line-clamp-2 pr-2">{task.title}</h3>
                                                <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-md shrink-0 border tracking-wider ${
                                                    task.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                                                    task.priority === 'Medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                }`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-6 bg-black/30 p-4 rounded-xl border border-white/5">{task.description}</p>
                                            
                                            <div className="flex items-center justify-between text-[11px] uppercase tracking-widest text-gray-500 mb-6 font-bold">
                                                <span className="flex items-center gap-1.5 bg-black/50 px-3 py-1.5 rounded-lg border border-white/5"><FaClock className="text-blue-400" /> Due: {new Date(task.deadline).toLocaleDateString('en-GB')}</span>
                                            </div>

                                            {/* Status Controller */}
                                            <div className="flex items-center justify-between pt-4 border-t border-white/5 gap-3">
                                                <select 
                                                    className="flex-1 bg-black/50 border border-white/10 text-xs font-bold uppercase tracking-wider rounded-xl px-4 py-3 text-white outline-none appearance-none focus:border-blue-500 hover:border-white/20 transition-colors shadow-inner cursor-pointer"
                                                    value={task.status}
                                                    onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                                                    disabled={task.status === 'Completed'}
                                                >
                                                    <option value="Pending">🕒 Pending</option>
                                                    <option value="In Progress">🚀 In Progress</option>
                                                    <option value="Completed">✅ Completed</option>
                                                </select>
                                                
                                                {task.status !== 'Completed' && (
                                                    <button className="text-xs flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-500 px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20">
                                                        <FaUpload /> Proof
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>

            {/* Change Password Modal */}
            <AnimatePresence>
                {isPwdModalOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div 
                            initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-[#111] border border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-xl font-bold">Update Password</h2>
                                <button onClick={() => setIsPwdModalOpen(false)} className="text-gray-400 hover:text-white transition-colors text-2xl leading-none">
                                    &times;
                                </button>
                            </div>
                            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Temporary Current Password</label>
                                    <input required type="text" value={pwdData.currentPassword} onChange={(e) => setPwdData({...pwdData, currentPassword: e.target.value})} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors" placeholder="Enter current password" />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">New Personal Password</label>
                                    <input required minLength={6} type="text" value={pwdData.newPassword} onChange={(e) => setPwdData({...pwdData, newPassword: e.target.value})} className="w-full bg-[#1A1A1C] border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 transition-colors" placeholder="Enter new password" />
                                </div>
                                <button disabled={isChangingPwd} type="submit" className="w-full mt-4 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                                    {isChangingPwd ? 'Updating...' : <><FaKey /> Save Password</>}
                                </button>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #555; }
            `}</style>
        </div>
    );
};

export default PartnerDashboard;
