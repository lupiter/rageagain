import { Env } from '../../types.js'
import { YoutubeResponse } from './types.js'

export type CachedResponse = {
  v: number // Version
  ts: number // Timestamp
  data: YoutubeResponse // Response Data
}

/**
 * Uploads data to Cloudflare KV storage with specified key.
 * @param key Storage key
 * @param data Data object
 */
export const set = (
  key: string,
  data: YoutubeResponse,
  env: Env,
): Promise<void> => {
  const wrappedData = {
    v: 1,
    ts: Date.now(),
    data,
  }

  if (typeof env.YOUTUBE_API_REQUESTS === 'undefined') {
    console.log('KV Namespace YOUTUBE_API_REQUESTS is not registered')
    return Promise.resolve()
  }

  return env.YOUTUBE_API_REQUESTS.put(key, JSON.stringify(wrappedData))
}

/**
 * Returns data from Cloudflare KV storage with specified key
 * or returns null if not found.
 * @param key Storage key
 */
export const get = (key: string, env: Env): Promise<CachedResponse | null> => {
  if (typeof env.YOUTUBE_API_REQUESTS === 'undefined') {
    console.log('KV Namespace YOUTUBE_API_REQUESTS is not registered')
    return Promise.resolve(null)
  }

  return env.YOUTUBE_API_REQUESTS.get<CachedResponse>(key, 'json')
}
