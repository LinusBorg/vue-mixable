import { mount, type MountingOptions } from '@vue/test-utils'
import { defineComponent } from 'vue'
import type { createComposableFromMixin } from '../createComposable'

type TCreateComposable = ReturnType<typeof createComposableFromMixin>

export const wrapComposable = <
  T extends TCreateComposable,
  O extends MountingOptions<{}>
>(
  composable: T,
  options: O = {} as O,
  extensions: Record<string, any> = {}
) =>
  mount(
    defineComponent({
      ...extensions,
      template: extensions.template ?? '<div>{{ msg }}</div>',
      setup() {
        return {
          ...composable(),
        }
      },
    }),
    options
  )
