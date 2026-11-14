import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { CadastroForm } from '@/components/shared/cadastro-form'
import { LimitedInput } from '@/components/shared/limited-input'
import { SelectField } from '@/components/shared/select-field'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { usePisos } from '@/features/pisos/hooks'
import { LIMITE } from '../limites'
import { equipamentoSchema, type EquipamentoForm as Valores } from '../schemas'
import { categorias, condicoes } from '../types'

type EquipamentoFormProps = {
  defaultValues: Valores
  salvando: boolean
  erro?: string
  onSubmit: (dados: Valores) => Promise<Valores | undefined>
  onSalvo: () => void
  onCancel: () => void
}

export function EquipamentoForm({ defaultValues, ...acoes }: EquipamentoFormProps) {
  const form = useForm<Valores>({ resolver: zodResolver(equipamentoSchema), defaultValues })
  const { errors } = form.formState
  const [codigo, nome, localizacao] = useWatch({ control: form.control, name: ['codigo', 'nome', 'localizacao'] })
  const pisos = usePisos()

  return (
    <CadastroForm form={form} rotulo="Equipamento" className="max-w-3xl" {...acoes}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
        <Field data-invalid={!!errors.codigo} className="gap-1.5">
          <FieldLabel htmlFor="eq-codigo">Código</FieldLabel>
          <LimitedInput
            id="eq-codigo"
            required
            maxLength={LIMITE.codigo}
            length={codigo?.length ?? 0}
            className="uppercase"
            autoCapitalize="characters"
            aria-invalid={!!errors.codigo}
            {...form.register('codigo')}
          />
          <FieldError errors={[errors.codigo]} />
        </Field>
        <Field data-invalid={!!errors.nome} className="gap-1.5">
          <FieldLabel htmlFor="eq-nome">Nome</FieldLabel>
          <LimitedInput id="eq-nome" required maxLength={LIMITE.nome} length={nome?.length ?? 0} aria-invalid={!!errors.nome} {...form.register('nome')} />
          <FieldError errors={[errors.nome]} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField<Valores> name="categoria" id="eq-categoria" label="Categoria" opcoes={categorias} />
        <SelectField<Valores>
          name="pisoId"
          id="eq-piso"
          label="Piso"
          opcoes={(pisos.data ?? []).map((p) => ({ valor: p.id, rotulo: p.nome }))}
          placeholder={pisos.isPending ? 'Carregando…' : 'Selecione'}
        />
        <SelectField<Valores> name="condicao" id="eq-condicao" label="Condição" opcoes={condicoes} />
      </div>

      <Field data-invalid={!!errors.localizacao} className="gap-1.5">
        <FieldLabel htmlFor="eq-localizacao">Localização</FieldLabel>
        <LimitedInput
          id="eq-localizacao"
          required
          maxLength={LIMITE.localizacao}
          length={localizacao?.length ?? 0}
          placeholder="Referência no piso"
          aria-invalid={!!errors.localizacao}
          {...form.register('localizacao')}
        />
        <FieldError errors={[errors.localizacao]} />
      </Field>
    </CadastroForm>
  )
}
