import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { LimitedTextarea } from '@/components/shared/limited-textarea'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { mensagemDeErro } from '@/lib/cadastro'
import { useDestinos, useMovimentar } from '../hooks'
import { LIMITE } from '../limites'
import { movimentacaoParaRequisicao, movimentacaoSchema, type MovimentacaoForm } from '../schemas'
import { unidadeCurta, type ItemEstoque, type TipoMovimentacao } from '../types'

export type PedidoMovimentacao = { item: ItemEstoque; tipo: TipoMovimentacao }

const VAZIO: MovimentacaoForm = { quantidade: 1, equipamentoId: '', observacao: '' }
const NENHUM = '__nenhum__'
const numero = { setValueAs: (v: unknown) => (v === '' || v === null ? undefined : Number(v)) }

/** Painel lateral de entrada ou retirada. Na retirada, o destino (equipamento) dá a rastreabilidade do uso. */
export function MovimentacaoSheet({ pedido, onClose }: { pedido: PedidoMovimentacao | null; onClose: () => void }) {
  const retirada = pedido?.tipo === 'RETIRADA'
  const movimentar = useMovimentar()
  const destinos = useDestinos(retirada)
  const schema = useMemo(() => movimentacaoSchema(retirada ? pedido?.item.saldo : undefined), [retirada, pedido])
  const form = useForm<MovimentacaoForm>({ resolver: zodResolver(schema), defaultValues: VAZIO })
  const { errors } = form.formState
  const [observacao, equipamentoId] = useWatch({ control: form.control, name: ['observacao', 'equipamentoId'] })

  // Cada abertura começa do zero (outro item, ou o mesmo depois de cancelar).
  useEffect(() => {
    if (pedido) form.reset(VAZIO)
  }, [pedido, form])

  const item = pedido?.item
  const unidade = item ? unidadeCurta[item.unidade] : ''

  const enviar = form.handleSubmit((dados) => {
    if (!pedido) return
    movimentar.mutate(
      { id: pedido.item.id, tipo: pedido.tipo, dados: movimentacaoParaRequisicao(dados) },
      {
        onSuccess: (m) => {
          toast.success(`${pedido.tipo === 'ENTRADA' ? 'Entrada' : 'Retirada'} registrada. Saldo: ${m.saldoApos} ${unidade}.`)
          onClose()
        },
        onError: (e) => toast.error(mensagemDeErro(e, 'Não foi possível registrar.')),
      },
    )
  })

  const titulo = retirada ? 'Registrar retirada' : 'Registrar entrada'

  return (
    <Sheet open={!!pedido} onOpenChange={(aberto) => !aberto && onClose()}>
      <SheetContent className="w-full sm:max-w-sm">
        <FormProvider {...form}>
          <form onSubmit={enviar} noValidate className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>{titulo}</SheetTitle>
              <SheetDescription>
                {item?.codigo} · {item?.nome} — saldo {item?.saldo} {unidade}
              </SheetDescription>
            </SheetHeader>
            <FieldGroup className="gap-4 px-4">
              <Field data-invalid={!!errors.quantidade} className="gap-1.5">
                <FieldLabel htmlFor="mov-quantidade">Quantidade ({unidade})</FieldLabel>
                <Input
                  id="mov-quantidade"
                  type="number"
                  inputMode="numeric"
                  required
                  min={LIMITE.quantidade.min}
                  max={retirada && item ? Math.max(item.saldo, LIMITE.quantidade.min) : LIMITE.quantidade.max}
                  className="tabular-nums"
                  aria-invalid={!!errors.quantidade}
                  {...form.register('quantidade', numero)}
                />
                <FieldError errors={[errors.quantidade]} />
              </Field>
              {retirada && (
                <Field className="gap-1.5">
                  <FieldLabel htmlFor="mov-equipamento">Equipamento atendido</FieldLabel>
                  <Select
                    value={equipamentoId || NENHUM}
                    onValueChange={(v) => form.setValue('equipamentoId', v === NENHUM ? '' : v, { shouldDirty: true })}
                  >
                    <SelectTrigger id="mov-equipamento" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NENHUM}>Nenhum</SelectItem>
                      {(destinos.data ?? []).map((e) => (
                        <SelectItem key={e.id} value={e.id}>
                          {e.codigo} · {e.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
              <Field data-invalid={!!errors.observacao} className="gap-1.5">
                <FieldLabel htmlFor="mov-observacao">Observação</FieldLabel>
                <LimitedTextarea id="mov-observacao" maxLength={LIMITE.observacao} length={observacao?.length ?? 0} rows={2} aria-invalid={!!errors.observacao} {...form.register('observacao')} />
                <FieldError errors={[errors.observacao]} />
              </Field>
            </FieldGroup>
            <SheetFooter className="mt-auto flex-row justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={movimentar.isPending}>
                {retirada ? 'Retirar' : 'Registrar entrada'}
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  )
}
