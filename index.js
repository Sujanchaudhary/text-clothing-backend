const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
var cors = require("cors");
require("dotenv").config();

const db = require("./models/index");
const authRoute = require("./routes/authRoute");
const categoryRoutes = require("./routes/categoryRoute");
const productRoutes = require("./routes/product");
const inventoryRoutes = require("./routes/inventoryRoute");
const unitRoutes = require("./routes/unitRoute");
const stockHistoryRoutes = require("./routes/stockRoute");
const saleRoutes = require("./routes/saleRoute");
const saleItemRoutes = require("./routes/saleItemRoute");
const expenseRoutes = require("./routes/expensRoute");
const dashboardRoute = require("./routes/dashboardRoute");
const reportRoute = require("./routes/reportRoute");

const { seedUsers } = require("./seeders");
const { setupSocket } = require("./middleware/notificationSocket");

(async () => {
  try {
    await seedUsers();

    console.log("Seeding completed successfully.");
  } catch (error) {
    console.error("Error during user seeding:", error);
  }
})();

db.sequelize.sync({ force: 0 });

const corsOptions = {
  origin: "*",
};

// routes

app.use(cors(corsOptions));

const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
setupSocket(server);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "static")));

app.use("/api/auth", authRoute);
app.use("/api/", categoryRoutes);
app.use("/api/", productRoutes);
app.use("/api/", inventoryRoutes);
app.use("/api/", unitRoutes);
app.use("/api/", stockHistoryRoutes);
app.use("/api/", saleRoutes);
app.use("/api/", saleItemRoutes);
app.use("/api/", expenseRoutes);
app.use("/api/", dashboardRoute);
app.use("/api/", reportRoute);

server.listen(8000, () => {
  console.log(`App is running on port 8000`);
});
