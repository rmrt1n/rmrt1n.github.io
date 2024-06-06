import { sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  userId: text('user_id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
})

export const sessions = sqliteTable('sessions', {
  sessionId: text('session_id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.userId),
})

export const accessTokens = sqliteTable('access_tokens', {
  tokenId: text('token_id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.userId),
})

export const cliSessions = sqliteTable('cli_sessions', {
  cliSessionId: text('cli_session_id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  tokenId: text('token_id')
    .notNull()
    .references(() => accessTokens.tokenId),
  pubKey: text('pub_key').notNull(), // <-- new column
})
