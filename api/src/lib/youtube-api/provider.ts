import * as cache from './cache.js'
import {
  MusicVideoHost,
  MusicVideoInfo,
  MusicVideoProvider,
  MusicVideoProviderSource,
} from '../../types.js'
import { Env } from '../../types.js'
import { WATCH, YOUTUBE, YoutubeResponse } from './types.js'

const youtube = async (query: string, env: Env): Promise<YoutubeResponse> => {
  const url = new URL(YOUTUBE)
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('q', query)
  url.searchParams.set('type', 'video')
  url.searchParams.set('key', env.GOOGLE_API_KEY)
  const resp = await fetch(url)

  if (resp.status === 200) {
    return (await resp.json()) as YoutubeResponse
  }

  console.warn(
    `Youtube give us a ${resp.status} because ${(await resp.text()).slice(100)}`,
  )
  throw new Error(`${resp.status}`)
}

const search = async (query: string, env: Env): Promise<YoutubeResponse> => {
  const cachedResponse = await cache.get(query, env)
  if (cachedResponse) return cachedResponse.data

  const response = await youtube(query, env)
  if (response && response.items && response.items.length)
    await cache.set(query, response, env)

  return response
}

const provider: MusicVideoProvider = async (
  artist: string,
  song: string,
  env: Env,
): Promise<MusicVideoInfo[]> => {
  const finalResult: MusicVideoInfo[] = []
  const query = `${artist} - ${song} music video`
  const response = await search(query, env)

  response.items.forEach((result) => {
    if (result.id.kind !== 'youtube#video') return

    const url = new URL(WATCH)
    url.searchParams.set('v', result.id.videoId)

    finalResult.push({
      source: MusicVideoProviderSource.ytapi,
      host: MusicVideoHost.youtube,
      url: url.href,
      title: result.snippet.title,
    })
  })

  return finalResult
}

export default provider
