import type { DataProvider } from '@/shared/api/data-provider'
import { mockDataProvider } from '@/shared/api/mock-provider'

const dataProviderMode = import.meta.env.VITE_DATA_PROVIDER ?? 'mock'

const resolveProvider = (): DataProvider => {
  if (dataProviderMode === 'api') {
    console.warn('VITE_DATA_PROVIDER=api is not implemented yet. Falling back to mock.')
    return mockDataProvider
  }

  return mockDataProvider
}

export const dataProvider = resolveProvider()
