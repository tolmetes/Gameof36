export let rawData = [
  // [2, 2, 3, 3],
  [2, 2, 4, 9],
  [2, 2, 5, 8],
  [2, 2, 6, 6],
  [2, 3, 3, 8],
  [2, 3, 4, 6],
  [2, 3, 6, 7],
  [2, 3, 6, 9],
  [2, 4, 6, 7],
  [2, 4, 8, 9],
  [2, 6, 6, 8],
  [2, 5, 7, 9],
  [2, 5, 8, 8],
  [2, 6, 9, 9],
  [3, 3, 4, 9],
  [3, 3, 5, 9],
  [3, 3, 6, 6],
  [3, 3, 6, 7],
  [3, 4, 6, 8],
  [3, 5, 6, 9],
  [3, 6, 6, 9],
  [3, 6, 8, 9],
  [3, 7, 9, 9],
  [2, 4, 4, 5],
  // [4, 4, 4, 9],
  // [4, 4, 6, 6],
  // [4, 5, 5, 9],
  // [4, 5, 7, 8],
  // [4, 6, 6, 9],
  // [4, 7, 7, 9],
  // [4, 7, 8, 8],
  // [4, 6, 8, 8],
  // [4, 8, 8, 9],
  // [4, 8, 9, 9],
  // [4, 9, 9, 9],
  // [5, 5, 6, 6],
  // [5, 6, 7, 8],
  // [5, 7, 7, 8],
  // [5, 9, 9, 9],
  // [6, 6, 6, 6],
  // [6, 6, 6, 8],
  // [6, 6, 7, 7],
  // [6, 6, 8, 8],
  // [6, 6, 8, 9],
  // [6, 6, 9, 9],
  // [6, 7, 7, 7],
  // [6, 9, 9, 9]
]

export let randomOrder = [
  [3, 1, 2, 4],
  [1, 3, 2, 4],
  [2, 3, 1, 4],
  [3, 2, 1, 4],
  [3, 2, 4, 1],
  [2, 3, 4, 1],
  [4, 3, 2, 1],
  [3, 4, 2, 1],
  [2, 4, 3, 1],
  [4, 2, 3, 1],
  [4, 1, 3, 2],
  [1, 4, 3, 2],
  [3, 4, 1, 2],
  [4, 3, 1, 2],
  [1, 3, 4, 2],
  [3, 1, 4, 2],
  [2, 1, 4, 3],
  [1, 2, 4, 3],
  [4, 2, 1, 3],
  [2, 4, 1, 3],
  [1, 4, 2, 3],
  [4, 1, 2, 3],
  [2, 1, 3, 4],

]

export function makeRandom(data, order) {
  let arrays = [];
  for (let i = 0, j = 0; i < data.length, j < order.length; i++ , j++) {

    let newArray = []
    for (let k = 0; k < 4; k++) {
      newArray[k] = data[i][order[j][k] - 1]
    }
    arrays.push(newArray)
  }
  return arrays;
}

export let levelsData = makeRandom(rawData, randomOrder)


export let levels = [
  { level: 1, disabled: false },
  { level: 2, disabled: true },
  { level: 3, disabled: true },
  { level: 4, disabled: true },
  { level: 5, disabled: true },
  { level: 6, disabled: true },
  { level: 7, disabled: true },
  { level: 8, disabled: true },
  { level: 9, disabled: true },
  { level: 10, disabled: true },
  { level: 11, disabled: true },
  { level: 12, disabled: true },
  { level: 13, disabled: true },
  { level: 14, disabled: true },
  { level: 15, disabled: true },
  { level: 16, disabled: true }
]

export function getLevels(number) {
  let levels = []
  for (let i = 0; i < 16;) {
    if (++i <= number) {
      levels.push({
        level: i,
        disable: false
      })
    } else {
      levels.push({
        level: i,
        disabled: true
      })
    }
  }
  return levels;
}