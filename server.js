const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
dotenv.config();
const jwt = require("jsonwebtoken");
const generateToken = require("./utils/generateToken");



const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));


// User model
const User = mongoose.model("User", new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String
}));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.set("views", path.join(__dirname, "views"));
app.use(express.static("public"));

// Routes

app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existing = await User.findOne({ email });
        if (existing) return res.send("User already exists. <a href='/login'>Login</a>");

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.send("Registration successful. <a href='/login'>Login</a>");
    } catch (err) {
        console.error(err);
        res.status(500).send("Error registering user.");
    }
});

app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.send("User not found. <a href='/login'>Try again</a>");

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.send("Incorrect password. <a href='/login'>Try again</a>");

        const token = generateToken(user._id);

        res.send(`
  <h2>Login successful!</h2>
  ...
`);

    } catch (err) {
        console.error(err);
        res.status(500).send("Login error.");
    }
});

app.get("/home", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "home.html"));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
