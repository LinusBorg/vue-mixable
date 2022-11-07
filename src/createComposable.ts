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
  reactive,
  provide,
  type ComponentPublicInstance,
  type WatchCallback,
} from 'vue'
import { callHook, isArray, isFunction, isObject } from './utils'
import { createContextProxy } from './vmContextProxy'

import type {
  ComputedOptions,
  MethodOptions,
  ComponentOptionsWithObjectProps,
  ComponentOptionsMixin,
  ToRefs,
  CreateComponentPublicInstance,
  ExtractPropTypes,
  ComponentPropsOptions,
  ExtractDefaultPropTypes,
  EmitsOptions,
} from 'vue'

// import { cache } from './cache'

import type {
  ComponentWatchOptionItem,
  ExtractComputedReturns,
  EmitsToProps,
} from './types'
import { resolveInjections } from './inject'

export /* @__PURE__ */ function createComposableFromMixin<
  Props extends Readonly<ExtractPropTypes<PropsOptions>> & EmitsToProps<E>,
  VM extends CreateComponentPublicInstance<
    Props,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    Props,
    ExtractDefaultPropTypes<PropsOptions>,
    false
  >,
  PropsOptions extends Readonly<ComponentPropsOptions>,
  RawBindings,
  D,
  C extends ComputedOptions = {},
  M extends MethodOptions = {},
  Mixin extends ComponentOptionsMixin = ComponentOptionsMixin,
  Extends extends ComponentOptionsMixin = ComponentOptionsMixin,
  E extends EmitsOptions = {},
  EE extends string = string
>(
  mixin: ComponentOptionsWithObjectProps<
    PropsOptions,
    RawBindings,
    D,
    C,
    M,
    Mixin,
    Extends,
    E,
    EE
  >
): (() => ToRefs<D> & ToRefs<ExtractComputedReturns<C>> & M) & {
  props: PropsOptions
  emits: E
} {
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
    const vm = instance.proxy! as VM

    // if (mixins) {
    //   mixins.forEach((mixin) => {
    //     const composable = cache.get(mixin) ?? createComposableFromMixin(mixin)

    //     Object.assign(context, composable())
    //   })
    // }

    const context = {} as ToRefs<D> & ToRefs<ExtractComputedReturns<C>> & M
    const reactiveContext = reactive(context)
    const vmContextProxy = createContextProxy(vm, reactiveContext) as VM

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
      // FIXME - any has to go here
      const data = dataFn.call(vmContextProxy as any, vmContextProxy as any)
      for (const key in data) {
        // FIXME - TS `this`error
        // @ts-expect-error this doesn't quite match yet
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
        // FIXME - TS `this`error
        // @ts-expect-error this doesn't quite match yet
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

    return context
  }

  Object.assign(composable, {
    props,
    emits,
  })
  return composable as typeof composable & { props: PropsOptions; emits: E }
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
