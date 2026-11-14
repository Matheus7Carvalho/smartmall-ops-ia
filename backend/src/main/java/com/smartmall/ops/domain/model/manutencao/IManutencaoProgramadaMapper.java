package com.smartmall.ops.domain.model.manutencao;

import com.smartmall.ops.domain.core.model.Resumo;
import com.smartmall.ops.domain.core.mapper.IBaseMapper;
import com.smartmall.ops.domain.core.mapper.Referencias;
import com.smartmall.ops.domain.entity.Checklist;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.ManutencaoProgramada;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface IManutencaoProgramadaMapper extends IBaseMapper<ManutencaoProgramada, ManutencaoProgramadaRequest, ManutencaoProgramadaResponse> {

    @Override
    @Mapping(target = "equipamento", source = "equipamentoId")
    @Mapping(target = "checklist", source = "checklistId")
    @Mapping(target = "equipe", source = "equipeId")
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "geradoAte", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    ManutencaoProgramada fromRequest(ManutencaoProgramadaRequest request);

    @Override
    @Mapping(target = "proximaData", ignore = true)
    ManutencaoProgramadaResponse toResponse(ManutencaoProgramada programada);

    default Resumo resumo(Equipamento e) {
        return e == null ? null : new Resumo(e.getId(), e.getNome(), e.getCodigo());
    }

    default Resumo resumo(Checklist c) {
        return c == null ? null : new Resumo(c.getId(), c.getNome(), null);
    }

    default Resumo resumo(Equipe e) {
        return e == null ? null : new Resumo(e.getId(), e.getNome(), null);
    }

    default Equipamento equipamento(String id) {
        return Referencias.porId(id, Equipamento::new);
    }

    default Checklist checklist(String id) {
        return Referencias.porId(id, Checklist::new);
    }

    default Equipe equipe(String id) {
        return Referencias.porId(id, Equipe::new);
    }
}
