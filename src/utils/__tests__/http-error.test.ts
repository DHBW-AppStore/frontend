import { describe, it, expect } from 'vitest'

import { extractErrorMessage } from '@/utils/http-error'

describe('extractErrorMessage', () => {
  it('returns a string detail verbatim', () => {
    const err = { response: { data: { detail: 'Boom' } } }
    expect(extractErrorMessage(err)).toBe('Boom')
  })

  it('drills into detail.reason for structured detail', () => {
    const err = { response: { data: { detail: { reason: 'openstack_credentials_missing' } } } }
    expect(extractErrorMessage(err)).toBe('openstack_credentials_missing')
  })

  it('falls back to detail.message when reason is absent', () => {
    const err = { response: { data: { detail: { message: 'Something broke' } } } }
    expect(extractErrorMessage(err)).toBe('Something broke')
  })

  it('prefers reason over message when both present', () => {
    const err = { response: { data: { detail: { reason: 'r', message: 'm' } } } }
    expect(extractErrorMessage(err)).toBe('r')
  })

  it('falls back to err.message when there is no response detail', () => {
    expect(extractErrorMessage({ message: 'Network Error' })).toBe('Network Error')
  })

  it('returns a generic string when nothing is available', () => {
    expect(extractErrorMessage({})).toBe('Unknown error')
    expect(extractErrorMessage(null)).toBe('Unknown error')
  })
})
