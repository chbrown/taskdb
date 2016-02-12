CREATE TABLE task_type (
  id SERIAL PRIMARY KEY,

  name TEXT NOT NULL UNIQUE,
  schema JSON NOT NULL,

  template_type TEXT NOT NULL, -- options like "react" / "angular" / "mustache"
  template TEXT NOT NULL,

  created TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp NOT NULL
);

-- user is a reserved keyword
CREATE TABLE worker (
  id SERIAL PRIMARY KEY,

  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  salt TEXT NOT NULL,
    CONSTRAINT salt_length CHECK (LENGTH(salt) = 256),
  password TEXT NOT NULL,
    CONSTRAINT password_length CHECK (LENGTH(password) = 64),

  administrator BOOLEAN DEFAULT FALSE NOT NULL,

  created TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp NOT NULL
);

CREATE TABLE task (
  id SERIAL PRIMARY KEY,

  task_type_id INTEGER NOT NULL REFERENCES task_type(id) ON DELETE CASCADE,
  context JSON DEFAULT 'null'::JSON NOT NULL,
  priority INTEGER DEFAULT 0 NOT NULL,

  -- available is the reservation mechanism
  available TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp NOT NULL,

  worker_id INTEGER REFERENCES worker(id) ON DELETE SET NULL,
  started TIMESTAMP WITH TIME ZONE,
  completed TIMESTAMP WITH TIME ZONE,
  result JSON,

  created TIMESTAMP WITH TIME ZONE DEFAULT current_timestamp NOT NULL
);
