package com.smartmall.ops.domain.model.checklist;

import com.smartmall.ops.domain.core.mapper.IBaseMapper;
import com.smartmall.ops.domain.entity.Checklist;
import com.smartmall.ops.domain.entity.ChecklistItem;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;

@Mapper(componentModel = "spring")
public interface IChecklistMapper extends IBaseMapper<Checklist, ChecklistRequest, ChecklistResponse> {

    @Override
    @Mapping(target = "itens", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    Checklist fromRequest(ChecklistRequest request);

    @Mapping(target = "checklist", ignore = true)
    @Mapping(target = "ordem", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "dataCriacao", ignore = true)
    @Mapping(target = "dataAtualizacao", ignore = true)
    ChecklistItem fromItemRequest(ChecklistItemRequest request);

    List<ChecklistItem> fromItensRequest(List<ChecklistItemRequest> itens);

    ChecklistItemResponse toItemResponse(ChecklistItem item);

    /** Liga cada item ao checklist (lado dono da relação). A ordem é definida no serviço. */
    @AfterMapping
    default void vincularItens(ChecklistRequest request, @MappingTarget Checklist checklist) {
        checklist.substituirItens(fromItensRequest(request.getItens()));
    }
}
