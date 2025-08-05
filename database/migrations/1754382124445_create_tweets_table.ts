import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tweets'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('tweet_id').notNullable()
      table.text('raw', 'longtext')
      table.string('likes')
      table.string('hash').notNullable().unique()
      table.string('retweets')
      table.string('comments')
      table.string('impressions')
      table.integer('reposted_by_id').unsigned().nullable()
      table.boolean('is_pinned').defaultTo(false)
      table.string('url')
      table.text('content', 'longtext')
      table.dateTime('timestamp')

      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
