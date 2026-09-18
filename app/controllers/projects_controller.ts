import type { HttpContext } from '@adonisjs/core/http'
import Project from '#models/project'
import Task from '#models/task'

export default class ProjectsController {
  /**
   * GET /projects
   * User & Admin bisa melihat daftar semua proyek
   */
  async index({ response }: HttpContext) {
    const projects = await Project.query().preload('creator', (query) => {
      query.select('id', 'name', 'email')
    })

    return response.json({
      message: 'Berhasil mengambil daftar proyek',
      data: projects,
    })
  }

  /**
   * GET /projects/:id
   * Admin melihat detail 1 proyek
   */
  async show({ params, response }: HttpContext) {
    const project = await Project.find(params.id)

    if (!project) {
      return response.status(404).json({
        message: `Project dengan ID ${params.id} tidak ditemukan`,
      })
    }

    await project.load('creator', (query) => {
      query.select('id', 'name', 'email')
    })

    return response.json({
      message: 'Berhasil mengambil detail proyek',
      data: project,
    })
  }

  /**
   * POST /projects
   * Admin membuat proyek baru
   */
  async store({ request, response, auth }: HttpContext) {
    const user = auth.user!
    const { name, description } = request.only(['name', 'description'])

    if (!name) {
      return response.status(400).json({
        message: 'Nama proyek wajib diisi',
      })
    }

    const project = await Project.create({
      name,
      description: description || null,
      createdBy: user.id,
    })

    return response.status(201).json({
      message: 'Proyek berhasil dibuat',
      data: project,
    })
  }

  /**
   * PUT /projects/:id
   * Admin memperbarui proyek
   */
  async update({ params, request, response }: HttpContext) {
    const project = await Project.find(params.id)

    if (!project) {
      return response.status(404).json({
        message: `Project dengan ID ${params.id} tidak ditemukan`,
      })
    }

    const { name, description } = request.only(['name', 'description'])

    if (name) project.name = name
    if (description !== undefined) project.description = description

    await project.save()

    return response.json({
      message: 'Proyek berhasil diperbarui',
      data: project,
    })
  }

  /**
   * DELETE /projects/:id
   * Admin menghapus proyek
   */
  async destroy({ params, response }: HttpContext) {
    const project = await Project.find(params.id)

    if (!project) {
      return response.status(404).json({
        message: `Project dengan ID ${params.id} tidak ditemukan`,
      })
    }

    await project.delete()

    return response.json({
      message: 'Proyek berhasil dihapus',
    })
  }

  /**
   * GET /projects/:id/tasks
   * User & Admin melihat semua tugas di dalam proyek tertentu
   */
  async getTasks({ params, response }: HttpContext) {
    const project = await Project.find(params.id)

    if (!project) {
      return response.status(404).json({
        message: `Project dengan ID ${params.id} tidak ditemukan`,
      })
    }

    const tasks = await Task.query()
      .where('projectId', params.id)
      .preload('assignee', (query) => {
        query.select('id', 'name', 'email')
      })

    return response.json({
      message: `Daftar task untuk project ID ${params.id}`,
      data: tasks,
    })
  }
}