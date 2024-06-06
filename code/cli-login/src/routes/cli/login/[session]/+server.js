import { db } from '$lib/db/db'
import { cliSessions } from '$lib/db/schema'
import { error } from '@sveltejs/kit'
import { eq } from 'drizzle-orm'
import { bytesToHex, hexToBytes } from '$lib/utils'

/** @type {import('./$types').RequestHandler} */
export async function GET({ params }) {
  const { session } = params

  const cliSessionData = await db
    .select()
    .from(cliSessions)
    .where(eq(cliSessions.cliSessionId, session))
  const cliSession = cliSessionData[0]

  if (!cliSession) return error(404)

  // generate ECC key pair
  const { privateKey, publicKey } = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey'],
  )
  const publicKeyBuffer = await crypto.subtle.exportKey('raw', publicKey)
  const remotePublicKey = await crypto.subtle.importKey(
    'raw',
    hexToBytes(cliSession.pubKey),
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  )

  // encrypt the access token using aes-gcm-256 and the secret key
  const enc = new TextEncoder()
  const secret = await crypto.subtle.deriveKey(
    { name: 'ECDH', public: remotePublicKey },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
  // iv in aes-gcm-256 must be 12 bytes long
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    secret,
    enc.encode(cliSession.tokenId),
  )

  return Response.json({
    token: bytesToHex(encrypted),
    pubKey: bytesToHex(publicKeyBuffer),
    iv: bytesToHex(iv),
  })
}
