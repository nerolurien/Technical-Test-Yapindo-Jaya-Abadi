/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  auth: {
    register: typeof routes['auth.register']
    login: typeof routes['auth.login']
  }
  projects: {
    index: typeof routes['projects.index']
    getTasks: typeof routes['projects.get_tasks']
    store: typeof routes['projects.store']
    show: typeof routes['projects.show']
    update: typeof routes['projects.update']
    destroy: typeof routes['projects.destroy']
  }
  ai: {
    handleCommand: typeof routes['ai.handle_command']
  }
}
