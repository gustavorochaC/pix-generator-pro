# Gerador de Pix

Gerador de códigos Pix e QR Codes de pagamento instantâneo. Crie cobranças com validade personalizada e compartilhe facilmente.

![Uploading pix.png…]()


## Características

- Geração de QR Codes Pix estáticos seguindo o padrão EMV
- Suporte a todos os tipos de chave Pix (CPF, CNPJ, e-mail, telefone, chave aleatória)
- Cálculo automático de CRC16 para validação dos códigos
- Interface moderna e responsiva
- Validade configurável dos QR Codes
- Código Pix Copia e Cola para pagamento manual

## Tecnologias Utilizadas

- **Vite** - Build tool e dev server
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Componentes de UI
- **React Router** - Roteamento
- **qrcode.react** - Geração de QR Codes
- **date-fns** - Manipulação de datas

## Requisitos

- Node.js 18+ (recomendado usar [nvm](https://github.com/nvm-sh/nvm))
- npm ou yarn

## Instalação

```bash
# 1. Clone o repositório
git clone [Gerador de Pix](https://gustavorochac.github.io/pix-generator-pro/)

# 2. Entre no diretório do projeto
cd pix-generator-pro

# 3. Instale as dependências
npm install

# 4. Inicie o servidor de desenvolvimento
npm run dev
```

O aplicativo estará disponível em `http://localhost:8080`

## Scripts Disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Cria o build de produção
- `npm run build:dev` - Cria o build de desenvolvimento
- `npm run lint` - Executa o linter
- `npm run preview` - Pré-visualiza o build de produção

## Estrutura do Projeto

```
pix-generator-pro/
├── src/
│   ├── components/      # Componentes React
│   │   ├── ui/         # Componentes de UI (shadcn/ui)
│   │   ├── PaymentForm.tsx
│   │   ├── QRCodeDisplay.tsx
│   │   └── ...
│   ├── lib/            # Utilitários e lógica de negócio
│   │   └── pix-generator.ts  # Geração de payloads Pix
│   ├── pages/          # Páginas da aplicação
│   ├── hooks/          # React hooks customizados
│   └── main.tsx        # Entry point
├── public/             # Arquivos estáticos
├── index.html          # HTML principal
└── package.json        # Dependências do projeto
```

## Funcionalidades

### Geração de QR Code Pix

1. Insira sua chave Pix (CPF, CNPJ, e-mail, telefone ou chave aleatória)
2. Preencha o nome do beneficiário (até 25 caracteres)
3. Informe a cidade do beneficiário (até 15 caracteres)
4. Defina o valor do pagamento
5. Opcionalmente, adicione uma descrição
6. Configure a validade do QR Code
7. Gere o código e compartilhe

### Validação

O sistema valida automaticamente:
- Formato da chave Pix
- Limites de caracteres dos campos
- Cálculo de CRC16 para integridade do código

## Padrão EMV

O gerador segue o padrão EMV QR Code para códigos Pix estáticos, conforme especificação do Banco Central do Brasil, incluindo:

- Campos obrigatórios (ID 00, 26, 52, 53, 58, 59, 60, 62, 63)
- Campo opcional de valor (ID 54)
- Cálculo de CRC16-CCITT (0xFFFF)
- Formato TLV (Tag-Length-Value)

## Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
