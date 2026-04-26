import type { PlopTypes } from '@turbo/gen'

import init from './init'

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  init(plop)
}
