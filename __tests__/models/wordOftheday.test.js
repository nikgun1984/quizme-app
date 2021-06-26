"use strict";

const db = require("../../db");
const { getRandomWord } = require("../../helpers/generateRandomWord");

const WordOfDay = require("../../models/wordOftheday");

/************************************** create wordOftheday */

describe("create a word of the day", function () {
	test("works", async function () {
		const word = await WordOfDay.createWord("2021-06-25");
		expect(word).toEqual({
			term: expect.any(String),
			part_speech: expect.any(String),
			syllable: expect.any(String),
			definition: expect.any(String),
			created_at: expect.any(Date),
		});
	});
});

/************************************** get wordOftheday */

describe("get", function () {
	let result;
	beforeEach(async function () {
		const data = await getRandomWord();
		result = await db.query(
			`INSERT INTO dailyword
		   		(term,part_speech,definition,syllable)
		   		VALUES ($1, $2, $3, $4)
		   		RETURNING term,part_speech,definition,syllable,created_at`,
			[data.term, data.partSpeech, data.definitions, data.syllables]
		);
	});

	test("works", async function () {
		const date = result.rows[0].created_at;
		console.log(date.toISOString().slice(0, 10));
		let wordOftheday = await WordOfDay.getWord(date.toISOString().slice(0, 10));
		expect(wordOftheday).toEqual({
			id: wordOftheday.id,
			term: wordOftheday.term,
			part_speech: wordOftheday.part_speech,
			definition: wordOftheday.definition,
			syllable: wordOftheday.syllable,
			created_at: wordOftheday.created_at,
		});
	});
});
