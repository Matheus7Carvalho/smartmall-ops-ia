import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'

/** 401 em qualquer chamada indica sessão expirada: limpa a sessão e o RequireAuth leva ao login. */
function encerrarSessaoSeExpirada(error: unknown) {
  if (error instanceof ApiError && error.status === 401) {
    queryClient.setQueryData(['sessao'], null)
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: encerrarSessaoSeExpirada }),
  mutationCache: new MutationCache({ onError: encerrarSessaoSeExpirada }),
  defaultOptions: {
    queries: {
      retry: (falhas, error) => !(error instanceof ApiError && error.status < 500 && error.status > 0) && falhas < 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})
