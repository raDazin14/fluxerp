const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getFinancialSummary } = require("../controllers/financialController");

router.get("/", authMiddleware, getFinancialSummary);

module.exports = router;