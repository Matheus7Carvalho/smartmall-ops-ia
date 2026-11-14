package com.smartmall.ops.domain.repository.equipe;

import com.smartmall.ops.domain.core.repository.BaseRepository;
import com.smartmall.ops.domain.entity.Equipe;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface EquipeRepository extends BaseRepository<Equipe> {

    /** Nome já usado por outra equipe. id nulo = cadastro novo. */
    @Query("select count(e) > 0 from Equipe e where lower(e.nome) = lower(:nome) and (:id is null or e.id <> :id)")
    boolean existeNome(String nome, String id);
}
