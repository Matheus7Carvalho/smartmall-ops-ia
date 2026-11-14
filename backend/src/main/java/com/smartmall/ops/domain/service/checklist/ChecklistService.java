package com.smartmall.ops.domain.service.checklist;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.core.service.BaseService;
import com.smartmall.ops.domain.entity.Checklist;
import com.smartmall.ops.domain.entity.ChecklistItem;
import com.smartmall.ops.domain.entity.enums.TipoResposta;
import com.smartmall.ops.domain.repository.checklist.ChecklistRepository;
import com.smartmall.ops.domain.repository.manutencao.ManutencaoProgramadaRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
public class ChecklistService extends BaseService<Checklist> implements IChecklistService {

    public static final int MAX_ITENS = 50;
    public static final int MAX_CARACTERES_TEXTO = 500;

    private final ManutencaoProgramadaRepository programadaRepository;

    protected ChecklistService(final ChecklistRepository repository, final ManutencaoProgramadaRepository programadaRepository) {
        super(repository);
        this.programadaRepository = programadaRepository;
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (programadaRepository.existsByChecklistId(id)) {
            throw new DomainException("Modelo de checklist usado em manutenção programada não pode ser excluído.");
        }
        super.delete(id);
    }

    @Override
    @Transactional
    public Checklist create(Checklist checklist) throws DomainException {
        normalizar(checklist);
        return super.create(checklist);
    }

    /** Substitui nome e itens. Itens removidos são apagados (orphanRemoval). */
    @Override
    @Transactional
    public Checklist update(Checklist alterado, String id) throws DomainException {
        var existente = getRepository().findById(id).orElseThrow(() -> new EntityNotFoundException("Item não encontrado."));
        existente.setNome(alterado.getNome());
        existente.substituirItens(new ArrayList<>(alterado.getItens()));
        normalizar(existente);
        validate(existente);
        return getRepository().save(existente);
    }

    @Override
    public void validate(Checklist checklist) throws DomainException {
        if (checklist.getNome() == null || checklist.getNome().isBlank()) {
            throw new DomainException("Informe o nome.");
        }
        if (checklist.getItens().isEmpty()) {
            throw new DomainException("Adicione pelo menos um item.");
        }
        if (checklist.getItens().size() > MAX_ITENS) {
            throw new DomainException("O checklist pode ter até %d itens.", MAX_ITENS);
        }
        for (ChecklistItem item : checklist.getItens()) {
            if (item.getTipoResposta() == TipoResposta.TEXTO) {
                var max = item.getMaxCaracteres();
                if (max == null || max < 1 || max > MAX_CARACTERES_TEXTO) {
                    throw new DomainException("Item %d: o máximo de caracteres deve ser entre 1 e %d.", item.getOrdem(), MAX_CARACTERES_TEXTO);
                }
            }
        }
    }

    /** Ordem segue a posição na lista; máximo de caracteres só vale para TEXTO. */
    private void normalizar(Checklist checklist) {
        if (checklist.getNome() != null) checklist.setNome(checklist.getNome().trim());
        var ordem = 1;
        for (ChecklistItem item : checklist.getItens()) {
            item.setOrdem(ordem++);
            item.setPergunta(item.getPergunta() == null ? null : item.getPergunta().trim());
            if (item.getObrigatorio() == null) item.setObrigatorio(Boolean.TRUE);
            if (item.getTipoResposta() != TipoResposta.TEXTO) item.setMaxCaracteres(null);
        }
    }

    @Override
    public ChecklistRepository getRepository() {
        return (ChecklistRepository) super.getRepository();
    }
}
