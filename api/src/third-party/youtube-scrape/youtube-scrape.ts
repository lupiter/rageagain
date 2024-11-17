/*************************
 * TAKEN FROM https://github.com/HermanFassett/youtube-scrape/blob/master/scraper.js
 *
 * Couldn't use the official version because it uses the nodejs "request" package,
 * this package doesn't work with CloudFlare Workers because workers use "fetch" for
 * network requests.
 *
 * CHANGES:
 * - Typescript
 * - Replaced request with fetch
 * - Replaced require call to "package.json" with hardcoded version string in youtube function
 **************************/

import {
  Channel,
  ChannelRenderer,
  parseChannelRenderer,
} from './channel-renderer.js'
import { parsePlaylistRenderer, PlaylistRenderer } from './playlist-renderer.js'
import { parseRadioRenderer, Radio, RadioRenderer } from './radio-renderer.js'
import { Uploader } from './yt-types.js'
import { parseVideoRenderer, Video, VideoRenderer } from './video-renderer.js'

export interface Result {
  video?: Video
  uploader?: Uploader
  radio?: Radio
  channel?: Channel
  playlist?: any
}

export interface Response {
  results: Result[]
  version: string
  parser?: string
  key?: string
  estimatedResults?: string
  nextPageToken?: string
}

interface SearchResponseBody {
  onResponseReceivedCommands?: any[]
}

export async function youtube({
  query,
  key,
  pageToken,
}: {
  query?: string
  key?: string
  pageToken?: string
}): Promise<Response> {
  let response: Response = { results: [], version: '0.1.5' }

  // Specify YouTube search url
  if (key) {
    response.parser = 'json_format.page_token'
    response.key = key

    // Access YouTube search API
    const resp = await fetch(
      `https://www.youtube.com/youtubei/v1/search?key=${key}`,
      {
        method: 'POST',
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20201022.01.01',
            },
          },
          continuation: pageToken,
        }),
      },
    )

    const body = (await resp.json()) as SearchResponseBody
    if (resp.status <= 200 || resp.status >= 400) {
      throw new Error(await resp.text())
    }
    if (
      body &&
      body.onResponseReceivedCommands &&
      body.onResponseReceivedCommands.length > 0 &&
      body.onResponseReceivedCommands[0] &&
      body.onResponseReceivedCommands[0].continuationItems
    ) {
      parseJsonFormat(
        body.onResponseReceivedCommands[0].appendContinuationItemsAction
          .continuationItems,
        response,
      )
    }

    return response
  } else if (query) {
    let url = `https://www.youtube.com/results?q=${encodeURIComponent(query)}`

    let resp = await fetch(url)

    const html = await resp.text()
    if (resp.status < 200 || resp.status >= 400) {
      console.error(html)
      throw new Error(`${resp.status}`)
    } else if (!html) {
      throw new Error('Recieved empty response')
    }

    response.parser = 'json_format'
    const keys = html.match(/"innertubeApiKey":"([^"]*)/)
    response.key = keys && keys.length > 1 ? keys[1] : undefined

    let data,
      sectionLists = []
    try {
      let match = html.match(/ytInitialData[^{]*(.*?);\s*<\/script>/s)
      if (match && match.length > 1) {
        response.parser += '.object_var'
      } else {
        response.parser += '.original'
        match = html.match(
          /ytInitialData"[^{]*(.*);\s*window\["ytInitialPlayerResponse"\]/s,
        )
      }
      if (!match || match.length < 2) {
        throw new Error(
          `Insufficient matchig content parsing youtube resonse ${match}`,
        )
      }
      data = JSON.parse(match[1])
      response.estimatedResults = data.estimatedResults || '0'
      sectionLists =
        data.contents.twoColumnSearchResultsRenderer.primaryContents
          .sectionListRenderer.contents
    } catch (ex) {
      console.error('Failed to parse data:', ex)
      console.log(data)
    }

    // Loop through all objects and parse data according to type
    parseJsonFormat(sectionLists, response)

    return response
  }
  return response
}

interface Content {
  itemSectionRenderer: {
    contents: {
      channelRenderer?: ChannelRenderer
      videoRenderer?: VideoRenderer
      radioRenderer?: RadioRenderer
      playlistRenderer?: PlaylistRenderer
    }[]
  }
  continuationItemRenderer: {
    continuationEndpoint: {
      continuationCommand: {
        token: string
      }
    }
  }
}

/**
 * Parse youtube search results from json sectionList array and add to json result object
 * @param {Array} contents - The array of sectionLists
 * @param {Object} response - The object being returned to caller
 */
function parseJsonFormat(contents: Content[], response: Response) {
  contents.forEach((sectionList) => {
    try {
      if (sectionList.itemSectionRenderer) {
        sectionList.itemSectionRenderer.contents.forEach((content) => {
          try {
            if (content.channelRenderer) {
              response.results.push(
                parseChannelRenderer(content.channelRenderer),
              )
            }
            if (content.videoRenderer) {
              response.results.push(parseVideoRenderer(content.videoRenderer))
            }
            if (content.radioRenderer) {
              response.results.push(parseRadioRenderer(content.radioRenderer))
            }
            if (content.playlistRenderer) {
              response.results.push(
                parsePlaylistRenderer(content.playlistRenderer),
              )
            }
          } catch (ex) {
            console.error('Failed to parse renderer:', ex)
            console.log(content)
          }
        })
      } else if (sectionList.hasOwnProperty('continuationItemRenderer')) {
        response.nextPageToken =
          sectionList.continuationItemRenderer.continuationEndpoint.continuationCommand.token
      }
    } catch (ex) {
      console.error('Failed to read contents for section list:', ex)
      console.log(sectionList)
    }
  })
}
