import crypto from 'crypto'
import { exec } from 'child_process'
import { bytesToHex, hexToBytes } from './src/lib/utils.js'

const randomKeyPair = async () => {
  return await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey'])
}

const decrypt = async (privateKey, publicKey, iv, encrypted) => {
  const remotePublicKey = await crypto.subtle.importKey(
    'raw',
    publicKey,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  )
  const secret = await crypto.subtle.deriveKey(
    { name: 'ECDH', public: remotePublicKey },
    privateKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, secret, encrypted)
  const dec = new TextDecoder()
  return dec.decode(decrypted)
}

const login = async () => {
  const host = 'http://localhost:5173'
  const session = crypto.randomUUID()
  const { privateKey, publicKey } = await randomKeyPair()
  const publicKeyBuffer = await crypto.subtle.exportKey('raw', publicKey)

  const url = `${host}/cli/login?session=${session}&pub_key=${bytesToHex(publicKeyBuffer)}`
  exec(`xdg-open '${url}'`, () => console.log(`Here's your login link:\n\n${url}\n`))

  const interval = setInterval(() => {
    fetch(`${host}/cli/login/${session}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return

        const { token, pubKey, iv } = data

        decrypt(privateKey, hexToBytes(pubKey), hexToBytes(iv), hexToBytes(token)).then(
          (accessToken) => console.log('Your access token:', accessToken),
        )

        clearInterval(interval)
      })
  }, 1000)
}

// eslint-disable-next-line no-unused-vars
const [_node, _acme, argv1] = process.argv

if (!argv1 || argv1 !== 'login') {
  console.log('usage: node acme.js login')
  process.exit(1)
}

login()
