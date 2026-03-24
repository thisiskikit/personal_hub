import type { DataProvider } from '@/shared/api/data-provider'
import { apiDataProvider } from '@/shared/api/api-provider'
import { mockDataProvider } from '@/shared/api/mock-provider'

const dataProviderMode = import.meta.env.VITE_DATA_PROVIDER ?? 'mock'

const resolveProvider = (): DataProvider => {
  if (dataProviderMode === 'mock') {
    return mockDataProvider
  }
  return apiDataProvider
}

export const dataProvider = resolveProvider()
