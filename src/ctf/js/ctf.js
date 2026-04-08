const STORAGE_KEY = 'flags'

const wasm = await WebAssembly.instantiateStreaming(fetch('/__WASM_FILE__'))

const flags = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')

document.querySelectorAll('#ctf input').forEach((input) => {
  if (flags[input.id]) {
    input.value = flags[input.id]
  }

  input.addEventListener('change', (event) => {
    flags[input.id] = event.target.value.trim()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(flags))
  })
})

document.getElementById('clear').addEventListener('click', (_) => {
  if (!confirm('Clear all inputs?')) return
  document.querySelectorAll('#ctf input').forEach((input) => input.value = '')
  localStorage.removeItem(STORAGE_KEY)
})

function showBanner(html, right) {
  const banner = document.getElementById('banner')
  banner.classList.remove(`${!right}`)
  banner.classList.add(`${right}`)
  banner.innerHTML = html
}

document.getElementById('ctf').addEventListener('submit', (event) => {
  event.preventDefault()

  const form = Array.from(new FormData(event.target))
  const input = form.map(([_, value]) => value).join('')

  if (input.length !== 32 * 10) {
    showBanner('<p>Nope... Try again.</p>', false)
    return
  }

  const { check_flag, memory } = wasm.instance.exports

  const buffer = new Uint8Array(memory.buffer, 0, 420)
  buffer.set((new TextEncoder()).encode(input))

  if (check_flag(0, input.length) === 1) {
    const offset = 32 * 10 + 1
    const prize = (new TextDecoder()).decode(buffer).slice(offset, offset + 32)
    showBanner(`<p>Congratulations!! <a href="/ctf/${prize}">Here\'s your prize</a>!</p>`, true)
  } else {
    showBanner('<p>Nope... Try again.</p>', false)
  }
})
