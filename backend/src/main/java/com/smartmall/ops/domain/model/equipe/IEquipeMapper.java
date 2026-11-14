package com.smartmall.ops.domain.model.equipe;

import com.smartmall.ops.domain.core.mapper.IBaseMapper;
import com.smartmall.ops.domain.core.mapper.Referencias;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.Usuario;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface IEquipeMapper extends IBaseMapper<Equipe, EquipeRequest, EquipeResponse> {

    @Override
    @Mapping(target = "membros", source = "membrosIds")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    Equipe fromRequest(EquipeRequest request);

    EquipeResponse.Membro toMembro(Usuario usuario);

    default Usuario usuario(String id) {
        return Referencias.porId(id, Usuario::new);
    }
}
