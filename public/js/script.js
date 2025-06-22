function copy(button) {
  const code = button.closest('.codeblock').querySelector('pre code')
  const text = [...code.childNodes]
    .filter((n) => !(n.nodeType === Node.ELEMENT_NODE && window.getComputedStyle(n).userSelect === 'none'))
    .map((n) => n.textContent)
    .join('')

  navigator.clipboard.writeText(text).then(() => {
    const original = button.textContent;
    button.textContent = 'Copied!';
    setTimeout(() => (button.textContent = original), 1000);
  })
}
