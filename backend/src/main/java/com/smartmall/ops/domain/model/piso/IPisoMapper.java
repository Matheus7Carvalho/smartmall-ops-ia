package com.smartmall.ops.domain.model.piso;

import com.smartmall.ops.domain.core.mapper.IBaseMapper;
import com.smartmall.ops.domain.entity.Piso;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface IPisoMapper extends IBaseMapper<Piso, PisoRequest, PisoResponse> {
}
