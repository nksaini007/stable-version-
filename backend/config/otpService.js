const nodemailer = require("nodemailer");

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// ============================================================
// EMAIL SENDING — Uses Brevo HTTP API (free, works on Render)
// Falls back to Gmail SMTP if Brevo key not set (for local dev)
// ============================================================

/**
 * Send OTP via Brevo HTTP API (formerly Sendinblue)
 * FREE: 300 emails/day, no credit card needed
 * Sign up at: https://www.brevo.com
 */
const sendViaBrevo = async (to, subject, htmlContent) => {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) return { success: false, error: "BREVO_API_KEY not set" };

    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.GMAIL_USER || "noreply@stinchar.com";
    const senderName = process.env.BREVO_SENDER_NAME || "Stinchar";

    try {
        const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
                "accept": "application/json",
                "api-key": apiKey,
                "content-type": "application/json",
            },
            body: JSON.stringify({
                sender: { name: senderName, email: senderEmail },
                to: [{ email: to }],
                subject: subject,
                htmlContent: htmlContent,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`[Brevo] ✅ Email sent to ${to} | MessageId: ${data.messageId}`);
            return { success: true, messageId: data.messageId };
        } else {
            console.error(`[Brevo] ❌ API Error:`, data);
            return { success: false, error: data.message || JSON.stringify(data) };
        }
    } catch (err) {
        console.error(`[Brevo] ❌ Network Error:`, err.message);
        return { success: false, error: err.message };
    }
};

/**
 * Send OTP via Gmail SMTP (for local development only)
 * BLOCKED on Render free tier — SMTP ports are blocked
 */
const sendViaGmail = async (to, subject, htmlContent) => {
    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_PASS?.replace(/\s/g, "");

    if (!user || !pass) return { success: false, error: "GMAIL_USER or GMAIL_PASS missing" };

    try {
        const transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: { user, pass },
            connectionTimeout: 10000,
            socketTimeout: 15000,
        });

        const info = await transporter.sendMail({
            from: `"Stinchar" <${user}>`,
            to,
            subject,
            html: htmlContent,
        });

        console.log(`[Gmail SMTP] ✅ Email sent to ${to} | MessageId: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (err) {
        console.error(`[Gmail SMTP] ❌ Error:`, err.message);
        return { success: false, error: err.message, code: err.code };
    }
};

/**
 * Build OTP email HTML template
 */
const buildOtpHtml = (otp) => `
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
</div>`;

/**
 * Send OTP via Email — auto-selects Brevo API or Gmail SMTP
 * Priority: Brevo (works on Render) → Gmail SMTP (works locally)
 */
const sendEmailOTP = async (email, otp) => {
    const subject = "Your Stinchar Verification Code";
    const html = buildOtpHtml(otp);

    // Try Brevo first (works everywhere, including Render)
    if (process.env.BREVO_API_KEY) {
        console.log(`[otpService] Using Brevo API to send OTP to: ${email}`);
        const result = await sendViaBrevo(email, subject, html);
        if (result.success) return result;
        console.warn(`[otpService] Brevo failed, trying Gmail SMTP fallback...`);
    }

    // Fallback to Gmail SMTP (works locally, blocked on Render free tier)
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        console.log(`[otpService] Using Gmail SMTP to send OTP to: ${email}`);
        return await sendViaGmail(email, subject, html);
    }

    return { success: false, error: "No email provider configured. Set BREVO_API_KEY or GMAIL_USER/GMAIL_PASS." };
};

/**
 * Verify email configuration
 */
const verifyEmailConfig = async () => {
    if (process.env.BREVO_API_KEY) {
        // Quick test — just check if the API key is valid by listing senders
        try {
            const res = await fetch("https://api.brevo.com/v3/senders", {
                headers: { "api-key": process.env.BREVO_API_KEY, "accept": "application/json" },
            });
            const data = await res.json();
            if (res.ok) return { ok: true, provider: "Brevo", senders: data.senders?.length || 0 };
            return { ok: false, provider: "Brevo", error: data.message };
        } catch (err) {
            return { ok: false, provider: "Brevo", error: err.message };
        }
    }
    if (process.env.GMAIL_USER && process.env.GMAIL_PASS) {
        try {
            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com", port: 465, secure: true,
                auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS.replace(/\s/g, "") },
                connectionTimeout: 10000,
            });
            await transporter.verify();
            return { ok: true, provider: "Gmail SMTP" };
        } catch (err) {
            return { ok: false, provider: "Gmail SMTP", error: err.message };
        }
    }
    return { ok: false, error: "No email provider configured" };
};

/**
 * Send OTP via SMS (Mock — real SMS requires Twilio or similar)
 */
const sendSMSOTP = async (phone, otp) => {
    try {
        console.log(`[otpService] [MOCK SMS] OTP ${otp} → ${phone}`);
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
