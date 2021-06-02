"use strict";

const express = require("express");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const StudySet = require("../models/studySet");

const router = express.Router();

router.post("/", ensureLoggedIn, async function (req, res, next) {
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

router.get("/:id", async function (req, res, next) {
	try {
		console.log(req.params.id);
		const studySet = await StudySet.getStudySet(parseInt(req.params.id));
		console.log(studySet);
		return res.status(200).json({ ...studySet });
	} catch (err) {
		return next(err);
	}
});

router.get("/:username/all", async function (req, res, next) {
	try {
		const studySets = await StudySet.usersStudySets(req.params.username);
		return res.status(200).json([...studySets]);
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
