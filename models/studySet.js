"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");

const {
	NotFoundError,
	BadRequestError,
	UnauthorizedError,
} = require("../expressError");

class StudySet {
	static async createSet({ username, title, description, cards }) {
		const preCheck = await db.query(
			`SELECT username
		   FROM users
		   WHERE username = $1`,
			[username]
		);
		const user = preCheck.rows[0];

		if (!user) throw new NotFoundError(`No username: ${username}`);

		const result = await db.query(
			`INSERT INTO studysets
		   (title,description,username)
		   VALUES ($1, $2, $3)
		   RETURNING id, title,description,username`,
			[title, description, username]
		);

		const studySet = result.rows[0];

		for (let card of cards) {
			const { term, definition } = card; // deleted img
			// if (!img) img = "";
			await db.query(
				`INSERT INTO flashcards
		   		(term,definition,studyset_id)
		   		VALUES ($1, $2, $3)
		   		RETURNING id,term,definition,studyset_id`,
				[term, definition, studySet.id]
			);
		}
		studySet.cards = cards;
		return studySet;
	}

	static async getStudySet(id) {
		const studySet = await db.query(
			`
			SELECT * FROM studysets WHERE id = $1
		`,
			[id]
		);
		const res = studySet.rows[0];

		if (!res) throw new NotFoundError(`No company: ${id}`);

		const flashcards = await db.query(
			`SELECT * FROM flashcards WHERE studyset_id = $1`,
			[res.id]
		);
		res.cards = flashcards.rows;
		return res;
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
			studyset.cards = flashcards.rows;
		}

		return results;
	}

	static async updateStudySet(id, data) {
		const keys = Object.keys(data);
		if (keys.length === 0) throw new BadRequestError("No data");
		// console.log("ID: " + id);
		// console.log("DATA ID: " + data.id);
		const set = await db.query(
			`UPDATE studysets
		     SET title = $1, description = $2
		     WHERE id = $3
		     RETURNING title, description
		    `,
			[data.title, data.description, data.id]
		);

		const studyset = set.rows[0];

		if (!studyset) throw new NotFoundError(`No studyset: ${id}`);

		studyset.cards = [];

		/* UPSERT operation if item exists update it otherwise insert a new one */
		for (let card of data.cards) {
			let resCard = await db.query(
				`UPDATE flashcards SET term = $1, definition = $2 WHERE id = $3
				RETURNING id, term, definition, studyset_id;
				`,
				[card.term, card.definition, card.id]
			);
			if (!resCard.rows.length) {
				resCard = await db.query(
					`INSERT INTO flashcards (term,definition,studyset_id) 
				VALUES ($1, $2, $3)
				RETURNING id, term, definition, studyset_id;
				`,
					[card.term, card.definition, data.id]
				);
			}
			// console.log(resCard);
			studyset.cards.push(resCard.rows[0]);
		}
		return studyset;
	}

	static async removeStudyset(id) {
		const result = await db.query(
			`DELETE FROM studysets
           	 WHERE id = $1
           	 RETURNING id`,
			[id]
		);
		const set = result.rows[0];

		if (!set) throw new NotFoundError(`No studyset: ${id} found`);
	}

	static async removeFlashcard(id) {
		const result = await db.query(
			`DELETE FROM flashcards
           	 WHERE id = $1
           	 RETURNING id`,
			[id]
		);
		const card = result.rows[0];

		if (!card) throw new NotFoundError(`No flashcard: ${id} found`);
	}
}

module.exports = StudySet;
