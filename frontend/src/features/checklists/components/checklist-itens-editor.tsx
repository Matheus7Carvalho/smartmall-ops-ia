import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type UniqueIdentifier,
} from '@dnd-kit/core'
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { PlusIcon } from 'lucide-react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { FieldError } from '@/components/ui/field'
import { cn } from '@/lib/utils'
import { novoItem, type ChecklistForm } from '../schemas'
import { MAX_ITENS } from '../types'
import { ChecklistItemRow } from './checklist-item-row'
import { AREA, ITEM_GRID } from './item-grid'

export function ChecklistItensEditor() {
  const { control, formState, setFocus } = useFormContext<ChecklistForm>()
  const { fields, append, move, remove } = useFieldArray({ control, name: 'itens', keyName: 'chave' })
  const erroLista = formState.errors.itens?.root ?? formState.errors.itens
  const cheio = fields.length >= MAX_ITENS

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const posicao = (id: UniqueIdentifier) => fields.findIndex((f) => f.chave === id) + 1

  const anuncios: Announcements = {
    onDragStart: ({ active }) => `Item ${posicao(active.id)} selecionado.`,
    onDragOver: ({ over }) => (over ? `Posição ${posicao(over.id)}.` : undefined),
    onDragEnd: ({ over }) => (over ? `Item solto na posição ${posicao(over.id)}.` : 'Item solto.'),
    onDragCancel: () => 'Movimento cancelado.',
  }

  const aoSoltar = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    move(posicao(active.id) - 1, posicao(over.id) - 1)
  }

  const adicionar = () => {
    if (!cheio) append(novoItem(), { focusName: `itens.${fields.length}.pergunta` })
  }

  const aoEnter = (index: number) => {
    if (index < fields.length - 1) setFocus(`itens.${index + 1}.pergunta`)
    else adicionar()
  }

  return (
    <section aria-labelledby="itens-titulo" className="grid gap-3">
      {/* Ação no topo: a lista cresce para baixo e o botão não se afasta. */}
      <div className="flex items-center justify-between gap-2">
        <h2 id="itens-titulo" className="text-base font-semibold">
          Itens{' '}
          <span className="font-normal text-muted-foreground">
            ({fields.length}/{MAX_ITENS})
          </span>
        </h2>
        <Button type="button" variant="outline" size="sm" disabled={cheio} onClick={adicionar}>
          <PlusIcon aria-hidden />
          Adicionar item
        </Button>
      </div>

      <div className="grid gap-2 md:gap-0 md:rounded-lg md:border">
        {/* Cabeçalho visual; cada campo tem seu próprio rótulo acessível. */}
        <div aria-hidden className={cn(ITEM_GRID, 'hidden border-b bg-muted/50 px-2 py-2 text-xs font-medium text-muted-foreground md:grid')}>
          <span className={AREA.alca} />
          <span className={cn(AREA.numero, 'text-center')}>#</span>
          <span className={AREA.pergunta}>Pergunta</span>
          <span className={AREA.tipo}>Tipo de resposta</span>
          <span className={cn(AREA.max, 'text-center')}>Máx. caracteres</span>
          <span className={cn(AREA.obrigatorio, 'text-center')}>Obrigatório</span>
          <span className={AREA.acoes} />
        </div>

        <DndContext
          sensors={sensores}
          collisionDetection={closestCenter}
          onDragEnd={aoSoltar}
          accessibility={{
            announcements: anuncios,
            screenReaderInstructions: {
              draggable: 'Pressione espaço para pegar o item, use as setas para mover e espaço para soltar. Esc cancela.',
            },
          }}
        >
          <SortableContext items={fields.map((f) => f.chave)} strategy={verticalListSortingStrategy}>
            {fields.map((field, index) => (
              <ChecklistItemRow
                key={field.chave}
                chave={field.chave}
                index={index}
                total={fields.length}
                onMove={move}
                onRemove={remove}
                onEnter={aoEnter}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <FieldError errors={[erroLista?.message ? { message: erroLista.message } : undefined]} />
    </section>
  )
}
