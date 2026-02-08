import Head from 'next/head'

import Editor from '../../modules/editor/components/Editor/Editor'

const EditorPage = () => {
  return (
    <>
      <Head>
        <title>Editor - Seat Map Generator</title>
      </Head>
      <Editor />
    </>
  )
}

export default EditorPage
