const express = require("express");
const { getDashboardData } = require("../controllers/dashboard");
const router = express.Router();

router.get("/dashboard/data", getDashboardData);

module.exports = router;
