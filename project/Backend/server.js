import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;

console.log("MongoDB URI:", process.env.MONGO_URI);

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Connection Error:", err));

// Mentor Schema
const MentorSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
});
const Mentor = mongoose.model("Mentor", MentorSchema);

// ✅ JWT Middleware to Protect Routes
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) return res.status(403).json({ error: "No token provided" });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Unauthorized: Invalid token" });
        req.userId = decoded.id;
        next();
    });
};

// ✅ Mentor Signup Route
app.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingMentor = await Mentor.findOne({ email });
        if (existingMentor) return res.status(400).json({ error: "Email already registered" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newMentor = new Mentor({ name, email, password: hashedPassword });
        await newMentor.save();
        res.status(201).json({ message: "Mentor registered successfully" });
    } catch (error) {
        res.status(500).json({ error: "Signup failed", details: error.message });
    }
});

// ✅ Mentor Login Route
app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const mentor = await Mentor.findOne({ email });
        if (!mentor) return res.status(400).json({ error: "Mentor not found" });

        const isMatch = await bcrypt.compare(password, mentor.password);
        if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

        const token = jwt.sign({ id: mentor._id }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Login failed", details: error.message });
    }
});

// ✅ Protected Mentor Dashboard Route
app.get("/mentor-dashboard", verifyToken, async (req, res) => {
    try {
        const mentor = await Mentor.findById(req.userId).select("-password");
        if (!mentor) return res.status(404).json({ error: "Mentor not found" });

        res.json({ message: "Welcome to Mentor Dashboard", mentor });
    } catch (error) {
        res.status(500).json({ error: "Error retrieving dashboard", details: error.message });
    }
});

// ✅ Test Database Connection
app.get("/test-db", async (req, res) => {
    try {
        await mongoose.connection.db.admin().ping();
        res.json({ message: "Database connected successfully" });
    } catch (error) {
        res.status(500).json({ error: "Database connection failed", details: error.message });
    }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
