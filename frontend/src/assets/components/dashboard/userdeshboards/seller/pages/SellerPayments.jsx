import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../../../../../context/AuthContext";
import { LanguageContext } from "../../../context/LanguageContext";
import { translations } from "../../../translations";
import {
    FaPrint, FaDownload, FaFilter, FaMoneyBillWave,
    FaChartLine, FaShoppingCart, FaBullhorn, FaCalendarAlt,
    FaCheckCircle, FaTimesCircle, FaFileInvoice, FaArrowUp, FaArrowDown
} from "react-icons/fa";
import API from "../../../../../api/api";

export default function SellerPayments() {
    const { token, user } = useContext(AuthContext);
    const { language } = useContext(LanguageContext);
    const t = translations[language] || translations.en;
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

    useEffect(() => { fetchRevenue(); }, []);

    const fetchRevenue = async () => {
        try {
            const { data } = await API.get(`/payments/seller/revenue`);
            setRevenue(data);
        } catch { }
    };

    const fetchStatement = async () => {
        setLoading(true);
        try {
            const { data } = await API.get(`/payments/seller/statement?from=${from}&to=${to}`);
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
        body { font-family: 'Inter', sans-serif; color: #111; margin: 0; padding: 40px; font-size: 13px; line-height: 1.6; }
        .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 24px; margin-bottom: 30px; }
        .logo { font-size: 28px; font-weight: 900; color: #000; letter-spacing: -1px; }
        .subtitle { color: #666; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-top: 4px; }
        .seller-block { background: #f9f9f9; border: 1px solid #eee; border-radius: 12px; padding: 20px; margin-bottom: 24px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .seller-item strong { display: block; font-size: 10px; color: #999; text-transform: uppercase; margin-bottom: 4px; }
        .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 30px; }
        .summary-card { border: 1px solid #eee; border-radius: 12px; padding: 20px; }
        .summary-card .val { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
        .summary-card .lbl { color: #888; font-size: 11px; font-weight: 600; text-transform: uppercase; margin-top: 8px; }
        .net { background: #000; color: #fff; border-color: #000; }
        .net .lbl { color: #aaa; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { text-align: left; padding: 12px 15px; font-size: 11px; font-weight: 700; text-transform: uppercase; border-bottom: 2px solid #eee; color: #666; }
        td { padding: 12px 15px; border-bottom: 1px solid #f5f5f5; color: #333; }
        .sale { color: #059669; font-weight: 600; }
        .ad { color: #dc2626; font-weight: 600; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; font-size: 11px; color: #aaa; text-align: center; }
        @media print { body { padding: 0; } .header { border-bottom-width: 4px; } }
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
        <div class="subtitle">Official Seller Statement</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:800; font-size:14px;">Statement #${Math.random().toString(36).slice(2, 8).toUpperCase()}</div>
        <div style="color:#888; font-size:11px; margin-top:4px;">Period: ${new Date(from).toLocaleDateString()} — ${new Date(to).toLocaleDateString()}</div>
      </div>
    </div>
    <div class="seller-block">
      <div class="seller-item"><strong>Account Holder</strong>${user?.name || "Business User"}</div>
      <div class="seller-item"><strong>Business Name</strong>${user?.businessName || "Stinchar Partner"}</div>
      <div class="seller-item"><strong>Email Address</strong>${user?.email || "—"}</div>
    </div>
    <div class="summary-grid">
      <div class="summary-card">
        <div class="val">₹${statement.summary.grossSales?.toLocaleString()}</div>
        <div class="lbl">Gross Sales</div>
      </div>
      <div class="summary-card">
        <div class="val" style="color:#dc2626;">-₹${statement.summary.platformCommission?.toLocaleString()}</div>
        <div class="lbl">Commission (2%)</div>
      </div>
      <div class="summary-card">
        <div class="val" style="color:#d97706;">-₹${statement.summary.adSpend?.toLocaleString()}</div>
        <div class="lbl">Total Ad Spend</div>
      </div>
      <div class="summary-card net">
        <div class="val">₹${statement.summary.netEarnings?.toLocaleString()}</div>
        <div class="lbl">Net Payout</div>
      </div>
    </div>
    <h3 style="font-size:14px; font-weight:800; margin-bottom:15px; letter-spacing:-0.3px;">Transaction History</h3>
    <table>
      <thead><tr><th>Date</th><th>Entry Type</th><th>Description</th><th style="text-align:right;">Amount</th><th>Status</th></tr></thead>
      <tbody>
        ${statement.transactions.map((t) => `
          <tr>
            <td style="color:#888;">${new Date(t.date).toLocaleDateString("en-IN")}</td>
            <td style="font-weight:700; font-size:10px; text-transform:uppercase;">${t.type === "sale" ? "Inventory Sale" : "Marketing Cost"}</td>
            <td>${t.type === "sale" ? t.customer + " (" + (t.items?.length || 0) + " items)" : t.campaignTitle}</td>
            <td style="text-align:right;" class="${t.type === "sale" ? "sale" : "ad"}">${t.type === "sale" ? "+" : "-"}₹${Math.abs(t.amount)?.toLocaleString()}</td>
            <td style="font-size:10px; font-weight:700; color:${t.isPaid ? "#059669" : "#666"}; text-transform:uppercase;">${t.isPaid ? "Settled" : t.type === "sale" ? "Processing" : "Deducted"}</td>
          </tr>`).join("")}
      </tbody>
    </table>
    <div class="footer">
      This financial statement was generated electronically and is valid without signature.  <br/>
      Stinchar E-Commerce Solutions Pvt Ltd · Total Items Focussed: ${statement.summary.totalItemsSold} · Transactions: ${statement.transactions.length}
    </div>
  ` : "";

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">{t.payments}</h1>
                    <p className="text-[14px] text-gray-500 mt-1">Monitor your financial performance and payouts</p>
                </div>
                <div className="flex bg-[#141414] border border-[#262626] p-1.5 rounded-2xl w-fit">
                    {[["overview", t.overview], ["statement", t.statements]].map(([k, l]) => (
                        <button key={k} onClick={() => setTab(k)}
                            className={`px-5 py-2 rounded-xl text-[13px] font-bold transition-all ${tab === k ? "bg-white text-black shadow-xl" : "text-gray-500 hover:text-gray-300"}`}>
                            {l}
                        </button>
                    ))}
                </div>
            </div>

            {/* Overview Stats - Professional Dark Cards */}
            {revenue && tab === "overview" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                        { label: t.gross_revenue, val: `₹${revenue.totalSales?.toLocaleString()}`, icon: <FaShoppingCart />, trend: "+12.4%", trendUp: true },
                        { label: t.net_payout, val: `₹${revenue.paidSales?.toLocaleString()}`, icon: <FaCheckCircle />, trend: "+8.2%", trendUp: true },
                        { label: t.pending_payout, val: `₹${revenue.pendingSales?.toLocaleString()}`, icon: <FaClock />, trend: "-2.1%", trendUp: false },
                        { label: t.items_shipped, val: revenue.totalItemsSold, icon: <FaBoxOpen />, trend: "+15.0%", trendUp: true },
                    ].map((s, i) => (
                        <div key={i} className="premium-card p-6 flex flex-col justify-between group overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/[0.02] -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-orange-500/[0.05] transition-all"></div>
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                    {s.icon}
                                </div>
                                <div className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg ${s.trendUp ? "text-emerald-500 bg-emerald-500/10" : "text-red-500 bg-red-500/10"}`}>
                                    {s.trendUp ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />} {s.trend}
                                </div>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white tracking-tight">{s.val}</p>
                                <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest mt-1">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Revenue Analytics Chart Mockup/Visual */}
            {tab === "overview" && revenue && (
                <div className="premium-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                             {t.monthly_revenue} <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        </h3>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 uppercase">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div> {t.monthly_revenue}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {revenue.monthlyChart?.length === 0 ? (
                            <p className="text-center py-12 text-gray-600 font-medium">No transaction data available yet</p>
                        ) : (
                            revenue.monthlyChart?.map((m, i) => (
                                <div key={i} className="group">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[13px] font-bold text-gray-400 group-hover:text-white transition-colors">{m.month}</span>
                                        <span className="text-[14px] font-black text-white">₹{m.amount?.toLocaleString()}</span>
                                    </div>
                                    <div className="relative h-2.5 w-full bg-[#141414] rounded-full overflow-hidden border border-white/[0.02]">
                                        <div 
                                            className="absolute inset-y-0 left-0 bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-out"
                                            style={{ width: `${Math.min(100, (m.amount / (revenue.totalSales || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* STATEMENT VIEW */}
            {tab === "statement" && (
                <div className="space-y-6">
                    {/* Filters Toolbar */}
                    <div className="premium-card p-6 flex flex-wrap items-center gap-6">
                        <div className="flex-1 min-w-[200px] space-y-2">
                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Account Period (From)</label>
                            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                                className="premium-input bg-[#0a0a0a] w-full" />
                        </div>
                        <div className="flex-1 min-w-[200px] space-y-2">
                            <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Account Period (To)</label>
                            <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
                                className="premium-input bg-[#0a0a0a] w-full" />
                        </div>
                        <div className="flex items-end gap-3 pt-6 lg:pt-0">
                            <button onClick={fetchStatement} disabled={loading}
                                className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-[13px] transition-all disabled:opacity-50 shadow-lg shadow-orange-950/20 flex items-center gap-2">
                                <FaFilter size={12} /> {loading ? "Analysing..." : t.generate_invoice}
                            </button>
                            {statement && (
                                <button onClick={handlePrint}
                                    className="px-6 py-2.5 bg-white hover:bg-gray-100 text-black font-bold rounded-xl text-[13px] transition-all flex items-center gap-2">
                                    <FaPrint size={12} /> Print PDF
                                </button>
                            )}
                        </div>
                    </div>

                    {statement && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                             {/* Statement Summary Ribbon */}
                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                {[
                                    { label: t.gross_sales, val: `₹${statement.summary.grossSales?.toLocaleString()}`, color: "text-white" },
                                    { label: t.marketing_cost, val: `-₹${statement.summary.adSpend?.toLocaleString()}`, color: "text-red-500" },
                                    { label: t.service_fee, val: `-₹${statement.summary.platformCommission?.toLocaleString()}`, color: "text-orange-500/80" },
                                    { label: t.net_earnings, val: `₹${statement.summary.netEarnings?.toLocaleString()}`, color: "text-emerald-500" },
                                ].map((s, i) => (
                                    <div key={i} className="bg-[#141414] border border-[#262626] rounded-2xl p-5 text-center">
                                        <p className={`text-xl font-black ${s.color} tracking-tight`}>{s.val}</p>
                                        <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mt-1">{s.label}</p>
                                    </div>
                                ))}
                             </div>

                             {/* Detailed Ledger Table */}
                             <div className="premium-card overflow-hidden">
                                <div className="px-6 py-4 bg-[#141414] border-b border-[#262626] flex items-center justify-between">
                                    <h3 className="text-[14px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                        <FaFileInvoice className="text-orange-500" /> {t.invoice}
                                    </h3>
                                    <span className="text-[11px] font-bold text-gray-600 uppercase tracking-widest">{statement.transactions.length} Entries</span>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-[#1a1a1a]/50 text-[11px] font-bold text-gray-500 uppercase tracking-widest border-b border-[#262626]">
                                                <th className="px-6 py-4 text-left font-bold">{t.billing_details}</th>
                                                <th className="px-6 py-4 text-left font-bold">{t.entry_type}</th>
                                                <th className="px-6 py-4 text-left font-bold">{t.details}</th>
                                                <th className="px-6 py-4 text-right font-bold">{t.amount}</th>
                                                <th className="px-6 py-4 text-center font-bold">{t.status}</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#262626]">
                                            {statement.transactions.map((t_item, i) => (
                                                <tr key={i} className="hover:bg-[#1a1a1a]/40 transition-colors">
                                                    <td className="px-6 py-4 text-[13px] font-medium text-gray-500 whitespace-nowrap">
                                                        {new Date(t_item.date).toLocaleDateString("en-IN")}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${t_item.type === "sale" ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-red-500/10 text-red-500 border border-red-500/20"}`}>
                                                            {t_item.type === "sale" ? t.inventory_sale : t.marketing_cost}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-[13px] font-bold text-gray-300 max-w-xs truncate">
                                                        {t_item.type === "sale"
                                                            ? <span>{t_item.customer} • {t_item.items?.length || 0} items</span>
                                                            : <span>{t_item.campaignTitle} <span className="text-gray-600 font-medium lowercase text-[11px] ml-1">({t_item.adType})</span></span>
                                                        }
                                                    </td>
                                                    <td className={`px-6 py-4 text-right text-[15px] font-black ${t_item.type === "sale" ? "text-white" : "text-red-500"}`}>
                                                        {t_item.type === "sale" ? "+" : "-"}₹{Math.abs(t_item.amount)?.toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`text-[11px] font-bold uppercase tracking-widest ${t_item.isPaid ? "text-emerald-500" : "text-gray-600"}`}>
                                                            {t_item.isPaid ? t.verified : t.pending}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                             </div>

                             {/* Hidden print payload */}
                             <div ref={printRef} className="hidden" dangerouslySetInnerHTML={{ __html: printableStatement }} />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
