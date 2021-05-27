"use strict";

const db = require("../db");
const bcrypt = require("bcrypt");

const {
	NotFoundError,
	BadRequestError,
	UnauthorizedError,
} = require("../expressError");

const { BCRYPT_WORK_FACTOR } = require("../config.js");

class User {
	static async authenticate(email, password) {
		// try to find the user first
		const result = await db.query(
			`SELECT username,
                  password,
                  email,
                  is_admin AS "isAdmin"
           FROM users
           WHERE email = $1`,
			[email]
		);

		const user = result.rows[0];
		console.log("USER: " + user);

		if (user) {
			// compare hashed password to a new hash from password
			const isValid = await bcrypt.compare(password, user.password);
			if (isValid === true) {
				delete user.password;
				return user;
			}
		}

		throw new UnauthorizedError("Invalid username/password");
	}

	static async register({ username, password, email, isAdmin }) {
		const duplicatedCheck = await db.query(
			`SELECT username
			 FROM users
			 WHERE username = $1
			`,
			[username]
		);

		if (duplicatedCheck.rows[0]) {
			throw new BadRequestError(`Duplicate username ${username}`);
		}

		const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

		const result = await db.query(
			`
			INSERT INTO users
			(
				username,
				password,
				email,
				is_admin
			)
			VALUES($1, $2, $3, $4)
			RETURNING username, email, is_admin AS "isAdmin"`,
			[username, hashedPassword, email, isAdmin]
		);

		const user = result.rows[0];

		return user;
	}
}

module.exports = User;
