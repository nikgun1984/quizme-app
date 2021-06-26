const bcrypt = require("bcrypt");

const db = require("../db");
const { BCRYPT_WORK_FACTOR } = require("../config");

const setIds = [];
const flashcardsIds = [];

async function commonBeforeAll() {
	await db.query("DELETE FROM users");

	await db.query(
		`
        INSERT INTO users (username, password, email, is_admin)
		VALUES ('testuser', $1,'john@johndoe.com',FALSE),
       		   ('testadmin',$2,'jane@janedoe.com',TRUE)
        RETURNING username, email, is_admin AS "isAdmin"`,
		[
			await bcrypt.hash("password1", BCRYPT_WORK_FACTOR),
			await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
		]
	);

	const studysets = await db.query(`
    INSERT INTO studysets (title,description,username)
	VALUES ('New Words', 'Memorize new words every day', 'testuser'),
	   	   ('Best slang', 'Informal words', 'testuser'),
	       ('Computer Science Terminology', 'Learn JS jargon', 'testadmin')
    RETURNING id
	`);
	// setIds.push(...studysets.rows.map((r) => r.id));
	setIds.splice(0, 0, ...studysets.rows.map((r) => r.id));
	const flashcards = await db.query(
		`
		INSERT INTO flashcards (term,definition,studyset_id)
		VALUES ('finicky','very detailed', $1),
	   		   ('preconceived','believed  before one has full knowledge', $1),
	           ('harness','put into use', $1),
	           ('chill out','calm down', $2),
	           ('balling','have a luxurious lifestyle', $2),
	           ('slay','being greatly impressed by someone', $2),
	           ('closure','the  ability of function to remember variables defined in outer functions', $3),
	           ('IIFE','immediately invoked function', $3),
	           ('Prototype','object that is associated with every functions and objects by default in JavaScript', $3)
		RETURNING id
	`,
		[setIds[0], setIds[1], setIds[2]]
	);
	flashcardsIds.splice(0, 0, ...flashcards.rows.map((r) => r.id));
}

async function commonBeforeEach() {
	await db.query("BEGIN");
}

async function commonAfterEach() {
	await db.query("ROLLBACK");
}

async function commonAfterAll() {
	await db.end();
}

module.exports = {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
	setIds,
	flashcardsIds,
};
