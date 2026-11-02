const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("./config/db");
const groupRoutes = require("./routes/groupRoutes");
const studentRoutes = require("./routes/studentRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const bookRoutes =
  require('./routes/bookRoutes');
 const bookPaymentRoutes =
  require('./routes/bookPaymentRoutes');
// Charger les variables d'environnement
dotenv.config();

// Connexion MongoDB
connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

// ==========================================
// Middlewares
// ==========================================
app.use(cors());
app.use(express.json());

// ==========================================
// Routes
// ==========================================

app.get("/", (req, res) => {
  res.json({
    message: "API Étude Math fonctionne correctement",
  });
});

// API Groupes
app.use("/api/groups", groupRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/attendances", attendanceRoutes);
app.use("/api/payments", paymentRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/book-payments', bookPaymentRoutes); // ==========================================
// Démarrage du serveur
// ==========================================

app.listen(PORT, () => {
  console.log(
    `🚀 Serveur Étude Math démarré sur http://localhost:${PORT}`
  );
});
