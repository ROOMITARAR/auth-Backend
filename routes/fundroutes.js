const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { upload } = require('../services/file-upload.service');
const stuser = require('../models/stuser');
const FundUser = require('../models/fundUser');

const router = Router();

router.post('/fundrequest', async (req, res) => {
    try {
        const cookie = req.cookies['jwt'];
        if (!cookie) return res.status(401).json({ error: 'Unauthenticated' });
        const claims = jwt.verify(cookie, process.env.JWT_SECRET);
        if (!claims) return res.status(401).json({ error: 'Unauthenticated' });

        const { identity, amount, whyneed } = req.body;

        // Fetch the authenticated student user
        const student = await stuser.findById(claims._id);
        if (!student) {
            return res.status(403).json({ error: 'Only registered students can apply for funds.' });
        }

        const email = student.email;

        // If email exists, proceed with saving the fund request
        const newFundUser = new FundUser({
            email,
            identity,
            amount,
            whyneed,
        });

        const result = await newFundUser.save();
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;
