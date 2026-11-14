import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { ErrorState } from '@/components/shared/error-state'
import { SelectField } from '@/components/shared/select-field'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useChecklists } from '@/features/checklists/hooks'
import { useEquipamentos } from '@/features/equipamentos/hooks'
import { useEquipes } from '@/features/equipes/hooks'
import { mensagemDeErro } from '@/lib/cadastro'
import { useAprovarChamado } from '../hooks'
import { LIMITE_CHAMADO } from '../limites'
import { aprovacaoSchema, paraAprovacaoRequest, type AprovacaoFormValores } from '../schemas'
import { prioridadesChamado, tiposChamado, type Chamado } from '../types'

const numero = { setValueAs: (valor: unknown) => valor === '' ? undefined : Number(valor) }
const NENHUM = { valor: '__nenhum__', rotulo: 'Nenhum' }

/** A triagem exige escolha explícita; sugestões não são aplicadas automaticamente. */
export function ChamadoAprovacaoForm({ chamado }: { chamado: Chamado }) {
  const form = useForm<AprovacaoFormValores>({
    resolver: zodResolver(aprovacaoSchema),
    defaultValues: { tipo: undefined, prioridade: undefined, equipeId: '', equipamentoId: NENHUM.valor, checklistId: NENHUM.valor, dataHoraPrevista: '', duracaoMinutos: 60 },
  })
  const equipes = useEquipes()
  const equipamentos = useEquipamentos()
  const checklists = useChecklists()
  const aprovar = useAprovarChamado(chamado.id)
  const [confirmacao, setConfirmacao] = useState<AprovacaoFormValores | null>(null)
  const { errors } = form.formState

  const aoConfirmar = () => {
    if (!confirmacao) return
    const dados = paraAprovacaoRequest(confirmacao)
    setConfirmacao(null)
    aprovar.mutate(dados, {
      onSuccess: () => toast.success('Chamado aprovado e tarefa criada.'),
      onError: (erro) => toast.error(mensagemDeErro(erro, 'Não foi possível aprovar o chamado.')),
    })
  }

  return (
    <section aria-labelledby="titulo-aprovar" className="rounded-lg border p-4 sm:p-5">
      <h2 id="titulo-aprovar" className="text-lg font-semibold">Aprovar e criar tarefa</h2>
      <p className="mt-1 text-sm text-muted-foreground">Confira o relato e defina o encaminhamento. A aprovação cria a tarefa para a equipe escolhida.</p>
      {(equipes.isError || equipamentos.isError || checklists.isError) && <div className="mt-4"><ErrorState message="Não foi possível carregar as opções de encaminhamento." onRetry={() => { void equipes.refetch(); void equipamentos.refetch(); void checklists.refetch() }} /></div>}
      <FormProvider {...form}>
        <form className="mt-5 space-y-4" noValidate onSubmit={form.handleSubmit((valores) => setConfirmacao(valores))}>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField<AprovacaoFormValores> name="tipo" id="chamado-tipo" label="Tipo" opcoes={tiposChamado} placeholder="Selecione o tipo" />
            <SelectField<AprovacaoFormValores> name="prioridade" id="chamado-prioridade" label="Prioridade" opcoes={prioridadesChamado} placeholder="Selecione a prioridade" />
          </div>
          <SelectField<AprovacaoFormValores> name="equipeId" id="chamado-equipe" label="Equipe responsável" opcoes={(equipes.data ?? []).map((e) => ({ valor: e.id, rotulo: e.nome }))} placeholder={equipes.isPending ? 'Carregando equipes...' : 'Selecione a equipe'} disabled={equipes.isPending || equipes.isError} />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField<AprovacaoFormValores> name="equipamentoId" id="chamado-equipamento" label="Equipamento (opcional)" opcoes={[NENHUM, ...(equipamentos.data ?? []).map((e) => ({ valor: e.id, rotulo: `${e.codigo} · ${e.nome}` }))]} disabled={equipamentos.isPending || equipamentos.isError} />
            <SelectField<AprovacaoFormValores> name="checklistId" id="chamado-checklist" label="Checklist (opcional)" opcoes={[NENHUM, ...(checklists.data ?? []).map((c) => ({ valor: c.id, rotulo: c.nome }))]} disabled={checklists.isPending || checklists.isError} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={!!errors.dataHoraPrevista} className="gap-1.5">
              <FieldLabel htmlFor="chamado-data-hora">Data e horário previstos</FieldLabel>
              <Input id="chamado-data-hora" type="datetime-local" required aria-invalid={!!errors.dataHoraPrevista} {...form.register('dataHoraPrevista')} />
              <FieldError errors={[errors.dataHoraPrevista]} />
            </Field>
            <Field data-invalid={!!errors.duracaoMinutos} className="gap-1.5">
              <FieldLabel htmlFor="chamado-duracao">Duração (minutos)</FieldLabel>
              <Input id="chamado-duracao" type="number" inputMode="numeric" min={LIMITE_CHAMADO.duracao.min} max={LIMITE_CHAMADO.duracao.max} step={1} required aria-invalid={!!errors.duracaoMinutos} {...form.register('duracaoMinutos', numero)} />
              <FieldError errors={[errors.duracaoMinutos]} />
            </Field>
          </div>
          <Button type="submit" disabled={aprovar.isPending || equipes.isPending || equipamentos.isPending || checklists.isPending || equipes.isError || equipamentos.isError || checklists.isError}>{aprovar.isPending ? 'Aprovando...' : 'Revisar aprovação'}</Button>
        </form>
      </FormProvider>
      <ConfirmDialog open={!!confirmacao} onOpenChange={(open) => !open && setConfirmacao(null)} title="Aprovar este chamado?" description="Uma tarefa será criada e atribuída à equipe selecionada." confirmLabel="Aprovar e criar tarefa" onConfirm={aoConfirmar} />
    </section>
  )
}
