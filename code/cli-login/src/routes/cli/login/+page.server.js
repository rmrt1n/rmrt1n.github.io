import { db } from '$lib/db/db'
import { accessTokens, cliSessions, sessions, users } from '$lib/db/schema'
import { error, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

/** @type {import('./$types').PageServerLoad} */
export async function load({ cookies, url }) {
  const sessionCookie = cookies.get('session')
  const next = encodeURIComponent(url.pathname + url.search)

  if (!sessionCookie) redirect(302, `/login?next=${next}`)

  const sessionData = await db.select().from(sessions).where(eq(sessions.sessionId, sessionCookie))
  const session = sessionData[0]

  // if there is no valid session, redirect to login
  if (!session) redirect(302, `/login?next=${next}`)

  // get user from session id
  const userData = await db
    .select()
    .from(users)
    .leftJoin(sessions, eq(users.userId, sessions.userId))
    .where(eq(sessions.sessionId, sessionCookie))
  const user = userData[0].users

  const params = url.searchParams
  const cliSessionId = params.get('session')
  const pubKey = params.get('pub_key')

  if (!cliSessionId || !pubKey) {
    return error(400, { message: 'missing search params' })
  }

  const cliSessionData = await db
    .select()
    .from(cliSessions)
    .where(eq(cliSessions.cliSessionId, cliSessionId))
  const cliSession = cliSessionData[0]

  // create cli session & access token if it doesn't exist
  if (!cliSession) {
    const token = await db.insert(accessTokens).values({ userId: user.userId }).returning()
    await db.insert(cliSessions).values({ cliSessionId, pubKey, tokenId: token[0].tokenId })
  }
}
