const nodemailer = require("nodemailer");

// ============================================================
// Safe Firebase import — won't crash if firebase-admin is missing
// ============================================================
let admin = null;
try {
    admin = require("./firebaseConfig");
} catch (e) {
    console.warn("[otpService] Firebase config unavailable:", e.message);
}

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================================
// PERSISTENT TRANSPORTER — created once, reused for all emails
// ============================================================
let _transporter = null;

const getTransporter = () => {
    if (_transporter) return _transporter;

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_PASS;

    if (!user || !pass) {
        console.error("[otpService] ❌ GMAIL_USER or GMAIL_PASS is missing from environment!");
        return null;
    }

    // Strip any accidental spaces from the app password
    const cleanPass = pass.replace(/\s/g, "");

    console.log(`[otpService] Creating SMTP transporter for: ${user} (pass length: ${cleanPass.length})`);

    _transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: user,
            pass: cleanPass,
        },
        connectionTimeout: 10000, // 10 sec
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });

    return _transporter;
};

/**
 * Verify the SMTP connection is working
 * @returns {Promise<{ok: boolean, error?: string}>}
 */
const verifyEmailConfig = async () => {
    const transporter = getTransporter();
    if (!transporter) {
        return { ok: false, error: "GMAIL_USER or GMAIL_PASS missing" };
    }
    try {
        await transporter.verify();
        return { ok: true };
    } catch (err) {
        // Reset transporter so next call rebuilds it
        _transporter = null;
        return { ok: false, error: err.message, code: err.code };
    }
};

/**
 * Send OTP via Email using Nodemailer
 * @returns {Promise<{success: boolean, error?: string}>}
 */
const sendEmailOTP = async (email, otp) => {
    try {
        const transporter = getTransporter();
        if (!transporter) {
            return { success: false, error: "Email configuration missing. Set GMAIL_USER and GMAIL_PASS." };
        }

        const mailOptions = {
            from: `"Stinchar" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your Stinchar Verification Code",
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; padding: 0; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb;">
                    <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 40px 30px; text-align: center;">
                        <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px;">STINCHAR</h1>
                        <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0; font-size: 14px;">Email Verification</p>
                    </div>
                    <div style="padding: 40px 30px; background: #fff;">
                        <p style="font-size: 16px; color: #374151; margin: 0 0 8px;">Hello,</p>
                        <p style="font-size: 15px; color: #6b7280; line-height: 1.6;">Use the following code to verify your email address. This code expires in <strong>10 minutes</strong>.</p>
                        <div style="text-align: center; margin: 32px 0;">
                            <div style="display: inline-block; background: #f0f4ff; border: 2px dashed #4f46e5; border-radius: 12px; padding: 16px 40px;">
                                <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: 'Courier New', monospace;">${otp}</span>
                            </div>
                        </div>
                        <p style="font-size: 13px; color: #9ca3af; text-align: center;">If you didn't request this, safely ignore this email.</p>
                    </div>
                    <div style="background: #f9fafb; padding: 20px 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="font-size: 11px; color: #9ca3af; margin: 0;">&copy; ${new Date().getFullYear()} Stinchar. All rights reserved.</p>
                    </div>
                </div>
            `,
        };

        console.log(`[otpService] Sending OTP to: ${email}`);
        const info = await transporter.sendMail(mailOptions);
        console.log(`[otpService] ✅ OTP sent to ${email} | MessageID: ${info.messageId} | Accepted: ${info.accepted}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error(`[otpService] ❌ Failed to send OTP to ${email}:`, error.message);
        // Reset transporter on auth errors so it rebuilds next time
        if (error.code === "EAUTH" || error.code === "ESOCKET") {
            _transporter = null;
        }
        return { success: false, error: error.message, code: error.code };
    }
};

/**
 * Send OTP via SMS (Mock — real SMS requires Twilio or similar)
 */
const sendSMSOTP = async (phone, otp) => {
    try {
        console.log(`[otpService] [MOCK SMS] OTP ${otp} → ${phone}`);
        // In production, integrate Twilio:
        // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
        // await client.messages.create({ body: `Your Stinchar OTP: ${otp}`, from: '+1234567890', to: phone });
        return { success: true };
    } catch (error) {
        console.error("[otpService] SMS Error:", error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    generateOTP,
    sendEmailOTP,
    sendSMSOTP,
    verifyEmailConfig,
};
