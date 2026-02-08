import Head from 'next/head'
import Link from 'next/link'

import styles from './index.module.scss'

const HomePage = () => {
  return (
    <>
      <Head>
        <title>Seat Map Generator</title>
        <meta name="description" content="Create and manage interactive seat maps" />
      </Head>
      <div className={styles.home}>
        <header className={styles.home__header}>
          <h1 className={styles.home__title}>Seat Map Generator</h1>
          <p className={styles.home__subtitle}>Create, edit, and embed interactive seat maps</p>
        </header>
        <main className={styles.home__main}>
          <Link href="/editor" className={styles.home__cta}>
            Create New Map
          </Link>
        </main>
      </div>
    </>
  )
}

export default HomePage
