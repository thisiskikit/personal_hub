import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppProviders } from '@/app/providers/AppProviders'
import { appRoutes } from '@/app/router'

describe('app routing', () => {
  it('navigates from dashboard to finance when menu is clicked', async () => {
    const user = userEvent.setup()
    const router = createMemoryRouter(appRoutes, { initialEntries: ['/dashboard'] })

    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>,
    )

    const financeLinks = await screen.findAllByRole('link', { name: /재무 장부/i })
    await user.click(financeLinks[0])

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/finance')
    })
  })
})
