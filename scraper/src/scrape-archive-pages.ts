import fs from 'fs'
import { load as cheerioLoad } from 'cheerio'
import downloadPage from './lib/downloadPage'
import writePlaylistFile from './lib/writePlaylistFile'
import  {reindex } from './indexer'
import { scrapeTracklistHtml } from './scraper/scrapeTracklists'
import { IndexedPlaylist } from './Types'

async function scrapeArchivePage(url: string, date: string) {
  if (url.endsWith('%22')) {
    url = url.slice(0, -3);
  }

  const html = await downloadPage(url)

  if (!html)
    throw new Error(`Failed to download page: ${url}`);

  console.log(` - Downloaded page ${html.length} chars`);

  const $ = cheerioLoad(html)
  
  const title = $('h1').text();

  const timeslot =
    title.toLowerCase().includes('night') ? 'night' :
    title.toLowerCase().includes('morning') ? 'morning' : null
  
  // Get special from meta[name="description"]
  const special = $('meta[name="description"]').attr('content') ?? null;

  const tracklist = scrapeTracklistHtml(html);

  if (!tracklist.tracks.length) {
    throw new Error(`No tracks found in tracklist for ${title}`);
  }

  return {
    title,
    url,
    special: special ? special : null, // Check for empty string
    timeslot,
    date,
    tracks: tracklist.tracks,
  }
}

async function scrapeUrls(urls: {url: string, date: string}[]) {
  //await reindex();

  if (!urls.length) {
    throw new Error('No URL provided');
  }

  // Check if data has been scraped before by checking index.json
  const index = JSON.parse(fs.readFileSync('../data/index.json', 'utf-8')).playlists as IndexedPlaylist[];

  if (!index || !index.length || !Array.isArray(index)) {
    throw new Error('No index found');
  }

  const newUrls = urls.filter(urlData => !index.some(indexDatum => indexDatum.url === urlData.url));

  if (!newUrls.length) {
    throw new Error('No new URLs to scrape');
  }

  for (const urlData of newUrls) {
    try {
      console.log(`Scraping ${urlData.url}...`);

      const data = await scrapeArchivePage(urlData.url, urlData.date);
      console.log(` - Scraped: ${data.title} ${data.tracks.length} tracks`);

      await writePlaylistFile(new Date(data.date), data);
      console.log(` - Wrote playlist file`);

      //break; // For testing, remove later
    } catch (e) {
      console.error(e);
    }
  }

  console.log('Scraping complete');

  await reindex();
}


const urls = JSON.parse(fs.readFileSync('../data/webarchive-output.json', 'utf-8'));

if (!urls || !urls.length) {
  throw new Error('No URLs found');
}

scrapeUrls(urls);