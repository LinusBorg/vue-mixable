/**
 * Code in this file is based on the Options API implementation in Vue 3's codebase:
 * https://github.com/vuejs/core/blob/f67bb500b6071bc0e55a89709a495a27da73badd/packages/runtime-core/src/componentOptions.ts
 */
import {
  onBeforeMount,
  onMounted,
  onBeforeUpdate,
  onUpdated,
  onActivated,
  onDeactivated,
  onBeforeUnmount,
  onUnmounted,
  onRenderTracked,
  onRenderTriggered,
  onErrorCaptured,
  getCurrentInstance,
  ref,
  computed,
  watch,
  type ComponentPublicInstance,
  type WatchCallback,
  type ToRefs,
  reactive,
  provide,
} from 'vue'
import { callHook, isArray, isFunction, isObject } from './utils'
import { createContextProxy } from './vmContextProxy'

// import { cache } from './cache'

import type {
  ComponentWatchOptionItem,
  Mixin,
  ExtractComputedReturns,
  MethodOptions,
  ComputedOptions,
} from './types'
import { resolveInjections } from './inject'

export function createComposableFromMixin<
  TData extends Record<string, any>,
  TMethods extends MethodOptions,
  TComputed extends ComputedOptions,
  Props extends Record<string, any> | string[],
  Emits extends string[]
>(mixin: Mixin<TData, TMethods, TComputed, Props, Emits>) {
  const {
    props,
    emits,

    data: dataFn,
    computed: computedOptions,
    methods,
    watch,

    provide: provideOptions,
    inject: injectOptions,

    // Lifecylce Hooks
    created,
    beforeCreate,
    beforeMount,
    mounted,
    beforeUpdate,
    updated,
    activated,
    deactivated,
    beforeUnmount,
    unmounted,
    renderTracked,
    renderTriggered,
    errorCaptured,

    // mixins,
  } = mixin

  const composable = () => {
    const instance = getCurrentInstance()!
    const vm = instance.proxy! as ComponentPublicInstance &
      TData &
      TMethods &
      TComputed

    // if (mixins) {
    //   mixins.forEach((mixin) => {
    //     const composable = cache.get(mixin) ?? createComposableFromMixin(mixin)

    //     Object.assign(context, composable())
    //   })
    // }

    const context: Record<string, any> = {}
    const reactiveContext = reactive(context)
    const vmContextProxy = createContextProxy(
      vm,
      reactiveContext
    ) as ComponentPublicInstance

    beforeCreate && callHook(beforeCreate, instance, 'bc')

    // methods
    if (methods) {
      for (const key in methods) {
        context[key] = methods[key].bind(vmContextProxy as any)
      }
    }

    //inject
    if (injectOptions) {
      resolveInjections(injectOptions, context)
    }

    // data
    if (dataFn) {
      const data = dataFn.call(vmContextProxy, vmContextProxy)
      for (const key in data) {
        context[key] = ref(data[key])
      }
    }

    // computed
    if (computedOptions) {
      for (const key in computedOptions) {
        const def = computedOptions[key]
        const c =
          typeof def === 'function'
            ? computed(def.bind(vmContextProxy as any))
            : computed({
                get: def.get.bind(vmContextProxy),
                set: def.set.bind(vmContextProxy),
              })
        context[key] = c
      }
    }

    //watch
    if (watch) {
      for (const key in watch) {
        const def = watch[key]
        if (Array.isArray(def)) {
          def.forEach((d) => createWatcher(d, vmContextProxy, key))
        } else {
          createWatcher(def, vmContextProxy, key)
        }
      }
    }

    // provide
    if (provideOptions) {
      const provides = isFunction(provideOptions)
        ? provideOptions.call(vmContextProxy)
        : provideOptions
      Reflect.ownKeys(provides).forEach((key) => {
        provide(key, provides[key])
      })
    }

    // Lifecycle
    created && callHook(created, instance, 'c')
    beforeMount && onBeforeMount(beforeMount.bind(vm))
    mounted && onMounted(mounted.bind(vm))
    beforeUpdate && onBeforeUpdate(beforeUpdate.bind(vm))
    updated && onUpdated(updated.bind(vm))
    activated && onActivated(activated.bind(vm))
    deactivated && onDeactivated(deactivated.bind(vm))
    beforeUnmount && onBeforeUnmount(beforeUnmount.bind(vm))
    unmounted && onUnmounted(unmounted.bind(vm))
    renderTracked && onRenderTracked(renderTracked.bind(vm))
    renderTriggered && onRenderTriggered(renderTriggered.bind(vm))
    errorCaptured && onErrorCaptured(errorCaptured.bind(vm))

    return context as ToRefs<TData> &
      TMethods &
      ToRefs<ExtractComputedReturns<TComputed>>
  }

  Object.assign(composable, {
    props,
    emits,
  })
  return composable as typeof composable & { props: Props; emits: Emits }
}

function createWatcher(
  raw: ComponentWatchOptionItem,
  // ctx: Record<string, any>,
  publicThis: ComponentPublicInstance & Record<string, any>,
  key: string
) {
  const getter = key.includes('.')
    ? createPathGetter(publicThis, key)
    : () => (publicThis as any)[key]
  if (typeof raw === 'string') {
    const handler = publicThis[raw]
    if (isFunction(handler)) {
      watch(getter, handler as WatchCallback)
    }
  } else if (typeof raw === 'function') {
    watch(getter, raw.bind(publicThis))
  } else if (isObject(raw)) {
    if (isArray(raw)) {
      raw.forEach((r) => createWatcher(r, publicThis, key))
    } else {
      const handler = isFunction(raw.handler)
        ? raw.handler.bind(publicThis)
        : (publicThis[raw.handler] as WatchCallback)
      if (isFunction(handler)) {
        watch(getter, handler, raw)
      }
    }
  }
}

function createPathGetter(ctx: any, path: string) {
  const segments = path.split('.')
  return () => {
    let cur = ctx
    for (let i = 0; i < segments.length && cur; i++) {
      cur = cur[segments[i]]
    }
    return cur
  }
}
