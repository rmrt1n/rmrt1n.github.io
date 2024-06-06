/**
 * @param {ArrayBuffer | Uint8Array} bytes
 * @returns string
 */
export const bytesToHex = (bytes) => {
  return [...new Uint8Array(bytes)].map((x) => x.toString(16).padStart(2, '0')).join('')
}

/**
 * @param {string} hex
 * @returns ArrayBuffer | Uint8Array
 */
export const hexToBytes = (hex) => {
  const hexBytes = hex.match(/.{1,2}/g) ?? []
  return Uint8Array.from(hexBytes.map((byte) => parseInt(byte, 16)))
}
