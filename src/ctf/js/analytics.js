// Flag 2.

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmbGFnIjoiNzg3NTMyM2EzMjZjMzAzNDMwMzczMjZjMzczNTM4MzUzMDMyNjUzMDMzNmUzODM0MzQzNjMyMzEzODZhMzg3NzY5NjkzMTMzIiwiaGludCI6Imtpbmcgb2YgaGVyb2VzIn0.SmC2wWHiSNklDZzvwaeHS0mvMPqLHfsjViTlOh52PLo'

sessionStorage.setItem('token', token)

// Flag 5.

function meow(message) {
  let lines = ['', 'Meow...', '']

  try {
    const split = message.trim().split('\n')
    if (split.length === 3) {
      lines = split
    }
  } catch { }

  if (message === Infinity) {
    let flag = []
    let encoded = 91133930106070088868049976697184305959n;

    while (encoded > 0) {
      flag.push((encoded % 16n).toString(16))
      encoded /= 16n
    }

    flag = [...flag, ':', '4', 'm', 'r'].reverse().join('')
    lines = ['Here you go!', flag, '']
  }

  console.log(`
 /\\---/\\  ${lines[0]}
(=ↀωↀ=)  ${lines[1]}
 ===o===   ${lines[2]}`)
}
