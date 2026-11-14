import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowDownIcon, ArrowUpIcon, GripVerticalIcon, Trash2Icon } from 'lucide-react'
import type { KeyboardEvent } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { LimitedInput } from '@/components/shared/limited-input'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { LIMITE } from '../limites'
import type { ChecklistForm } from '../schemas'
import { MAX_CARACTERES_TEXTO, tiposResposta, type TipoResposta } from '../types'
import { AREA, ITEM_GRID } from './item-grid'

type ChecklistItemRowProps = {
  /** Chave estável do useFieldArray, usada também pelo arrastar. */
  chave: string
  index: number
  total: number
  onMove: (from: number, to: number) => void
  onRemove: (index: number) => void
  /** Enter na pergunta: vai para o próximo item ou cria um novo. */
  onEnter: (index: number) => void
}

/** Rótulos visíveis só no celular; no desktop o cabeçalho da lista cumpre esse papel. */
const ROTULO = 'text-xs text-muted-foreground md:sr-only'

export function ChecklistItemRow({ chave, index, total, onMove, onRemove, onEnter }: ChecklistItemRowProps) {
  const { register, control, setValue, getValues, formState } = useFormContext<ChecklistForm>()
  const tipo = useWatch({ control, name: `itens.${index}.tipoResposta` })
  const pergunta = useWatch({ control, name: `itens.${index}.pergunta` })
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: chave })
  const erros = formState.errors.itens?.[index]
  const id = (campo: string) => `item-${index}-${campo}`
  const numero = index + 1

  const trocarTipo = (valor: TipoResposta, onChange: (v: TipoResposta) => void) => {
    onChange(valor)
    if (valor === 'TEXTO' && !getValues(`itens.${index}.maxCaracteres`)) {
      setValue(`itens.${index}.maxCaracteres`, MAX_CARACTERES_TEXTO, { shouldValidate: formState.isSubmitted })
    }
  }

  const aoTeclar = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || e.nativeEvent.isComposing) return
    e.preventDefault()
    onEnter(index)
  }

  return (
    // O <legend> é o primeiro filho para nomear o grupo ("Item 1") para leitores de tela e testes.
    <fieldset
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      className={cn(
        'group/item relative rounded-lg border bg-card p-3',
        'md:rounded-none md:border-0 md:border-b md:px-2 md:py-2 md:last-of-type:border-b-0',
        'focus-within:bg-muted/40 hover:bg-muted/40',
        isDragging && 'z-10 shadow-md ring-1 ring-ring/40',
      )}
    >
      <legend className="sr-only">Item {numero}</legend>
      <div className={ITEM_GRID}>
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-roledescription="item reordenável"
          aria-label={`Arrastar item ${numero}`}
          className={cn(
            AREA.alca,
            'flex h-8 w-7 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground',
            'hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:cursor-grabbing',
          )}
        >
          <GripVerticalIcon className="size-4" aria-hidden />
        </button>

        <span aria-hidden className={cn(AREA.numero, 'flex h-8 items-center text-sm font-medium tabular-nums md:justify-center md:text-muted-foreground')}>
          <span className="md:hidden">Item&nbsp;</span>
          {numero}
        </span>

        <Field data-invalid={!!erros?.pergunta} className={cn(AREA.pergunta, 'gap-1.5')}>
          <FieldLabel htmlFor={id('pergunta')} className={ROTULO}>
            Pergunta
          </FieldLabel>
          <LimitedInput
            id={id('pergunta')}
            required
            maxLength={LIMITE.pergunta}
            length={pergunta?.length ?? 0}
            enterKeyHint="next"
            aria-invalid={!!erros?.pergunta}
            {...register(`itens.${index}.pergunta`)}
            onKeyDown={aoTeclar}
          />
          <FieldError errors={[erros?.pergunta]} />
        </Field>

        <Field data-invalid={!!erros?.tipoResposta} className={cn(AREA.tipo, 'gap-1.5')}>
          <FieldLabel htmlFor={id('tipo')} className={ROTULO}>
            Tipo de resposta
          </FieldLabel>
          <Controller
            control={control}
            name={`itens.${index}.tipoResposta`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={(v) => trocarTipo(v as TipoResposta, field.onChange)}>
                <SelectTrigger id={id('tipo')} className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tiposResposta.map((t) => (
                    <SelectItem key={t.valor} value={t.valor}>
                      {t.rotulo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[erros?.tipoResposta]} />
        </Field>

        {tipo === 'TEXTO' ? (
          <Field data-invalid={!!erros?.maxCaracteres} className={cn(AREA.max, 'gap-1.5')}>
            <FieldLabel htmlFor={id('max')} className={ROTULO}>
              Máx. caracteres
            </FieldLabel>
            <Input
              id={id('max')}
              type="number"
              inputMode="numeric"
              min={1}
              max={MAX_CARACTERES_TEXTO}
              required
              className="tabular-nums"
              aria-invalid={!!erros?.maxCaracteres}
              {...register(`itens.${index}.maxCaracteres`, { setValueAs: (v) => (v === '' || v === null ? undefined : Number(v)) })}
            />
            <FieldError errors={[erros?.maxCaracteres]} />
          </Field>
        ) : (
          <span aria-hidden className={cn(AREA.max, 'hidden h-8 items-center justify-center text-muted-foreground md:flex')}>
            —
          </span>
        )}

        <Field orientation="horizontal" className={cn(AREA.obrigatorio, 'h-8 w-auto items-center self-end md:self-start md:justify-center')}>
          <Controller
            control={control}
            name={`itens.${index}.obrigatorio`}
            render={({ field }) => (
              <Checkbox id={id('obrigatorio')} checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
            )}
          />
          <FieldLabel htmlFor={id('obrigatorio')} className="font-normal md:sr-only">
            Obrigatório
          </FieldLabel>
        </Field>

        {/* No desktop as ações aparecem ao passar o mouse ou focar a linha; no celular ficam sempre visíveis. */}
        <div
          className={cn(
            AREA.acoes,
            'flex justify-end gap-0.5 transition-opacity',
            'md:opacity-0 md:group-focus-within/item:opacity-100 md:group-hover/item:opacity-100',
          )}
        >
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Mover para cima" disabled={index === 0} onClick={() => onMove(index, index - 1)}>
            <ArrowUpIcon aria-hidden />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Mover para baixo" disabled={index === total - 1} onClick={() => onMove(index, index + 1)}>
            <ArrowDownIcon aria-hidden />
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Remover item" disabled={total === 1} onClick={() => onRemove(index)}>
            <Trash2Icon aria-hidden />
          </Button>
        </div>
      </div>
    </fieldset>
  )
}
