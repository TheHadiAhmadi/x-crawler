import type { HttpContext } from '@adonisjs/core/http'

import Account from '#models/account'

export default class AccountsController {
  async index({ request, response }: HttpContext) {
    const accounts = await Account.query()
    return response.json(accounts)
  }

  async save({ request, response }: HttpContext) {
    const { authToken } = request.all()

    const account = new Account()
    account.auth_token = authToken
    account.status = 'active'
    await account.save()

    return response.json({ message: 'Account saved successfully' })
  }
}
