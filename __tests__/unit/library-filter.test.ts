import { describe, it, expect } from 'vitest'
import { filterLibrarySubjects, type FilterableSubject } from '@/lib/library-filter'

const subjects: FilterableSubject[] = [
  { name: 'Biology', isFree: true },
  { name: 'Chemistry', isFree: false },
  { name: 'French', isFree: true },
  { name: 'English Literature', isFree: false },
]

describe('filterLibrarySubjects', () => {
  it('returns all subjects with empty query and access "all"', () => {
    expect(filterLibrarySubjects(subjects, '', 'all')).toHaveLength(4)
  })

  it('matches subject name case-insensitively', () => {
    const r = filterLibrarySubjects(subjects, 'bio', 'all')
    expect(r).toHaveLength(1)
    expect(r[0].name).toBe('Biology')
  })

  it('matches partial words anywhere in the name', () => {
    const r = filterLibrarySubjects(subjects, 'lit', 'all')
    expect(r.map((s) => s.name)).toEqual(['English Literature'])
  })

  it('filters by free access', () => {
    const r = filterLibrarySubjects(subjects, '', 'free')
    expect(r.map((s) => s.name).sort()).toEqual(['Biology', 'French'])
  })

  it('filters by pro access', () => {
    const r = filterLibrarySubjects(subjects, '', 'pro')
    expect(r.map((s) => s.name).sort()).toEqual(['Chemistry', 'English Literature'])
  })

  it('combines query and access', () => {
    expect(filterLibrarySubjects(subjects, 'e', 'free')).toEqual([{ name: 'French', isFree: true }])
  })
})
