package com.smartmall.ops.domain.service.equipamento;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.core.service.BaseService;
import com.smartmall.ops.domain.entity.Equipamento;
import com.smartmall.ops.domain.repository.equipamento.EquipamentoRepository;
import com.smartmall.ops.domain.repository.estoque.MovimentacaoEstoqueRepository;
import com.smartmall.ops.domain.repository.manutencao.ManutencaoProgramadaRepository;
import com.smartmall.ops.domain.repository.piso.PisoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EquipamentoService extends BaseService<Equipamento> implements IEquipamentoService {

    private final PisoRepository pisoRepository;
    private final ManutencaoProgramadaRepository programadaRepository;
    private final MovimentacaoEstoqueRepository movimentacaoRepository;

    protected EquipamentoService(final EquipamentoRepository repository, final PisoRepository pisoRepository,
                                 final ManutencaoProgramadaRepository programadaRepository,
                                 final MovimentacaoEstoqueRepository movimentacaoRepository) {
        super(repository);
        this.pisoRepository = pisoRepository;
        this.programadaRepository = programadaRepository;
        this.movimentacaoRepository = movimentacaoRepository;
    }

    @Override
    @Transactional
    public Equipamento create(Equipamento equipamento) throws DomainException {
        preparar(equipamento);
        return super.create(equipamento);
    }

    @Override
    @Transactional
    public Equipamento update(Equipamento equipamento, String id) throws DomainException {
        preparar(equipamento);
        return super.update(equipamento, id);
    }

    @Override
    public void validate(Equipamento equipamento) throws DomainException {
        if (getRepository().existeCodigo(equipamento.getCodigo(), equipamento.getId())) {
            throw new DomainException("Já existe um equipamento com o código %s.", equipamento.getCodigo());
        }
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (programadaRepository.existsByEquipamentoId(id)) {
            throw new DomainException("Equipamento com manutenção programada não pode ser excluído.");
        }
        if (movimentacaoRepository.existsByEquipamentoId(id)) {
            throw new DomainException("Equipamento com movimentações de estoque não pode ser excluído.");
        }
        super.delete(id);
    }

    /** Normaliza textos e troca a referência de piso pela entidade real. */
    private void preparar(Equipamento equipamento) {
        if (equipamento.getCodigo() != null) equipamento.setCodigo(equipamento.getCodigo().trim().toUpperCase());
        if (equipamento.getNome() != null) equipamento.setNome(equipamento.getNome().trim());
        if (equipamento.getLocalizacao() != null) equipamento.setLocalizacao(equipamento.getLocalizacao().trim());
        var pisoId = equipamento.getPiso() == null ? null : equipamento.getPiso().getId();
        equipamento.setPiso(pisoId == null ? null : pisoRepository.findById(pisoId)
                .orElseThrow(() -> new DomainException("Piso não encontrado.")));
        if (equipamento.getPiso() == null) throw new DomainException("Selecione o piso.");
    }

    @Override
    public EquipamentoRepository getRepository() {
        return (EquipamentoRepository) super.getRepository();
    }
}
