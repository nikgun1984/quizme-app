"use strict";

const { DuplicationError, UnauthorizedError } = require("../../expressError");
const db = require("../../db.js");
const User = require("../../models/user");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll,
} = require("../../models/_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** authenticate */

describe("authenticate", function () {
	test("works", async function () {
		const user = await User.authenticate("john@johndoe.com", "password1");
		expect(user).toEqual({
			username: "testuser",
			email: "john@johndoe.com",
			isAdmin: false,
		});
	});

	test("unauth if no such user", async function () {
		try {
			const user = await User.authenticate("none@johndoe.com", "password");
			console.log(user);
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});

	test("unauth if wrong password", async function () {
		try {
			await User.authenticate("john@johndoe.com", "wrong");
			fail();
		} catch (err) {
			expect(err instanceof UnauthorizedError).toBeTruthy();
		}
	});
});

/************************************** register */

describe("register", function () {
	const newUser = {
		username: "new",
		email: "test@test.com",
		isAdmin: false,
	};

	test("works", async function () {
		let user = await User.register({
			...newUser,
			password: "password",
		});
		expect(user).toEqual(newUser);
		const found = await db.query("SELECT * FROM users WHERE username = 'new'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].is_admin).toEqual(false);
		expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
	});

	test("works: adds admin", async function () {
		let user = await User.register({
			...newUser,
			password: "password",
			isAdmin: true,
		});
		expect(user).toEqual({ ...newUser, isAdmin: true });
		const found = await db.query("SELECT * FROM users WHERE username = 'new'");
		expect(found.rows.length).toEqual(1);
		expect(found.rows[0].is_admin).toEqual(true);
		expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
	});

	test("bad request with dup data", async function () {
		try {
			await User.register({
				...newUser,
				password: "password",
			});
			await User.register({
				...newUser,
				password: "password",
			});
			fail();
		} catch (err) {
			expect(err instanceof DuplicationError).toBeTruthy();
		}
	});
});
