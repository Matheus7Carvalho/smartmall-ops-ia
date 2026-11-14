package com.smartmall.ops.domain.model.equipamento;

import com.smartmall.ops.domain.core.mapper.IBaseMapper;
import com.smartmall.ops.domain.core.mapper.Referencias;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.entity.Piso;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface IEquipamentoMapper extends IBaseMapper<Equipamento, EquipamentoRequest, EquipamentoResponse> {

    @Override
    @Mapping(target = "piso", source = "pisoId")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    Equipamento fromRequest(EquipamentoRequest request);

    @Override
    @Mapping(target = "pisoId", source = "piso.id")
    @Mapping(target = "pisoNome", source = "piso.nome")
    EquipamentoResponse toResponse(Equipamento equipamento);

    default Piso piso(String id) {
        return Referencias.porId(id, Piso::new);
    }
}
