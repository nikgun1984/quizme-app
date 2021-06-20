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
		console.log("IN HERE");
		console.log(data.cards);
		console.log(username);
		console.log("////////////////");
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
		console.log("studyset: ");
		console.log(studySet);

		const studysets = await db.query(
			`SELECT id FROM studysets WHERE title = $1`,
			[data.title]
		);
		const studyID = studysets.rows[0].id;
		studySet.id = studyID;
		console.log("studyID: ");
		console.log(studyID);
		const cards = [];
		for (let card of data.cards) {
			const { term, definition } = card; // deleted img
			console.log(term);
			console.log(definition);
			// if (!img) img = "";
			const resCards = await db.query(
				`INSERT INTO flashcards
		   		(term,definition,studyset_id)
		   		VALUES ($1, $2, $3)
		   		RETURNING id,term,definition,studyset_id`,
				[term, definition, studyID]
			);
			// console.log("resCards: ");
			// console.log(resCards.rows[0]);
			// console.log("/////////////");
		}
		// console.log("studySet: ");
		// console.log(studySet);
		// console.log("/////////////");
		// studySet["flashcards"] = [...data.cards];
		studySet.cards = data.cards;
		console.log("studySet: ");
		console.log(studySet);
		console.log("/////////////");
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
			console.log(flashcards.rows);
			studyset.cards = flashcards.rows;
		}
		console.log(results);

		return results;
	}

	static async updateStudySet(id, data) {
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
