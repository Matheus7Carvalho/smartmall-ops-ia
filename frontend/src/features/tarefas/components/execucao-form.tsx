import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2Icon, SendIcon } from 'lucide-react'
import { useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { toast } from 'sonner'
import { CadastroForm } from '@/components/shared/cadastro-form'
import { LimitedTextarea } from '@/components/shared/limited-textarea'
import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldLabel } from '@/components/ui/field'
import { mensagemDeErro } from '@/lib/cadastro'
import { useEnviarParaAnalise, useSalvarExecucao } from '../hooks'
import { LIMITE } from '../limites'
import { execucaoSchema, faltandoParaEnviar, paraFormulario, paraRequisicao, type ExecucaoValores } from '../schemas'
import type { TarefaDetalhe } from '../types'
import { ChecklistExecucao } from './checklist-execucao'
import { EvidenciasPendentes } from './evidencias-pendentes'

type ExecucaoFormProps = {
  detalhe: TarefaDetalhe
  onCancel: () => void
}

/**
 * Execução pelo responsável: checklist, observação e evidências.
 * Salvar guarda o rascunho e permanece; Enviar para análise salva e envia (CadastroForm nos dois casos).
 */
export function ExecucaoForm({ detalhe, onCancel }: ExecucaoFormProps) {
  const id = detalhe.tarefa.id
  const form = useForm<ExecucaoValores>({ resolver: zodResolver(execucaoSchema(detalhe.itens)), defaultValues: paraFormulario(detalhe) })
  const observacao = useWatch({ control: form.control, name: 'observacao' })
  const salvar = useSalvarExecucao(id)
  const enviar = useEnviarParaAnalise(id)
  // O botão clicado define a ação do envio do formulário (o clique ocorre antes do submit).
  const acao = useRef<'salvar' | 'enviar'>('salvar')
  const enviou = useRef(false)
  const [erro, setErro] = useState<string>()
  const pendentes = detalhe.evidencias.filter((e) => e.envio === null).length

  const onSubmit = async (dados: ExecucaoValores) => {
    const enviando = acao.current === 'enviar'
    acao.current = 'salvar'
    setErro(undefined)
    if (enviando) {
      if (detalhe.tarefa.origem === 'CHAMADO' && !dados.observacao.trim()) {
        setErro('Registre a resolução do chamado.')
        form.setError('observacao', { message: 'Registre a resolução do chamado.' })
        form.setFocus('observacao')
        return undefined
      }
      const faltando = faltandoParaEnviar(detalhe.itens, dados)
      faltando.forEach((i) => form.setError(`respostas.${i}.resposta`, { message: 'Responda este item.' }))
      if (faltando.length) {
        setErro('Responda os itens obrigatórios.')
        form.setFocus(`respostas.${faltando[0]}.resposta`)
        return undefined
      }
      if (!pendentes && detalhe.tarefa.origem === 'MANUTENCAO_PROGRAMADA') {
        setErro(detalhe.tarefa.envios > 0 ? 'Anexe ao menos uma imagem nova para reenviar.' : 'Anexe ao menos uma imagem como evidência.')
        return undefined
      }
    }
    try {
      const salvo = await (enviando ? enviar : salvar).mutateAsync(paraRequisicao(dados))
      // Enviada, a tarefa fica em análise e a tela troca o formulário pela visão somente leitura:
      // o formulário é desmontado antes do onSalvo, por isso a mensagem sai aqui.
      enviou.current = enviando
      if (enviando) toast.success('Tarefa enviada para análise.')
      return paraFormulario(salvo)
    } catch (e) {
      setErro(mensagemDeErro(e, 'Não foi possível salvar.'))
      return undefined
    }
  }

  return (
    <CadastroForm
      form={form}
      rotulo="Execução da tarefa"
      salvando={salvar.isPending || enviar.isPending}
      erro={erro}
      onSubmit={onSubmit}
      onSalvo={() => !enviou.current && toast.success('Execução salva.')}
      onCancel={onCancel}
      acaoExtra={
        <Button type="submit" disabled={salvar.isPending || enviar.isPending} onClick={() => (acao.current = 'enviar')}>
          {enviar.isPending ? <Loader2Icon className="animate-spin" aria-hidden /> : <SendIcon aria-hidden />}
          Enviar para análise
        </Button>
      }
    >
      {detalhe.itens.length > 0 && <ChecklistExecucao itens={detalhe.itens} />}
      <Field data-invalid={!!form.formState.errors.observacao} className="gap-1.5">
        <FieldLabel htmlFor="execucao-observacao">{detalhe.tarefa.origem === 'CHAMADO' ? 'Resolução' : 'Observação'}</FieldLabel>
        <LimitedTextarea
          id="execucao-observacao"
          rows={3}
          maxLength={LIMITE.observacao}
          length={observacao?.length ?? 0}
          {...form.register('observacao')}
        />
        <FieldError errors={[form.formState.errors.observacao]} />
      </Field>
      <EvidenciasPendentes detalhe={detalhe} />
    </CadastroForm>
  )
}
