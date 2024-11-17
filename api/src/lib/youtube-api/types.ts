export const YOUTUBE = `https://www.googleapis.com/youtube/v3/search`
export const WATCH = `https://www.youtube.com/watch`

export interface Thumbnail {
  url: string
  width: number
  height: number
}

export interface YoutubeResponse {
  kind: string
  etag: string
  nextPageTOken: string
  regionCode: string
  pageInfo: {
    totalResults: number
    resultsPerPage: number
  }
  items: {
    kind: string
    etag: string
    id: {
      kind: string
      videoId: string
    }
    snippet: {
      publishedAt: string
      channelId: string
      title: string
      description: string
      thumbnails: {
        default: Thumbnail
        medium: Thumbnail
        high: Thumbnail
      }
      channelTitle: string
      liveBroadcastContent: string
      publishTime: string
    }
  }[]
}
