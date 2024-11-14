import * as cheerio from 'cheerio';
import { militaryTime } from '../lib/DateHelpers.js'
import downloadPage from '../lib/downloadPage.js'
import { parseTrackString, stripParens } from '../lib/StringParsers.js'
import { PlaylistTrack } from '../Types.js'
import type { AnyNode, DataNode, Document, Element, ParentNode } from 'domhandler';
import { ElementType} from 'domelementtype';

export const scraperV1 = ($: cheerio.CheerioAPI, $article: cheerio.Cheerio<Element>): PlaylistTrack[] => {
  const tracks: PlaylistTrack[] = []

  const $ps = $article.children('p')

  if (!$ps.length)
    console.warn('Failed to find any P tags')

  $ps.toArray().forEach(p => {
    const $p = $(p)
    const timeslot = $p.text().trim()

    if (!(/am|pm$/gi.test(timeslot)))
      return

    const items = $p.next().children()
    let $item = items.filter('strong').first()

    while ($item.length) {
      const artist = $item.text().trim()
      const song = $item.next('em').text().trim()
      const nextEm = $item.next('em')[0]
      const label = stripParens((nextEm.next as DataNode)?.data?.trim())

      tracks.push({
        artist,
        song,
        label,
        timeslot: militaryTime(timeslot) ?? ''
      })

      $item = $item.nextAll('strong').first()
    }
  })

  return tracks
}

export const scraperV2 = ($: cheerio.CheerioAPI, $article: cheerio.Cheerio<Element>): PlaylistTrack[] => {
  const tracks: PlaylistTrack[] = []
  const $headings = $article.find('h2')

  const findLabel = (nodes: cheerio.Cheerio<Element>) => {
    for (let i = nodes.length - 1; i <= 0; i--) {
      const n = $(nodes[i]);
      if (nodes[i].type === ElementType.Tag && /\(.*\)/.test(n.text().trim() ?? '')) {
        return stripParens(n.text().trim())
      }
      
    }
  }

  $headings.toArray().forEach(heading => {
    const $heading = $(heading)
    const timeslot = $heading.text().trim()

    if (!(/am|pm$/gi.test(timeslot)))
      return

    const $lis = $heading.next('ul').children('li')

    if (!$lis.length)
      console.warn('Failed to find any items for timeslot: ' + timeslot)

    $lis.toArray().forEach(li => {
      const $li = $(li)
      let artist = $li.find('strong').text().trim()
      let song = $li.find('em').text().trim()

      // Find last non-empty child text node
      const tagLi = $($li[0]) as cheerio.Cheerio<Element>
      let label = findLabel(tagLi.children())

      // Fallback to text parser for some older pages.
      // For an example of a page that needs this see:
      // https://www.abc.net.au/rage/playlist/friday-night-4-may-2018-on-abc/9758698
      if (!artist || !song) {
        const result = parseTrackString($li.text())

        artist = result.artist
        song = result.song
        label = result.label
      }

      tracks.push({
        artist,
        song,
        label,
        timeslot: militaryTime(timeslot) ?? ''
      })
    })
  })

  return tracks
}

export const scrapeTracklistHtml = (html: string) => {
  const $ = cheerio.load(html)
  let $article = $('.article-text')

  if (!$article.length) {
    $article = $('article');

    if (!$article.length) {
      throw new Error('Failed to find article element')
    }
  }

  const $headings = $article.find('h2')

  // Newer pages use H2 tags to seperate timeslots
  if ($headings.length) {
    return {
      scraper: 2,
      tracks: scraperV2($, $article)
    }
  } else {
    return {
      scraper: 1,
      tracks: scraperV1($, $article)
    }
  }
}

export const scrapeTracklist = async (tracklistUrl: string): Promise<PlaylistTrack[]> => {
  const html = await downloadPage(tracklistUrl)

  if (!html)
    throw new Error('Failed to download playlist at ' + tracklistUrl)

  try {
    const result = scrapeTracklistHtml(html)
    console.log(`Scraper v${result.scraper} found ${result.tracks.length} tracks at "${tracklistUrl}"`)
    return result.tracks
  } catch (e) {
    throw new Error(e + ' at ' + tracklistUrl)
  }
}
