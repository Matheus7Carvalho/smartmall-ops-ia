import { Loader2Icon } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from './confirm-dialog'

type FormActionsProps = {
  /** Há alterações não salvas (formState.isDirty). */
  alterado: boolean
  salvando: boolean
  onCancel: () => void
  /** Registro que não pode ser editado: só "Voltar". */
  somenteLeitura?: boolean
  /** Ação principal além de Salvar (ex.: "Enviar para análise"); Salvar passa a ser secundário. */
  extra?: ReactNode
}

/**
 * Barra de ações padrão de cadastro/edição, fixa no rodapé.
 * Cancelar com alterações pendentes pede confirmação antes de descartar.
 * As margens negativas compensam o padding do <main>.
 */
export function FormActions({ alterado, salvando, onCancel, somenteLeitura, extra }: FormActionsProps) {
  const [confirmando, setConfirmando] = useState(false)

  return (
    <div className="sticky bottom-0 z-20 -mx-4 flex justify-end gap-2 border-t bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
      <Button type="button" variant="outline" onClick={() => (alterado ? setConfirmando(true) : onCancel())}>
        {somenteLeitura ? 'Voltar' : 'Cancelar'}
      </Button>
      {!somenteLeitura && (
        <Button type="submit" variant={extra ? 'outline' : 'default'} disabled={salvando}>
          {salvando && <Loader2Icon className="animate-spin" aria-hidden />}
          Salvar
        </Button>
      )}
      {!somenteLeitura && extra}

      <ConfirmDialog
        open={confirmando}
        onOpenChange={setConfirmando}
        title="Descartar alterações?"
        description="As informações não salvas serão perdidas."
        confirmLabel="Descartar"
        destructive
        onConfirm={onCancel}
      />
    </div>
  )
}
