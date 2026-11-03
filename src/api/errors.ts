import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js'

/**
 * Error with an i18n key safe to show to the user. Raw PostgREST/Edge messages are never
 * displayed: they can leak table names or policies.
 */
export class AppError extends Error {
  readonly messageKey: string
  readonly status: number | null

  constructor(messageKey: string, status: number | null = null) {
    super(messageKey)
    this.name = 'AppError'
    this.messageKey = messageKey
    this.status = status
  }
}

interface PostgrestLikeError {
  code?: string
  message?: string
}

/** Converts a PostgREST error into an AppError with a generic, translated message. */
export function fromPostgrest(error: PostgrestLikeError): AppError {
  switch (error.code) {
    case '42501': // insufficient_privilege (RLS / RPC checks)
    case 'PGRST301':
      return new AppError('errors.forbidden', 403)
    case '23505':
      return new AppError('errors.duplicate', 409)
    case '23514':
    case '22023':
    case '23502':
      return new AppError('errors.invalid', 400)
    case '23503':
      return new AppError('errors.inUse', 409)
    default:
      return new AppError('errors.generic')
  }
}

/** Converts a supabase.functions.invoke error (not deployed, 4xx, network…). */
export async function fromFunctionError(error: unknown): Promise<AppError> {
  if (error instanceof FunctionsHttpError) {
    const response = error.context as Response | undefined
    const status = response?.status ?? null
    if (status === 401 || status === 403) return new AppError('errors.forbidden', status)
    if (status === 404) return new AppError('errors.functionUnavailable', status)
    if (status === 409) return new AppError('errors.duplicate', status)
    if (status === 400) return new AppError('errors.invalid', status)
    if (status === 429) return new AppError('errors.rateLimited', status)
    return new AppError('errors.generic', status)
  }
  if (error instanceof FunctionsRelayError || error instanceof FunctionsFetchError) {
    return new AppError('errors.functionUnavailable')
  }
  return new AppError('errors.generic')
}

export function errorMessageKey(error: unknown): string {
  return error instanceof AppError ? error.messageKey : 'errors.generic'
}
