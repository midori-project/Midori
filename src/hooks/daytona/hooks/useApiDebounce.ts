// hooks/useApiDebounce.ts
import { useCallback, useRef } from 'react'
import { DEBOUNCE_CONFIG } from '../utils/constants'

export function useApiDebounce() {
  const lastRequestRef = useRef<number>(0)

  /**
   * Check if request should be debounced
   */
  const shouldDebounce = useCallback((): boolean => {
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestRef.current
    return timeSinceLastRequest < DEBOUNCE_CONFIG.delay
  }, [])

  /**
   * Update last request timestamp
   */
  const updateLastRequest = useCallback((): void => {
    lastRequestRef.current = Date.now()
  }, [])

  /**
   * Get time remaining until next request can be made
   */
  const getTimeRemaining = useCallback((): number => {
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequestRef.current
    return Math.max(0, DEBOUNCE_CONFIG.delay - timeSinceLastRequest)
  }, [])

  /**
   * Check if request can proceed, and update timestamp if so
   */
  const canProceed = useCallback((): boolean => {
    if (shouldDebounce()) {
      console.log(`⏳ [DEBOUNCE] Request too soon, ${getTimeRemaining()}ms remaining`)
      return false
    }
    
    updateLastRequest()
    return true
  }, [shouldDebounce, getTimeRemaining, updateLastRequest])

  /**
   * Wait for debounce period to complete
   */
  const waitForDebounce = useCallback(async (): Promise<void> => {
    const timeRemaining = getTimeRemaining()
    if (timeRemaining > 0) {
      console.log(`⏳ [DEBOUNCE] Waiting ${timeRemaining}ms before next request`)
      await new Promise(resolve => setTimeout(resolve, timeRemaining))
    }
  }, [getTimeRemaining])

  /**
   * Execute function with debounce protection
   */
  const debounced = useCallback(async <T>(
    fn: () => Promise<T>,
    context: string = 'REQUEST'
  ): Promise<T | null> => {
    if (!canProceed()) {
      console.log(`⏳ [DEBOUNCE] ${context} skipped due to rate limiting`)
      return null
    }

    try {
      console.log(`🚀 [DEBOUNCE] ${context} proceeding`)
      return await fn()
    } catch (error) {
      console.error(`❌ [DEBOUNCE] ${context} failed:`, error)
      throw error
    }
  }, [canProceed])

  /**
   * Get debounce statistics
   */
  const getStats = useCallback(() => {
    return {
      lastRequest: lastRequestRef.current,
      timeSinceLastRequest: Date.now() - lastRequestRef.current,
      debounceDelay: DEBOUNCE_CONFIG.delay,
      timeRemaining: getTimeRemaining(),
      canMakeRequest: !shouldDebounce(),
    }
  }, [getTimeRemaining, shouldDebounce])

  return {
    shouldDebounce,
    canProceed,
    waitForDebounce,
    debounced,
    getTimeRemaining,
    getStats,
    updateLastRequest,
  }
}

