DROP TABLE IF EXISTS marvel;
CREATE TABLE marvel (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  image VARCHAR(255),
  description TEXT,
  rating NUMERIC

)