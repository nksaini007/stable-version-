const express = require("express");
const router = express.Router();
const {
   getUsers,
   getProviders,
   getUserById,
   createUser,
   updateUser,
   deleteUser,
   loginUser,
   adminSecretLogin,
   getMyProfile,
   updateMyProfile,
   changePassword,
   toggleUserActive,
   approveUser,
   changeUserRole,
   uploadProfile,
   getSellerPublicProfile,
   getArchitectPublicProfile,
   sendOTP,
   verifyOTP,
   resetPassword,
   logoutUser,
   verifyEmailConfig,
} = require("../controllers/userController");

const { protect, adminOnly } = require("../middlewares/authMiddleware");

/* ============================================================
   🔓 Public Routes
============================================================ */
router.post("/signup", uploadProfile, createUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);
router.get("/shop/:id", getSellerPublicProfile);
router.get("/architect/:id", getArchitectPublicProfile);
// Diagnostic route - check email config status
router.get("/test-email-config", verifyEmailConfig);
// Hidden admin gate — not linked in any UI or docs
router.post("/x-admin-auth", adminSecretLogin);

/* ============================================================
   🔐 Profile Routes (Logged-in User)
============================================================ */
router.get("/me", protect, getMyProfile);
router.put("/me", protect, uploadProfile, updateMyProfile);
router.put("/me/password", protect, changePassword);

/* ============================================================
   🛡️ Admin Routes
============================================================ */
router.get("/", protect, adminOnly, getUsers);
router.get("/providers", protect, adminOnly, getProviders);
router.get("/:id", protect, getUserById);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);
router.put("/:id/toggle-active", protect, adminOnly, toggleUserActive);
router.put("/:id/approve", protect, adminOnly, approveUser);
router.put("/:id/role", protect, adminOnly, changeUserRole);

module.exports = router;
