import { handleRequest } from './handler.js'

export default {
  async fetch(request): Promise<Response> {
    return handleRequest(request);
  }
} satisfies ExportedHandler;