# QR Codes de demonstração

Esta pasta contém um PNG e um SVG para cada local cadastrado. Clique no arquivo no Explorador do VS Code para visualizar ou imprimir.

| Local | Arquivos | Parâmetro da URL |
|---|---|---|
| Banheiro Norte | `banheiro-norte.png` / `banheiro-norte.svg` | `local=banheiro-norte` |
| Praça de Alimentação | `praca-alimentacao.png` / `praca-alimentacao.svg` | `local=praca-alimentacao` |
| Entrada Principal | `entrada.png` / `entrada.svg` | `local=entrada` |

As URLs completas gravadas nos códigos estão em `enderecos.json`. Elas usam o IP Wi-Fi da máquina no momento da geração. Para usar no celular, deixe a aplicação acessível por esse IP e na porta 5173. O endereço pode mudar; gere novos códigos antes de imprimir para uso permanente.

Esses QR Codes de demonstração usam HTTP por IP. O botão **Abrir câmera** exige HTTPS no celular; nesses endereços de demonstração, use **Escolher arquivo** para anexar a foto. Para abrir a câmera diretamente, gere novos QR Codes com a URL HTTPS da aplicação.

Na raiz do projeto, o [README principal](../../../README.md#como-acessar-as-funções) explica como abrir o formulário público, a triagem e as tarefas. Para gerar códigos com outro domínio ou IP, execute na pasta `frontend`:

```bash
npm run qr:gerar -- --base-url https://seu-dominio.com --output ../docs/qrcodes/finais
```
