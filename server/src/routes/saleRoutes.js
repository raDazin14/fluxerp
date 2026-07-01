const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createSale,
    listSales,
    getSaleById
} = require("../controllers/saleController");

router.post("/", authMiddleware, createSale);
router.get("/", authMiddleware, listSales);
router.get("/:id", authMiddleware, getSaleById);

module.exports = router;