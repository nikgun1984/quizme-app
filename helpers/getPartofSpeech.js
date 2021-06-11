function getPartofSpeech(word) {
	const map = {
		n: "noun",
		v: "verb",
		adj: "adjective",
		adv: "adverb",
		u: "unknown",
	};
	return map[word] ? map[word] : word;
}

module.exports = { getPartofSpeech };
