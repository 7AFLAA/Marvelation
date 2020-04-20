DROP TABLE IF EXISTS home;
CREATE TABLE home
(
    id SERIAL PRIMARY KEY,
    char_name VARCHAR(255),
    thumbNail VARCHAR(255),
    rating  NUMERIC(5)
);
