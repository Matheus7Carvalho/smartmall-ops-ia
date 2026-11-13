# SmartMall Ops AI — Cadastro de ocorrência

Entrega local de uma única tela estática em **HTML5** para cadastro de ocorrência, guiada pelos protótipos de média fidelidade fornecidos. A identidade visual usa azul-marinho com degradês para azul-claro e a logo oficial do SmartMall Ops IA.

## Incluído

- Navegação lateral e barra de contexto operacional;
- Etapas de cadastro: registro, análise assistida e confirmação humana;
- Evidência visual demonstrativa, descrição, local e informação adicional;
- Avisos de privacidade, dados sintéticos e revisão humana.

## Visualização local

Com Python instalado, execute na pasta deste projeto:

```powershell
python -m http.server 4173 --directory dist
```

Abra `http://127.0.0.1:4173/`. Nenhum dado é enviado para fora do computador e esta versão não possui integração, persistência nem envio de formulário.
