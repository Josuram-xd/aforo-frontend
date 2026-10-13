import type { ReactNode } from 'react'
import './DashboardLayout.css'

interface DashboardLayoutProps {
  occupancy: ReactNode
  people: ReactNode
  events: ReactNode
}

export function DashboardLayout({ occupancy, people, events }: DashboardLayoutProps) {
  return (
    <div className="dashboard">
      <main className="dashboard__grid">
        <section className="dashboard__occupancy">{occupancy}</section>
        <section className="dashboard__people">{people}</section>
        <section className="dashboard__events">{events}</section>
      </main>
    </div>
  )
}
