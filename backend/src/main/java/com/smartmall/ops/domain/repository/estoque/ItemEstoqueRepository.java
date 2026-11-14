package com.smartmall.ops.domain.repository.estoque;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.ItemEstoque;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemEstoqueRepository extends BaseRepository<ItemEstoque> {

    /** Código já usado por outro item. id nulo = cadastro novo. */
    @Query("select count(i) > 0 from ItemEstoque i where lower(i.codigo) = lower(:codigo) and (:id is null or i.id <> :id)")
    boolean existeCodigo(String codigo, String id);

    /** Bloqueia a linha até o fim da transação: duas retiradas simultâneas não deixam o saldo negativo. */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select i from ItemEstoque i where i.id = :id")
    Optional<ItemEstoque> buscarParaMovimentar(String id);

    List<ItemEstoque> findByCodigo(String codigo);
}
