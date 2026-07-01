const express = require("express");
const {
  createCompany,
  listCompanies,
  updateCompany,
  deleteCompany,
} = require("../controllers/companyController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authMiddleware, createCompany);
router.get("/", authMiddleware, listCompanies);
router.put("/:id", authMiddleware, updateCompany);
router.delete("/:id", authMiddleware, deleteCompany);

module.exports = router;