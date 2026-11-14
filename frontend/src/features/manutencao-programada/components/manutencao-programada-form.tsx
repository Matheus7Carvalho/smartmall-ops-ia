import { zodResolver } from '@hookform/resolvers/zod'
import { RepeatIcon } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
import { CadastroForm } from '@/components/shared/cadastro-form'
import { LimitedTextarea } from '@/components/shared/limited-textarea'
import { SelectField } from '@/components/shared/select-field'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useChecklists } from '@/features/checklists/hooks'
import { useEquipamentos } from '@/features/equipamentos/hooks'
import { useEquipes } from '@/features/equipes/hooks'
import { hojeIso } from '@/lib/datas'
import { LIMITE } from '../limites'
import { descreverRecorrencia } from '../recorrencia'
import { programadaSchema, type ProgramadaFormValores as Valores } from '../schemas'
import { frequencias } from '../types'

type ManutencaoProgramadaFormProps = {
  defaultValues: Valores
  novo: boolean
  somenteLeitura?: boolean
  salvando: boolean
  erro?: string
  onSubmit: (dados: Valores) => Promise<Valores | undefined>
  onSalvo: () => void
  onCancel: () => void
}

const numero = { setValueAs: (v: unknown) => (v === '' || v === null ? undefined : Number(v)) }

export function ManutencaoProgramadaForm({ defaultValues, novo, ...acoes }: ManutencaoProgramadaFormProps) {
  const form = useForm<Valores>({ resolver: zodResolver(programadaSchema), defaultValues })
  const { errors } = form.formState
  const regra = useWatch({ control: form.control })
  const frequencia = frequencias.find((f) => f.valor === regra.frequencia) ?? frequencias[2]
  const unica = regra.frequencia === 'UNICA'

  const equipamentos = useEquipamentos()
  const checklists = useChecklists()
  const equipes = useEquipes()

  const descricao = descreverRecorrencia({
    frequencia: regra.frequencia ?? 'SEMANAL',
    intervalo: regra.intervalo ?? 1,
    dataInicio: regra.dataInicio ?? '',
    horario: regra.horario ?? '',
    dataFim: unica ? null : regra.dataFim,
  })

  return (
    <CadastroForm form={form} rotulo="Manutenção programada" className="max-w-none" {...acoes}>
      <div className="grid gap-4 md:grid-cols-3">
        <SelectField<Valores>
          name="equipamentoId"
          id="programada-equipamento"
          label="Equipamento"
          opcoes={(equipamentos.data ?? []).map((e) => ({ valor: e.id, rotulo: `${e.codigo} · ${e.nome}` }))}
        />
        <SelectField<Valores>
          name="checklistId"
          id="programada-checklist"
          label="Modelo de checklist"
          opcoes={(checklists.data ?? []).map((c) => ({ valor: c.id, rotulo: c.nome }))}
        />
        <SelectField<Valores>
          name="equipeId"
          id="programada-equipe"
          label="Equipe responsável"
          opcoes={(equipes.data ?? []).map((e) => ({ valor: e.id, rotulo: e.nome }))}
        />
      </div>

      <fieldset className="grid gap-4 rounded-lg border p-4">
        <legend className="px-1 text-sm font-medium">Recorrência</legend>
        {/* auto-fill: cabe quantos campos a largura permitir, sem estourar a coluna (o painel de datas fica ao lado). */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-4">
          <SelectField<Valores> name="frequencia" id="programada-frequencia" label="Frequência" opcoes={frequencias} />

          {!unica && (
            <Field data-invalid={!!errors.intervalo} className="gap-1.5">
              <FieldLabel htmlFor="programada-intervalo">A cada</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="programada-intervalo"
                  type="number"
                  inputMode="numeric"
                  min={LIMITE.intervalo.min}
                  max={LIMITE.intervalo.max}
                  required
                  className="w-16 tabular-nums"
                  aria-invalid={!!errors.intervalo}
                  {...form.register('intervalo', numero)}
                />
                <span className="text-sm text-muted-foreground">{frequencia.unidade[(regra.intervalo ?? 1) === 1 ? 0 : 1]}</span>
              </div>
              <FieldError errors={[errors.intervalo]} />
            </Field>
          )}

          <Field data-invalid={!!errors.dataInicio} className="gap-1.5">
            <FieldLabel htmlFor="programada-inicio">{unica ? 'Data' : 'Início'}</FieldLabel>
            <Input id="programada-inicio" type="date" required min={novo ? hojeIso() : undefined} aria-invalid={!!errors.dataInicio} {...form.register('dataInicio')} />
            <FieldError errors={[errors.dataInicio]} />
          </Field>

          <Field data-invalid={!!errors.horario} className="gap-1.5">
            <FieldLabel htmlFor="programada-horario">Horário</FieldLabel>
            <Input id="programada-horario" type="time" required aria-invalid={!!errors.horario} {...form.register('horario')} />
            <FieldError errors={[errors.horario]} />
          </Field>

          <Field data-invalid={!!errors.duracaoMinutos} className="gap-1.5">
            <FieldLabel htmlFor="programada-duracao">Duração (min)</FieldLabel>
            <Input
              id="programada-duracao"
              type="number"
              inputMode="numeric"
              min={LIMITE.duracao.min}
              max={LIMITE.duracao.max}
              step={15}
              required
              className="tabular-nums"
              aria-invalid={!!errors.duracaoMinutos}
              {...form.register('duracaoMinutos', numero)}
            />
            <FieldError errors={[errors.duracaoMinutos]} />
          </Field>

          {!unica && (
            <Field data-invalid={!!errors.dataFim} className="gap-1.5">
              <FieldLabel htmlFor="programada-fim">Término (opcional)</FieldLabel>
              <Input id="programada-fim" type="date" min={regra.dataInicio || undefined} aria-invalid={!!errors.dataFim} {...form.register('dataFim')} />
              <FieldError errors={[errors.dataFim]} />
            </Field>
          )}
        </div>

        {descricao && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite" data-testid="descricao-recorrencia">
            <RepeatIcon className="size-4 shrink-0" aria-hidden />
            {descricao}
          </p>
        )}
      </fieldset>

      <Field data-invalid={!!errors.observacoes} className="gap-1.5">
        <FieldLabel htmlFor="programada-observacoes">Observações (opcional)</FieldLabel>
        <LimitedTextarea
          id="programada-observacoes"
          rows={3}
          maxLength={LIMITE.observacoes}
          length={regra.observacoes?.length ?? 0}
          aria-invalid={!!errors.observacoes}
          {...form.register('observacoes')}
        />
        <FieldError errors={[errors.observacoes]} />
      </Field>
    </CadastroForm>
  )
}
