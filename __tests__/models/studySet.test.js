"use strict";

const db = require("../../db");
const {
	BadRequestError,
	NotFoundError,
	UnauthorizedError,
} = require("../../expressError");
const StudySet = require("../../models/studySet");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	setIds,
	flashcardsIds,
} = require("../../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create studyset */

describe("create", function () {
	let newSet;
	beforeEach(function () {
		newSet = {
			username: "testuser",
			title: "New",
			description: "New Description",
			cards: [
				{ term: "word1", definition: "definition1" },
				{ term: "word2", definition: "definition2" },
			],
			id: 0,
		};
	});

	test("works", async function () {
		let set = await StudySet.createSet(newSet);
		newSet.id = set.id;
		expect(set).toEqual(newSet);

		const resultSet = await db.query(
			`SELECT id, username, title, description
           FROM studysets
           WHERE title = 'New'`
		);
		const resultFlashcards = await db.query(
			`SELECT term, definition
           FROM flashcards
           WHERE studyset_id = $1`,
			[resultSet.rows[0].id]
		);
		const result = resultSet.rows[0];
		result.cards = resultFlashcards.rows;
		expect(result).toEqual({
			id: set.id,
			username: "testuser",
			title: "New",
			description: "New Description",
			cards: [
				{ term: "word1", definition: "definition1" },
				{ term: "word2", definition: "definition2" },
			],
		});
	});
});

/************************************** get studyset */

describe("get", function () {
	test("works", async function () {
		let studyset = await StudySet.getStudySet(setIds[0]);
		expect(studyset).toEqual({
			id: setIds[0],
			username: "testuser",
			title: "New Words",
			description: "Memorize new words every day",
			cards: [
				{
					term: "finicky",
					definition: "very detailed",
					studyset_id: setIds[0],
					id: studyset.cards[0].id,
				},
				{
					term: "preconceived",
					definition: "believed  before one has full knowledge",
					studyset_id: setIds[0],
					id: studyset.cards[1].id,
				},
				{
					term: "harness",
					definition: "put into use",
					studyset_id: setIds[0],
					id: studyset.cards[2].id,
				},
			],
		});
	});

	test("not found if no such set", async function () {
		try {
			await StudySet.getStudySet(0);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

/************************************** get user's studysets */

describe("get user studysets", function () {
	test("works", async function () {
		let studysets = await StudySet.usersStudySets("testadmin");
		expect(studysets).toEqual([
			{
				id: setIds[2],
				title: "Computer Science Terminology",
				description: "Learn JS jargon",
				username: "testadmin",
				cards: [
					{
						term: "closure",
						definition:
							"the  ability of function to remember variables defined in outer functions",
						studyset_id: setIds[2],
						id: studysets[0].cards[0].id,
					},
					{
						term: "IIFE",
						definition: "immediately invoked function",
						studyset_id: setIds[2],
						id: studysets[0].cards[1].id,
					},
					{
						term: "Prototype",
						definition:
							"object that is associated with every functions and objects by default in JavaScript",
						studyset_id: setIds[2],
						id: studysets[0].cards[2].id,
					},
				],
			},
		]);
	});
});

/************************************** update studyset */

describe("update", function () {
	let newData;
	/*
		WHAT WILL BE CHANGED and UPDATED:
			- title and description will be updated
			- flashcard1's term will be updated
			- flashcard3 will be deleted
			- 2 flashcards will be added
	*/
	beforeEach(function () {
		newData = {
			id: setIds[0],
			username: "testuser",
			title: "New",
			description: "New Description",
			cards: [
				{ id: flashcardsIds[0], term: "trickery", definition: "very detailed" },
				{
					id: flashcardsIds[1],
					term: "preconceived",
					definition: "believed  before one has full knowledge",
				},
				{ term: "word1", definition: "definition1" },
				{ term: "word2", definition: "definition2" },
			],
		};
	});

	test("works", async function () {
		let studySet = await StudySet.updateStudySet(setIds[0], newData);
		expect(studySet).toEqual({
			title: "New",
			description: "New Description",
			cards: [
				{
					id: studySet.cards[0].id,
					term: "trickery",
					definition: "very detailed",
					studyset_id: setIds[0],
				},
				{
					id: studySet.cards[1].id,
					term: "preconceived",
					definition: "believed  before one has full knowledge",
					studyset_id: setIds[0],
				},
				{
					id: studySet.cards[2].id,
					term: "word1",
					definition: "definition1",
					studyset_id: setIds[0],
				},
				{
					id: studySet.cards[3].id,
					term: "word2",
					definition: "definition2",
					studyset_id: setIds[0],
				},
			],
		});

		const set = await db.query(
			`SELECT id, title, description FROM studysets WHERE id=$1`,
			[setIds[0]]
		);
		const cards = await db.query(
			`SELECT term, definition FROM flashcards WHERE studyset_id=$1`,
			[set.rows[0].id]
		);
		const result = set.rows[0];
		result.cards = cards.rows;
		expect(result).toEqual({
			id: setIds[0],
			title: "New",
			description: "New Description",
			cards: [
				{ term: "harness", definition: "put into use" },
				{ term: "trickery", definition: "very detailed" },
				{
					term: "preconceived",
					definition: "believed  before one has full knowledge",
				},
				{ term: "word1", definition: "definition1" },
				{ term: "word2", definition: "definition2" },
			],
		});
	});

	test("not found if no such study set", async function () {
		try {
			newData.id = 0;
			const set = await StudySet.updateStudySet(setIds[0], newData);
			console.log(set);
			fail();
		} catch (err) {
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});

	test("bad request with no data", async function () {
		try {
			await StudySet.updateStudySet(setIds[0], {});
			fail();
		} catch (err) {
			expect(err instanceof BadRequestError).toBeTruthy();
		}
	});
});

describe("remove study set", function () {
	test("works", async function () {
		await StudySet.removeStudyset(setIds[0]);
		const res = await db.query(`SELECT * FROM studysets WHERE id=$1`, [
			setIds[0],
		]);
		expect(res.rows.length).toEqual(0);
	});

	test("not found if no such studyset", async function () {
		try {
			await StudySet.removeStudyset(0);
			fail();
		} catch (err) {
			console.log(err);
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});

describe("remove a flashcard", function () {
	test("works", async function () {
		await StudySet.removeFlashcard(flashcardsIds[0]);
		const res = await db.query(`SELECT * FROM flashcards WHERE id=$1`, [
			flashcardsIds[0],
		]);
		expect(res.rows.length).toEqual(0);
	});

	test("not found if no such flashcard", async function () {
		try {
			await StudySet.removeFlashcard(0);
			fail();
		} catch (err) {
			console.log(err);
			expect(err instanceof NotFoundError).toBeTruthy();
		}
	});
});
