import { getSession } from '@/lib/getSession'
import EmbedClient from '@/components/EmbedClient'
import React from 'react'

async function page() {
    const session = await getSession()
  return (
    <div>
      <EmbedClient ownerId={session?.user?.id!} />
    </div>
  )
}

export default page
