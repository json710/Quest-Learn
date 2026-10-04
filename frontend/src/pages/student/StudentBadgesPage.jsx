import { useEffect, useMemo, useState } from 'react'

import { Alert } from '../../components/Alert.jsx'
import { BadgeCard } from '../../components/BadgeCard.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { Icon } from '../../components/Icon.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { badgeApi } from '../../services/badge.service.js'

export function StudentBadgesPage() {
  const [badges, setBadges] = useState([])
  const [earned, setEarned] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([badgeApi.list(), badgeApi.earned()])
      .then(([availableResponse, earnedResponse]) => {
        setBadges(availableResponse.data.badges)
        setEarned(earnedResponse.data.badges)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  const earnedByBadgeId = useMemo(
    () => new Map(earned.map((achievement) => [achievement.badge.id, achievement])),
    [earned],
  )

  if (loading) return <PageLoader label="Loading your achievements..." />

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Achievements" title="Your badges" description="Complete learning milestones to unlock every QuestLearn badge." />
      <Alert>{error}</Alert>
      <section className="surface-card flex flex-col gap-5 overflow-hidden p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600">Badge collection</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{earned.length} of {badges.length} unlocked</p>
          <p className="mt-2 text-sm text-slate-500">Quiz, task-review, and level milestones all count.</p>
        </div>
        <span className="grid h-20 w-20 place-items-center rounded-3xl bg-violet-100 text-violet-700"><Icon name="badge" className="h-10 w-10" /></span>
      </section>
      {badges.length === 0 ? (
        <EmptyState icon="badge" title="No badges available" message="Badge definitions have not been added yet." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {badges.map((badge) => {
            const achievement = earnedByBadgeId.get(badge.id)
            return <BadgeCard key={badge.id} badge={badge} earnedAt={achievement?.earnedAt} />
          })}
        </div>
      )}
    </div>
  )
}
