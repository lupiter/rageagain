import { promisify } from "util"
import fs from 'fs'
import * as chrono from 'chrono-node'

import { DataIndex, ArchivePlaylist } from '../Types.js'
import downloadPage from '../lib/downloadPage.js'
import { DATA_INDEX_PATH } from "../Constants.js"

const readFile = promisify(fs.readFile)


/**
 * Removes garbage from title string.
 * E.g. 'Saturday morning 20th January 2018 on ABC'
 *      converts to 'saturday 20th january 2018'
 * @param str
 */
const cleanDate = (str: string) => {
  str = str.toLowerCase()
           .replace(/ ?night ?/, ' ')
           .replace(/ ?morning ?/, ' ')

  if (str.includes(' on'))
    str = str.substring(0, str.indexOf(' on'))

  // There a couple of invalid playlist titles that only contain a timeslot
  if (/[0-9]+:[0-9]+[ap]m - [0-9]+:[0-9]+[ap]m/.test(str))
    return null

  return str
}


const findMissingPlaylists = async () => {
  const index: DataIndex = JSON.parse(await readFile(DATA_INDEX_PATH, 'utf8'))

  if (!index)
    throw new Error('Failed to find index.json at ' + DATA_INDEX_PATH)

  if (!index.playlists.length)
    throw new Error('No playlists found in index.json at ' + DATA_INDEX_PATH)


  let offset = 0;
  const size = 16;
  let missingPlaylists = []
  let accumulatedPlaylists: ArchivePlaylist[] = []

  do {
    const json = await downloadPage(`https://www.abc.net.au/core-next/api/collection/rage/playlist?collectionId=13642802&offset=${offset}&size=${size}`)
    const data = JSON.parse(json)
    if (!data.collection) {
      // end of results
      break
    }
    const playlists = data.collection.items

    type PlaylistEntry = {
      cardTitle: string
      description: string
      articleLink: string
    }

    const newPlaylists = playlists.map((playlist: PlaylistEntry) => {
      const {
        cardTitle: title,
        description: teaserText,
        articleLink: tracklistUrl,
      } = playlist;

      const timeslot =
      title.toLowerCase().includes('night') ? 'night' :
      title.toLowerCase().includes('morning') ? 'morning' : null

      const special = /am|pm$/gi.test(teaserText) ? null : teaserText.trim()

      const dateString = cleanDate(title)
      if (!dateString) {
        console.log(`${dateString} not a recognisable date string`)
        return;
      }

      let referenceDate = new Date('2024-01-01')
      if (!dateString.match(/202\d/)) {
        console.log(`${dateString} has no year?`)
        console.log(playlist)
        // The one tracklist in 2023 without a year in the title
        if (tracklistUrl == "https://www.abc.net.au/rage/playlist/friday-night-22-december-on-abc-tv/103241478") {
          referenceDate = new Date('2023-12-22')
        }
      }

      const date = chrono.parseDate(dateString, referenceDate)

      if (!date)
      return console.error(`No date found for playlist "${title}"`)

      const result = {
        title,
        url: tracklistUrl.startsWith('https://www.abc.net.au/') ? tracklistUrl : 'https://www.abc.net.au' + tracklistUrl,
        special,
        timeslot,
        date
      }

      return result
    })

    missingPlaylists = newPlaylists.filter((p: ArchivePlaylist) => {
      return !index.playlists.find(l => l.url == p.url)
    })

    accumulatedPlaylists = [...accumulatedPlaylists, ...missingPlaylists];

    offset += size;
  } while (missingPlaylists.length > 0)

  return accumulatedPlaylists
}

export default findMissingPlaylists;
