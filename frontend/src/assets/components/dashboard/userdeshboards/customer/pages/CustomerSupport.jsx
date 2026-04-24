import React, { useState } from "react";
import { FaHeadset, FaQuestionCircle, FaEnvelope, FaWhatsapp, FaChevronDown, FaPaperPlane } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const FAQItem = ({ question, answer }) => {
   const [isOpen, setIsOpen] = useState(false);
   return (
      <div className="bg-white rounded-xl border border-zinc-100 overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] transition-all">
         <div
            className="p-5 cursor-pointer flex items-center justify-between hover:bg-zinc-50/50 transition-colors"
            onClick={() => setIsOpen(!isOpen)}
         >
            <h4 className="font-medium text-zinc-900 text-[13px] tracking-wide">{question}</h4>
            <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
               <FaChevronDown className="text-zinc-400" size={12} />
            </motion.div>
         </div>
         <AnimatePresence>
            {isOpen && (
               <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="px-5 pb-5"
               >
                  <p className="text-[12px] text-zinc-500 font-medium leading-relaxed tracking-wide">{answer}</p>
               </motion.div>
            )}
         </AnimatePresence>
      </div>
   );
};

const CustomerSupport = () => {
   return (
      <div className="max-w-4xl mx-auto space-y-12 customer-theme">
         {/* Search Bar Header */}
         <div className="text-center space-y-3">
            <h2 className="text-3xl font-light text-zinc-800 tracking-tight">How can we help?</h2>
            <p className="text-[13px] text-zinc-400 font-medium tracking-wide">Search our knowledge base or reach out to us directly.</p>

         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[

               { icon: <FaWhatsapp />, title: "WhatsApp Us", value: "+91 6377011413" },
               { icon: <FaHeadset />, title: "Call Center", value: "+91 6377011413" }
            ].map((item, idx) => (
               <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="bg-white p-8 rounded-xl border border-zinc-100 text-center shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.06)] transition-all duration-300"
               >
                  <div className="w-12 h-12 rounded-xl bg-zinc-50 border border-zinc-100 text-zinc-600 flex items-center justify-center mx-auto mb-4 text-xl shadow-sm">
                     {item.icon}
                  </div>
                  <h4 className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mb-1">{item.title}</h4>
                  <p className="text-[13px] font-medium text-zinc-800">{item.value}</p>
               </motion.div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* FAQ Section */}
            <div className="space-y-4">
               <div className="flex items-center gap-3 mb-4">
                  <FaQuestionCircle className="text-zinc-400" size={18} />
                  <h3 className="text-lg font-medium text-zinc-800 tracking-tight">FAQs</h3>
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



         </div>
      </div>
   );
};

export default CustomerSupport;
