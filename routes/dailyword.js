"use strict";

const express = require("express");
const WordOfDay = require("../models/wordOftheday");

const router = express.Router();

router.get("/word", async function (req, res, next) {
	try {
		console.log("IM IN HERE");
		console.log("Line  11: " + req.query.date);
		const dailyWord = await WordOfDay.createWord(req.query.date);
		return res
			.status(201)
			.json({
				term: dailyWord.term,
				partOfSpeech: dailyWord.part_speech,
				defs: dailyWord.definition,
				syllable: dailyWord.syllable,
			});
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
