import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import User from './user.js'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'

export default class Tweet extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tweetId: string

  @column()
  declare raw: string

  @column()
  declare likes: string

  @column()
  declare hash: string

  @column()
  declare retweets: string

  @column()
  declare comments: string

  @column()
  declare impressions: string

  @column()
  declare repostedById: number

  @column()
  declare isPinned: boolean

  @column()
  declare url: string

  @column()
  declare content: string

  @column.dateTime()
  declare timestamp: DateTime

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
