import { SetMetadata } from '@nestjs/common'

export const USE_SYNC_API_KEY = 'useSyncAPIKey'
export const SyncApiKeyAuth = () => SetMetadata(USE_SYNC_API_KEY, true)
