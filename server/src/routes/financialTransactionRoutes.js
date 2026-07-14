const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createTransaction,
  listTransactions,
  updateTransaction,
  markAsPaid,
  deleteTransaction,
  getFinancialSummary,
} = require("../controllers/financialTransactionController");

router.post("/", authMiddleware, createTransaction);
router.get("/", authMiddleware, listTransactions);
router.get("/summary", authMiddleware, getFinancialSummary);
router.put("/:id", authMiddleware, updateTransaction);
router.patch("/:id/pay", authMiddleware, markAsPaid);
router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;