import Head from 'next/head'
import { useRouter } from 'next/router'
import { useCallback, useEffect, useState } from 'react'

import { SeatMap } from '../../modules/core/types'
import Editor from '../../modules/editor/components/Editor/Editor'
import { useEditorState } from '../../modules/editor/hooks/useEditorState'

const EditMapPage = () => {
  const router = useRouter()
  const { id } = router.query
  const setSeatMap = useEditorState((s) => s.setSeatMap)
  const [isLoading, setIsLoading] = useState(true)
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
    } finally {
      setIsLoading(false)
    }
  }, [id, setSeatMap])

  useEffect(() => {
    loadMap()
  }, [loadMap])

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          gap: '16px',
        }}
      >
        <p style={{ color: '#f44336' }}>{error}</p>
        <button onClick={() => router.push('/editor')} type="button">
          Create New Map
        </button>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Edit Map - Seat Map Generator</title>
      </Head>
      <Editor />
    </>
  )
}

export default EditMapPage
