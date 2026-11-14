package com.smartmall.ops.domain.service.usuario;

import com.smartmall.ops.domain.core.exception.DomainException;
import com.smartmall.ops.domain.core.service.BaseService;
import com.smartmall.ops.domain.entity.Usuario;
import com.smartmall.ops.domain.entity.enums.Perfil;
import com.smartmall.ops.domain.repository.usuario.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.text.Normalizer;

@Service
public class UsuarioService extends BaseService<Usuario> implements IUsuarioService {

    private final PasswordEncoder passwordEncoder;

    protected UsuarioService(final UsuarioRepository repository, final PasswordEncoder passwordEncoder) {
        super(repository);
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public Usuario create(Usuario usuario) throws DomainException {
        prepararDados(usuario);
        if (usuario.getAtivo() == null) usuario.setAtivo(true);
        validarSenhaNova(usuario.getSenha());
        usuario.setSenha(passwordEncoder.encode(usuario.getSenha()));
        return super.create(usuario);
    }

    @Override
    @Transactional
    public Usuario update(Usuario dados, String id) throws DomainException {
        Usuario existente = findById(id);
        prepararDados(dados);
        validarUltimoAdministrador(existente, dados.getPerfil(),
                dados.getAtivo() == null ? existente.getAtivo() : dados.getAtivo());
        existente.setNome(dados.getNome());
        existente.setEmail(dados.getEmail());
        existente.setPerfil(dados.getPerfil());
        if (dados.getAtivo() != null) existente.setAtivo(dados.getAtivo());
        if (dados.getSenha() != null && !dados.getSenha().isBlank()) {
            validarSenhaNova(dados.getSenha());
            existente.setSenha(passwordEncoder.encode(dados.getSenha()));
        }
        validate(existente);
        return getRepository().save(existente);
    }

    @Override
    @Transactional
    public Usuario atualizar(Usuario dados, String id, String autorId) {
        if (id.equals(autorId) && (dados.getPerfil() != Perfil.ADMINISTRADOR || Boolean.FALSE.equals(dados.getAtivo()))) {
            throw new DomainException("Você não pode remover o próprio acesso de administrador.");
        }
        return update(dados, id);
    }

    @Override
    @Transactional
    public void delete(String id) {
        Usuario usuario = findById(id);
        validarUltimoAdministrador(usuario, null, false);
        if (getRepository().possuiVinculos(id)) {
            throw new DomainException("Usuário vinculado a equipes ou tarefas não pode ser excluído. Desative o cadastro.");
        }
        getRepository().delete(usuario);
    }

    @Override
    @Transactional
    public void excluir(String id, String autorId) {
        if (id.equals(autorId)) {
            throw new DomainException("Você não pode excluir o próprio cadastro.");
        }
        delete(id);
    }

    @Override
    public Page<Usuario> filtrar(String nome, String email, Perfil perfil, Boolean ativo, Pageable pageable) {
        String nomeBusca = normalizar(nome);
        String emailBusca = normalizar(email);
        Sort sort = pageable.getSort().isSorted() ? pageable.getSort() : Sort.by("nome").ascending();
        List<Usuario> encontrados = getRepository().findAll(sort).stream()
                .filter(u -> normalizar(u.getNome()).contains(nomeBusca))
                .filter(u -> normalizar(u.getEmail()).contains(emailBusca))
                .filter(u -> perfil == null || u.getPerfil() == perfil)
                .filter(u -> ativo == null || ativo.equals(u.getAtivo()))
                .toList();
        int inicio = (int) Math.min(pageable.getOffset(), encontrados.size());
        int fim = Math.min(inicio + pageable.getPageSize(), encontrados.size());
        return new PageImpl<>(encontrados.subList(inicio, fim), pageable, encontrados.size());
    }

    private String normalizar(String texto) {
        if (texto == null) return "";
        return Normalizer.normalize(texto, Normalizer.Form.NFD)
                .replaceAll("\\p{M}+", "")
                .toLowerCase(Locale.ROOT)
                .trim();
    }

    private void prepararDados(Usuario usuario) {
        if (usuario.getNome() != null) usuario.setNome(usuario.getNome().trim());
        if (usuario.getEmail() != null) usuario.setEmail(usuario.getEmail().trim().toLowerCase(Locale.ROOT));
    }

    private void validarSenhaNova(String senha) {
        if (senha == null || senha.isBlank() || senha.length() < 6 || senha.length() > 72) {
            throw new DomainException("A senha deve ter entre 6 e 72 caracteres.");
        }
    }

    private void validarUltimoAdministrador(Usuario atual, Perfil novoPerfil, Boolean novoAtivo) {
        if (atual.getPerfil() == Perfil.ADMINISTRADOR && Boolean.TRUE.equals(atual.getAtivo())
                && (novoPerfil != Perfil.ADMINISTRADOR || !Boolean.TRUE.equals(novoAtivo))
                && getRepository().countByPerfilAndAtivoTrue(Perfil.ADMINISTRADOR) <= 1) {
            throw new DomainException("O último administrador ativo não pode ser desativado, alterado ou excluído.");
        }
    }

    @Override
    public void validate(Usuario usuario) throws DomainException {
        if (getRepository().existeEmail(usuario.getEmail(), usuario.getId())) {
            throw new DomainException("Já existe um usuário com o e-mail %s.", usuario.getEmail());
        }
    }

    @Override
    public Optional<Usuario> buscarPorEmail(String email) {
        return getRepository().findByEmailIgnoreCase(email);
    }

    @Override
    public List<Usuario> funcionariosAtivos() {
        return getRepository().findByPerfilAndAtivoTrueOrderByNome(Perfil.FUNCIONARIO);
    }

    @Override
    public UsuarioRepository getRepository() {
        return (UsuarioRepository) super.getRepository();
    }
}
