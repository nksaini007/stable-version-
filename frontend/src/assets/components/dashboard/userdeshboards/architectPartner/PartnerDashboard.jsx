import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../../../context/AuthContext';
import { FaClock, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaUpload } from 'react-icons/fa';

const PartnerDashboard = () => {
    const { token } = useContext(AuthContext);
    const [tasks, setTasks] = useState([]);
    const [attendance, setAttendance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    
    // Quick fetch functions
    const fetchTasks = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/architect-workforce/tasks', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) setTasks(res.data.tasks);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchAttendance = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const res = await axios.get(`http://localhost:5000/api/architect-workforce/attendance?date=${today}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
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

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [token]);

    const syncOfflineData = async () => {
        const offlineData = JSON.parse(localStorage.getItem('offlineAttendance')) || [];
        if (offlineData.length > 0 && token) {
            let syncedCount = 0;
            for (let record of offlineData) {
                try {
                    const endpoint = record.action === 'checkin' ? '/attendance/checkin' : '/attendance/checkout';
                    await axios.post(`http://localhost:5000/api/architect-workforce${endpoint}`, {
                        lat: record.lat, 
                        lng: record.lng, 
                        timestamp: record.timestamp
                    }, { headers: { Authorization: `Bearer ${token}` }});
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
                const res = await axios.post(`http://localhost:5000/api/architect-workforce${endpoint}`, {
                    lat: latitude, lng: longitude, timestamp
                }, { headers: { Authorization: `Bearer ${token}` }});
                
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
            const res = await axios.put(`http://localhost:5000/api/architect-workforce/task/${taskId}`, 
            { status },
            { headers: { Authorization: `Bearer ${token}` }});
            
            if (res.data.success) {
                fetchTasks(); // Refresh tasks
            }
        } catch (err) {
            console.error(err);
            alert('Error updating task');
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6">
            
            {/* Attendance Module */}
            <div className="bg-[#111] p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-xl font-bold">Today's Attendance</h2>
                        {!isOnline && <span className="text-xs bg-red-600 px-2 py-1 rounded text-white font-bold animate-pulse">OFFLINE MODE</span>}
                    </div>
                    <p className="text-gray-400 text-sm">Make sure you are at the site before checking in/out.</p>
                </div>

                <div className="flex gap-4 w-full md:w-auto">
                    {!attendance?.checkInTime ? (
                        <button 
                            disabled={loading}
                            onClick={() => handleAttendanceAction('checkin')}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold w-full md:w-auto transition-colors flex items-center justify-center gap-2"
                        >
                           {loading ? <FaSpinner className="animate-spin" /> : <FaMapMarkerAlt />} Check In
                        </button>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-4 items-center w-full">
                            <span className="text-green-400 bg-green-400/10 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                                <FaCheckCircle /> Checked In at {new Date(attendance.checkInTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                            
                            {!attendance?.checkOutTime && (
                                <button 
                                    disabled={loading}
                                    onClick={() => handleAttendanceAction('checkout')}
                                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-3 rounded-xl font-semibold w-full md:w-auto transition-colors flex items-center justify-center gap-2"
                                >
                                   {loading ? <FaSpinner className="animate-spin" /> : <FaSignOutAlt />} Check Out
                                </button>
                            )}
                            
                            {attendance?.checkOutTime && (
                                <span className="text-gray-400 bg-gray-400/10 px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
                                    <FaClock /> Checked Out at {new Date(attendance.checkOutTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Task Board */}
            <div className="bg-[#1A1A1C] p-6 rounded-2xl border border-white/5">
                <h2 className="text-xl font-bold mb-4">Assigned Tasks</h2>
                
                {tasks.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">No tasks currently assigned to you.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {tasks.map(task => (
                            <div key={task._id} className="bg-[#090909] p-5 rounded-xl border border-white/5">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-lg">{task.title}</h3>
                                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                                        task.priority === 'High' ? 'bg-red-500/20 text-red-500' : 
                                        task.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 
                                        'bg-blue-500/20 text-blue-500'
                                    }`}>
                                        {task.priority}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mb-4">{task.description}</p>
                                
                                <div className="text-xs text-gray-500 mb-4 flex items-center gap-2">
                                    <FaClock /> Deadline: {new Date(task.deadline).toLocaleDateString()}
                                </div>

                                {/* Status Toggle */}
                                <div className="flex items-center justify-between mt-auto border-t border-white/10 pt-4">
                                    <select 
                                        className="bg-[#1A1A1C] border border-white/10 text-sm rounded-lg px-3 py-2 text-white outline-none"
                                        value={task.status}
                                        onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                                        disabled={task.status === 'Completed'}
                                    >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Completed">Completed</option>
                                    </select>
                                    
                                    {task.status !== 'Completed' && (
                                        <button className="text-xs flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg font-medium transition-colors">
                                            <FaUpload /> Upload Proof
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
};

export default PartnerDashboard;
