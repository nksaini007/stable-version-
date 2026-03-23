import React, { useState } from "react";
import API from "../../../../../api/api";
import { FaDatabase, FaPlay, FaCode } from "react-icons/fa";

const AdminCustomQuery = () => {
  const [collection, setCollection] = useState("users");
  const [filterStr, setFilterStr] = useState("{}");
  const [projectionStr, setProjectionStr] = useState("{}");
  const [sortStr, setSortStr] = useState('{"createdAt": -1}');
  const [limit, setLimit] = useState(50);
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRunQuery = async () => {
    setLoading(true);
    setError("");
    setResults(null);
    try {
      const filter = JSON.parse(filterStr);
      const projection = JSON.parse(projectionStr);
      const sort = JSON.parse(sortStr);

      const res = await API.post("/query/custom", {
        collection,
        filter,
        projection,
        sort,
        limit: Number(limit)
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      if (err.name === "SyntaxError") {
        setError("Invalid JSON format in inputs. Please wrap keys in double quotes.");
      } else {
        setError(err.response?.data?.message || err.message || "Failed to run query");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8">
      <div className="flex items-center gap-3">
        <FaDatabase className="text-2xl text-indigo-500" />
        <div>
          <h1 className="text-2xl font-bold text-white">Custom Query Engine</h1>
          <p className="text-sm text-[#8E929C] mt-1">Execute safe read-only MongoDB queries directly</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-1 bg-[#1A1B1E] border border-[#2A2B2F] rounded-xl p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#8E929C] mb-1">Target Collection</label>
            <input 
              type="text" 
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
              placeholder="e.g. users, orders, products"
              className="w-full bg-[#121212] border border-[#2A2B2F] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E929C] mb-1">Filter (JSON)</label>
            <textarea 
              value={filterStr}
              onChange={(e) => setFilterStr(e.target.value)}
              className="w-full h-24 bg-[#121212] border border-[#2A2B2F] rounded-lg px-3 py-2 text-sm font-mono text-green-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#8E929C] mb-1">Projection (JSON)</label>
            <textarea 
              value={projectionStr}
              onChange={(e) => setProjectionStr(e.target.value)}
              className="w-full h-16 bg-[#121212] border border-[#2A2B2F] rounded-lg px-3 py-2 text-sm font-mono text-amber-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#8E929C] mb-1">Sort (JSON)</label>
              <input 
                type="text" 
                value={sortStr}
                onChange={(e) => setSortStr(e.target.value)}
                className="w-full bg-[#121212] border border-[#2A2B2F] rounded-lg px-3 py-2 text-sm font-mono text-blue-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#8E929C] mb-1">Limit</label>
              <input 
                type="number" 
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="w-full bg-[#121212] border border-[#2A2B2F] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button 
            onClick={handleRunQuery}
            disabled={loading}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-600/50 text-white font-bold py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <FaPlay className="text-xs" />
            )}
            Run Query
          </button>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-xs leading-5 text-red-400 font-semibold break-words">
              {error}
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2 bg-[#1A1B1E] border border-[#2A2B2F] rounded-xl flex flex-col min-h-[500px]">
          <div className="p-4 border-b border-[#2A2B2F] flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FaCode className="text-[#8E929C]" /> JSON Output
            </h2>
            {results && (
              <span className="text-xs font-bold px-2.5 py-1 bg-green-500/10 text-green-400 rounded border border-green-500/20">
                {results.count} results found
              </span>
            )}
          </div>
          <div className="flex-1 p-0 overflow-hidden relative">
            {results ? (
              <div className="absolute inset-0 overflow-auto p-4 custom-scrollbar">
                <pre className="text-[13px] font-mono leading-relaxed text-[#c3e88d] whitespace-pre-wrap">
                  {JSON.stringify(results.results, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[#8E929C] text-sm">
                Run a query to see results here.
              </div>
            )}
          </div>
        </div>
      </div>
      <style>
        {`
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #1A1B1E;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #3A3B3F;
            border-radius: 3px;
          }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background: #4A4B4F;
          }
        `}
      </style>
    </div>
  );
};

export default AdminCustomQuery;
