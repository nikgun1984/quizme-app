"use strict";

const express = require("express");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const { BadRequestError } = require("../expressError");
const StudySet = require("../models/studySet");

const router = express.Router();

router.post("/", ensureLoggedIn, async function (req, res, next) {
	try {
		const studySet = await StudySet.createSet(req.body);
		return res.status(201).json({ studySet });
	} catch (err) {
		return next(err);
	}
});

router.get("/:id", async function (req, res, next) {
	try {
		const studySet = await StudySet.getStudySet(parseInt(req.params.id));
		return res.status(200).json({ ...studySet });
	} catch (err) {
		return next(err);
	}
});

router.put("/:id", ensureLoggedIn, async function (req, res, next) {
	try {
		const studySet = await StudySet.updateStudySet(
			parseInt(req.params.id),
			req.body
		);
		return res.status(200).json({ ...studySet });
	} catch (err) {
		return next(err);
	}
});

router.delete("/:id", ensureLoggedIn, async function (req, res, next) {
	try {
		await StudySet.removeStudyset(req.params.id);
		return res.json({ deleted: +req.params.id });
	} catch (err) {
		return next(err);
	}
});

router.delete(
	"/flashcard/:id",
	ensureLoggedIn,
	async function (req, res, next) {
		try {
			await StudySet.removeFlashcard(req.params.id);
			return res.json({ deleted: +req.params.id });
		} catch (err) {
			return next(err);
		}
	}
);

router.get("/:username/all", async function (req, res, next) {
	try {
		const studySets = await StudySet.usersStudySets(req.params.username);
		return res.status(200).json([...studySets]);
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
