-- both test users have the password "password"

INSERT INTO users (username, password, email, is_admin)
VALUES ('testuser',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'john@johndoe.com',
        FALSE),
       ('testadmin',
        '$2b$12$AZH7virni5jlTTiGgEg4zu3lSvAw68qVEfSIOjJ3RqtbJbdW/Oi5q',
        'jane@janedoe.com',
        TRUE);

INSERT INTO studysets (title,description,username)
VALUES ('New Words', 'Memorize new words every day', 'testuser'),
	   ('Best slang', 'Informal words', 'testuser'),
	   ('Computer Science Terminology', 'Learn JS jargon', 'testadmin'),
	   ('Politics', 'Learn words in politics', 'testadmin');

INSERT INTO flashcards (term,definition,studyset_id)
VALUES ('finicky','very detailed', 1),
	   ('preconceived','believed  before one has full knowledge', 1),
	   ('harness','put into use', 1),
	   ('chill out','calm down', 2),
	   ('balling','have a luxurious lifestyle', 2),
	   ('slay','being greatly impressed by someone', 2),
	   ('closure','the  ability of function to remember variables defined in outer functions', 3),
	   ('IIFE','immediately invoked function', 3),
	   ('Prototype','object that is associated with every functions and objects by default in JavaScript', 3),
	   ('Bipartisan','A cooperative effort by two political partie', 4),
	   ('Caucus','An informal meeting of local party members to discuss candidates and choose delegates to the partys convention', 4),
	   ('Lobby','A group seeking to influence an elected official, or the act of doing so', 4);
