import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Task from '#models/task'
import AuditLog from '#models/audit_log'
import { parseNaturalLanguageTaskCommand } from '#services/gemini_service'

export default class AiController {
  async handleCommand({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const { prompt } = request.only(['prompt'])

    if (!prompt) {
      return response.status(400).json({ message: 'Prompt wajib diisi' })
    }

    let parsedResult: any = null

    // Memanggil AI
    try {
      parsedResult = await parseNaturalLanguageTaskCommand(prompt)
    } catch (err: any) {
      await AuditLog.create({
        userId: user.id,
        action: 'AI_COMMAND',
        requestPayload: { prompt },
        responsePayload: null,
        status: 'failed',
        failedReason: `Gagal memproses AI: ${err.message}`
      })
      return response.status(400).json({ message: 'Gagal memproses instruksi dengan AI' })
    }

    //  Guardrail Penolakan
    if (parsedResult.rejected || !parsedResult.actions || parsedResult.actions.length === 0) {
      const reason = parsedResult.rejectionReason || 'Instruksi ditolak. AI hanya diizinkan mengelola tabel Task dan dilarang memodifikasi data User.'

      await AuditLog.create({
        userId: user.id,
        action: 'AI_COMMAND',
        requestPayload: { prompt },
        responsePayload: parsedResult,
        status: 'failed',
        failedReason: reason
      })

      return response.status(400).json({
        message: 'Instruksi ditolak',
        reason: reason
      })
    }

    // Eksekusi Database Transaction
    const trx = await db.transaction()
    try {
      const executedResults: any[] = []

      for (const act of parsedResult.actions) {
        if (act.action === 'CREATE') {
          if (!act.projectId || !act.title) {
            throw new Error('projectId dan title wajib ada untuk membuat task')
          }
          const newTask = new Task()
          newTask.useTransaction(trx)
          newTask.fill({
            projectId: act.projectId,
            title: act.title,
            description: act.description,
            status: act.status || 'todo',
            priority: act.priority || 'medium',
            assigneeId: act.assigneeId
          })
          await newTask.save()
          executedResults.push({ action: 'CREATE', task: newTask })
        } else if (act.action === 'UPDATE') {
          if (!act.taskId) throw new Error('taskId wajib disertakan untuk update')
          
          const task = await Task.query({ client: trx }).where('id', act.taskId).first()
          if (!task) throw new Error(`Task dengan ID ${act.taskId} tidak ditemukan`)

          task.useTransaction(trx)
          if (act.title) task.title = act.title
          if (act.status) task.status = act.status
          if (act.priority) task.priority = act.priority
          if (act.assigneeId !== undefined) task.assigneeId = act.assigneeId
          await task.save()
          executedResults.push({ action: 'UPDATE', task })
        } else if (act.action === 'DELETE') {
          if (!act.taskId) throw new Error('taskId wajib disertakan untuk delete')
          
          const task = await Task.query({ client: trx }).where('id', act.taskId).first()
          if (!task) throw new Error(`Task dengan ID ${act.taskId} tidak ditemukan`)

          task.useTransaction(trx)
          await task.delete()
          executedResults.push({ action: 'DELETE', taskId: act.taskId })
        }
      }

      await trx.commit()

      // Catat Audit Log Success (di luar transaksi task)
      await AuditLog.create({
        userId: user.id,
        action: 'AI_COMMAND',
        requestPayload: { prompt },
        responsePayload: { parsed: parsedResult, results: executedResults },
        status: 'success'
      })

      return response.json({
        message: 'Instruksi berhasil dijalankan',
        data: executedResults
      })
    } catch (error: any) {
      await trx.rollback()

      // Catat Audit Log Failed
      await AuditLog.create({
        userId: user.id,
        action: 'AI_COMMAND',
        requestPayload: { prompt },
        responsePayload: parsedResult,
        status: 'failed',
        failedReason: error.message
      })

      return response.status(400).json({
        message: 'Gagal mengeksekusi instruksi database',
        error: error.message
      })
    }
  }
}