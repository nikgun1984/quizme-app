"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");

const {
	NotFoundError,
	BadRequestError,
	UnauthorizedError,
} = require("../expressError");

class StudySet {
	static async createSet(data, username) {
		console.log("I am in createSet");
		console.log(data);
		const preCheck = await db.query(
			`SELECT username
		   FROM users
		   WHERE username = $1`,
			[username]
		);
		const user = preCheck.rows[0];

		if (!user) throw new NotFoundError(`No username: ${username}`);
		// try to find the user first
		const result = await db.query(
			`INSERT INTO studysets
		   (title,description,username)
		   VALUES ($1, $2, $3)
		   RETURNING title,description,username`,
			[data.title, data.description, username]
		);

		const studySet = result.rows[0];
		console.log("StudySet: " + studySet);

		const studysetres = await db.query(
			`SELECT id FROM studysets WHERE title = $1`,
			[data.title]
		);
		const studyID = studysetres.rows[0].id;
		console.log(studyID);
		for (let card of data.cards) {
			const { term, definition, img } = card;
			if (!img) img = "";
			const resCards = await db.query(
				`INSERT INTO flashcards
		   		(term,definition,studyset_id)
		   		VALUES ($1, $2, $3)
		   		RETURNING term,definition,studyset_id`,
				[term, definition, studyID]
			);
			console.log(resCards.rows[0]);
		}

		studySet.flashcards = data.cards;
		console.log(studySet);
		return studySet;
	}

	static async usersStudySets(username) {
		const studySets = await db.query(
			`
			SELECT * FROM studysets WHERE username = $1
		`,
			[username]
		);
		const results = studySets.rows;
		for (let studyset of results) {
			const flashcards = await db.query(
				`SELECT * FROM flashcards WHERE studyset_id = $1`,
				[studyset.id]
			);
			studyset.cards = flashcards.rows[0];
		}

		return results;
	}
}

module.exports = StudySet;
