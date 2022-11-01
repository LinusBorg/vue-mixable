import { inject, isRef, type Ref } from 'vue'
import type { ComponentInjectOptions, ObjectInjectOptions } from './types'
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
