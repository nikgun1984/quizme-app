CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE studysets (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
	"description" TEXT NOT NULL,
	username VARCHAR(25) NOT NULL REFERENCES users
);

CREATE TABLE flashcards (
    id SERIAL PRIMARY KEY,
    term TEXT NOT NULL,
	  "definition" TEXT NOT NULL,
    studyset_id INTEGER NOT NULL REFERENCES studysets
);

CREATE TABLE dailyword (
  id SERIAL PRIMARY KEY,
  term TEXT NOT NULL,
  part_speech TEXT NOT NULL,
  "definition" TEXT NOT NULL,
  syllable TEXT NOT NULL,
  created_at DATE DEFAULT CURRENT_DATE
);