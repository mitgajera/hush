import { getUserRegistrationFunction } from '@umbra-privacy/sdk'
import type { IUmbraClient } from './client'

export async function registerAccount(client: IUmbraClient): Promise<unknown> {
  const register = getUserRegistrationFunction({ client })

  // IMPORTANT: both confidential AND anonymous must be true
  // This is a current protocol requirement confirmed by Umbra team
  const signatures = await register({
    confidential: true,
    anonymous: true,
  })

  return signatures
}
