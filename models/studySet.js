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
           RETURNING id,title,description`,
			[data.title, data.description]
		);

		const studySet = result.rows[0];
		console.log("StudySet: " + studySet);

		for (let card of data.cards) {
			const { term, definition, img } = card;
			const resCards = await db.query(
				`INSERT INTO flashcards
           		(term,definition,img,studyset_id)
           		VALUES ($1, $2, $3, $4)
           		RETURNING term,definition,img,studyset_id`,
				[term, definition, img]
			);
			console.log(resCards.rows[0]);
		}

		studySet.flashcards = data.cards;

		return studySet;
	}
}

module.exports = StudySet;
