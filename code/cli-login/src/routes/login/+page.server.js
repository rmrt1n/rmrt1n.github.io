import { db } from '$lib/db/db'
import { sessions, users } from '$lib/db/schema'
import { fail, redirect } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'

/** @type {import('./$types').Actions} */
export const actions = {
  default: async ({ request, cookies, url }) => {
    const form = await request.formData()
    const email = /** @type {string} */ (form.get('email'))
    const password = /** @type {string} */ (form.get('password'))

    if (!email || !password) {
      return fail(400, { message: 'missing email or password' })
    }

    const userData = await db.select().from(users).where(eq(users.email, email))
    const user = userData[0]
    const next = url.searchParams.get('next') ?? '/'

    // register user if not exists & create session
    if (!user) {
      const newUserData = await db.insert(users).values({ email, password }).returning()
      const session = await db
        .insert(sessions)
        .values({ userId: newUserData[0].userId })
        .returning()
      cookies.set('session', session[0].sessionId, { path: '/' })
      redirect(303, next)
    }

    // else login
    if (email === user.email && password === user.password) {
      const session = await db.insert(sessions).values({ userId: user.userId }).returning()
      cookies.set('session', session[0].sessionId, { path: '/' })
      redirect(303, next)
    }

    return fail(400, { message: 'invalid email or password' })
  },
}
