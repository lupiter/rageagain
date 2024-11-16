import { comb, NavigationEndpoint } from './yt-types.js'

export interface ChannelRenderer {
  channelId: string
  title: {
    simpleText: string
  }
  descriptionSnippet: {
    runs: { text: string }[]
  }
  thumbnail: { thumbnails: { url: string }[] }
  videoCountText: { runs: { text: string }[] }
  subscriberCountText: { simpleText: string }
  ownerBadges: {
    metadataBadgeRenderer: {
      style: string
    }
  }[]
  navigationEndpoint: NavigationEndpoint
}

export interface Channel {
  id: string
  title: string
  url: string
  snippet: string
  thumbnail_src: string
  video_count: string
  subscriber_count: string
  verified: boolean
}

/**
 * Parse a channelRenderer object from youtube search results
 * @param {ChannelRenderer} renderer - The channel renderer
 * @returns object with data to return for this channel
 */
export function parseChannelRenderer(renderer: ChannelRenderer): {
  channel: Channel
} {
  let channel = {
    id: renderer.channelId,
    title: renderer.title.simpleText,
    url: `https://www.youtube.com${renderer.navigationEndpoint.commandMetadata.webCommandMetadata.url}`,
    snippet: renderer.descriptionSnippet
      ? renderer.descriptionSnippet.runs.reduce(comb, '')
      : '',
    thumbnail_src:
      renderer.thumbnail.thumbnails[renderer.thumbnail.thumbnails.length - 1]
        .url,
    video_count:
      renderer.videoCountText && renderer.videoCountText.runs
        ? renderer.videoCountText.runs.reduce(comb, '')
        : '',
    subscriber_count: renderer.subscriberCountText
      ? renderer.subscriberCountText.simpleText
      : '0 subscribers',
    verified:
      (renderer.ownerBadges &&
        renderer.ownerBadges.some(
          (badge) => badge.metadataBadgeRenderer.style.indexOf('VERIFIED') > -1,
        )) ||
      false,
  }

  return { channel }
}
