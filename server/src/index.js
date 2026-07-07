const express = require("express");
const cors = require("cors");
const companyRoutes = require("./routes/companyRoutes");
const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const saleRoutes = require("./routes/saleRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const stockRoutes = require("./routes/stockRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const financialRoutes = require("./routes/financialRoutes");
const reportsRoutes = require("./routes/reportsRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");

require("dotenv").config();

require("./config/database");

const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/sales", saleRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/financial", financialRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/purchases", purchaseRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "🚀 FluxERP API funcionando!"
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});