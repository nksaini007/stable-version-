const nodemailer = require("nodemailer");
const admin = require("./firebaseConfig"); // We'll create this next

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP via Email using Nodemailer
 */
const sendEmailOTP = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });

        const mailOptions = {
            from: `"Stinchar Support" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: "Your Stinchar Verification Code",
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Verify Your Email</h2>
                    <p style="font-size: 16px; color: #555;">Hello,</p>
                    <p style="font-size: 16px; color: #555;">Thank you for choosing Stinchar. Use the following OTP to complete your verification process. This code is valid for 10 minutes.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #007bff; background: #f0f8ff; padding: 10px 20px; border-radius: 5px;">${otp}</span>
                    </div>
                    <p style="font-size: 14px; color: #888; text-align: center;">If you didn't request this code, please ignore this email.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #aaa; text-align: center;">&copy; 2024 Stinchar. All rights reserved.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP sent to email: ${email}`);
        return true;
    } catch (error) {
        console.error("Error sending email OTP:", error);
        return false;
    }
};

/**
 * Send OTP via SMS using Firebase or Mock
 */
const sendSMSOTP = async (phone, otp) => {
    try {
        // NOTE: Firebase Admin SDK doesn't natively "send" SMS like Twilio.
        // Usually, Phone Auth is handled on the Frontend.
        // However, for backend-initiated SMS, you'd typically use Twilio.
        // IF the user wants a "free" backend-only SMS solution, it's tricky.
        
        // For now, if Firebase is configured, we'll assume they might use it for verification later.
        // For SENDING, I'll log to console as a "Mock" and explain this.
        console.log(`[MOCK SMS] Sending OTP ${otp} to ${phone}`);
        
        // In a real scenario with Twilio:
        // const client = require('twilio')(process.env.TWILIO_SID, process.env.TWILIO_AUTH);
        // await client.messages.create({ body: `Your Stinchar OTP is ${otp}`, from: '+123456789', to: phone });

        return true;
    } catch (error) {
        console.error("Error sending SMS OTP:", error);
        return false;
    }
};

module.exports = {
    generateOTP,
    sendEmailOTP,
    sendSMSOTP,
};
