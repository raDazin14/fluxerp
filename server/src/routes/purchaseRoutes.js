const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  createPurchase,
  listPurchases,
  deletePurchase,
} = require("../controllers/purchaseController");

router.post("/", authMiddleware, createPurchase);
router.get("/", authMiddleware, listPurchases);
router.delete("/:id", authMiddleware, deletePurchase);

module.exports = router;