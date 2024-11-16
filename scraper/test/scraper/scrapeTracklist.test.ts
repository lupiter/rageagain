import { testParser } from "../../src/lib/ParserTestHelper.js";
import { scrapeTracklistHtml } from "../../src/scraper/scrapeTracklists.js";

describe("scraperV1", () => {
  it("correctly scrapes variation 1", async () => {
    testParser(
      "tracklist-variation-1_sunday-night-29th-january-2017-on-abc",
      (html) => scrapeTracklistHtml(html),
    );
  });
});

describe("scraperV2", () => {
  it("correctly scrapes variation 2", async () => {
    testParser("tracklist-variation-2_friday-night-4-may-2018-on-abc", (html) =>
      scrapeTracklistHtml(html),
    );
  });

  it("correctly scrapes variation 3", async () => {
    testParser(
      "tracklist-variation-3_saturday-night-31-october-2020-on-abc-1",
      (html) => scrapeTracklistHtml(html),
    );
  });
});
