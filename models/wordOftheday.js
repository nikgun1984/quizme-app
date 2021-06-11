"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");
const { getRandomWord } = require("../helpers/generateRandomWord");

const {
	NotFoundError,
	BadRequestError,
	UnauthorizedError,
} = require("../expressError");

class WordOfDay {
	static async getWord(date) {
		console.log("I am in word of the day");
		console.log(date);
		const preCheck = await db.query(
			`SELECT *
		   FROM dailyword
		   WHERE created_at = $1`,
			[date]
		);
		const word = preCheck.rows[0];

		if (!word) return;

		return word;
	}

	static async createWord(date) {
		console.log("I am in word of the day");
		console.log(date);
		const preCheck = await db.query(
			`SELECT *
		   FROM dailyword
		   WHERE created_at = $1`,
			[date]
		);
		const word = preCheck.rows[0];
		console.log(word);
		if (!word) {
			const data = await getRandomWord();
			const result = await db.query(
				`INSERT INTO dailyword
		   		(term,part_speech,definition,syllable)
		   		VALUES ($1, $2, $3, $4)
		   		RETURNING term,part_speech,definition,syllable,created_at`,
				[data.term, data.partSpeech, data.definitions, data.syllables]
			);
			return result.rows[0];
		}
		return word;
	}
}

module.exports = WordOfDay;
