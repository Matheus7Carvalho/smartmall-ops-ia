package com.smartmall.ops.domain.service.usuario;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class UsuarioServiceTest {

    @Mock
    private UsuarioRepository repository;

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    private UsuarioService service;

    @BeforeEach
    void setUp() {
        service = new UsuarioService(repository, encoder);
    }

    @Test
    void gravaSenhaComoHash() {
        when(repository.existeEmail("novo@smartmall.local", null)).thenReturn(false);
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var salvo = service.create(new Usuario("Novo", "novo@smartmall.local", "segredo1", Perfil.FUNCIONARIO, true));

        assertThat(salvo.getSenha()).isNotEqualTo("segredo1");
        assertThat(encoder.matches("segredo1", salvo.getSenha())).isTrue();
    }

    @Test
    void rejeitaEmailDuplicado() {
        when(repository.existeEmail("admin@smartmall.local", null)).thenReturn(true);

        assertThatThrownBy(() -> service.create(new Usuario("X", "admin@smartmall.local", "segredo1", Perfil.ADMINISTRADOR, true)))
                .isInstanceOf(DomainException.class)
                .hasMessage("Já existe um usuário com o e-mail admin@smartmall.local.");

        verify(repository, never()).save(any());
    }

    @Test
    void buscaPorEmailIgnorandoMaiusculas() {
        var usuario = new Usuario("Ana Souza", "supervisor@smartmall.local", "hash", Perfil.SUPERVISOR, true);
        when(repository.findByEmailIgnoreCase("SUPERVISOR@smartmall.local")).thenReturn(Optional.of(usuario));

        assertThat(service.buscarPorEmail("SUPERVISOR@smartmall.local")).contains(usuario);
    }

    @Test
    void buscaPorEmailInexistenteRetornaVazio() {
        when(repository.findByEmailIgnoreCase("ninguem@smartmall.local")).thenReturn(Optional.empty());

        assertThat(service.buscarPorEmail("ninguem@smartmall.local")).isEmpty();
    }

    @Test
    void exigeSenhaNoCadastro() {
        assertThatThrownBy(() -> service.create(new Usuario("Novo", "novo@smartmall.local", null, Perfil.FUNCIONARIO, true)))
                .isInstanceOf(DomainException.class)
                .hasMessage("A senha deve ter entre 6 e 72 caracteres.");
        verify(repository, never()).save(any());
    }

    @Test
    void editaSemTrocarSenhaQuandoCampoVazio() {
        var existente = new Usuario("Ana", "ana@smartmall.local", encoder.encode("segredo1"), Perfil.FUNCIONARIO, true);
        existente.setId("usuario-1");
        String hashAnterior = existente.getSenha();
        when(repository.findById("usuario-1")).thenReturn(Optional.of(existente));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var atualizado = service.update(new Usuario("Ana Souza", " ANA@SMARTMALL.LOCAL ", "", Perfil.SUPERVISOR, true), "usuario-1");

        assertThat(atualizado.getNome()).isEqualTo("Ana Souza");
        assertThat(atualizado.getEmail()).isEqualTo("ana@smartmall.local");
        assertThat(atualizado.getPerfil()).isEqualTo(Perfil.SUPERVISOR);
        assertThat(atualizado.getSenha()).isEqualTo(hashAnterior);
    }

    @Test
    void editaTrocandoSenhaComHash() {
        var existente = new Usuario("Ana", "ana@smartmall.local", encoder.encode("segredo1"), Perfil.FUNCIONARIO, true);
        existente.setId("usuario-1");
        when(repository.findById("usuario-1")).thenReturn(Optional.of(existente));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        var atualizado = service.update(new Usuario("Ana", "ana@smartmall.local", "segredo2", Perfil.FUNCIONARIO, true), "usuario-1");

        assertThat(encoder.matches("segredo2", atualizado.getSenha())).isTrue();
        assertThat(atualizado.getSenha()).isNotEqualTo("segredo2");
    }

    @Test
    void naoRemoveUltimoAdministradorAtivo() {
        var existente = new Usuario("Admin", "admin@smartmall.local", "hash", Perfil.ADMINISTRADOR, true);
        existente.setId("admin-1");
        when(repository.findById("admin-1")).thenReturn(Optional.of(existente));
        when(repository.countByPerfilAndAtivoTrue(Perfil.ADMINISTRADOR)).thenReturn(1L);

        assertThatThrownBy(() -> service.update(new Usuario("Admin", "admin@smartmall.local", null, Perfil.ADMINISTRADOR, false), "admin-1"))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("último administrador ativo");
        verify(repository, never()).save(any());
    }

    @Test
    void orientaDesativacaoQuandoUsuarioTemVinculos() {
        var existente = new Usuario("Ana", "ana@smartmall.local", "hash", Perfil.FUNCIONARIO, true);
        existente.setId("usuario-1");
        when(repository.findById("usuario-1")).thenReturn(Optional.of(existente));
        when(repository.possuiVinculos("usuario-1")).thenReturn(true);

        assertThatThrownBy(() -> service.delete("usuario-1"))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("Desative o cadastro");
        verify(repository, never()).delete(any(Usuario.class));
    }

    @Test
    void filtraNomeSemDiferenciarAcentosEPaginaResultado() {
        var jose = new Usuario("José Almeida", "jose@smartmall.local", "hash", Perfil.FUNCIONARIO, true);
        var joana = new Usuario("Joana", "joana@smartmall.local", "hash", Perfil.SUPERVISOR, true);
        var joseInativo = new Usuario("José Pereira", "jose.p@smartmall.local", "hash", Perfil.FUNCIONARIO, false);
        when(repository.findAll(any(Sort.class))).thenReturn(List.of(joana, jose, joseInativo));

        var pagina = service.filtrar("jose", "smartmall", Perfil.FUNCIONARIO, true, PageRequest.of(0, 1));

        assertThat(pagina.getTotalElements()).isEqualTo(1);
        assertThat(pagina.getContent()).containsExactly(jose);
    }

    @Test
    void impedeRemoverProprioAcesso() {
        assertThatThrownBy(() -> service.atualizar(
                new Usuario("Admin", "admin@smartmall.local", null, Perfil.FUNCIONARIO, true), "admin-1", "admin-1"))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("próprio acesso");
        assertThatThrownBy(() -> service.excluir("admin-1", "admin-1"))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("próprio cadastro");
        verifyNoInteractions(repository);
    }

    @Test
    void impedeExcluirUltimoAdministradorAtivo() {
        var existente = new Usuario("Admin", "admin@smartmall.local", "hash", Perfil.ADMINISTRADOR, true);
        existente.setId("admin-1");
        when(repository.findById("admin-1")).thenReturn(Optional.of(existente));
        when(repository.countByPerfilAndAtivoTrue(Perfil.ADMINISTRADOR)).thenReturn(1L);

        assertThatThrownBy(() -> service.excluir("admin-1", "outro-admin"))
                .isInstanceOf(DomainException.class)
                .hasMessageContaining("último administrador ativo");
        verify(repository, never()).delete(any(Usuario.class));
    }
}
