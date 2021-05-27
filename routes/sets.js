"use strict";

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const User = require("../models/user");

const { createToken } = require("../helpers/tokens");

const router = express.Router();

router.post("/", async function (req, res, next) {
	try {
		const user = await User.register(req.body);
		const token = createToken(user);
		return res.status(201).json({ user, token });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
