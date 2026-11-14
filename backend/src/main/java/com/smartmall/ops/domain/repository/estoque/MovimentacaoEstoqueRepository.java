package com.smartmall.ops.domain.repository.estoque;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.MovimentacaoEstoque;
import com.smartmall.ops.domain.entity.enums.TipoMovimentacao;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MovimentacaoEstoqueRepository extends BaseRepository<MovimentacaoEstoque> {

    boolean existsByItemId(String itemId);

    boolean existsByEquipamentoId(String equipamentoId);

    /** Rastreabilidade do item: da mais recente para a mais antiga. */
    List<MovimentacaoEstoque> findByItemIdOrderByDataHoraDescDataCriacaoDesc(String itemId);

    /** Histórico geral em [de, ate). Filtros nulos são ignorados. */
    @Query("""
            select m from MovimentacaoEstoque m
            where m.dataHora >= :de and m.dataHora < :ate
              and (:itemId is null or m.item.id = :itemId)
              and (:equipamentoId is null or m.equipamento.id = :equipamentoId)
              and (:tipo is null or m.tipo = :tipo)
            order by m.dataHora desc, m.dataCriacao desc
            """)
    List<MovimentacaoEstoque> buscar(LocalDateTime de, LocalDateTime ate, String itemId, String equipamentoId, TipoMovimentacao tipo);

    @Modifying
    @Query("delete from MovimentacaoEstoque m where m.item.id = :itemId")
    void excluirDoItem(String itemId);
}
