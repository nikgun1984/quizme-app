const { getRandomWord } = require("../../helpers/generateRandomWord");

describe("generate random word", function () {
	test("get random word from API", async function () {
		const word = await getRandomWord();
		expect(word).toEqual({
			term: expect.any(String),
			partSpeech: expect.any(String),
			syllables: expect.any(String),
			definitions: expect.any(String),
		});
	});
});
