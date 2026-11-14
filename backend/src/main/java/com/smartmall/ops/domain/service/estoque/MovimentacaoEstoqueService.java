package com.smartmall.ops.domain.service.estoque;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.MovimentacaoEstoque;
import com.smartmall.ops.domain.entity.enums.TipoMovimentacao;
import com.smartmall.ops.domain.model.estoque.FiltroMovimentacoes;
import com.smartmall.ops.domain.model.estoque.MovimentacaoRequest;
import com.smartmall.ops.domain.model.estoque.MovimentacaoResponse;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.estoque.ItemEstoqueRepository;
import com.smartmall.ops.domain.repository.estoque.MovimentacaoEstoqueRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class MovimentacaoEstoqueService implements IMovimentacaoEstoqueService {

    /** Período máximo do histórico geral (um ano, contando ano bissexto). */
    public static final int MAX_DIAS = 366;

    private final ItemEstoqueRepository itemRepository;
    private final MovimentacaoEstoqueRepository repository;
    private final EquipamentoRepository equipamentoRepository;
    private final UsuarioRepository usuarioRepository;
    private final Clock clock;

    public MovimentacaoEstoqueService(ItemEstoqueRepository itemRepository, MovimentacaoEstoqueRepository repository,
                                      EquipamentoRepository equipamentoRepository, UsuarioRepository usuarioRepository, Clock clock) {
        this.itemRepository = itemRepository;
        this.repository = repository;
        this.equipamentoRepository = equipamentoRepository;
        this.usuarioRepository = usuarioRepository;
        this.clock = clock;
    }

    @Override
    @Transactional
    public MovimentacaoResponse movimentar(String itemId, TipoMovimentacao tipo, MovimentacaoRequest request, String usuarioId) {
        var item = itemRepository.buscarParaMovimentar(itemId).orElseThrow(() -> new DomainException("Item não encontrado."));
        int quantidade = request.getQuantidade();
        int saldo = tipo == TipoMovimentacao.ENTRADA ? item.getSaldo() + quantidade : item.getSaldo() - quantidade;
        if (saldo < 0) {
            throw new DomainException("Saldo insuficiente: há %d disponível.", item.getSaldo());
        }
        var equipamentoId = request.getEquipamentoId();
        var equipamento = equipamentoId == null || equipamentoId.isBlank() ? null
                : equipamentoRepository.findById(equipamentoId).orElseThrow(() -> new DomainException("Equipamento não encontrado."));

        item.setSaldo(saldo);
        itemRepository.save(item);

        var m = new MovimentacaoEstoque();
        m.setItem(item);
        m.setTipo(tipo);
        m.setQuantidade(quantidade);
        m.setSaldoApos(saldo);
        m.setDataHora(LocalDateTime.now(clock));
        m.setUsuario(usuarioRepository.getReferenceById(usuarioId));
        m.setEquipamento(equipamento);
        m.setObservacao(request.getObservacao() == null || request.getObservacao().isBlank() ? null : request.getObservacao().trim());
        return MovimentacaoResponse.de(repository.save(m));
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimentacaoResponse> doItem(String itemId) {
        if (!itemRepository.existsById(itemId)) throw new DomainException("Item não encontrado.");
        return repository.findByItemIdOrderByDataHoraDescDataCriacaoDesc(itemId).stream().map(MovimentacaoResponse::de).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimentacaoResponse> buscar(FiltroMovimentacoes filtro) {
        if (filtro.getAte().isBefore(filtro.getDe())) {
            throw new DomainException("A data final não pode ser antes da inicial.");
        }
        if (ChronoUnit.DAYS.between(filtro.getDe(), filtro.getAte()) >= MAX_DIAS) {
            throw new DomainException("Consulte no máximo %d dias por vez.", MAX_DIAS);
        }
        return repository.buscar(filtro.getDe().atStartOfDay(), filtro.getAte().plusDays(1).atStartOfDay(),
                        vazioParaNulo(filtro.getItemId()), vazioParaNulo(filtro.getEquipamentoId()), filtro.getTipo())
                .stream().map(MovimentacaoResponse::de).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovimentacaoResponse.Resumo> destinos() {
        return equipamentoRepository.findAll(Sort.by("codigo")).stream()
                .map(e -> new MovimentacaoResponse.Resumo(e.getId(), e.getCodigo(), e.getNome()))
                .toList();
    }

    private static String vazioParaNulo(String texto) {
        return texto == null || texto.isBlank() ? null : texto;
    }
}
