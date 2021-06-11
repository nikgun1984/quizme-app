const axios = require("axios");
const { getPartofSpeech } = require("./getPartofSpeech");
const { syllabify } = require("./generateSyllables");

async function getRandomWord() {
	const word = {};
	while (true) {
		const randWord = await axios.get(
			"https://random-word-api.herokuapp.com/word?number=1"
		);
		const getWordDetails = await axios.get(
			`https://api.datamuse.com/words?sp=${randWord.data[0]}&qe=sp&md=pd&max=1`
		);
		const data = getWordDetails.data[0];
		if (data.defs) {
			word.term = data.word;
			word.partSpeech = getPartofSpeech(data.tags[data.tags.length - 1]);
			word.syllables = [data.word].map(syllabify)[0].join("•");
			word.definitions = data.defs.join(", ");
			return word;
		}
	}
}

module.exports = { getRandomWord };
