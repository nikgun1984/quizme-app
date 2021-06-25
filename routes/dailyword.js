"use strict";

const express = require("express");
const WordOfDay = require("../models/wordOftheday");

const router = express.Router();

router.get("/", async function (req, res, next) {
	try {
		console.log(req.query.date);
		const dailyWord = await WordOfDay.createWord(req.query.date);
		console.log(dailyWord);
		return res.status(201).json({
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
