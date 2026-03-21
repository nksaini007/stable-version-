const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../backend/.env") });

const sendEmailOTP = async (email, otp) => {
    try {
        console.log("Using GMAIL_USER:", process.env.GMAIL_USER);
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
            html: `<p>Your OTP is ${otp}</p>`,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Email sent: " + info.response);
        return true;
    } catch (error) {
        console.error("Error sending email OTP:", error);
        return false;
    }
};

sendEmailOTP("your_test_email@example.com", "123456");
