import { execSync } from 'node:child_process'

import type { PlopTypes } from '@turbo/gen'

export default function init(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator('init', {
    description: 'Create a new workspace in this monorepo',
    prompts: [
      {
        type: 'list',
        name: 'location',
        message: 'Where should the workspace be created?',
        choices: ['packages', 'tooling', 'apps'],
      },
      {
        type: 'input',
        name: 'name',
        message: 'What is the workspace name?',
        validate: (input: string) => {
          if (!input) return 'Name is required'
          if (!/^[a-z][a-z0-9-]*$/.test(input)) return 'Must be lowercase with hyphens (e.g. my-package)'
          return true
        },
      },
      {
        type: 'confirm',
        name: 'react',
        message: 'Does this workspace use React?',
        default: false,
        when: ({ location }: { location: string }) => location !== 'tooling',
      },
    ],
    actions: (answers) => {
      if (!answers) return []
      const location = answers.location as string

      return [
        {
          type: 'addMany',
          destination: `${location}/{{ name }}`,
          templateFiles: `templates/init/${location}/**/*.hbs`,
          base: `templates/init/${location}`,
        },
        (answers) => {
          const loc = answers.location as string
          const name = answers.name as string
          const react = answers.react as boolean | undefined
          const cwd = `${loc}/${name}`

          execSync('bun install', { stdio: 'inherit' })

          if (react) {
            execSync(`bun add --cwd ${cwd} react react-dom`, { stdio: 'inherit' })
            execSync(`bun add --cwd ${cwd} -d @types/react @types/react-dom`, { stdio: 'inherit' })
          }

          execSync(`bunx prettier --write "${cwd}/" --list-different`, { stdio: 'inherit' })

          return `${cwd} scaffolded`
        },
      ]
    },
  })
}
