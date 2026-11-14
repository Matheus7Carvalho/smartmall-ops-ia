package com.smartmall.ops.domain.model;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Size;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.ClassPathScanningCandidateComponentProvider;
import org.springframework.core.type.filter.RegexPatternTypeFilter;

import java.lang.reflect.AnnotatedType;
import java.lang.reflect.Field;
import java.lang.reflect.Modifier;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Guarda: todo campo de entrada da API precisa de limite.
 * Texto e coleções exigem @Size(max); números exigem @Max/@DecimalMax.
 * Sem isso, um valor gigante passa pela validação e estoura no banco (erro 500) ou trava a tela.
 */
class LimitesDosRequestsTest {

    private static final String PACOTE = "com.smartmall.ops.domain";

    private static List<Class<?>> requests() throws ClassNotFoundException {
        var scanner = new ClassPathScanningCandidateComponentProvider(false);
        scanner.addIncludeFilter(new RegexPatternTypeFilter(Pattern.compile(".*Request$")));
        var classes = new ArrayList<Class<?>>();
        for (var bean : scanner.findCandidateComponents(PACOTE)) {
            classes.add(Class.forName(bean.getBeanClassName()));
        }
        return classes;
    }

    private static boolean temSizeMax(AnnotatedType tipo, Field campo) {
        var size = campo.getAnnotation(Size.class);
        if (size == null) size = tipo.getAnnotation(Size.class);
        return size != null && size.max() < Integer.MAX_VALUE;
    }

    private static String problema(Field campo) {
        Class<?> tipo = campo.getType();
        if (tipo == String.class && !temSizeMax(campo.getAnnotatedType(), campo)) return "texto sem @Size(max)";
        if (Collection.class.isAssignableFrom(tipo) && !temSizeMax(campo.getAnnotatedType(), campo)) return "lista sem @Size(max)";
        boolean numero = Number.class.isAssignableFrom(tipo) || (tipo.isPrimitive() && tipo != boolean.class && tipo != char.class);
        boolean comMax = campo.isAnnotationPresent(Max.class) || campo.isAnnotationPresent(DecimalMax.class);
        if (numero && !comMax) return "número sem @Max";
        if (tipo == BigDecimal.class && !campo.isAnnotationPresent(DecimalMax.class)) return "decimal sem @DecimalMax";
        return null;
    }

    @Test
    void encontraOsRequests() throws Exception {
        assertThat(requests()).extracting(Class::getSimpleName)
                .contains("LoginRequest", "ChecklistRequest", "ChecklistItemRequest", "PisoRequest", "UsuarioRequest");
    }

    @Test
    void todoCampoDeEntradaTemLimite() throws Exception {
        var faltando = new ArrayList<String>();
        for (Class<?> classe : requests()) {
            for (Field campo : classe.getDeclaredFields()) {
                if (Modifier.isStatic(campo.getModifiers())) continue;
                var erro = problema(campo);
                if (erro != null) faltando.add(classe.getSimpleName() + "." + campo.getName() + ": " + erro);
            }
        }

        assertThat(faltando).as("Campos de entrada sem limite").isEmpty();
    }
}
