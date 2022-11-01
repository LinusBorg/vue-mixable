import { callWithAsyncErrorHandling, type ComponentInternalInstance } from 'vue'

export const isFunction = (val: unknown): val is Function =>
  typeof val === 'function'
export const isArray = Array.isArray
export const isObject = (val: unknown): val is Record<any, any> =>
  val !== null && typeof val === 'object'

export function callHook(
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
