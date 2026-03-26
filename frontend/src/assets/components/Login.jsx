import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";
import { toast } from "react-toastify";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [maintenance, setMaintenance] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await API.post(`/users/login`, {
        email, password 
      });
      const data = res.data;

      if (data.user.role === "admin") {
        setMaintenance(true);
        return;
      }

      const redirectPath = login(data.user, data.token);
      toast.success("Welcome Back!");
      navigate(redirectPath);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4 font-sans text-white">
      <div className="w-full max-w-sm flex flex-col">
        {maintenance ? (
          <div className="text-center py-20">
            <h1 className="text-3xl font-black mb-4">SITE NOT WORKING</h1>
            <p className="text-gray-500 text-sm tracking-widest uppercase">Undergoing critical maintenance</p>
            <button onClick={() => setMaintenance(false)} className="mt-8 text-xs text-gray-600 hover:text-white transition-colors">Return to Safety</button>
          </div>
        ) : (
          <>
            {/* Back Button */}
        <button type="button" onClick={() => navigate(-1)} className="self-start text-gray-400 hover:text-white mb-8 text-sm tracking-wide transition-colors">
          Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight">Welcome Back</h1>
          <p className="text-sm text-gray-400 mt-1.5">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col">
            <input 
              type="email" 
              placeholder="Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-md px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />
          </div>
          <div className="flex flex-col">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[#1A1A1A] border border-[#2A2A2A] rounded-md px-4 py-3.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
            />
          </div>

          {/* Links */}
          <div className="flex justify-end mt-1">
            <Link to="/forgot-password" className="text-xs text-gray-400 hover:text-white transition-colors">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-[#F3F4F6] text-black font-medium text-sm rounded-md py-3.5 mt-4 hover:bg-white transition-colors disabled:opacity-50 flex justify-center items-center"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <hr className="flex-1 border-[#2A2A2A]" />
          <span className="px-4 text-xs text-gray-500">or</span>
          <hr className="flex-1 border-[#2A2A2A]" />
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-white hover:underline transition-all">Sign Up</Link>
        </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
