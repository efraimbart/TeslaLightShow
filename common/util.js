export const extractTokenFromAuthorization = authorization => authorization.split('Bearer ').pop()

const indexlessArraysPattern = /[^&]*(\[][^=]*)/g
export const replaceIndexlessArrays = (str) => {
  const matchSets = {}
  return str.replace(indexlessArraysPattern, (match, p1) => {
    matchSets[match] = matchSets[match] || 0
    const matchCount = matchSets[match]++
    const p1Replaced = p1.replace('[]', `[${matchCount}]`)
    return match.replace(p1, p1Replaced)
  })
}
