const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { getReportsSummary } = require("../controllers/reportsController");

router.get("/", authMiddleware, getReportsSummary);

module.exports = router;