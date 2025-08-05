import { useRef, useCallback } from 'react'

export const useLongPress = (callback, ms = 500) => {
  const timeoutRef = useRef(null)
  const isLongPress = useRef(false)

  const start = useCallback(() => {
    isLongPress.current = false
    timeoutRef.current = setTimeout(() => {
      isLongPress.current = true
      callback()
    }, ms)
  }, [callback, ms])

  const stop = useCallback(() => {
    clearTimeout(timeoutRef.current)
  }, [])

  const cancel = useCallback(() => {
    clearTimeout(timeoutRef.current)
    isLongPress.current = false
  }, [])

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: stop,
    onTouchCancel: cancel,
  }
} 