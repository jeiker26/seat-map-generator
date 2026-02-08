import { useCallback, useEffect } from 'react'

import { EmbedEvent, HostCommand } from '../../core/types'

interface UsePostMessageOptions {
  onCommand?: (command: HostCommand) => void
}

export const usePostMessage = ({ onCommand }: UsePostMessageOptions = {}) => {
  const sendEvent = useCallback((event: EmbedEvent) => {
    if (typeof window !== 'undefined' && window.parent !== window) {
      window.parent.postMessage(event, '*')
    }
  }, [])

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      const data = e.data as HostCommand
      if (!data || !data.type || !data.type.startsWith('seatmap:')) {
        return
      }
      if (onCommand) {
        onCommand(data)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [onCommand])

  return { sendEvent }
}
