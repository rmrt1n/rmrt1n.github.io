import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/lib/db/schema.js',
  dbCredentials: {
    url: './data/database.db',
  },
})
