'use client'

import { useState, useEffect } from 'react'
import { FollowUpReminder } from '@/types'
import clsx from 'clsx'

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'pending' | 'sent' | 'completed'>('pending')

  useEffect(() => {
    fetchReminders()
  }, [filter])

  const fetchReminders = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/follow-up-reminders?status=${filter}`)
      const data = await res.json()
      setReminders(data)
    } catch (error) {
      console.error('Failed to fetch reminders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateReminder = async (reminderId: string, newStatus: string) => {
    try {
      const res = await fetch('/api/follow-up-reminders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: reminderId,
          status: newStatus,
        }),
      })

      if (res.ok) {
        fetchReminders()
      }
    } catch (error) {
      console.error('Failed to update reminder:', error)
    }
  }

  const isDue = (reminderDate: string) => {
    return new Date(reminderDate) <= new Date()
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-4xl font-bold mb-8">Follow-up Reminders</h1>

        {/* Filter Buttons */}
        <div className="flex gap-4 mb-6">
          {(['pending', 'sent', 'completed'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={clsx(
                'px-4 py-2 rounded-lg transition capitalize font-medium',
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              )}
            >
              {status}
            </button>
          ))}
        </div>

        {/* Reminders List */}
        <div className="space-y-4">
          {reminders.map((reminder) => {
            const isDueNow = isDue(reminder.reminder_date)

            return (
              <div
                key={reminder.id}
                className={clsx(
                  'p-6 rounded-lg border transition',
                  isDueNow && reminder.status === 'pending'
                    ? 'bg-red-900/20 border-red-700'
                    : 'bg-slate-800 border-slate-700'
                )}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      {reminder.leads?.company_name}
                    </h3>
                    <div className="text-sm text-gray-300 space-y-1 mb-3">
                      <p>
                        <strong>Contact:</strong> {reminder.leads?.full_name} (
                        {reminder.leads?.email})
                      </p>
                      <p>
                        <strong>Assigned to:</strong> {reminder.team_members?.name}
                      </p>
                      <p>
                        <strong>Reminder Date:</strong>{' '}
                        {new Date(reminder.reminder_date).toLocaleString()}
                        {isDueNow && reminder.status === 'pending' && (
                          <span className="ml-2 text-red-400 font-semibold">
                            ⚠️ Due Now!
                          </span>
                        )}
                      </p>
                      {reminder.title && (
                        <p>
                          <strong>Title:</strong> {reminder.title}
                        </p>
                      )}
                      {reminder.description && (
                        <p>
                          <strong>Notes:</strong> {reminder.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status & Actions */}
                  <div className="ml-6">
                    <span
                      className={clsx(
                        'inline-block px-3 py-1 rounded-full text-xs font-medium mb-4 capitalize',
                        reminder.status === 'pending'
                          ? 'bg-yellow-900/30 text-yellow-300'
                          : reminder.status === 'sent'
                          ? 'bg-blue-900/30 text-blue-300'
                          : 'bg-green-900/30 text-green-300'
                      )}
                    >
                      {reminder.status}
                    </span>

                    {reminder.status === 'pending' && (
                      <div className="flex gap-2 flex-col">
                        <button
                          onClick={() => handleUpdateReminder(reminder.id, 'sent')}
                          className="px-3 py-2 text-xs bg-blue-600 hover:bg-blue-700 rounded-lg transition whitespace-nowrap"
                        >
                          Mark as Sent
                        </button>
                        <button
                          onClick={() => handleUpdateReminder(reminder.id, 'completed')}
                          className="px-3 py-2 text-xs bg-green-600 hover:bg-green-700 rounded-lg transition whitespace-nowrap"
                        >
                          Mark Done
                        </button>
                      </div>
                    )}

                    {reminder.status === 'sent' && (
                      <button
                        onClick={() => handleUpdateReminder(reminder.id, 'completed')}
                        className="px-3 py-2 text-xs bg-green-600 hover:bg-green-700 rounded-lg transition whitespace-nowrap block w-full"
                      >
                        Mark Done
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {reminders.length === 0 && !loading && (
          <div className="text-center py-12 text-gray-400">
            <p>No {filter} reminders. Great job! 🎉</p>
          </div>
        )}
      </div>
    </div>
  )
}
