import { reindex } from "./indexer/index.js"
import { scrapeLatest } from "./scraper/index.js"
import { generateTop200 } from "./top200/index.js"

(async () => {
  console.log('Starting scrape...')

  await reindex()
  await scrapeLatest()
  await reindex()

  console.log('Generating top 200...')
  await generateTop200()

  console.log('Finished')
})()
