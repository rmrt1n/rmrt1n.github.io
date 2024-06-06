import { db } from '$lib/db/db'
import { sessions, users } from '$lib/db/schema'
import { redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies }) {
  const sessionCookie = cookies.get('session')
  if (!sessionCookie) redirect(302, '/login')

  const sessionData = await db.select().from(sessions).where(eq(sessions.sessionId, sessionCookie))
  const session = sessionData[0]
  if (!session) redirect(302, '/login')

  const user = await db.select().from(users).where(eq(users.userId, session.userId))

  return {
    user: user[0],
  }
}
