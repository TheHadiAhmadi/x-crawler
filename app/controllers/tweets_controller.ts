import type { HttpContext } from '@adonisjs/core/http'

import Tweet from '#models/tweet'

export default class TweetsController {
  async index({ request, response }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Number(request.input('perPage', 20))

    const tweets = await Tweet.query().orderBy('created_at', 'desc').paginate(page, perPage)

    return response.ok(tweets)
  }
}
