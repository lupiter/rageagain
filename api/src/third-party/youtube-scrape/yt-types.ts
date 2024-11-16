export interface NavigationEndpoint {
  commandMetadata: {
    webCommandMetadata: {
      url: string
    }
  }
}

export interface Uploader {
  username: string
  url: string
  verified?: boolean
}

/**
 * Combine array containing objects in format { text: "string" } to a single string
 * For use with reduce function
 * @param {string} a - Previous value
 * @param {object} b - Current object
 * @returns Previous value concatenated with new object text
 */
export function comb(a: string, b: { text: string }) {
  return a + b.text
}
