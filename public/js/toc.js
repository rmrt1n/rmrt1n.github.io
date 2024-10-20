const mediaQuery = '(min-width: 1356px)'
const toc = document.querySelector('.toc details')

if (window.matchMedia(mediaQuery).matches) toc.open = true

window.matchMedia(mediaQuery).addEventListener((e) => {
  if (e.matches) toc.open = true
})

window.matchMedia('not all and ' + mediaQuery).addEventListener((e) => {
  if (e.matches) toc.open = false
})
