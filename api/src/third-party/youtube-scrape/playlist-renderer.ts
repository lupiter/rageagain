import { NavigationEndpoint, Uploader } from './yt-types.js'

export interface PlaylistRenderer {
  thumbnailRenderer: {
    playlistVideoThumbnailRenderer: {
      thumbnail: {
        thumbnails: { url: string }[]
      }
    }
  }
  playlistId: string
  title: {
    simpleText: string
  }
  videoCount: string
  shortBylineText: {
    runs: {
      text: string
      navigationEndpoint: NavigationEndpoint
    }[]
  }
  navigationEndpoint: NavigationEndpoint
}

export interface Playlist {
  id: string
  title: string
  url: string
  thumbnail_src: string
  video_count: string
}

/**
 * Parse a playlistRenderer object from youtube search results
 * @param {object} renderer - The playlist renderer
 * @returns object with data to return for this playlist
 */
export function parsePlaylistRenderer(renderer: PlaylistRenderer): {
  playlist: Playlist
  uploader: Uploader
} {
  let thumbnails =
    renderer.thumbnailRenderer.playlistVideoThumbnailRenderer.thumbnail
      .thumbnails
  let playlist = {
    id: renderer.playlistId,
    title: renderer.title.simpleText,
    url: `https://www.youtube.com${renderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    thumbnail_src: thumbnails[thumbnails.length - 1].url,
    video_count: renderer.videoCount,
  }

  let uploader = {
    username: renderer.shortBylineText.runs[0].text,
    url: `https://www.youtube.com${renderer.shortBylineText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
  }

  return { playlist: playlist, uploader: uploader }
}
