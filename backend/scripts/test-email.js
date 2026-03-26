require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const nodemailer = require("nodemailer");

async function testEmail() {
    console.log("--- 🕵️ Stinchar Email Diagnostic Tool ---");
    console.log(`Current Time: ${new Date().toLocaleString()}`);
    console.log(`Node Version: ${process.version}`);
    console.log("-----------------------------------------");

    const user = process.env.GMAIL_USER;
    const pass = process.env.GMAIL_PASS;

    if (!user || !pass) {
        console.error("❌ ERROR: GMAIL_USER or GMAIL_PASS missing in .env file.");
        process.exit(1);
    }

    console.log(`Attempting to connect to Gmail SMTP as: ${user}`);
    console.log("Connecting to smtp.gmail.com:465...");

    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 465,
        secure: true, // use SSL
        auth: {
            user: user,
            pass: pass.replace(/\s/g, ""), // Remove any accidental spaces
        },
        debug: true, // Show SMTP traffic
        logger: true  // Log to console
    });

    try {
        console.log("Step 1: Verifying SMTP connection...");
        await transporter.verify();
        console.log("✅ SUCCESS: SMTP Connection verified! Your credentials are correct.");

        console.log("\nStep 2: Sending test email...");
        const info = await transporter.sendMail({
            from: `"Stinchar Test" <${user}>`,
            to: user, // Send it to self
            subject: "Stinchar Email Test ✅",
            text: "If you received this, your email system is working perfectly!",
            html: "<b>If you received this, your email system is working perfectly!</b>"
        });

        console.log(`✅ SUCCESS: Email sent! Message ID: ${info.messageId}`);
    } catch (error) {
        console.error("\n❌ FAILED: Email could not be sent.");
        console.error("-----------------------------------------");
        console.error(`Error Code: ${error.code}`);
        console.error(`Command: ${error.command}`);
        console.error(`Response: ${error.response}`);
        console.error(`Message: ${error.message}`);
        console.error("-----------------------------------------");

        if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
            console.log("\n💡 DIAGNOSIS: Connection Blocked.");
            console.log("It looks like your network or hosting provider (Render) is blocking SMTP ports (465/587).");
            console.log("SOLUTION: Use Brevo API instead. Port 80/443 (HTTP) is never blocked.");
        } else if (error.code === 'EAUTH') {
            console.log("\n💡 DIAGNOSIS: Authentication Failed.");
            console.log("Your Gmail App Password may be incorrect or revoked.");
            console.log("SOLUTION: Generate a new 16-character App Password in your Google Account Security settings.");
        }
    }
}

testEmail();
