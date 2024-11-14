import findMissingPlaylists from "./findMissingPlaylistsNew.js"
import { scrapeTracklist } from "./scrapeTracklistsNew.js"
import { dateFormat } from "../lib/DateHelpers.js"
import writePlaylistFile from "../lib/writePlaylistFile.js"

export const scrapeLatest = async () => {
  console.log('Scrape started')

  const missingPlaylists = await findMissingPlaylists()

  console.log(`Found ${missingPlaylists.length} missing playlists`)

  for (const missingPlaylist of missingPlaylists) {
    try {
      const tracks = await scrapeTracklist(missingPlaylist.url)
      await writePlaylistFile(missingPlaylist.date, {
        title: missingPlaylist.title,
        special: missingPlaylist.special,
        timeslot: missingPlaylist.timeslot,
        date: dateFormat(missingPlaylist.date),
        url: missingPlaylist.url,
        tracks: tracks
      })
    } catch (e) {
      console.error('Failed to process playlist: ' + missingPlaylist.title + ' at ' + missingPlaylist.url + " - " + e)
    }
  }

  console.log('Scrape finished')
}
