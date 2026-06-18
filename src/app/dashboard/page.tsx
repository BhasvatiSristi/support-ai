import DashboardClient from '@/components/DashboardClient'
import { getSession } from '@/lib/getSession'
import React from 'react'

export default async function page() {
  const session = await getSession()

  return (
    <>
      <DashboardClient ownerId={session?.user?.id!}/>
    </>
  )
}
