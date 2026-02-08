import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import { SeatMap } from '../../modules/core/types'
import EmbedRenderer from '../../modules/embed/components/EmbedRenderer/EmbedRenderer'

const EmbedPage = () => {
  const router = useRouter()
  const { id } = router.query
  const [seatMap, setSeatMap] = useState<SeatMap | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadMap = useCallback(async () => {
    if (!id || typeof id !== 'string') {
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/maps/${id}`)
      if (!response.ok) {
        throw new Error('Map not found')
      }
      const result = await response.json()
      setSeatMap(result.data as SeatMap)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load map')
    }
  }, [id])

  useEffect(() => {
    loadMap()
  }, [loadMap])

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          color: '#f44336',
        }}
      >
        {error}
      </div>
    )
  }

  if (!seatMap) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading...
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{seatMap.name} - Seat Map</title>
        <meta name="robots" content="noindex" />
      </Head>
      <EmbedRenderer seatMap={seatMap} />
    </>
  )
}

export default EmbedPage
