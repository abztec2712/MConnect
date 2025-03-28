import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors()); // Enable CORS
app.use(express.json());

const SECRET_KEY = process.env.SECRET_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// 🔹 Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("✅ MongoDB Connected"))
.catch(err => console.log("❌ MongoDB Connection Error:", err));

// ✅ Mentor Schema
const MentorSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    occupation: String,
    position: String,
    department: String,
    specialty: String,
    phone: String,
    collegeEmail: String,
    photo: String
});
const Mentor = mongoose.model("Mentor", MentorSchema);

// ✅ Availability Schema
const AvailabilitySchema = new mongoose.Schema({
    mentorEmail: String,
    date: String,
    startTime: String,
    endTime: String
});
const Availability = mongoose.model("Availability", AvailabilitySchema);

// ✅ Appointment Schema
const AppointmentSchema = new mongoose.Schema({
    mentorEmail: String,
    studentName: String,
    studentEmail: String,
    date: String,
    time: String,
    status: { type: String, default: "Pending" }
});
const Appointment = mongoose.model("Appointment", AppointmentSchema);

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

// ✅ Mentor Signup
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

// ✅ Mentor Login
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

// ✅ Fetch Mentor Profile
app.get("/get-profile/:email", async (req, res) => {
    try {
        const mentor = await Mentor.findOne({ email: req.params.email }).select("-password");
        if (!mentor) return res.status(404).json({ error: "Mentor not found" });
        res.json(mentor);
    } catch (error) {
        res.status(500).json({ error: "Error retrieving profile", details: error.message });
    }
});

// ✅ Update Mentor Profile
app.post("/update-profile", async (req, res) => {
    try {
        const { email, name, occupation, position, department, specialty, phone, collegeEmail, photo } = req.body;
        const updatedMentor = await Mentor.findOneAndUpdate(
            { email },
            { name, occupation, position, department, specialty, phone, collegeEmail, photo },
            { new: true, upsert: true }
        );
        res.json({ message: "Profile updated successfully", mentor: updatedMentor });
    } catch (error) {
        res.status(500).json({ error: "Error updating profile", details: error.message });
    }
});

// ✅ Save Mentor Availability
app.post("/save-availability", async (req, res) => {
    try {
        const { mentorEmail, date, startTime, endTime } = req.body;
        const newAvailability = new Availability({ mentorEmail, date, startTime, endTime });
        await newAvailability.save();
        res.json({ message: "Availability saved successfully" });
    } catch (error) {
        res.status(500).json({ error: "Error saving availability", details: error.message });
    }
});

// ✅ Fetch Mentor Availability
app.get("/get-availability/:email", async (req, res) => {
    try {
        const availability = await Availability.find({ mentorEmail: req.params.email });
        res.json(availability);
    } catch (error) {
        res.status(500).json({ error: "Error fetching availability", details: error.message });
    }
});

// ✅ Fetch Appointment Requests
app.get("/get-appointments/:email", async (req, res) => {
    try {
        const appointments = await Appointment.find({ mentorEmail: req.params.email, status: "Pending" });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Error fetching appointments", details: error.message });
    }
});

// ✅ Fetch Scheduled Appointments
app.get("/get-scheduled-appointments/:email", async (req, res) => {
    try {
        const appointments = await Appointment.find({ mentorEmail: req.params.email, status: "Confirmed" });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: "Error fetching scheduled appointments", details: error.message });
    }
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
