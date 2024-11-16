import * as scraper from '../third-party/youtube-scrape/youtube-scrape.js'
import * as cache from './youtubeCache.js'
import {
  MusicVideoHost,
  MusicVideoInfo,
  MusicVideoProvider,
  MusicVideoProviderSource,
} from '../types.js'
import { Env } from '../types.js'

const search = async (query: string, env: Env): Promise<scraper.Response> => {
  const cachedResponse = await cache.get(query, env)
  if (cachedResponse) return cachedResponse.data

  const response = await scraper.youtube({ query })
  if (response && response.results && response.results.length)
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

  response.results.forEach((result) => {
    if (!result.video) return

    finalResult.push({
      source: MusicVideoProviderSource.ytscraper,
      host: MusicVideoHost.youtube,
      url: result.video.url,
      title: result.video.title,
    })
  })

  return finalResult
}

export default provider
