import {
  callWithAsyncErrorHandling,
  type ComponentInternalInstance,
  type ComponentPublicInstance,
} from 'vue'

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'
export const isArray = Array.isArray
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'
export const isString = (val: unknown): val is string => typeof val === 'string'

/**
 * @legal
 * taken from the Vue 3 Codebase, slightly adjusted:
 * https://github.com/vuejs/core/blob/f67bb500b6071bc0e55a89709a495a27da73badd/packages/runtime-core/src/componentOptions.ts#L878-L890
 */
export function callHook(
  hook: Function,
  instance: ComponentInternalInstance,
  vm: ComponentPublicInstance,
  type: 'c' | 'bc'
) {
  callWithAsyncErrorHandling(
    isArray(hook) ? hook.map((h) => h.bind(vm)) : hook.bind(vm),
    instance,
    type as any
  )
}
