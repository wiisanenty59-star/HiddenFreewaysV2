import { pool } from "@workspace/db";

async function main() {
  console.log("Adding new columns and tables for HiddenFreedom integration...");

  // Extend users
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS bio text;`);
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS trust_level integer NOT NULL DEFAULT 0;`,
  );
  await pool.query(
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS post_count integer NOT NULL DEFAULT 0;`,
  );

  // Extend categories with parent_id
  await pool.query(
    `ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id integer REFERENCES categories(id) ON DELETE CASCADE;`,
  );

  // Announcements
  await pool.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id serial PRIMARY KEY,
      title text NOT NULL,
      body text NOT NULL,
      kind text NOT NULL DEFAULT 'info',
      priority integer NOT NULL DEFAULT 0,
      is_active boolean NOT NULL DEFAULT true,
      created_by_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  // Thread votes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS thread_votes (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      thread_id integer NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
      value text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS thread_votes_user_thread_idx
      ON thread_votes (user_id, thread_id);
  `);

  // Post votes
  await pool.query(`
    CREATE TABLE IF NOT EXISTS post_votes (
      id serial PRIMARY KEY,
      user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      post_id integer NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      value text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS post_votes_user_post_idx
      ON post_votes (user_id, post_id);
  `);

  // Chat rooms
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chat_rooms (
      id serial PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      description text NOT NULL DEFAULT '',
      kind text NOT NULL DEFAULT 'public',
      state_id integer REFERENCES states(id) ON DELETE SET NULL,
      min_trust_level integer NOT NULL DEFAULT 0,
      is_archived boolean NOT NULL DEFAULT false,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  // Room messages
  await pool.query(`
    CREATE TABLE IF NOT EXISTS room_messages (
      id serial PRIMARY KEY,
      room_id integer NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
      author_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS room_messages_room_created_idx
      ON room_messages (room_id, created_at);
  `);

  // Crews
  await pool.query(`
    CREATE TABLE IF NOT EXISTS crews (
      id serial PRIMARY KEY,
      name text NOT NULL,
      description text NOT NULL DEFAULT '',
      creator_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      room_id integer NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);

  // Crew members
  await pool.query(`
    CREATE TABLE IF NOT EXISTS crew_members (
      id serial PRIMARY KEY,
      crew_id integer NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
      user_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      joined_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS crew_members_crew_user_idx
      ON crew_members (crew_id, user_id);
  `);

  // Private chats
  await pool.query(`
    CREATE TABLE IF NOT EXISTS private_chats (
      id serial PRIMARY KEY,
      user_a_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_b_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      last_activity_at timestamptz NOT NULL DEFAULT now(),
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS private_chats_pair_idx
      ON private_chats (user_a_id, user_b_id);
  `);

  // Private chat messages
  await pool.query(`
    CREATE TABLE IF NOT EXISTS private_chat_messages (
      id serial PRIMARY KEY,
      chat_id integer NOT NULL REFERENCES private_chats(id) ON DELETE CASCADE,
      author_id integer NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS private_chat_messages_chat_created_idx
      ON private_chat_messages (chat_id, created_at);
  `);

  console.log("Schema extensions applied.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
