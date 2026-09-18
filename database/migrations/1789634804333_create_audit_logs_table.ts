import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'audit_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').unsigned().references('id').inTable('users').nullable()
      table.string('action').notNullable()
      table.json('request_payload').notNullable()
      table.json('response_payload').nullable()
      table.enum('status', ['success', 'failed']).notNullable()
      table.text('failed_reason').nullable()
      table.timestamp('created_at', { useTz: true })
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}