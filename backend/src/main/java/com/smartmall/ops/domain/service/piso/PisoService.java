package com.smartmall.ops.domain.service.piso;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.core.service.BaseService;
import com.smartmall.ops.domain.entity.Piso;
import com.smartmall.ops.domain.repository.piso.PisoRepository;
import org.springframework.stereotype.Service;

@Service
public class PisoService extends BaseService<Piso> implements IPisoService {

    protected PisoService(final PisoRepository repository) {
        super(repository);
    }

    @Override
    public void validate(Piso piso) throws DomainException {
        if (getRepository().existeCodigo(piso.getCodigo(), piso.getId())) {
            throw new DomainException("Já existe um piso com o código %s.", piso.getCodigo());
        }
    }

    @Override
    public PisoRepository getRepository() {
        return (PisoRepository) super.getRepository();
    }
}
