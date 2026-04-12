import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBoxOpen, FaUpload } from "react-icons/fa";
import API from "../../../api/api";
import { toast } from "react-toastify";

const ReturnRequestModal = ({ isOpen, onClose, order, item, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [customerNote, setCustomerNote] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !item || !order) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      toast.error("Please select a valid return reason.");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        orderId: order._id,
        productId: item.product,
        reason,
        customerNote,
      };

      const { data } = await API.post("/orders/return/request", payload);
      toast.success("Return request submitted successfully");
      onSuccess(data.order);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit return request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-100"
        >
          {/* Header */}
          <div className="bg-gray-50 border-b border-gray-100 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                <FaBoxOpen size={18} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">Request Return</h3>
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Item: {item.name}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-900 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
               {/* Item Summary */}
              <div className="bg-gray-50 rounded-2xl p-4 flex gap-4 items-center">
                 <div className="w-14 h-14 bg-white rounded-xl overflow-hidden border border-gray-100">
                    <img src={item.image} alt="" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-gray-900 line-clamp-2">{item.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold mt-1">Qty: {item.qty} &bull; ₹{item.price}</p>
                 </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Reason for Return *
                </label>
                <select
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                >
                  <option value="" disabled>-- Select Reason --</option>
                  <option value="DEFECTIVE">Product is defective / damaged</option>
                  <option value="NOT_AS_DESCRIBED">Product not as described</option>
                  <option value="WRONG_ITEM">Received wrong item</option>
                  <option value="QUALITY_ISSUE">Poor material quality</option>
                  <option value="NO_LONGER_NEEDED">No longer needed (Restocking fee may apply)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Additional Comments (Optional)
                </label>
                <textarea
                  rows={3}
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="Provide more context to help speed up the process..."
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>

              {/* Upload Proof (Mocked) */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 hover:border-orange-200 transition-all group">
                 <FaUpload className="mx-auto text-gray-300 group-hover:text-orange-400 mb-2 transition-colors" size={20} />
                 <p className="text-xs font-bold text-gray-600">Upload Photo Evidence</p>
                 <p className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mt-1">JPEG, PNG up to 5MB</p>
              </div>

              <div className="pt-4 border-t border-gray-100 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                >
                  {loading ? "Submitting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ReturnRequestModal;
