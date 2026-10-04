import { useEffect, useState } from 'react'

import { Alert } from '../../components/Alert.jsx'
import { EmptyState } from '../../components/EmptyState.jsx'
import { Icon } from '../../components/Icon.jsx'
import { LeaderboardRow } from '../../components/LeaderboardRow.jsx'
import { PageHeader } from '../../components/PageHeader.jsx'
import { PageLoader } from '../../components/PageLoader.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { leaderboardApi } from '../../services/leaderboard.service.js'

const podiumStyles = [
  'border-amber-200 bg-amber-50 text-amber-700',
  'border-slate-200 bg-slate-50 text-slate-600',
  'border-orange-200 bg-orange-50 text-orange-700',
]

export function StudentLeaderboardPage() {
  const { user } = useAuth()
  const [leaders, setLeaders] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    leaderboardApi
      .get()
      .then((response) => {
        setLeaders(response.data.leaders)
        setCurrentUser(response.data.currentUser)
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader label="Loading the leaderboard..." />

  const topThree = leaders.slice(0, 3)
  const remaining = leaders.slice(3)
  const currentUserIsVisible = leaders.some((entry) => entry.id === user.id)

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Community progress" title="Student leaderboard" description="Rankings reflect current total XP. Keep learning to move up." />
      <Alert>{error}</Alert>

      {leaders.length === 0 ? (
        <EmptyState icon="trophy" title="No rankings yet" message="Student rankings will appear once accounts are available." />
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-3">
            {topThree.map((entry, index) => (
              <article key={entry.id} className={`relative overflow-hidden rounded-2xl border p-5 text-center shadow-sm ${podiumStyles[index]} ${entry.id === user.id ? 'ring-2 ring-violet-300 ring-offset-2' : ''}`}>
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-white/80 shadow-sm"><Icon name={index === 0 ? 'trophy' : 'users'} className="h-6 w-6" /></span>
                <p className="mt-4 text-xs font-black uppercase tracking-[0.16em]">Rank #{entry.rank}</p>
                <h2 className="mt-1 truncate text-lg font-black text-slate-950">{entry.name}{entry.id === user.id && <span className="ml-2 text-xs text-violet-600">You</span>}</h2>
                <p className="mt-3 text-3xl font-black tracking-tight">{entry.xp.toLocaleString()} <span className="text-sm">XP</span></p>
                <div className="mt-4 flex items-center justify-center gap-4 border-t border-current/10 pt-4 text-xs font-bold"><span>Level {entry.level}</span><span className="inline-flex items-center gap-1"><Icon name="badge" className="h-4 w-4" />{entry.badgeCount} badges</span></div>
              </article>
            ))}
          </section>

          {remaining.length > 0 && (
            <section>
              <div className="mb-3 hidden grid-cols-[56px_minmax(0,1fr)_80px_100px_90px] gap-3 px-5 text-xs font-black uppercase tracking-wide text-slate-400 sm:grid"><span>Rank</span><span>Student</span><span className="text-center">Level</span><span className="text-right">XP</span><span className="text-right">Badges</span></div>
              <div className="space-y-2">{remaining.map((entry) => <LeaderboardRow key={entry.id} entry={entry} isCurrent={entry.id === user.id} />)}</div>
            </section>
          )}

          {!currentUserIsVisible && currentUser && (
            <section className="border-t border-slate-200 pt-6">
              <p className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-violet-600">Your position</p>
              <LeaderboardRow entry={currentUser} isCurrent />
            </section>
          )}
        </>
      )}
    </div>
  )
}
