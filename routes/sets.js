"use strict";

const express = require("express");
const { ensureCorrectUserOrAdmin, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const StudySet = require("../models/studySet");

const router = express.Router();

router.post("/", ensureCorrectUserOrAdmin, async function (req, res, next) {
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
