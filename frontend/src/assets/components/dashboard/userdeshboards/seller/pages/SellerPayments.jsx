import React, { useState, useEffect, useContext, useRef } from "react";
import {
    FaPrint, FaDownload, FaFilter, FaMoneyBillWave,
    FaChartLine, FaShoppingCart, FaBullhorn, FaCalendarAlt,
    FaCheckCircle, FaTimesCircle, FaFileInvoice,
} from "react-icons/fa";
import axios from "axios";
import { AuthContext } from "../../../../../context/AuthContext";

const API = import.meta.env.VITE_API_URL || "";

export default function SellerPayments() {
    const { token, user } = useContext(AuthContext);
    const [tab, setTab] = useState("overview");
    const [revenue, setRevenue] = useState(null);
    const [statement, setStatement] = useState(null);
    const [loading, setLoading] = useState(false);
    const [from, setFrom] = useState(() => {
        const d = new Date(); d.setMonth(d.getMonth() - 1);
        return d.toISOString().split("T")[0];
    });
    const [to, setTo] = useState(() => new Date().toISOString().split("T")[0]);
    const printRef = useRef();
    const headers = { Authorization: `Bearer ${token}` };

    useEffect(() => { fetchRevenue(); }, []);

    const fetchRevenue = async () => {
        try {
            const { data } = await axios.get(`${API}/api/payments/seller/revenue`, { headers });
            setRevenue(data);
        } catch { }
    };

    const fetchStatement = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/api/payments/seller/statement?from=${from}&to=${to}`, { headers });
            setStatement(data);
        } catch (err) {
            console.error(err);
        } finally { setLoading(false); }
    };

    const handlePrint = () => {
        const printContent = printRef.current?.innerHTML;
        if (!printContent) return;
        const win = window.open("", "_blank", "width=800,height=900");
        win.document.write(`<!DOCTYPE html><html><head>
      <title>Stinchar Seller Statement</title>
      <style>
        body { font-family: Arial, sans-serif; color: #111; margin: 0; padding: 20px; font-size: 13px; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 3px solid #f97316; padding-bottom: 16px; margin-bottom: 20px; }
        .logo { font-size: 24px; font-weight: 900; color: #f97316; letter-spacing: 3px; }
        .subtitle { color: #666; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
        .seller-block { background: #f8f8f8; border-radius: 8px; padding: 12px 16px; margin-bottom: 16px; }
        .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
        .summary-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; text-align: center; }
        .summary-card .val { font-size: 20px; font-weight: 900; }
        .summary-card .lbl { color: #666; font-size: 10px; text-transform: uppercase; margin-top: 4px; }
        .net .val { color: #16a34a; }
        .commission .val { color: #dc2626; }
        .adspend .val { color: #d97706; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { background: #f97316; color: white; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
        td { padding: 8px 10px; border-bottom: 1px solid #f3f4f6; }
        tr:nth-child(even) td { background: #fafafa; }
        .sale { color: #16a34a; }
        .ad { color: #dc2626; }
        .footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #e5e7eb; font-size: 10px; color: #999; text-align: center; }
        @media print { body { margin: 0; } }
      </style>
    </head><body>${printContent}</body></html>`);
        win.document.close();
        win.focus();
        setTimeout(() => { win.print(); }, 500);
    };

    const printableStatement = statement ? `
    <div class="header">
      <div>
        <div class="logo">STINCHAR</div>
        <div class="subtitle">Seller Payment Statement</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700;">Generated: ${new Date().toLocaleDateString("en-IN")}</div>
        <div style="color:#666; font-size:11px;">Period: ${statement.period.from || "All"} to ${statement.period.to || "All"}</div>
      </div>
    </div>
    <div class="seller-block">
      <strong>Seller:</strong> ${user?.name || ""}&nbsp;&nbsp;|&nbsp;&nbsp;<strong>Email:</strong> ${user?.email || ""}&nbsp;&nbsp;|&nbsp;&nbsp;<strong>Business:</strong> ${user?.businessName || "—"}
    </div>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="val" style="color:#1e40af;">₹${statement.summary.grossSales?.toLocaleString()}</div>
        <div class="lbl">Gross Sales</div>
      </div>
      <div class="summary-card commission">
        <div class="val">-₹${statement.summary.platformCommission?.toLocaleString()}</div>
        <div class="lbl">Platform Commission (2%)</div>
      </div>
      <div class="summary-card adspend">
        <div class="val">-₹${statement.summary.adSpend?.toLocaleString()}</div>
        <div class="lbl">Ad Spend</div>
      </div>
    </div>
    <div class="summary-grid" style="grid-template-columns:1fr;">
      <div class="summary-card net">
        <div class="val">₹${statement.summary.netEarnings?.toLocaleString()}</div>
        <div class="lbl">Net Earnings (Gross – Commission – Ad Spend)</div>
      </div>
    </div>
    <h3 style="font-size:13px; font-weight:700; margin-bottom:8px;">Transaction Ledger</h3>
    <table>
      <tr><th>Date</th><th>Type</th><th>Description</th><th>Qty</th><th>Amount</th><th>Status</th></tr>
      ${statement.transactions.map((t) => `
        <tr>
          <td>${new Date(t.date).toLocaleDateString("en-IN")}</td>
          <td>${t.type === "sale" ? "Sale" : "Ad Spend"}</td>
          <td>${t.type === "sale" ? t.customer + " – " + (t.items?.map((i) => i.name).join(", ") || "") : t.campaignTitle}</td>
          <td>${t.type === "sale" ? (t.items?.reduce((s, i) => s + i.qty, 0) || "—") : "—"}</td>
          <td class="${t.type === "sale" ? "sale" : "ad"}">₹${Math.abs(t.amount)?.toLocaleString()}</td>
          <td>${t.type === "sale" ? (t.isPaid ? "Paid" : "Unpaid") : "Deducted"}</td>
        </tr>`).join("")}
    </table>
    <div class="footer">
      This is an auto-generated statement from Stinchar Platform. For disputes, contact support@stinchar.com · Total Orders: ${statement.summary.totalOrders} · Items Sold: ${statement.summary.totalItemsSold}
    </div>
  ` : "";

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-black text-gray-300 flex items-center gap-3">
                    <FaMoneyBillWave className="text-orange-400" /> Payments & Statement
                </h1>
                <p className="text-gray-400 text-sm mt-1">Track your earnings and download financial statements</p>
            </div>

            {/* Overview Stats */}
            {revenue && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: "Total Sales", val: `₹${revenue.totalSales?.toFixed(2)}`, icon: <FaShoppingCart />, color: "from-orange-500 to-amber-500" },
                        { label: "Paid Revenue", val: `₹${revenue.paidSales?.toFixed(2)}`, icon: <FaCheckCircle />, color: "from-green-500 to-emerald-500" },
                        { label: "Pending", val: `₹${revenue.pendingSales?.toFixed(2)}`, icon: <FaTimesCircle />, color: "from-yellow-500 to-orange-500" },
                        { label: "Items Sold", val: revenue.totalItemsSold, icon: <FaChartLine />, color: "from-blue-500 to-cyan-500" },
                    ].map((s, i) => (
                        <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl p-4">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-gray-300 mb-3`}>{s.icon}</div>
                            <p className="text-2xl font-black text-gray-300">{s.val}</p>
                            <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-2 bg-white/[0.03] border border-white/5 p-1 rounded-xl w-fit">
                {[["overview", "Overview"], ["statement", "Statement"]].map(([k, l]) => (
                    <button key={k} onClick={() => setTab(k)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === k ? "bg-orange-500 text-gray-300 shadow" : "text-gray-400 hover:text-gray-300"}`}>
                        {l}
                    </button>
                ))}
            </div>

            {/* OVERVIEW */}
            {tab === "overview" && revenue && (
                <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
                    <h3 className="text-gray-300 font-bold mb-4">Monthly Revenue</h3>
                    <div className="space-y-3">
                        {revenue.monthlyChart?.length === 0 && <p className="text-gray-500 text-sm">No data yet</p>}
                        {revenue.monthlyChart?.map((m, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="text-gray-400 text-sm w-16">{m.month}</span>
                                <div className="flex-1 bg-white/5 rounded-full h-2 overflow-hidden">
                                    <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                                        style={{ width: `${Math.min(100, (m.amount / (revenue.totalSales || 1)) * 100)}%` }} />
                                </div>
                                <span className="text-orange-400 font-bold text-sm w-24 text-right">₹{m.amount?.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* STATEMENT */}
            {tab === "statement" && (
                <div className="space-y-5">
                    {/* Filters */}
                    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">From Date</label>
                            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-orange-500/50" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1 block">To Date</label>
                            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-gray-300 text-sm focus:outline-none focus:border-orange-500/50" />
                        </div>
                        <button onClick={fetchStatement} disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-gray-300 font-bold rounded-xl text-sm transition-all disabled:opacity-60">
                            <FaFilter /> {loading ? "Loading..." : "Generate Statement"}
                        </button>
                        {statement && (
                            <button onClick={handlePrint}
                                className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-gray-300 font-bold rounded-xl text-sm transition-all">
                                <FaPrint /> Print Statement
                            </button>
                        )}
                    </div>

                    {statement && (
                        <>
                            {/* Summary Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                                {[
                                    { label: "Gross Sales", val: `₹${statement.summary.grossSales?.toLocaleString()}`, color: "text-blue-400" },
                                    { label: "Platform (2%)", val: `-₹${statement.summary.platformCommission?.toLocaleString()}`, color: "text-red-400" },
                                    { label: "Ad Spend", val: `-₹${statement.summary.adSpend?.toLocaleString()}`, color: "text-yellow-400" },
                                    { label: "Net Earnings", val: `₹${statement.summary.netEarnings?.toLocaleString()}`, color: "text-green-400 font-black" },
                                    { label: "Orders", val: statement.summary.totalOrders, color: "text-gray-300" },
                                    { label: "Items Sold", val: statement.summary.totalItemsSold, color: "text-gray-300" },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-4 text-center">
                                        <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                                        <p className="text-gray-400 text-xs mt-1">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Transactions Table */}
                            <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                                <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                                    <h3 className="text-gray-300 font-bold flex items-center gap-2"><FaFileInvoice className="text-orange-400" /> Transaction Ledger</h3>
                                    <span className="text-gray-400 text-sm">{statement.transactions.length} entries</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-white/[0.02]">
                                                {["Date", "Type", "Description", "Amount", "Status"].map((h) => (
                                                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statement.transactions.map((t, i) => (
                                                <tr key={i} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                                                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                                                        {new Date(t.date).toLocaleDateString("en-IN")}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${t.type === "sale" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                                                            {t.type === "sale" ? "SALE" : "AD SPEND"}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-gray-300 max-w-xs">
                                                        {t.type === "sale"
                                                            ? <span>{t.customer} — {t.items?.slice(0, 2).map((i) => i.name).join(", ")}{t.items?.length > 2 ? ` +${t.items.length - 2}` : ""}</span>
                                                            : <span>{t.campaignTitle}<span className="text-gray-500 text-xs ml-2">({t.adType})</span></span>
                                                        }
                                                    </td>
                                                    <td className={`px-4 py-3 font-bold ${t.type === "sale" ? "text-green-400" : "text-red-400"}`}>
                                                        {t.type === "sale" ? "+" : ""}₹{Math.abs(t.amount)?.toLocaleString()}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {t.type === "sale"
                                                            ? <span className={`text-xs font-semibold ${t.isPaid ? "text-green-400" : "text-yellow-400"}`}>{t.isPaid ? "Paid" : "Pending"}</span>
                                                            : <span className="text-xs font-semibold text-gray-400">Deducted</span>
                                                        }
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Hidden printable version */}
                            <div ref={printRef} className="hidden" dangerouslySetInnerHTML={{ __html: printableStatement }} />
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
