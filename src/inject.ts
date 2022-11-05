/**
 * @legal
 * This code is largely based on code from the Vue 3 codebase:
 * https://github.com/vuejs/core/blob/f67bb500b6071bc0e55a89709a495a27da73badd/packages/runtime-core/src/componentOptions.ts#L823-L876
 * https://github.com/vuejs/core/blob/f67bb500b6071bc0e55a89709a495a27da73badd/packages/runtime-core/src/componentOptions.ts#L1073-L1084
 */

import {
  inject,
  isRef,
  type ComponentPublicInstance,
  type DebuggerEvent,
  type Ref,
} from 'vue'

export type ComponentInjectOptions = string[] | ObjectInjectOptions

export type ObjectInjectOptions = Record<
  string | symbol,
  string | symbol | { from?: string | symbol; default?: unknown }
>
export type DebuggerHook = (e: DebuggerEvent) => void
export type ErrorCapturedHook<TError = unknown> = (
  err: TError,
  instance: ComponentPublicInstance | null,
  info: string
) => boolean | void

import { isArray, isObject } from './utils'

export function resolveInjections(
  injectOptions: ComponentInjectOptions,
  ctx: any
) {
  if (isArray(injectOptions)) {
    injectOptions = normalizeInject(injectOptions)!
  }
  for (const key in injectOptions) {
    const opt = (injectOptions as ObjectInjectOptions)[key]
    let injected: unknown
    if (isObject(opt)) {
      if ('default' in opt) {
        injected = inject(
          opt.from || key,
          opt.default,
          true /* treat default function as factory */
        )
      } else {
        injected = inject(opt.from || key)
      }
    } else {
      injected = inject(opt)
    }
    if (isRef(injected)) {
      // TODO remove the check in 3.3
      Object.defineProperty(ctx, key, {
        enumerable: true,
        configurable: true,
        get: () => (injected as Ref).value,
        set: (v) => ((injected as Ref).value = v),
      })
    } else {
      ctx[key] = injected
    }
  }
}

function normalizeInject(
  raw: ComponentInjectOptions | undefined
): ObjectInjectOptions | undefined {
  if (isArray(raw)) {
    const res: ObjectInjectOptions = {}
    for (let i = 0; i < raw.length; i++) {
      res[raw[i]] = raw[i]
    }
    return res
  }
  return raw
}
