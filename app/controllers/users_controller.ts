import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'

export default class UsersController {
  async index({ request, response }: HttpContext) {
    const page = Number(request.input('page', 1))
    const perPage = Number(request.input('perPage', 20))

    const users = await User.query().orderBy('created_at', 'desc').paginate(page, perPage)
    return response.ok(users)
  }

  async show({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })

    return response.ok(user)
  }

  async store({ request, response }: HttpContext) {
    const data = request.only(['username', 'name', 'status'])
    const user = await User.create(data)

    return response.created(user)
  }

  async update({ params, request, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })

    const data = request.only(['username', 'name', 'status'])
    user.merge(data)
    await user.save()

    return response.ok(user)
  }

  async destroy({ params, response }: HttpContext) {
    const user = await User.find(params.id)
    if (!user) return response.notFound({ message: 'User not found' })

    await user.delete()
    return response.noContent()
  }
}

