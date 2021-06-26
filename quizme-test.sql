\echo 'Delete and recreate quizme_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE quizme_test;
CREATE DATABASE quizme_test;
\connect quizme_test

\i quizme-schema.sql