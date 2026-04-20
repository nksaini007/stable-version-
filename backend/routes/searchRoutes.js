const express = require("express");
const router = express.Router();
const { getSuggestions } = require("../controllers/searchController");

// ✅ Get aggregated search suggestions
// Example: GET /api/search/suggestions?q=cement
router.get("/suggestions", getSuggestions);

module.exports = router;
