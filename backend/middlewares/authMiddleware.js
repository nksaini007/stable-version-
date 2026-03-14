
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

/**
 * ====================================================
 *  PROTECT MIDDLEWARE (Verify Token & Attach User)
 * ====================================================
 */
const protect = async (req, res, next) => {
  let token;

  try {
    // ✅ Check if token exists and starts with "Bearer"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // ✅ Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ Fetch user and exclude password
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(404).json({ message: "User not found" });
      }

      next();
    } else {
      return res.status(401).json({ message: "Authorization token missing" });
    }
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * ====================================================
 *  ROLE-BASED ACCESS CONTROL
 * ====================================================
 */

// ✅ Admin only
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied — Admins only" });
  }
};

// ✅ Seller only
const sellerOnly = (req, res, next) => {
  if (req.user && req.user.role === "seller") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied — Sellers only" });
  }
};

// ✅ Delivery only
const deliveryOnly = (req, res, next) => {
  if (req.user && req.user.role === "delivery") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied — Delivery personnel only" });
  }
};

// ✅ Customer only
const customerOnly = (req, res, next) => {
  if (req.user && req.user.role === "customer") {
    next();
  } else {
    return res.status(403).json({ message: "Access denied — Customers only" });
  }
};
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};



module.exports = {
  protect,
  adminOnly,
  sellerOnly,
  deliveryOnly,
  customerOnly,authorize
};
