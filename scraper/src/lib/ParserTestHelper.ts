import fs from "fs";
import path, { dirname } from "path";
import { expect } from "chai";
import { fileURLToPath } from "node:url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const testParser = (
  fileName: string,
  extractFn: (data: string) => any
) => {
  const htmlPath = path.join(
    __dirname,
    `../../test/fixtures/${fileName}.html`
  );
  const jsonPath = path.join(
    __dirname,
    `../../test/fixtures/${fileName}.json`
  );

  const html = fs.readFileSync(htmlPath, "utf8");

  const result = extractFn(html);
  // fs.writeFileSync(jsonPath, JSON.stringify(result, null, 2))
  const expected = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  expect(result).deep.equals(expected);
};
