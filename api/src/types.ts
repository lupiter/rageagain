export enum MusicVideoProviderSource {
  imvdb = 'imvdb',
  ytscraper = 'ytscraper',
  ytapi = 'ytapi',
}

export enum MusicVideoHost {
  youtube = 'youtube',
}

export type MusicVideoInfo = {
  source: MusicVideoProviderSource
  host: MusicVideoHost
  url: string
  title?: string
}

export type MusicVideoProvider = (
  artist: string,
  song: string,
  env: Env,
) => Promise<MusicVideoInfo[]>

export interface Env {
  YOUTUBE_REQUESTS: KVNamespace
  YOUTUBE_API_REQUESTS: KVNamespace
  GITHUB_DATA: KVNamespace
  GOOGLE_API_KEY: string
}
