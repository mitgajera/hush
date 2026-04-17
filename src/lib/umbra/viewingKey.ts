import { nanoid } from 'nanoid'
import { UmbraClient } from './client'
import { DecryptedTransfer, ViewingKeyResult, ViewingKeyScope } from './types'

export async function generateViewingKey(
  _client: UmbraClient,
  _scope: ViewingKeyScope
): Promise<ViewingKeyResult> {
  // Real:
  //   return umbra.generateViewingKey({ scope })
  return { key: 'vk_' + nanoid(48) }
}

export async function decryptWithViewingKey(
  _client: UmbraClient,
  key: string
): Promise<DecryptedTransfer[]> {
  // Real:
  //   return umbra.decryptWithViewingKey({ key })
  if (!key.startsWith('vk_')) throw new Error('Invalid viewing key')
  return []
}
