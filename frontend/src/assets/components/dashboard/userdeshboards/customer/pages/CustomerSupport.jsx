import React, { useState } from "react";
import { FaHeadset, FaQuestionCircle, FaEnvelope, FaWhatsapp, FaChevronDown, FaPaperPlane } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm transition-all">
       <div 
         className="p-6 cursor-pointer flex items-center justify-between"
         onClick={() => setIsOpen(!isOpen)}
       >
          <h4 className="font-bold text-gray-800">{question}</h4>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
             <FaChevronDown className="text-gray-300" />
          </motion.div>
       </div>
       <AnimatePresence>
          {isOpen && (
            <motion.div 
               initial={{ height: 0 }}
               animate={{ height: "auto" }}
               exit={{ height: 0 }}
               className="px-6 pb-6"
            >
               <p className="text-sm text-gray-500 font-medium leading-relaxed">{answer}</p>
            </motion.div>
          )}
       </AnimatePresence>
    </div>
  );
};

const CustomerSupport = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      {/* Search Bar Header */}
      <div className="text-center space-y-4">
         <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">How can we help?</h2>
         <p className="text-gray-400 font-medium">Search our knowledge base or contact a support agent.</p>
         <div className="max-w-2xl mx-auto mt-8 bg-white p-2 rounded-[2.5rem] border border-gray-100 shadow-xl flex gap-2">
            <input 
              type="text" 
              placeholder="Type your question..." 
              className="flex-1 px-6 outline-none text-gray-800 font-medium"
            />
            <button className="px-8 py-3 bg-gray-900 text-white rounded-[1.8rem] font-black uppercase tracking-widest text-xs hover:bg-orange-500 transition-all">Search</button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { icon: <FaEnvelope />, title: "Email Support", value: "support@stinchar.com", color: "bg-indigo-500" },
           { icon: <FaWhatsapp />, title: "WhatsApp Us", value: "+91 98765 43210", color: "bg-emerald-500" },
           { icon: <FaHeadset />, title: "Call Center", value: "1800-123-456", color: "bg-orange-500" }
         ].map((item, idx) => (
           <motion.div 
             key={idx}
             whileHover={{ y: -5 }}
             className="bg-white p-8 rounded-[2.5rem] border border-gray-100 text-center shadow-sm"
           >
              <div className={`w-14 h-14 rounded-2xl ${item.color} text-white flex items-center justify-center mx-auto mb-4 text-2xl shadow-lg shadow-current/20`}>
                 {item.icon}
              </div>
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{item.title}</h4>
              <p className="text-sm font-bold text-gray-900">{item.value}</p>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
         {/* FAQ Section */}
         <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <FaQuestionCircle className="text-orange-500" size={24} />
               <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Common Questions</h3>
            </div>
            <FAQItem 
               question="How do I track my order?" 
               answer="Go to your dashboard's 'My Orders' section. Each order has a tracking timeline showing every step from confirmation to delivery." 
            />
            <FAQItem 
               question="Can I cancel my order?" 
               answer="Yes, you can cancel an order as long as its status is 'Pending' or 'Confirmed'. Once it's in 'Processing' or 'Shipped', cancellation is no longer possible." 
            />
            <FAQItem 
               question="What is the refund policy?" 
               answer="Refunds are initiated within 48 hours of a successful cancellation. It may take 5-7 business days for the amount to reflect in your original payment method." 
            />
         </div>

         {/* Contact Form Support */}
         <div className="bg-gray-900 rounded-[3rem] p-8 sm:p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500 rounded-full blur-[80px] opacity-20"></div>
            <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Direct Message</h3>
            <p className="text-gray-400 text-sm mb-8 font-medium">Can't find the answer? Send us a ticket and we'll get back to you within 2 hours.</p>
            
            <div className="space-y-4">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Subject</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:bg-white/10 outline-none" placeholder="Delivery Issue, etc." />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Message</label>
                  <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-4 text-sm focus:bg-white/10 outline-none resize-none" placeholder="Tell us more about your issue..."></textarea>
               </div>
               <button className="w-full py-4 bg-orange-500 hover:bg-orange-600 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95">
                  Send Ticket <FaPaperPlane />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
