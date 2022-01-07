export const extractTokenFromAuthorization = authorization => authorization.split('Bearer ').pop()

const indexlessArraysPattern = /[^&]*(%5B%5D[^=]*)/g
export const replaceIndexlessArrays = (str) => {
  const matchSets = {}
  return str.replace(indexlessArraysPattern, (match, p1) => {
    matchSets[match] = matchSets[match] || 0
    const matchCount = matchSets[match]++
    const p1Replaced = p1.replace('%5B%5D', `%5B${matchCount}%5D`)
    return match.replace(p1, p1Replaced)
  })
}
