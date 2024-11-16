import { expect } from 'chai'
import { handleRequest } from '../src/handler.js'

describe('handler responds to request', () => {
  it('GET Request: music video', async () => {
    const result = await handleRequest(
      new Request(
        'https://api.ragereplay.com/api/musicvideosearch?song=never%20gonna%20give%20you%20up&artist=Rick%20Astley',
        { method: 'GET' },
      ),
    )
    expect(result.status).to.eq(200)
    const json = (await result.json()) as any
    expect(json.length).to.eq(19)
  })

  it('GET Request: music video with odd artist', async () => {
    const result = await handleRequest(
      new Request(
        'https://api.ragereplay.com/api/musicvideosearch?artist=THE STEMS - LIVE ON COUNTDOWN&song=Sad Girl',
        { method: 'GET' },
      ),
    )
    expect(result.status).to.eq(200)
    const json = (await result.json()) as any
    expect(json.length).to.eq(19)
  })

  it('GET Request: data', async () => {
    const result = await handleRequest(
      new Request('https://api.ragereplay.com/api/data/2020/02/01_night.json', {
        method: 'GET',
      }),
    )
    expect(result.status).to.eq(200)
    const json = (await result.json()) as any
    expect(json['date']).to.eq('2020-02-01')
  })

  it('OPTIONS Request', async () => {
    const result = await handleRequest(
      new Request('https://api.ragereplay.com/', { method: 'OPTIONS' }),
    )
    expect(result.status).to.eq(200)
  })

  it('GET Request: not found', async () => {
    const result = await handleRequest(
      new Request('https://api.ragereplay.com/', { method: 'GET' }),
    )
    expect(result.status).to.eq(404)
  })

  it('Not Found Request', async () => {
    const result = await handleRequest(
      new Request('https://api.ragereplay.com/unknown/', { method: 'GET' }),
    )
    expect(result.status).to.eq(404)
  })

  it('Invalid DELETE Request', async () => {
    const result = await handleRequest(
      new Request('https://api.ragereplay.com//', { method: 'DELETE' }),
    )
    expect(result.status).to.eq(405)
  })
})
