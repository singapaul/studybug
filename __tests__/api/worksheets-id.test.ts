import { describe, it, expect, vi, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/auth', () => ({
  auth: { api: { getSession: vi.fn() } },
}))

vi.mock('@/lib/db', () => ({
  db: {
    worksheet: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

const mockAuth = auth.api.getSession as ReturnType<typeof vi.fn>
const mockDb = db.worksheet as {
  findUnique: ReturnType<typeof vi.fn>
  update: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

const PRO_SESSION = { user: { id: 'user-1', plan: 'pro' } }
const OTHER_SESSION = { user: { id: 'user-2', plan: 'pro' } }

function validContent(overrides: Record<string, unknown> = {}) {
  return {
    title: 'Photosynthesis basics',
    topic: 'Photosynthesis',
    subject: 'Biology',
    yearGroup: 'Year 8',
    level: 'KS3',
    teacherOverview: {
      intendedUse: '', timeEstimate: '', equipmentNeeded: [],
      differentiationNotes: { support: '', stretch: '' },
      misconceptions: [], assumptions: [], optionalChallenge: '', challengeAnswer: '',
    },
    vocabularyBox: [],
    sections: [
      {
        title: 'Recall',
        instructions: '',
        questions: [
          { id: 'q1', type: 'shortAnswer', text: 'Q1', marks: 2, answer: 'A1', difficulty: 'core' },
          { id: 'q2', type: 'shortAnswer', text: 'Q2', marks: 3, answer: 'A2', difficulty: 'core' },
        ],
      },
    ],
    extensionTask: '',
    totalMarks: 0, // deliberately wrong — server must recompute to 5
    ...overrides,
  }
}

const SAMPLE_WORKSHEET = {
  id: 'ws-1',
  userId: 'user-1',
  title: 'Old title',
  topic: 'Photosynthesis',
  subject: 'Biology',
  yearGroup: 'Year 8',
  level: 'KS3',
  content: validContent(),
  shareToken: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
}

function makeRequest(method = 'GET', body?: unknown) {
  return new NextRequest('http://localhost/api/worksheets/ws-1', {
    method,
    ...(body && {
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    }),
  })
}

const PARAMS = { params: Promise.resolve({ id: 'ws-1' }) }

beforeEach(() => vi.clearAllMocks())

describe('PATCH /api/worksheets/[id] — title', () => {
  it('returns 401 without session', async () => {
    mockAuth.mockResolvedValue(null)
    const { PATCH } = await import('@/app/api/worksheets/[id]/route')
    const res = await PATCH(makeRequest('PATCH', { title: 'New' }), PARAMS)
    expect(res.status).toBe(401)
  })

  it('returns 403 when user does not own the worksheet', async () => {
    mockAuth.mockResolvedValue(OTHER_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_WORKSHEET)
    const { PATCH } = await import('@/app/api/worksheets/[id]/route')
    const res = await PATCH(makeRequest('PATCH', { title: 'New' }), PARAMS)
    expect(res.status).toBe(403)
  })

  it('updates the title only', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_WORKSHEET)
    mockDb.update.mockResolvedValue({ ...SAMPLE_WORKSHEET, title: 'New' })
    const { PATCH } = await import('@/app/api/worksheets/[id]/route')
    const res = await PATCH(makeRequest('PATCH', { title: 'New' }), PARAMS)
    expect(res.status).toBe(200)
    expect(mockDb.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { title: 'New' } }),
    )
  })
})

describe('PATCH /api/worksheets/[id] — content', () => {
  it('saves valid content and recomputes totalMarks from question marks', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_WORKSHEET)
    mockDb.update.mockResolvedValue(SAMPLE_WORKSHEET)
    const { PATCH } = await import('@/app/api/worksheets/[id]/route')
    const res = await PATCH(makeRequest('PATCH', { content: validContent() }), PARAMS)
    expect(res.status).toBe(200)
    const call = mockDb.update.mock.calls[0][0]
    expect(call.data.content.totalMarks).toBe(5)
  })

  it('syncs denormalized columns (title/topic/subject) from edited content', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_WORKSHEET)
    mockDb.update.mockResolvedValue(SAMPLE_WORKSHEET)
    const { PATCH } = await import('@/app/api/worksheets/[id]/route')
    const res = await PATCH(
      makeRequest('PATCH', { content: validContent({ title: 'Edited title', subject: 'Chemistry' }) }),
      PARAMS,
    )
    expect(res.status).toBe(200)
    const call = mockDb.update.mock.calls[0][0]
    expect(call.data.title).toBe('Edited title')
    expect(call.data.subject).toBe('Chemistry')
  })

  it('rejects malformed content with 400 (no silent filtering)', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_WORKSHEET)
    const { PATCH } = await import('@/app/api/worksheets/[id]/route')
    const bad = validContent({
      sections: [
        { title: 'S', instructions: '', questions: [{ id: 'q1', type: 'bogus', text: 'X', marks: 1, answer: 'Y', difficulty: 'core' }] },
      ],
    })
    const res = await PATCH(makeRequest('PATCH', { content: bad }), PARAMS)
    expect(res.status).toBe(400)
    expect(mockDb.update).not.toHaveBeenCalled()
  })

  it('rejects an empty payload (neither title nor content) with 400', async () => {
    mockAuth.mockResolvedValue(PRO_SESSION)
    mockDb.findUnique.mockResolvedValue(SAMPLE_WORKSHEET)
    const { PATCH } = await import('@/app/api/worksheets/[id]/route')
    const res = await PATCH(makeRequest('PATCH', {}), PARAMS)
    expect(res.status).toBe(400)
  })
})
