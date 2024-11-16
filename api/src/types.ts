export enum MusicVideoProviderSource {
  imvdb = 'imvdb',
  ytscraper = 'ytscraper',
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
  GITHUB_DATA: KVNamespace
}