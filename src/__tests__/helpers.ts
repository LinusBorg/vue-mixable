import { mount, type MountingOptions } from '@vue/test-utils'
import { defineComponent } from 'vue'

export const wrapComposable = <O extends MountingOptions<{}>>(
  composable: any,
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
