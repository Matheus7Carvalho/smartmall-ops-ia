package com.smartmall.ops.domain.model.usuario;

import com.smartmall.ops.domain.core.mapper.IBaseMapper;
import com.smartmall.ops.domain.entity.Usuario;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface IUsuarioMapper extends IBaseMapper<Usuario, UsuarioRequest, UsuarioResponse> {
}
