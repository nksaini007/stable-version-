/**
 * Test script for Gmail SMTP email sending.
 * Run with: node test_email.js
 */
require("dotenv").config();
const nodemailer = require("nodemailer");

async function testEmail() {
  console.log("=== Gmail SMTP Test ===");
  console.log("GMAIL_USER:", process.env.GMAIL_USER);
  console.log("GMAIL_PASS:", process.env.GMAIL_PASS ? `${process.env.GMAIL_PASS.substring(0,4)}****` : "NOT SET");
  console.log("GMAIL_PASS length:", process.env.GMAIL_PASS?.length || 0);
  console.log("");

  if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
    console.error("❌ GMAIL_USER or GMAIL_PASS is missing in .env");
    process.exit(1);
  }

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      debug: true,
      logger: true,
    });

    console.log("🔌 Verifying SMTP connection...");
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully!\n");

    console.log("📧 Sending test email...");
    const info = await transporter.sendMail({
      from: `"Stinchar Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Send to self for testing
      subject: "Stinchar OTP Test - " + new Date().toLocaleTimeString(),
      html: `<div style="padding:20px;font-family:sans-serif;">
        <h2>✅ Email Test Successful!</h2>
        <p>Your Gmail SMTP configuration is working correctly.</p>
        <p>Test OTP: <strong>123456</strong></p>
        <p>Time: ${new Date().toISOString()}</p>
      </div>`,
    });

    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Accepted:", info.accepted);
    console.log("   Rejected:", info.rejected);
  } catch (error) {
    console.error("\n❌ SMTP ERROR:");
    console.error("   Code:", error.code);
    console.error("   Command:", error.command);
    console.error("   Message:", error.message);
    
    if (error.code === "EAUTH") {
      console.error("\n🔑 AUTHENTICATION FAILED. Common fixes:");
      console.error("   1. Make sure GMAIL_PASS is a Google App Password (NOT your regular Gmail password)");
      console.error("   2. Remove any spaces from GMAIL_PASS in .env");
      console.error("   3. Generate a new App Password at: https://myaccount.google.com/apppasswords");
      console.error("   4. Make sure 2-Step Verification is enabled on the Gmail account");
    }
  }
}

testEmail();
