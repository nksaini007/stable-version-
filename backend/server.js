const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const mongoSanitize = require("express-mongo-sanitize");
const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);
// Load env variables
dotenv.config();

const app = express();

// ✅ Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // Allow serving /uploads
app.use(cors({
  origin: (origin, callback) => {
    // If no origin (like a server-side or postman request), allow it
    if (!origin) return callback(null, true);

    const sanitizedOrigin = origin.replace(/\/$/, "").toLowerCase();
    
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "https://stable-version.vercel.app",
      "https://stinchar.com",
      "https://www.stinchar.com",
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ].map(o => o?.replace(/\/$/, "").toLowerCase()).filter(Boolean);

    // Support main domain and hyphenated preview subdomains (e.g. stable-version-git-main-nksaini007.vercel.app)
    const isVercel = sanitizedOrigin.endsWith(".vercel.app") && sanitizedOrigin.includes("stable-version");
    const isLocal = /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):517[0-9]$/.test(sanitizedOrigin);

    if (allowedOrigins.includes(sanitizedOrigin) || isVercel || isLocal) {
      console.log(`[CORS Success] Origin: ${origin}`);
      callback(null, true);
    } else {
      console.warn(`[CORS Rejected] Origin: ${origin}`);
      // Instead of throwing an error which might crash the response, 
      // just pass false to let the browser handle the block normally.
      callback(null, false);
    }
  },
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers crash on 204
}));
app.use(express.json({ limit: "10kb" }));
app.use(mongoSanitize()); // ✅ DATA SANITIZATION AGAINST NoSQL INJECTION
app.use(cookieParser());

// ✅ Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // General limit: 500 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests from this IP, please try again later." }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Strict limit: 5 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login/signup attempts. Please try again after 15 minutes." }
});

app.set("trust proxy", 1);
app.use("/api/users/login", authLimiter);
app.use("/api/users/signup", authLimiter);
app.use("/api/users/reset-password", authLimiter);
app.use("/api/users/x-admin-auth", authLimiter); // ✅ Protected hidden admin login
app.use("/api/", apiLimiter);

// ✅ Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Import routes
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const orderRoutes = require("./routes/orderRoutes"); // ✅ added
const paymentRoutes = require("./routes/paymentRoutes"); // ✅ payment system
const postRoutes = require("./routes/postRoutes"); // ✅ community posts
const quotationRoutes = require("./routes/quotationRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const constructionRoutes = require("./routes/constructionRoutes"); // ✅ construction projects
const constructionPlanRoutes = require("./routes/constructionPlanRoutes"); // ✅ construction catalog plans
const planCategoryRoutes = require("./routes/planCategoryRoutes"); // ✅ plan categories
const messageRoutes = require("./routes/messageRoutes"); // ✅ messages
const reviewRoutes = require("./routes/reviewRoutes"); // ✅ reviews & ratings
const architectWorkRoutes = require("./routes/architectWorkRoutes"); // ✅ architect catalog
const laborRoutes = require("./routes/laborRoutes"); // ✅ labor management
const materialRoutes = require("./routes/materialRoutes"); // ✅ materials management
const supportRoutes = require("./routes/supportRoutes"); // ✅ support tickets
const adRoutes = require("./routes/adRoutes"); // ✅ seller ad campaigns
const deliveryPricingRoutes = require("./routes/deliveryPricingRoutes"); // ✅ delivery pricing
const serviceCategoryRoutes = require("./routes/serviceCategoryRoutes"); // ✅ service categories
const followRoutes = require("./routes/followRoutes"); // ✅ follow system
const architectWorkforceRoutes = require("./routes/architectWorkforceRoutes"); // ✅ architect workforce
const customPlanRoutes = require("./routes/customPlanRoutes"); // ✅ project customization workflow

// ✅ Use routes
app.use("/api/quotations", quotationRoutes); // ✅ quotation routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/orders", orderRoutes); // ✅ order routes
app.use("/api/payments", paymentRoutes); // ✅ payment routes
app.use("/api/posts", postRoutes); // ✅ community posts
app.use("/api/services", serviceRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/construction-projects", constructionRoutes); // New Ecosystem
app.use("/api/construction", constructionRoutes);          // Legacy Support
app.use("/api/construction-plans", constructionPlanRoutes);
app.use("/api/plan-categories", planCategoryRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes); // ✅ reviews & ratings
app.use("/api/architect-works", architectWorkRoutes); // ✅ architect catalog
app.use("/api/labor", laborRoutes); // ✅ labor management
app.use("/api/materials", materialRoutes); // ✅ materials management
app.use("/api/support", supportRoutes); // ✅ support tickets
app.use("/api/config", require("./routes/configRoutes")); // ✅ website config
app.use("/api/ads", adRoutes); // ✅ seller ad campaigns
app.use("/api/delivery-pricing", deliveryPricingRoutes); // ✅ delivery pricing rules
app.use("/api/service-categories", serviceCategoryRoutes); // ✅ service categories
app.use("/api/follow", followRoutes); // ✅ follow system
app.use("/api/query", require("./routes/queryRoutes")); // ✅ custom queries and charts
app.use("/api/architect-workforce", architectWorkforceRoutes); // ✅ architect workforce
app.use("/api/custom-plans", customPlanRoutes); // ✅ project customization lifecycle

// ✅ Test & Health Routes
app.get("/", (req, res) => {
  res.send("✅ API is running...");
});

app.get("/api/health", (req, res) => {
  const isAdmin = req.headers["admin-key"] === process.env.ADMIN_MASTER_KEY;
  
  const healthData = { 
    status: "ok", 
    message: "Server is healthy",
    version: "1.0.6",
    timestamp: new Date().toISOString(),
  };

  if (isAdmin) {
    healthData.gmailConfigured = !!(process.env.GMAIL_USER && process.env.GMAIL_PASS);
    healthData.brevoConfigured = !!process.env.BREVO_API_KEY;
  }

  res.status(200).json(healthData);
});

// ✅ Email diagnostics endpoint — checks if Gmail SMTP is working
app.get("/api/email-check", async (req, res) => {
  try {
    if (req.headers["admin-key"] !== process.env.ADMIN_MASTER_KEY) {
      return res.status(403).json({ message: "Access denied" });
    }

    const { verifyEmailConfig } = require("./config/otpService");
    const result = await verifyEmailConfig();
    res.json({
      gmailUser: process.env.GMAIL_USER || "NOT SET",
      smtpVerified: result.ok,
      error: result.error || null,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal server error during diagnostics" });
  }
});

// ✅ Global error handler — prevents unhandled errors from killing CORS headers
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = status === 500 && process.env.NODE_ENV === "production"
    ? "Internal Server Error"
    : err.message || "Internal Server Error";

  if (status === 500) {
    console.error("[Global Error Handler]", err.message, err.stack);
  }

  res.status(status).json({ message });
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, "0.0.0.0", () =>
    console.log(`🚀 Server running on port ${PORT}`)
  );
});
