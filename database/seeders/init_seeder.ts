import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import Project from '#models/project'
import Task from '#models/task'

export default class extends BaseSeeder {
  async run() {
  //  Admin & User
    const admin = await User.create({
      name: 'Admin Utama',
      email: 'admin@mail.com',
      password: 'password123',
      role: 'admin',
    })

    const member1 = await User.create({
      name: 'Budi Developer',
      email: 'budi@mail.com',
      password: 'password123',
      role: 'user',
    })

    const member2 = await User.create({
      name: 'Siti QA',
      email: 'siti@mail.com',
      password: 'password123',
      role: 'user',
    })

    // Project Dummy
    const project1 = await Project.create({
      name: 'E-Commerce Revamp',
      description: 'Project redesign dan optimasi arsitektur sistem belanja',
      createdBy: admin.id,
    })

    // Task Dummy
    await Task.createMany([
      {
        projectId: project1.id,
        title: 'Setup Environment Server',
        description: 'Konfigurasi Docker dan PostgreSQL di VPS',
        status: 'done',
        priority: 'high',
        assigneeId: member1.id,
      },
      {
        projectId: project1.id,
        title: 'Bug Slicing Checkout Page',
        description: 'Tampilan mobile responsive berantakan di Safari',
        status: 'todo',
        priority: 'medium',
        assigneeId: member2.id,
      },
    ])
  }
}