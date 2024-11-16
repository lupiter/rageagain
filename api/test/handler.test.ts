import { expect } from 'chai'
import { handleRequest } from '../src/handler.js'
import { Env } from '../src/types.js'

describe('handler responds to request', () => {
  let fakeEnv: Env

  beforeEach(() => {
    fakeEnv = {
      YOUTUBE_REQUESTS:  undefined,
      GITHUB_DATA: undefined,
    } as unknown as Env
  })

  // Youtube tests are for debugging only, we don't want to run them on CI as they flake a lot

  xit('GET Request: music video', async () => {
    const result = await handleRequest(
      new Request(
        'https://api.ragereplay.com/api/musicvideosearch?song=never%20gonna%20give%20you%20up&artist=Rick%20Astley',
        { method: 'GET' },
      ),
      fakeEnv
    )
    expect(result.status).to.eq(200)
    const json = (await result.json()) as any
    expect(json.length).to.eq(19)
  })

  xit('GET Request: music video with odd artist', async () => {
    const result = await handleRequest(
      new Request(
        'https://api.ragereplay.com/api/musicvideosearch?artist=THE STEMS - LIVE ON COUNTDOWN&song=Sad Girl',
        { method: 'GET' },
      ),
      fakeEnv
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
      fakeEnv
    )
    expect(result.status).to.eq(200)
    const json = (await result.json()) as any
    expect(json['date']).to.eq('2020-02-01')
  })

  it('OPTIONS Request', async () => {
    const result = await handleRequest(
      new Request('https://api.ragereplay.com/', { method: 'OPTIONS' }), fakeEnv
    )
    expect(result.status).to.eq(200)
  })

  it('GET Request: not found', async () => {
    const result = await handleRequest(
      new Request('https://api.ragereplay.com/', { method: 'GET' }), fakeEnv
    )
    expect(result.status).to.eq(404)
  })

  it('Not Found Request', async () => {
    const result = await handleRequest(
      new Request('https://api.ragereplay.com/unknown/', { method: 'GET' }), fakeEnv
    )
    expect(result.status).to.eq(404)
  })

  it('Invalid DELETE Request', async () => {
    const result = await handleRequest(
      new Request('https://api.ragereplay.com//', { method: 'DELETE' }), fakeEnv
    )
    expect(result.status).to.eq(405)
  })
})
