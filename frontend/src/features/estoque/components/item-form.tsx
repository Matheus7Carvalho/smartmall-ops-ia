import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { CadastroForm } from '@/components/shared/cadastro-form'
import { LimitedInput } from '@/components/shared/limited-input'
import { LimitedTextarea } from '@/components/shared/limited-textarea'
import { SelectField } from '@/components/shared/select-field'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { LIMITE } from '../limites'
import { itemSchema, type ItemForm as Valores } from '../schemas'
import { categoriasItem, unidades } from '../types'

type ItemFormProps = {
  defaultValues: Valores
  salvando: boolean
  erro?: string
  somenteLeitura?: boolean
  onSubmit: (dados: Valores) => Promise<Valores | undefined>
  onSalvo: () => void
  onCancel: () => void
}

const numero = { setValueAs: (v: unknown) => (v === '' || v === null ? undefined : Number(v)) }

/** Cadastro do item. O saldo não é editável aqui: muda só por entrada e retirada. */
export function ItemForm({ defaultValues, ...acoes }: ItemFormProps) {
  const form = useForm<Valores>({ resolver: zodResolver(itemSchema), defaultValues })
  const { errors } = form.formState
  const [codigo, nome, descricao, localizacao] = useWatch({ control: form.control, name: ['codigo', 'nome', 'descricao', 'localizacao'] })

  return (
    <CadastroForm form={form} rotulo="Item de estoque" className="max-w-3xl" {...acoes}>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
        <Field data-invalid={!!errors.codigo} className="gap-1.5">
          <FieldLabel htmlFor="item-codigo">Código</FieldLabel>
          <LimitedInput
            id="item-codigo"
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
          <FieldLabel htmlFor="item-nome">Nome</FieldLabel>
          <LimitedInput id="item-nome" required maxLength={LIMITE.nome} length={nome?.length ?? 0} aria-invalid={!!errors.nome} {...form.register('nome')} />
          <FieldError errors={[errors.nome]} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <SelectField<Valores> name="categoria" id="item-categoria" label="Categoria" opcoes={categoriasItem} />
        <SelectField<Valores> name="unidade" id="item-unidade" label="Unidade" opcoes={unidades} />
        <Field data-invalid={!!errors.estoqueMinimo} className="gap-1.5">
          <FieldLabel htmlFor="item-minimo">Estoque mínimo</FieldLabel>
          <Input
            id="item-minimo"
            type="number"
            inputMode="numeric"
            required
            min={LIMITE.minimo.min}
            max={LIMITE.minimo.max}
            className="tabular-nums"
            aria-invalid={!!errors.estoqueMinimo}
            {...form.register('estoqueMinimo', numero)}
          />
          <FieldError errors={[errors.estoqueMinimo]} />
        </Field>
      </div>

      <Field data-invalid={!!errors.localizacao} className="gap-1.5">
        <FieldLabel htmlFor="item-localizacao">Localização</FieldLabel>
        <LimitedInput
          id="item-localizacao"
          maxLength={LIMITE.localizacao}
          length={localizacao?.length ?? 0}
          placeholder="Ex.: Almoxarifado A · Prateleira 2"
          aria-invalid={!!errors.localizacao}
          {...form.register('localizacao')}
        />
        <FieldError errors={[errors.localizacao]} />
      </Field>

      <Field data-invalid={!!errors.descricao} className="gap-1.5">
        <FieldLabel htmlFor="item-descricao">Descrição</FieldLabel>
        <LimitedTextarea id="item-descricao" maxLength={LIMITE.descricao} length={descricao?.length ?? 0} rows={3} aria-invalid={!!errors.descricao} {...form.register('descricao')} />
        <FieldError errors={[errors.descricao]} />
      </Field>
    </CadastroForm>
  )
}
