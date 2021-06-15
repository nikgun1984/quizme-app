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
			const { term, definition } = card; // deleted img
			// if (!img) img = "";
			const resCards = await db.query(
				`INSERT INTO flashcards
		   		(term,definition,studyset_id)
		   		VALUES ($1, $2, $3)
		   		RETURNING id,term,definition,studyset_id`,
				[term, definition, studyID]
			);
			console.log(resCards.rows[0]);
		}

		studySet.flashcards = data.cards;
		console.log(studySet);
		return studySet;
	}

	static async getStudySet(id) {
		console.log(id);
		const studySet = await db.query(
			`
			SELECT * FROM studysets WHERE id = $1
		`,
			[id]
		);
		const res = studySet.rows[0];
		console.log(res);

		const flashcards = await db.query(
			`SELECT * FROM flashcards WHERE studyset_id = $1`,
			[res.id]
		);
		console.log(flashcards);
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
		console.log("IM IN Update");
		console.log(data);
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
		for (let card of data.cards) {
			const resCard = await db.query(
				`UPDATE flashcards 
				SET term = $1, definition = $2
				WHERE id = $3
				RETURNING term, definition
				`,
				[card.term, card.definition, card.id]
			);
			studyset.cards.push(resCard.rows[0]);
			console.log(resCard.rows[0]);
		}
		const flashcards = await db.query(
			`
			SELECT * FROM flashcards WHERE studyset_id = $1
		    `,
			[id]
		);

		if (flashcards.rows.length < data.cards.length) {
			for (let i = flashcards.rows.length; i < data.cards.length; i++) {
				const resCard = await db.query(
					`INSERT INTO flashcards
		   				(term,definition,studyset_id)
		   				VALUES ($1, $2, $3)
		   				RETURNING id,term,definition,studyset_id`,
					[data.cards[i].term, data.cards[i].definition, id]
				);
				studyset.cards.push(resCard.rows[0]);
			}
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
