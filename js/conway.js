const Tile = Object.freeze({
  BORDER: 0,
  ALIVE: 1,
  DEAD: 2,
});

const directions = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1], [0, 1],
  [1, -1], [1, 0], [1, 1],
]

const patterns = {
  glider: [
    [Tile.DEAD, Tile.ALIVE, Tile.DEAD],
    [Tile.DEAD, Tile.DEAD, Tile.ALIVE],
    [Tile.ALIVE, Tile.ALIVE, Tile.ALIVE],
  ],
  blinker: [
    [Tile.DEAD, Tile.DEAD, Tile.DEAD],
    [Tile.ALIVE, Tile.ALIVE, Tile.ALIVE],
    [Tile.DEAD, Tile.DEAD, Tile.DEAD],
  ],
  rpentonimo: [
    [Tile.DEAD, Tile.ALIVE, Tile.ALIVE],
    [Tile.ALIVE, Tile.ALIVE, Tile.DEAD],
    [Tile.DEAD, Tile.ALIVE, Tile.DEAD],
  ],
}

const canvas = document.getElementById('conway');
const context = canvas.getContext('2d');

const cellSize = 3
const nRows = 2 + Math.floor(canvas.height / cellSize);
const nCols = 2 + Math.floor(canvas.width / cellSize);

canvas.width = cellSize * nCols
canvas.height = cellSize * nRows

let map = Array.from({ length: nRows }, (_, j) =>
  Array.from({ length: nCols }, (_, i) =>
    (i === 0 || i === nCols - 1 || j === 0 || j === nRows - 1)
      ? Tile.BORDER
      : Math.random() < 0.25 ? Tile.ALIVE : Tile.DEAD
  ))

function loop(i) {
  draw(map)
  map = update(map)
  if (i % 3 === 0) map = seed(map)
  setTimeout(loop, 60, i + 1)
}

loop(0)

function draw(map) {
  const fill = getComputedStyle(document.documentElement).getPropertyValue('--color-bg')
  context.clearRect(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < nRows; i++) {
    for (let j = 0; j < nCols; j++) {
      if (map[i][j] === Tile.ALIVE) {
        context.fillStyle = fill
        context.fillRect(j * cellSize, i * cellSize, cellSize, cellSize)
      }
    }
  }
}

function seed(map) {
  const patternsList = Object.keys(patterns)
  const pattern = patterns[patternsList[Math.floor(Math.random() * patternsList.length)]]

  const row = Math.floor(Math.random() * (nRows - pattern.length));
  const col = Math.floor(Math.random() * (nCols - pattern[0].length));
  const tile = map[row][col]

  if (tile === Tile.BORDER) return map

  const newMap = map.map(row => [...row]);
  for (let i = 0; i < pattern.length; i++) {
    for (let j = 0; j < pattern[0].length; j++) {
      newMap[row + i][col + j] = pattern[i][j]
    }
  }
  return newMap
}

function update(map) {
  return map.map((row, i) => i === 0 || i === nRows - 1
    ? row
    : row.map((tile, j) => {
      if (tile === Tile.BORDER) return tile

      let nNeighbors = 0
      for (const dir of directions) {
        const neighbor = map[i + dir[0]][j + dir[1]]
        if (neighbor === Tile.BORDER) continue
        if (neighbor === Tile.ALIVE) nNeighbors++
      }

      if (tile === Tile.ALIVE && (nNeighbors === 2 || nNeighbors === 3)) return tile
      if (tile === Tile.DEAD && nNeighbors === 3) return Tile.ALIVE
      return Tile.DEAD
    }))
}
