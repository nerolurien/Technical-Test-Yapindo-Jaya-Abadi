import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const AuthController = () => import('#controllers/auth_controller')
const ProjectsController = () => import('#controllers/projects_controller')
const AiController = () => import('#controllers/ai_controller')

// Autentikasi
router.post('/register', [AuthController, 'register'])
router.post('/login', [AuthController, 'login'])

router
  .group(() => {
    // Fitur Role User & Admin
    router.get('/projects', [ProjectsController, 'index'])
    router.get('/projects/:id/tasks', [ProjectsController, 'getTasks'])
    router.post('/ai/command', [AiController, 'handleCommand'])

    // Fitur Khusus Role Admin (CRUD Projects)
    router
      .group(() => {
        router.post('/projects', [ProjectsController, 'store'])
        router.get('/projects/:id', [ProjectsController, 'show'])
        router.put('/projects/:id', [ProjectsController, 'update'])
        router.delete('/projects/:id', [ProjectsController, 'destroy'])
      })
      .use(middleware.admin())
  })
  .use(middleware.auth())