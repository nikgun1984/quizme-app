"use strict";

const express = require("express");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const StudySet = require("../models/studySet");

const router = express.Router();

router.post("/", ensureLoggedIn, async function (req, res, next) {
	console.log(Object.entries(req.body.data.cards));
	try {
		const studySet = await StudySet.createSet(
			req.body,
			res.locals.user.username
		);
		return res.status(201).json({ studySet });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
