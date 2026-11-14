package com.smartmall.ops.api.controller.tarefa;

import com.smartmall.ops.api.config.security.UsuarioAutenticado;
import com.smartmall.ops.domain.model.tarefa.Ator;
import com.smartmall.ops.domain.model.tarefa.AvaliacaoTarefaRequest;
import com.smartmall.ops.domain.model.tarefa.ExecucaoTarefaRequest;
import com.smartmall.ops.domain.model.tarefa.TarefaDetalheResponse;
import com.smartmall.ops.domain.model.tarefa.TarefaResponse;
import com.smartmall.ops.domain.service.tarefa.IExecucaoTarefaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

/**
 * Execução (responsável) e validação da tarefa.
 * Fila de análise, aprovar e reprovar: Administrador e Supervisor (SecurityConfiguration).
 * As demais regras (membro da equipe, responsável, status) ficam no serviço.
 */
@RestController
@RequestMapping(value = "/api/tarefa", produces = "application/json")
@Tag(name = "Execução da tarefa", description = "Assumir, preencher o checklist, anexar evidências, enviar para análise, aprovar e reprovar.")
public class ExecucaoTarefaController {

    private final IExecucaoTarefaService service;

    public ExecucaoTarefaController(IExecucaoTarefaService service) {
        this.service = service;
    }

    @GetMapping("/em-analise")
    @Operation(description = "Tarefas enviadas para análise, o envio mais antigo primeiro.")
    public List<TarefaResponse> emAnalise() {
        return service.emAnalise();
    }

    @GetMapping("/{id}")
    @Operation(description = "Tarefa com checklist, evidências, histórico e ações permitidas ao usuário.")
    public TarefaDetalheResponse detalhe(@PathVariable String id, @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.detalhe(id, ator(usuario));
    }

    @PostMapping("/{id}/assumir")
    @Operation(description = "Membro da equipe assume a tarefa e passa a ser o responsável.")
    public TarefaDetalheResponse assumir(@PathVariable String id, @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.assumir(id, ator(usuario));
    }

    @PutMapping(value = "/{id}/execucao", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(description = "Salva respostas do checklist e observação, sem enviar.")
    public TarefaDetalheResponse salvar(@PathVariable String id, @Valid @RequestBody ExecucaoTarefaRequest request,
                                        @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.salvar(id, request, ator(usuario));
    }

    @PostMapping(value = "/{id}/evidencia", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(description = "Anexa uma imagem (JPG, PNG ou WebP, até 5 MB).")
    public TarefaDetalheResponse adicionarEvidencia(@PathVariable String id, @RequestParam("arquivo") MultipartFile arquivo,
                                                    @AuthenticationPrincipal UsuarioAutenticado usuario) throws IOException {
        return service.adicionarEvidencia(id, arquivo.getOriginalFilename(), arquivo.getBytes(), ator(usuario));
    }

    @DeleteMapping("/{id}/evidencia/{evidenciaId}")
    @Operation(description = "Remove uma evidência ainda não enviada para análise.")
    public TarefaDetalheResponse removerEvidencia(@PathVariable String id, @PathVariable String evidenciaId,
                                                  @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.removerEvidencia(id, evidenciaId, ator(usuario));
    }

    @GetMapping(value = "/{id}/evidencia/{evidenciaId}/arquivo", produces = MediaType.ALL_VALUE)
    @Operation(description = "Conteúdo da imagem.")
    public ResponseEntity<byte[]> arquivo(@PathVariable String id, @PathVariable String evidenciaId,
                                          @AuthenticationPrincipal UsuarioAutenticado usuario) {
        var arquivo = service.arquivo(id, evidenciaId, ator(usuario));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(arquivo.tipoConteudo()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.inline().filename(arquivo.nomeArquivo(), StandardCharsets.UTF_8).build().toString())
                // Evidência não muda depois de anexada; o cache é só do navegador do usuário logado.
                .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePrivate())
                .body(arquivo.conteudo());
    }

    @PostMapping(value = "/{id}/enviar", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(description = "Salva e envia para análise. Exige itens obrigatórios respondidos e ao menos uma imagem nova.")
    public TarefaDetalheResponse enviar(@PathVariable String id, @Valid @RequestBody ExecucaoTarefaRequest request,
                                        @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.enviar(id, request, ator(usuario));
    }

    @PostMapping(value = "/{id}/aprovar", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(description = "Aprova e conclui a tarefa.")
    public TarefaDetalheResponse aprovar(@PathVariable String id, @Valid @RequestBody AvaliacaoTarefaRequest request,
                                         @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.aprovar(id, request, ator(usuario));
    }

    @PostMapping(value = "/{id}/reprovar", consumes = MediaType.APPLICATION_JSON_VALUE)
    @Operation(description = "Reprova (motivo obrigatório); a tarefa volta para execução com o mesmo responsável.")
    public TarefaDetalheResponse reprovar(@PathVariable String id, @Valid @RequestBody AvaliacaoTarefaRequest request,
                                          @AuthenticationPrincipal UsuarioAutenticado usuario) {
        return service.reprovar(id, request, ator(usuario));
    }

    private static Ator ator(UsuarioAutenticado usuario) {
        return new Ator(usuario.getId(), usuario.getPerfil());
    }
}
