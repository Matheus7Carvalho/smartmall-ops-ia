package com.smartmall.ops.domain.service.equipe;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Equipe;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.repository.equipe.EquipeRepository;
import com.smartmall.ops.domain.repository.manutencao.ManutencaoProgramadaRepository;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EquipeServiceTest {

    @Mock private EquipeRepository repository;
    @Mock private UsuarioRepository usuarioRepository;
    @Mock private ManutencaoProgramadaRepository programadaRepository;

    private EquipeService service;

    @BeforeEach
    void setUp() {
        service = new EquipeService(repository, usuarioRepository, programadaRepository);
        lenient().when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
    }

    private static Usuario usuario(String id, String nome, Perfil perfil, boolean ativo) {
        var u = new Usuario(nome, id + "@smartmall.local", "hash", perfil, ativo);
        u.setId(id);
        return u;
    }

    private static Equipe equipe(String nome, String... membros) {
        return new Equipe(nome, java.util.Arrays.stream(membros).map(id -> {
            var ref = new Usuario();
            ref.setId(id);
            return ref;
        }).toList());
    }

    @Test
    void criaComMembrosResolvidosEIgnoraRepetidos() {
        var joao = usuario("u1", "João Costa", Perfil.FUNCIONARIO, true);
        when(usuarioRepository.findAllById(Set.of("u1"))).thenReturn(List.of(joao));

        var salva = service.create(equipe(" Climatização ", "u1", "u1"));

        assertThat(salva.getNome()).isEqualTo("Climatização");
        assertThat(salva.getMembros()).containsExactly(joao);
    }

    @Test
    void equipeSemMembrosEhPermitida() {
        when(usuarioRepository.findAllById(Set.of())).thenReturn(List.of());

        assertThat(service.create(equipe("Segurança")).getMembros()).isEmpty();
    }

    @Test
    void membroQueNaoEhFuncionarioEhRecusado() {
        when(usuarioRepository.findAllById(Set.of("u2"))).thenReturn(List.of(usuario("u2", "Ana Souza", Perfil.SUPERVISOR, true)));

        assertThatThrownBy(() -> service.create(equipe("Climatização", "u2")))
                .isInstanceOf(DomainException.class)
                .hasMessage("Ana Souza não pode ser membro: só funcionários ativos.");
    }

    @Test
    void funcionarioInativoEhRecusado() {
        when(usuarioRepository.findAllById(Set.of("u1"))).thenReturn(List.of(usuario("u1", "João Costa", Perfil.FUNCIONARIO, false)));

        assertThatThrownBy(() -> service.create(equipe("Climatização", "u1")))
                .isInstanceOf(DomainException.class)
                .hasMessage("João Costa não pode ser membro: só funcionários ativos.");
    }

    @Test
    void membroInexistenteEhRecusado() {
        when(usuarioRepository.findAllById(Set.of("x"))).thenReturn(List.of());

        assertThatThrownBy(() -> service.create(equipe("Climatização", "x")))
                .isInstanceOf(DomainException.class)
                .hasMessage("Membro não encontrado.");
    }

    @Test
    void nomeDuplicadoEhRecusado() {
        when(usuarioRepository.findAllById(Set.of())).thenReturn(List.of());
        when(repository.existeNome("Hidráulica", null)).thenReturn(true);

        assertThatThrownBy(() -> service.create(equipe("Hidráulica")))
                .isInstanceOf(DomainException.class)
                .hasMessage("Já existe uma equipe com o nome Hidráulica.");
    }

    @Test
    void equipeComPlanoNaoPodeSerExcluida() {
        when(programadaRepository.existsByEquipeId("t1")).thenReturn(true);

        assertThatThrownBy(() -> service.delete("t1"))
                .isInstanceOf(DomainException.class)
                .hasMessage("Equipe com manutenção programada não pode ser excluída.");
        verify(repository, never()).deleteById(any());
    }
}
