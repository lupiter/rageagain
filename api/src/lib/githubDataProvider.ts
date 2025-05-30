import { Env } from '../types.js'

const baseUrl =
  'https://raw.githubusercontent.com/lupiter/rageagain/refs/heads/master/data/'

const provider = async (path: string, env: Env): Promise<string> => {
  path = path.replace(/^\/data\//, '') // remove leading slash

  // Attempt to get cached data
  if (typeof env.GITHUB_DATA !== 'undefined') {
    const cachedResult = await env.GITHUB_DATA.get(path, 'text')

    if (cachedResult) return cachedResult
  }

  const response = await fetch(baseUrl + path)
  const bodyText = await response.text()

  if (
    response.status >= 200 &&
    response.status < 300 &&
    typeof env.GITHUB_DATA !== 'undefined'
  ) {
    await env.GITHUB_DATA.put(path, bodyText, { expirationTtl: 60 * 60 * 24 })
  } else if (response.status >= 300 || response.status < 200) {
    // it was a redirect or error
    console.error(response.status, bodyText, baseUrl + path)
    return Promise.reject(response.status)
  }

  return bodyText
}

export default provider
