CREATE TABLE users (
  username VARCHAR(25) PRIMARY KEY,
  password TEXT NOT NULL,
  email TEXT NOT NULL
    CHECK (position('@' IN email) > 1),
  is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE flashcards (
    id SERIAL PRIMARY KEY,
    term TEXT NOT NULL,
	"definition" TEXT NOT NULL
);

CREATE TABLE studysets (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
	"description" TEXT NOT NULL,
	username VARCHAR(25) NOT NULL REFERENCES users
);

CREATE TABLE studysets_has_flashcards (
	studyset_id INTEGER NOT NULL REFERENCES studysets ON DELETE CASCADE,
    flashcard_id INTEGER NOT NULL REFERENCES flashcards,
    PRIMARY KEY(studyset_id, flashcard_id)
);