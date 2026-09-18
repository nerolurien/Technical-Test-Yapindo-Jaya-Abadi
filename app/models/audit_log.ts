import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class AuditLog extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'user_id' })
  declare userId: number | null

  @column()
  declare action: string

  @column({ columnName: 'request_payload', prepare: (v) => JSON.stringify(v), consume: (v) => (typeof v === 'string' ? JSON.parse(v) : v) })
  declare requestPayload: Record<string, any>

  @column({ columnName: 'response_payload', prepare: (v) => (v ? JSON.stringify(v) : null), consume: (v) => (typeof v === 'string' ? JSON.parse(v) : v) })
  declare responsePayload: Record<string, any> | null

  @column()
  declare status: 'success' | 'failed'

  @column({ columnName: 'failed_reason' })
  declare failedReason: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime
}