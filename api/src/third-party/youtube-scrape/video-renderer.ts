import { Uploader } from '../youtube-scrape.js'
import { comb, NavigationEndpoint } from './yt-types.js'

export interface VideoRenderer {
  videoId: string
  title: {
    runs: { text: string }[]
  }
  navigationEndpoint: NavigationEndpoint
  lengthText: {
    simpleText: string
  }
  descriptionSnippet: {
    runs: { text: string; bold: boolean }[]
  }
  publishedTimeText: {
    simpleText: string
  }
  thumbnail: {
    thumbnails: {
      url: string
    }[]
  }
  viewCountText: {
    simpleText: string
    runs: {
      text: string
    }[]
  }
  ownerText: {
    runs: { text: string; navigationEndpoint: NavigationEndpoint }[]
  }
  ownerBadges: {
    metadataBadgeRenderer: {
      style: string
    }
  }[]
}

export interface Video {
  id: string
  title: string
  url: string
  duration: string
  snippet: string
  upload_date: string
  thumbnail_src: string
  views: string
}

/**
 * Parse a videoRenderer object from youtube search results
 * @param {object} renderer - The video renderer
 * @returns object with data to return for this video
 */
export function parseVideoRenderer(renderer: VideoRenderer): {
  video: Video
  uploader: Uploader
} {
  let video = {
    id: renderer.videoId,
    title: renderer.title.runs.reduce(comb, ''),
    url: `https://www.youtube.com${renderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    duration: renderer.lengthText ? renderer.lengthText.simpleText : 'Live',
    snippet: renderer.descriptionSnippet
      ? renderer.descriptionSnippet.runs.reduce(
          (a, b) => a + (b.bold ? `<b>${b.text}</b>` : b.text),
          '',
        )
      : '',
    upload_date: renderer.publishedTimeText
      ? renderer.publishedTimeText.simpleText
      : 'Live',
    thumbnail_src:
      renderer.thumbnail.thumbnails[renderer.thumbnail.thumbnails.length - 1]
        .url,
    views: renderer.viewCountText
      ? renderer.viewCountText.simpleText ||
        renderer.viewCountText.runs.reduce(comb, '')
      : renderer.publishedTimeText
        ? '0 views'
        : '0 watching',
  }

  const verified =
    (renderer.ownerBadges &&
      renderer.ownerBadges.some(
        (badge) => badge.metadataBadgeRenderer.style.indexOf('VERIFIED') > -1,
      )) ||
    false
  let uploader = {
    username: renderer.ownerText.runs[0].text,
    url: `https://www.youtube.com${renderer.ownerText.runs[0].navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    verified,
  }

  return { video: video, uploader: uploader }
}
