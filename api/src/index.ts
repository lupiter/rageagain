import { Env } from './types.js'
import { handleRequest } from './handler.js'

export default {
  async fetch(request, env, ctx): Promise<Response> {
    return handleRequest(request, env)
  },
} satisfies ExportedHandler<Env>
