import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import Nev from "../Nev";

/**
 * Compact & Professional Contact Component
 * Responsive for laptop & mobile
 * Suitable for Home Solution / Service Platform
 */

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <>
      <Nev />
      <section className="bg-slate-50 text-slate-800 min-h-screen flex items-center">

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">

          {/* Header */}
          <div className="mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Contact Support
            </h2>
            <p className="text-slate-600 text-sm mt-2 max-w-xl">
              Need help with construction, interiors, renovation, or repairs?
              Share your details and our team will contact you.
            </p>
          </div>

          {/* Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white rounded-xl border border-slate-200 p-4 sm:p-6">

            {/* Left Info */}
            <div className="space-y-4">
              <p className="text-sm font-medium">Quick Support</p>

              <p className="flex items-center gap-2 text-sm text-slate-600">
                <FaPhoneAlt className="text-emerald-600" />
                +91 6377011413
              </p>

              <p className="flex items-center gap-2 text-sm text-slate-600">
                <FaEnvelope className="text-emerald-600" />
                officialwhitehk@gmail.com
              </p>

              <p className="text-xs text-slate-500 pt-4">
                Average response time: under 24 hours
              </p>
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
              >
                <input
                  type="text"
                  placeholder="Full name"
                  required
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                <input
                  type="email"
                  placeholder="Email address"
                  required
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />

                <select
                  required
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none sm:col-span-2"
                >
                  <option value="">Select service</option>
                  <option>Construction</option>
                  <option>Interior Design</option>
                  <option>Renovation</option>
                  <option>Repair & Maintenance</option>
                </select>

                <textarea
                  rows="3"
                  placeholder="Short description of your requirement"
                  required
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none sm:col-span-2"
                />

                {submitted ? (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-emerald-600 text-sm font-medium sm:col-span-2"
                  >
                    ✔ Request sent successfully
                  </motion.p>
                ) : (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    className="bg-emerald-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-emerald-700 transition sm:col-span-2 w-full sm:w-fit"
                  >
                    Submit
                  </motion.button>
                )}
              </form>
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-500 mt-8">
            © {new Date().getFullYear()} Start 2 Pvt. Ltd.
          </p>
        </div>
      </section>
    </>
  );
};

export default Contact;
