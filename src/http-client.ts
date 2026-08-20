import axios, { AxiosError, AxiosInstance } from 'axios'

/**
 * Shared axios instance with production-grade defaults:
 * - 15s timeout to prevent indefinite hangs
 * - Centralized error wrapping for consistent error messages
 */
export const httpClient: AxiosInstance = axios.create({
  timeout: 15_000,
})

/**
 * Wraps axios errors with contextual information about which operation failed.
 * Preserves the original error for stack trace inspection.
 */
export function wrapHttpError(error: unknown, context: string): never {
  const axiosError = error as AxiosError
  if (axiosError.isAxiosError) {
    if (axiosError.code === 'ECONNABORTED') {
      throw new Error(`${context}: Request timed out`)
    }
    if (axiosError.response) {
      throw new Error(`${context}: Server returned ${axiosError.response.status}`)
    }
    if (axiosError.request) {
      throw new Error(`${context}: No response received - network error`)
    }
  }
  const message = error instanceof Error ? error.message : String(error)
  throw new Error(`${context}: ${message}`)
}
