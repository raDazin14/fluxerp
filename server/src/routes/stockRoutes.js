const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    stockEntry,
    stockExit,
    listStockMovements
} = require("../controllers/stockController");

router.post("/entry", authMiddleware, stockEntry);
router.post("/exit", authMiddleware, stockExit);
router.get("/movements", authMiddleware, listStockMovements);

module.exports = router;