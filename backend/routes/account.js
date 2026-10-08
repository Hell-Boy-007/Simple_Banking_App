// backend/routes/account.js
const express = require('express');
const { authMiddleware } = require('../middleware');
const { Account } = require('../db');
const mongoose = require("mongoose")
const zod = require("zod");

const router = express.Router();
const transferSchema = zod.object({
    to: zod.string().refine((value) => mongoose.Types.ObjectId.isValid(value)),
    amount: zod.number().finite().positive()
});

router.get("/balance", authMiddleware, async (req, res) => {
    try {
        const account = await Account.findOne({ userId: req.userId });
        if (!account) {
            return res.status(404).json({ message: "Account not found" });
        }

        return res.json({ balance: account.balance });
    } catch (error) {
        return res.status(500).json({ message: "Unable to retrieve balance" });
    }
});

router.post("/transfer", authMiddleware, async (req, res) => {
    const parsed = transferSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Invalid transfer details" });
    }

    const { amount, to } = parsed.data;
    if (String(req.userId) === to) {
        return res.status(400).json({ message: "Cannot transfer to yourself" });
    }

    let session;
    try {
        session = await mongoose.startSession();
        session.startTransaction();

        const sender = await Account.findOne({ userId: req.userId }).session(session);
        if (!sender) {
            await session.abortTransaction();
            return res.status(404).json({ message: "Sender account not found" });
        }
        if (sender.balance < amount) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const recipient = await Account.findOne({ userId: to }).session(session);
        if (!recipient) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Invalid recipient account" });
        }

        const debit = await Account.updateOne(
            { userId: req.userId, balance: { $gte: amount } },
            { $inc: { balance: -amount } },
            { session }
        );
        if (debit.modifiedCount === 0) {
            await session.abortTransaction();
            return res.status(400).json({ message: "Insufficient balance" });
        }

        await Account.updateOne(
            { userId: to },
            { $inc: { balance: amount } },
            { session }
        );

        await session.commitTransaction();
        return res.json({ message: "Transfer successful" });
    } catch (error) {
        if (session?.inTransaction()) {
            await session.abortTransaction().catch(() => {});
        }
        return res.status(500).json({ message: "Transfer failed" });
    } finally {
        if (session) {
            await session.endSession();
        }
    }
});

module.exports = router;