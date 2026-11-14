import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { SelectField } from '@/components/shared/select-field'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { mensagemDeErro } from '@/lib/cadastro'
import { paraIsoData } from '@/lib/datas'
import { useAgora } from '@/lib/use-agora'
import { MOTIVOS_AUSENCIA, motivoAusenciaRotulo, type Disponibilidade } from '../disponibilidade'
import { useRegistrarAusencia } from '../hooks'
import { ausenciaParaRequisicao, ausenciaSchema, type AusenciaForm } from '../schemas'

const MOTIVOS = MOTIVOS_AUSENCIA.map((m) => ({ valor: m, rotulo: motivoAusenciaRotulo[m] }))

type AusenciaSheetProps = {
  /** Funcionário da ausência; nulo fecha o painel. */
  funcionario: Disponibilidade | null
  onClose: () => void
}

/** Painel lateral para registrar a ausência de um funcionário (dias inteiros). */
export function AusenciaSheet({ funcionario, onClose }: AusenciaSheetProps) {
  const hoje = paraIsoData(useAgora())
  const registrar = useRegistrarAusencia()
  const form = useForm<AusenciaForm>({ resolver: zodResolver(ausenciaSchema), defaultValues: { inicio: hoje, fim: hoje, motivo: '' } })
  const { errors } = form.formState
  const inicio = useWatch({ control: form.control, name: 'inicio' })

  // Cada abertura começa do zero (outro funcionário, ou o mesmo depois de cancelar).
  useEffect(() => {
    if (funcionario) form.reset({ inicio: hoje, fim: hoje, motivo: '' })
  }, [funcionario, hoje, form])

  const enviar = form.handleSubmit((dados) => {
    if (!funcionario) return
    registrar.mutate(ausenciaParaRequisicao(funcionario.id, dados), {
      onSuccess: () => {
        toast.success('Ausência registrada.')
        onClose()
      },
      onError: (e) => toast.error(mensagemDeErro(e, 'Não foi possível registrar a ausência.')),
    })
  })

  return (
    <Sheet open={!!funcionario} onOpenChange={(aberto) => !aberto && onClose()}>
      <SheetContent className="w-full sm:max-w-sm">
        <FormProvider {...form}>
          <form onSubmit={enviar} noValidate className="flex h-full flex-col">
            <SheetHeader>
              <SheetTitle>Registrar ausência</SheetTitle>
              <SheetDescription>{funcionario?.nome}</SheetDescription>
            </SheetHeader>
            <FieldGroup className="gap-4 px-4">
              <Field data-invalid={!!errors.inicio} className="gap-1.5">
                <FieldLabel htmlFor="ausencia-inicio">Início</FieldLabel>
                <Input id="ausencia-inicio" type="date" required min={hoje} aria-invalid={!!errors.inicio} {...form.register('inicio')} />
                <FieldError errors={[errors.inicio]} />
              </Field>
              <Field data-invalid={!!errors.fim} className="gap-1.5">
                <FieldLabel htmlFor="ausencia-fim">Fim</FieldLabel>
                <Input id="ausencia-fim" type="date" required min={inicio || hoje} aria-invalid={!!errors.fim} {...form.register('fim')} />
                <FieldError errors={[errors.fim]} />
              </Field>
              <SelectField<AusenciaForm> name="motivo" id="ausencia-motivo" label="Motivo" opcoes={MOTIVOS} />
            </FieldGroup>
            <SheetFooter className="mt-auto flex-row justify-end">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={registrar.isPending}>
                Registrar
              </Button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  )
}
