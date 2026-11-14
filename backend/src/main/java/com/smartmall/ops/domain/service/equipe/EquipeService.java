package com.smartmall.ops.domain.service.equipe;

import com.smartmall.ops.domain.core.entity.BaseEntity;
import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.core.service.BaseService;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.repository.equipe.EquipeRepository;
import com.smartmall.ops.domain.repository.manutencao.ManutencaoProgramadaRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.Objects;

@Service
public class EquipeService extends BaseService<Equipe> implements IEquipeService {

    private final UsuarioRepository usuarioRepository;
    private final ManutencaoProgramadaRepository programadaRepository;

    protected EquipeService(final EquipeRepository repository, final UsuarioRepository usuarioRepository,
                            final ManutencaoProgramadaRepository programadaRepository) {
        super(repository);
        this.usuarioRepository = usuarioRepository;
        this.programadaRepository = programadaRepository;
    }

    @Override
    @Transactional
    public Equipe create(Equipe equipe) throws DomainException {
        preparar(equipe);
        return super.create(equipe);
    }

    @Override
    @Transactional
    public Equipe update(Equipe equipe, String id) throws DomainException {
        preparar(equipe);
        return super.update(equipe, id);
    }

    @Override
    public void validate(Equipe equipe) throws DomainException {
        if (getRepository().existeNome(equipe.getNome(), equipe.getId())) {
            throw new DomainException("Já existe uma equipe com o nome %s.", equipe.getNome());
        }
    }

    @Override
    @Transactional
    public void delete(String id) {
        if (programadaRepository.existsByEquipeId(id)) {
            throw new DomainException("Equipe com manutenção programada não pode ser excluída.");
        }
        super.delete(id);
    }

    /** Troca as referências de membros pelos usuários reais; só Funcionários ativos podem ser membros. */
    private void preparar(Equipe equipe) {
        if (equipe.getNome() != null) equipe.setNome(equipe.getNome().trim());
        var ids = new LinkedHashSet<String>();
        equipe.getMembros().stream().filter(Objects::nonNull).map(BaseEntity::getId).forEach(ids::add);
        var usuarios = usuarioRepository.findAllById(ids);
        if (usuarios.size() != ids.size()) {
            throw new DomainException("Membro não encontrado.");
        }
        for (Usuario usuario : usuarios) {
            if (usuario.getPerfil() != Perfil.FUNCIONARIO || !Boolean.TRUE.equals(usuario.getAtivo())) {
                throw new DomainException("%s não pode ser membro: só funcionários ativos.", usuario.getNome());
            }
        }
        equipe.setMembros(new ArrayList<>(usuarios));
    }

    @Override
    public EquipeRepository getRepository() {
        return (EquipeRepository) super.getRepository();
    }
}
