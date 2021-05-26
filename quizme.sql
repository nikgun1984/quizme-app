\echo 'Delete and recreate quizme db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE quizme;
CREATE DATABASE quizme;
\connect quizme

\i quizme-schema.sql