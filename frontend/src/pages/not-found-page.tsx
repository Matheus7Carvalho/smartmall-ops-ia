import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/empty-state'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <>
      <PageHeader title="Página não encontrada" />
      <EmptyState
        title="O endereço não existe."
        action={
          <Button asChild variant="outline" size="sm">
            <Link to="/">Voltar ao início</Link>
          </Button>
        }
      />
    </>
  )
}
