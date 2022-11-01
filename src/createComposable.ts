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
  callWithAsyncErrorHandling,
  type ComponentInternalInstance,
  type ComponentPublicInstance,
  type WatchCallback,
  type ToRefs,
  reactive,
} from 'vue'
import { isArray, isFunction, isObject } from './utils'
import { cache } from './cache'

import type {
  ComponentWatchOptionItem,
  Mixin,
  ExtractComputedReturns,
  MethodOptions,
  ComputedOptions,
} from './types'

export function createComposableFromMixin<
  TData extends Record<string, any>,
  TMethods extends MethodOptions,
  TComputed extends ComputedOptions
>(mixin: Mixin<TData, TMethods, TComputed>) {
  const {
    mixins,

    data: dataFn,
    computed: computedOptions,
    methods,

    watch,

    provide,
    inject,

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
    const vmContextProxy = createContextProxy(vm, reactiveContext)

    beforeCreate && callHook(beforeCreate, instance, 'bc')

    // data
    if (dataFn) {
      const data = dataFn.call(vm, vm)
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
            ? computed(() => def.call(vm, vm))
            : computed({
                get: def.get.bind(vm),
                set: def.set.bind(vm),
              })
        context[key] = c
      }
    }

    // methods
    if (methods) {
      for (const key in methods) {
        context[key] = methods[key].bind(vm)
      }
    }

    //watch
    if (watch) {
      for (const key in watch) {
        const def = watch[key]
        if (Array.isArray(def)) {
          def.forEach((d) =>
            createWatcher(d, vmContextProxy as ComponentPublicInstance, key)
          )
        } else {
          createWatcher(def, vmContextProxy as ComponentPublicInstance, key)
        }
      }
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

  return composable
}

function callHook(
  hook: Function,
  instance: ComponentInternalInstance,
  type: 'c' | 'bc'
) {
  callWithAsyncErrorHandling(
    Array.isArray(hook)
      ? hook.map((h) => h.bind(instance.proxy!))
      : hook.bind(instance.proxy!),
    instance,
    type as any
  )
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

function createContextProxy(
  vm: ComponentPublicInstance,
  context: Record<string, any>
) {
  return new Proxy(vm, {
    get(vm, key, receiver) {
      if (key in context) {
        return Reflect.get(context, key, receiver)
      } else {
        return (vm as any)[key]
      }
    },
    set(m, key, value, receiver) {
      if (key in context) {
        return Reflect.set(context, key, value, receiver)
      } else {
        return Reflect.set(vm, key, value)
      }
    },
    has(vm, property) {
      return Reflect.has(context, property) || Reflect.has(vm, property)
    },
    getOwnPropertyDescriptor(vm, property) {
      if (property in context) {
        return Reflect.getOwnPropertyDescriptor(context, property)
      } else {
        return Reflect.getOwnPropertyDescriptor(vm, property)
      }
    },
    defineProperty(vm, property, descriptor) {
      return Reflect.defineProperty(vm, property, descriptor)
    },
    deleteProperty(vm, property) {
      if (property in context) {
        return Reflect.deleteProperty(context, property)
      } else {
        return Reflect.deleteProperty(vm, property)
      }
    },
  })
}
