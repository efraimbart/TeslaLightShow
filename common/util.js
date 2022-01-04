export const extractTokenFromAuthorization = authorization => authorization.split('Bearer ').pop()
