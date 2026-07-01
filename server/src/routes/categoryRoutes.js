const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
    createCategory,
    listCategories,
    updateCategory,
    deleteCategory
} = require("../controllers/categoryController");

router.post("/", authMiddleware, createCategory);
router.get("/", authMiddleware, listCategories);
router.put("/:id", authMiddleware, updateCategory);
router.delete("/:id", authMiddleware, deleteCategory);

module.exports = router;