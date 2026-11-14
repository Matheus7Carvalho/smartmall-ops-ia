package com.smartmall.ops.domain.model.estoque;

import com.smartmall.ops.domain.core.mapper.IBaseMapper;
import com.smartmall.ops.domain.entity.ItemEstoque;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface IItemEstoqueMapper extends IBaseMapper<ItemEstoque, ItemEstoqueRequest, ItemEstoqueResponse> {

    @Override
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "saldo", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    ItemEstoque fromRequest(ItemEstoqueRequest request);
}
