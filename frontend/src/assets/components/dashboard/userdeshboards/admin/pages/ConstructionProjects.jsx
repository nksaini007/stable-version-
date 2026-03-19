import React, { useState, useEffect, useContext } from "react";
import API from "../../../../../api/api";
import { AuthContext } from "../../../../../context/AuthContext";
import { toast } from "react-toastify";
import { FaPlus, FaEye, FaTasks, FaHardHat, FaTimes } from "react-icons/fa";
import { Link } from "react-router-dom";

const ConstructionProjects = () => {
    const { token } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        type: "House",
        description: "",
        location: "",
        estimatedCost: "",
        startDate: "",
        endDate: "",
    });

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const res = await API.get("/construction/projects");
            setProjects(res.data.projects);
        } catch (error) {
            toast.error("Failed to load projects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [token]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post(
                "/construction/project",
                formData
            );
            toast.success("Project created successfully");
            setShowModal(false);
            setFormData({
                name: "",
                type: "House",
                description: "",
                location: "",
                estimatedCost: "",
                startDate: "",
                endDate: "",
            });
            fetchProjects();
        } catch (error) {
            toast.error(error.response?.data?.message || "Error creating project");
        }
    };

    const statusColor = (status) => {
        const map = {
            "Completed": "bg-green-50 text-green-700 border-green-200",
            "In Progress": "bg-blue-50 text-blue-700 border-blue-200",
            "Planning": "bg-amber-50 text-amber-700 border-amber-200",
            "On Hold": "bg-orange-50 text-orange-700 border-orange-200",
        };
        return map[status] || "bg-gray-50 text-gray-700 border-gray-200";
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Construction Projects</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage and track all construction projects.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-sm transition flex items-center gap-2"
                    >
                        <FaPlus className="text-xs" /> New Project
                    </button>
                    <div className="flex items-center gap-2 text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
                        <span className="font-bold text-gray-800">{projects.length}</span> Projects
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="p-8 text-center text-gray-500">Loading projects...</div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 border-b border-gray-100 text-gray-600">
                                <tr>
                                    <th className="px-6 py-4 font-semibold">Project Name</th>
                                    <th className="px-6 py-4 font-semibold">Type</th>
                                    <th className="px-6 py-4 font-semibold hidden md:table-cell">Location</th>
                                    <th className="px-6 py-4 font-semibold text-center">Status</th>
                                    <th className="px-6 py-4 font-semibold text-center">Progress</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {projects.length > 0 ? (
                                    projects.map((project) => (
                                        <tr key={project._id} className="hover:bg-gray-50/50 transition">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-gray-800">{project.name}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">₹{Number(project.estimatedCost || 0).toLocaleString()}</p>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1 text-gray-600">
                                                    <FaHardHat className="text-gray-400 text-xs" /> {project.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 hidden md:table-cell text-gray-600">{project.location}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColor(project.status)}`}>
                                                    {project.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="w-20 bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-500 h-2 rounded-full transition-all"
                                                            style={{ width: `${project.progressPercentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-xs font-semibold text-gray-500">{project.progressPercentage}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to={`/admin/construction/${project._id}`}
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition"
                                                >
                                                    <FaEye /> Manage
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                            <FaHardHat className="text-4xl mx-auto mb-3 text-gray-200" />
                                            <p className="font-semibold text-gray-500">No construction projects found</p>
                                            <p className="text-xs text-gray-400 mt-1">Click "New Project" to get started.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Add Project Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
                        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg text-gray-800">Add Construction Project</h3>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-red-500"><FaTimes size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-blue-400 focus:ring-0 outline-none" placeholder="E.g. Riverside Villa" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select required name="type" value={formData.type} onChange={handleChange} className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-blue-400 focus:ring-0 outline-none">
                                        <option value="House">House</option>
                                        <option value="Building">Building</option>
                                        <option value="Apartment">Apartment</option>
                                        <option value="Cricket Stadium">Cricket Stadium</option>
                                        <option value="Commercial Project">Commercial Project</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Cost (₹)</label>
                                    <input required type="number" name="estimatedCost" value={formData.estimatedCost} onChange={handleChange} className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-blue-400 focus:ring-0 outline-none" placeholder="500000" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea required name="description" value={formData.description} onChange={handleChange} rows="3" className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-blue-400 focus:ring-0 outline-none" placeholder="Describe the project"></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input required type="text" name="location" value={formData.location} onChange={handleChange} className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-blue-400 focus:ring-0 outline-none" placeholder="City, State" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                    <input required type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-blue-400 focus:ring-0 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                    <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="w-full border-2 border-gray-200 p-2.5 rounded-xl focus:border-blue-400 focus:ring-0 outline-none" />
                                </div>
                            </div>
                            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold mt-4 transition">
                                Create Project
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConstructionProjects;
