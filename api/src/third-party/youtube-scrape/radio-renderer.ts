import { comb, NavigationEndpoint, Uploader } from './yt-types.js'

export interface RadioRenderer {
  thumbnail: {
    thumbnails: { url: string }[]
  }
  videoCountText: {
    runs: { text: string }[]
  }
  playlistId: string
  title: {
    simpleText: string
  }
  shortBylineText: {
    simpleText: string
  }
  navigationEndpoint: NavigationEndpoint
}

export interface Radio {
  id: string
  title: string
  url: string
  thumbnail_src: string
  video_count: string
}

/**
 * Parse a radioRenderer object from youtube search results
 * @param {object} renderer - The radio renderer
 * @returns object with data to return for this mix
 */
export function parseRadioRenderer(renderer: RadioRenderer): {
  radio: Radio
  uploader: Uploader
} {
  let radio = {
    id: renderer.playlistId,
    title: renderer.title.simpleText,
    url: `https://www.youtube.com${renderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    thumbnail_src:
      renderer.thumbnail.thumbnails[renderer.thumbnail.thumbnails.length - 1]
        .url,
    video_count: renderer.videoCountText.runs.reduce(comb, ''),
  }

  let uploader = {
    username: renderer.shortBylineText
      ? renderer.shortBylineText.simpleText
      : 'YouTube',
    url: `https://www.youtube.com${renderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
  }

  return { radio: radio, uploader: uploader }
}
