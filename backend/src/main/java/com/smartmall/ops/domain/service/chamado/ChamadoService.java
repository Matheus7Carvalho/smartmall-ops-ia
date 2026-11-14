package com.smartmall.ops.domain.service.chamado;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.*;
import com.smartmall.ops.domain.entity.enums.StatusChamado;
import com.smartmall.ops.domain.model.chamado.*;
import com.smartmall.ops.domain.repository.arquivo.ArquivoRepository;
import com.smartmall.ops.domain.repository.chamado.*;
import com.smartmall.ops.domain.repository.checklist.ChecklistRepository;
import com.smartmall.ops.domain.repository.equipe.EquipeRepository;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.tarefa.TarefaRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import jakarta.persistence.EntityNotFoundException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ChamadoService {
    private final LocalQrRepository locais;
    private final ChamadoRepository chamados;
    private final ChamadoMidiaRepository midias;
    private final ChamadoHistoricoRepository historicos;
    private final PlanoAcaoRepository planos;
    private final TarefaRepository tarefas;
    private final EquipeRepository equipes;
    private final EquipamentoRepository equipamentos;
    private final ChecklistRepository checklists;
    private final UsuarioRepository usuarios;
    private final TriagemPorRegras triagem;
    private final Clock clock;

    public ChamadoService(LocalQrRepository locais, ChamadoRepository chamados, ChamadoMidiaRepository midias,
                          ChamadoHistoricoRepository historicos, PlanoAcaoRepository planos, TarefaRepository tarefas,
                          EquipeRepository equipes, EquipamentoRepository equipamentos, ChecklistRepository checklists,
                          UsuarioRepository usuarios, TriagemPorRegras triagem, Clock clock) {
        this.locais = locais; this.chamados = chamados; this.midias = midias; this.historicos = historicos;
        this.planos = planos; this.tarefas = tarefas; this.equipes = equipes; this.equipamentos = equipamentos;
        this.checklists = checklists; this.usuarios = usuarios; this.triagem = triagem; this.clock = clock;
    }

    public LocalQrResponse local(String codigo) {
        var local = locais.findByCodigoAndAtivoTrue(codigo)
                .orElseThrow(() -> new EntityNotFoundException("Local não encontrado."));
        return new LocalQrResponse(local.getCodigo(), local.getNome(), local.getPiso().getNome());
    }

    @Transactional
    public ChamadoPublicoResponse registrar(ChamadoPublicoRequest dados, String nomeMidia, byte[] conteudo) {
        String descricao = obrigatorio(dados.getDescricao(), "Descreva o relato.", 1000);
        String localInformado = obrigatorio(dados.getLocalInformado(), "Informe o local.", 150);
        String contato = opcional(dados.getContato(), 150);
        String codigo = opcional(dados.getCodigoLocal(), 60);
        String chave = dados.getChaveEnvio() == null ? null : dados.getChaveEnvio().toLowerCase(Locale.ROOT);
        if (chave == null || !chave.matches("[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}"))
            throw new DomainException("Chave de envio inválida.");
        if (contato != null && !contato.matches("(?i)[^\\s@]+@[^\\s@]+\\.[^\\s@]+")) {
            if (!contato.matches("[+0-9 ()-]+") || !contato.replaceAll("\\D", "").matches("[0-9]{10,13}"))
                throw new DomainException("Informe um e-mail ou WhatsApp válido.");
        }
        var tipoMidia = validarMidia(conteudo);
        String assinatura = assinatura(descricao, localInformado, contato, codigo, conteudo);
        chamados.bloquearChave(chave);
        var anterior = chamados.findByChaveEnvio(chave);
        if (anterior.isPresent()) {
            if (!anterior.get().getAssinatura().equals(assinatura))
                throw new DomainException("A chave de envio já foi usada com outro relato.");
            return respostaPublica(anterior.get());
        }
        LocalQr local = codigo == null ? null : locais.findByCodigoAndAtivoTrue(codigo)
                .orElseThrow(() -> new DomainException("O código do local não é válido."));
        var sugestao = triagem.sugerir(descricao);
        var chamado = new Chamado();
        chamado.setProtocolo("CH-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase(Locale.ROOT));
        chamado.setChaveEnvio(chave);
        chamado.setAssinatura(assinatura);
        chamado.setLocalQr(local);
        chamado.setLocalInformado(localInformado);
        chamado.setDescricao(descricao);
        chamado.setContato(contato);
        chamado.setStatus(StatusChamado.REGISTRADA);
        chamado.setTipoSugerido(sugestao.tipo());
        chamado.setPrioridadeSugerida(sugestao.prioridade());
        chamados.saveAndFlush(chamado);
        if (tipoMidia != null) {
            var midia = new ChamadoMidia();
            midia.setChamado(chamado);
            midia.setArquivo(new Arquivo(conteudo));
            midia.setNome(nomeSeguro(nomeMidia));
            midia.setTipo(tipoMidia);
            midia.setTamanhoBytes(conteudo.length);
            midias.save(midia);
            chamado.setMidia(midia);
        }
        historico(chamado, "REGISTRADA", null, null);
        chamado.setStatus(StatusChamado.EM_ANALISE);
        historico(chamado, "TRIADA", null, "Sugestão por regras, sujeita a revisão humana.");
        return respostaPublica(chamado);
    }

    public Page<ChamadoResponse> listar(StatusChamado status, int page, int size) {
        if (page < 0 || size < 1 || size > 100) throw new DomainException("Paginação inválida.");
        var paginacao = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "dataCriacao"));
        return (status == null ? chamados.findAll(paginacao) : chamados.findByStatus(status, paginacao))
                .map(c -> resposta(c, false));
    }

    public ChamadoResponse detalhe(String id) { return resposta(buscar(id), true); }

    public MidiaPrivada midia(String id) {
        buscar(id);
        var midia = midias.findByChamadoId(id).orElseThrow(() -> new EntityNotFoundException("Mídia não encontrada."));
        return new MidiaPrivada(midia.getNome(), midia.getTipo(), midia.getArquivo().getConteudo());
    }

    @Transactional
    public ChamadoResponse aprovar(String id, AprovarChamadoRequest request, String usuarioId) {
        var chamado = paraTriagem(id);
        if (request.getTipo() == null || request.getPrioridade() == null)
            throw new DomainException("Informe o tipo e a prioridade.");
        if (request.getDataHoraPrevista() == null || request.getDataHoraPrevista().isBefore(LocalDateTime.now(clock)))
            throw new DomainException("Informe uma data futura para a tarefa.");
        if (request.getDuracaoMinutos() == null || request.getDuracaoMinutos() < 1 || request.getDuracaoMinutos() > 1440)
            throw new DomainException("A duração deve ser de 1 a 1440 minutos.");
        if (request.getEquipeId() == null || request.getEquipeId().isBlank())
            throw new DomainException("Informe a equipe.");
        var equipe = equipes.findById(request.getEquipeId())
                .orElseThrow(() -> new DomainException("Equipe não encontrada."));
        var equipamento = request.getEquipamentoId() == null ? null : equipamentos.findById(request.getEquipamentoId())
                .orElseThrow(() -> new DomainException("Equipamento não encontrado."));
        var checklist = request.getChecklistId() == null ? null : checklists.findById(request.getChecklistId())
                .orElseThrow(() -> new DomainException("Checklist não encontrado."));
        var plano = new PlanoAcao();
        plano.setChamado(chamado);
        planos.saveAndFlush(plano);
        chamado.setPlanoAcao(plano);
        var tarefa = new Tarefa(plano, equipe, equipamento, checklist,
                chamado.getLocalQr() == null ? null : chamado.getLocalQr().getPiso(),
                chamado.getLocalInformado(), request.getDataHoraPrevista(), request.getDuracaoMinutos());
        tarefas.saveAndFlush(tarefa);
        chamado.setTipoConfirmado(request.getTipo());
        chamado.setPrioridadeConfirmada(request.getPrioridade());
        chamado.setEquipeConfirmada(equipe);
        chamado.setStatus(StatusChamado.APROVADA);
        historico(chamado, "APROVADA", usuarioId, "Tarefa " + tarefa.getId() + " criada.");
        return resposta(chamado, true);
    }

    @Transactional
    public ChamadoResponse arquivar(String id, ArquivarChamadoRequest request, String usuarioId) {
        var chamado = paraTriagem(id);
        String motivo = obrigatorio(request.getMotivo(), "Informe o motivo do arquivamento.", 500);
        chamado.setMotivoArquivamento(motivo);
        chamado.setStatus(StatusChamado.ARQUIVADA);
        historico(chamado, "ARQUIVADA", usuarioId, motivo);
        return resposta(chamado, true);
    }

    private Chamado paraTriagem(String id) {
        var chamado = buscar(id);
        if (chamado.getStatus() != StatusChamado.EM_ANALISE)
            throw new DomainException("Só chamados em análise podem ser decididos.");
        return chamado;
    }

    private Chamado buscar(String id) {
        return chamados.findById(id).orElseThrow(() -> new EntityNotFoundException("Chamado não encontrado."));
    }

    private void historico(Chamado chamado, String acao, String usuarioId, String detalhe) {
        var item = new ChamadoHistorico();
        item.setChamado(chamado);
        item.setAcao(acao);
        item.setUsuario(usuarioId == null ? null : usuarios.getReferenceById(usuarioId));
        item.setDataHora(LocalDateTime.now(clock));
        item.setStatusResultante(chamado.getStatus());
        item.setDetalhe(detalhe);
        historicos.save(item);
    }

    private ChamadoResponse resposta(Chamado c, boolean detalhar) {
        var midia = c.getMidia();
        var plano = c.getPlanoAcao();
        String tarefaId = plano == null ? null : tarefas.findFirstByPlanoAcaoId(plano.getId()).map(Tarefa::getId).orElse(null);
        List<ChamadoResponse.Historico> historia = detalhar ? historicos.findByChamadoIdOrderByDataHoraAsc(c.getId()).stream()
                .map(h -> new ChamadoResponse.Historico(h.getAcao(), h.getUsuario() == null ? null : h.getUsuario().getId(),
                        h.getDataHora(), h.getStatusResultante(), h.getDetalhe())).toList() : List.of();
        return new ChamadoResponse(c.getId(), c.getProtocolo(), c.getStatus(), c.getDescricao(),
                c.getLocalQr() == null ? null : c.getLocalQr().getCodigo(),
                c.getLocalQr() == null ? null : c.getLocalQr().getNome(), c.getLocalInformado(), c.getContato(),
                c.getTipoSugerido(), c.getPrioridadeSugerida(), c.getEquipeSugerida() == null ? null : c.getEquipeSugerida().getId(),
                c.getTipoConfirmado(), c.getPrioridadeConfirmada(), c.getEquipeConfirmada() == null ? null : c.getEquipeConfirmada().getId(),
                c.getDataCriacao(), midia == null ? null : new ChamadoResponse.Midia(midia.getId(), midia.getNome(), midia.getTipo(), midia.getTamanhoBytes()),
                tarefaId, c.getMotivoArquivamento(), historia);
    }

    private static ChamadoPublicoResponse respostaPublica(Chamado c) {
        return new ChamadoPublicoResponse(c.getId(), c.getProtocolo(), c.getStatus());
    }

    private static String obrigatorio(String valor, String mensagem, int max) {
        String v = opcional(valor, max);
        if (v == null) throw new DomainException(mensagem);
        return v;
    }

    private static String opcional(String valor, int max) {
        if (valor == null || valor.isBlank()) return null;
        String v = valor.trim();
        if (v.length() > max) throw new DomainException("Texto acima de %d caracteres.", max);
        return v;
    }

    private static String nomeSeguro(String nome) {
        if (nome == null) return "midia";
        String base = nome.substring(Math.max(nome.lastIndexOf('/'), nome.lastIndexOf('\\')) + 1)
                .replaceAll("[\\p{Cntrl}\"]", "");
        if (base.isBlank()) return "midia";
        return base.length() > 150 ? base.substring(base.length() - 150) : base;
    }

    private static String validarMidia(byte[] bytes) {
        if (bytes == null || bytes.length == 0) return null;
        if (bytes.length >= 3 && (bytes[0]&255)==255 && (bytes[1]&255)==216 && (bytes[2]&255)==255) {
            if (bytes.length > 5*1024*1024) throw new DomainException("A foto deve ter no máximo 5 MB.");
            return "image/jpeg";
        }
        if (bytes.length >= 8 && (bytes[0]&255)==137 && bytes[1]==80 && bytes[2]==78 && bytes[3]==71
                && bytes[4]==13 && bytes[5]==10 && bytes[6]==26 && bytes[7]==10) {
            if (bytes.length > 5*1024*1024) throw new DomainException("A foto deve ter no máximo 5 MB.");
            return "image/png";
        }
        if (bytes.length >= 12 && new String(bytes, 0, 4, StandardCharsets.US_ASCII).equals("RIFF")
                && new String(bytes, 8, 4, StandardCharsets.US_ASCII).equals("WEBP")) {
            if (bytes.length > 5*1024*1024) throw new DomainException("A foto deve ter no máximo 5 MB.");
            return "image/webp";
        }
        if (bytes.length >= 12 && new String(bytes, 4, 4, StandardCharsets.US_ASCII).equals("ftyp")) {
            if (bytes.length > 20*1024*1024) throw new DomainException("O vídeo deve ter no máximo 20 MB.");
            String marca = new String(bytes, 8, 4, StandardCharsets.US_ASCII);
            if (marca.equals("qt  ")) return "video/quicktime";
            if (marca.equals("isom") || marca.equals("iso2") || marca.equals("mp41") || marca.equals("mp42") || marca.equals("avc1")) return "video/mp4";
        }
        throw new DomainException("Envie uma foto JPG, PNG, WebP ou vídeo MP4, MOV.");
    }

    private static String assinatura(String descricao, String local, String contato, String codigo, byte[] midia) {
        try {
            var digest = MessageDigest.getInstance("SHA-256");
            for (String parte : new String[]{descricao, local, contato, codigo}) {
                byte[] data = parte == null ? new byte[0] : parte.getBytes(StandardCharsets.UTF_8);
                digest.update(ByteBuffer.allocate(4).putInt(data.length).array());
                digest.update(data);
            }
            if (midia != null) digest.update(midia);
            return HexFormat.of().formatHex(digest.digest());
        } catch (NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
    }

    public record MidiaPrivada(String nome, String tipo, byte[] conteudo) { }
}
