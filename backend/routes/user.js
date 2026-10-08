const express = require("express")
const zod = require("zod")
const mongoose = require("mongoose")
const { User, Account } = require("../db")
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { JWT_SECRET } = require("../config");
const { authMiddleware } = require("../middleware");
const router = express.Router()

const signupSchema = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string().min(6)
})

router.post("/signup", async (req, res) => {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Incorrect inputs" });
    }

    let session;
    try {
        const { username, firstName, lastName, password } = parsed.data;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(409).json({ message: "Email already taken" });
        }

        const passwordHash = await bcrypt.hash(password, 12);
        session = await mongoose.startSession();
        let user;
        await session.withTransaction(async () => {
            [user] = await User.create([{
                username,
                firstName,
                lastName,
                password: passwordHash
            }], { session });
            await Account.create([{
                userId: user._id,
                balance: 1 + Math.random() * 10000
            }], { session });
        });

        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({ message: "User created successfully", token });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Email already taken" });
        }
        return res.status(500).json({ message: "Unable to create account" });
    } finally {
        if (session) {
            await session.endSession();
        }
    }
})

const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin", async (req, res) => {
    const parsed = signinBody.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Incorrect inputs" });
    }

    try {
        const user = await User.findOne({ username: parsed.data.username });
        const passwordMatches = user && await bcrypt.compare(parsed.data.password, user.password);

        if (!passwordMatches) {
            return res.status(401).json({ message: "Error while logging in" });
        }

        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({ token });
    } catch (error) {
        return res.status(500).json({ message: "Unable to log in" });
    }
})

const updateBody = zod.object({
    password: zod.string().min(6).optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
}).refine((data) => Object.keys(data).length > 0)

router.put("/", authMiddleware, async (req, res) => {
    const parsed = updateBody.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: "Error while updating information"
        });
    }

    try {
        const updates = parsed.data;
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 12);
        }

        const result = await User.updateOne({ _id: req.userId }, updates);
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.json({ message: "Updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: "Unable to update information" });
    }
})

router.get("/bulk", async (req, res) => {
    const filter = req.query.filter || "";

    try {
        const users = await User.find({
            $or: [{
                firstName: {
                    "$regex": filter
                }
            }, {
                lastName: {
                    "$regex": filter
                }
            }]
        });

        return res.json({
            user: users.map(user => ({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
        });
    } catch (error) {
        return res.status(500).json({ message: "Unable to retrieve users" });
    }
})

module.exports = router