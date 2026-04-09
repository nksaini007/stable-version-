try {
  console.log("Testing imports...");
  require("express");
  require("cors");
  require("dotenv").config();
  require("path");
  require("helmet");
  require("express-rate-limit");
  require("cookie-parser");
  require("express-mongo-sanitize");
  console.log("Core middlewares loaded.");

  // Test routes
  require("./backend/routes/userRoutes");
  require("./backend/routes/productRoutes");
  require("./backend/routes/categoryRoutes");
  require("./backend/routes/orderRoutes");
  require("./backend/routes/paymentRoutes");
  require("./backend/routes/postRoutes");
  require("./backend/routes/quotationRoutes");
  require("./backend/routes/serviceRoutes");
  require("./backend/routes/bookingRoutes");
  require("./backend/routes/constructionRoutes");
  require("./backend/routes/constructionPlanRoutes");
  require("./backend/routes/planCategoryRoutes");
  require("./backend/routes/messageRoutes");
  require("./backend/routes/reviewRoutes");
  require("./backend/routes/architectWorkRoutes");
  require("./backend/routes/laborRoutes");
  require("./backend/routes/materialRoutes");
  require("./backend/routes/supportRoutes");
  require("./backend/routes/adRoutes");
  require("./backend/routes/deliveryPricingRoutes");
  require("./backend/routes/serviceCategoryRoutes");
  require("./backend/routes/followRoutes");
  require("./backend/routes/architectWorkforceRoutes");
  console.log("All routes loaded successfully.");
} catch (err) {
  console.error("Import failed:", err.message);
  console.error(err.stack);
  process.exit(1);
}
