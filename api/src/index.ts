import { handleRequest } from './handler'

export default {
  async fetch(request): Promise<Response> {
    return handleRequest(request);
  }
} satisfies ExportedHandler;