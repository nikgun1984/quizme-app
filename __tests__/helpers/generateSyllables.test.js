const { syllabify } = require("../../helpers/generateSyllables");

describe("test syllabify function", function () {
	test("get syllables from a word", async function () {
		const sylArray = syllabify("hello");
		expect(sylArray.length).toEqual(2);
		expect(sylArray).toEqual(["hel", "lo"]);
	});
});
