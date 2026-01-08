
Gerador de códigos Pix e QR Codes de pagamento instantâneo. Crie cobranças com validade personalizada e compartilhe facilmente.

<img width="1348" height="905" alt="pix" src="https://github.com/user-attachments/assets/adf7c1a7-968d-4f54-bbd9-f2b18b6da094" />


## Características

- Geração de QR Codes Pix estáticos seguindo o padrão EMV
- Suporte a todos os tipos de chave Pix (CPF, CNPJ, e-mail, telefone, chave aleatória)
- Cálculo automático de CRC16 para validação dos códigos
- Interface moderna e totalmente responsiva para mobile, tablet e desktop
- QR Code adaptativo com tamanhos otimizados para cada dispositivo
- Validade configurável dos QR Codes (15 min, 1 hora, 24 horas ou personalizado)
- Código Pix Copia e Cola para pagamento manual
- Validação em tempo real da chave Pix com feedback visual
- Área de toque otimizada para dispositivos móveis (mínimo 44x44px)

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
git clone https://github.com/gustavorochac/pix-generator-pro.git

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
6. Configure a validade do QR Code (presets ou personalizado)
7. Gere o código e compartilhe

### Responsividade Mobile

O aplicativo foi otimizado para oferecer uma experiência excepcional em dispositivos móveis:

- **QR Code Adaptativo**: Tamanho automático baseado no dispositivo (160px mobile, 180px tablet, 200px desktop)
- **Layout Flexível**: Grid que se adapta de 2 colunas (desktop) para 1 coluna (mobile)
- **Inputs Touch-Friendly**: Todos os campos têm área de toque mínima de 44x44px
- **Badge de Validação**: Posicionamento inteligente (dentro do input em desktop, abaixo em mobile)
- **Tipografia Responsiva**: Tamanhos de fonte ajustados para melhor legibilidade em telas pequenas
- **Espaçamentos Otimizados**: Padding e gaps ajustados para diferentes tamanhos de tela

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

Todos os códigos gerados são validados e podem ser lidos pelos aplicativos bancários oficiais.

## Suporte a Dispositivos

### Mobile (< 640px)
- Interface otimizada para telas pequenas
- QR Code com tamanho reduzido (160px)
- Layout de coluna única
- Badge de validação abaixo dos inputs

### Tablet (640px - 1024px)
- QR Code de tamanho médio (180px)
- Layout híbrido com grid adaptativo
- Espaçamentos intermediários

### Desktop (> 1024px)
- QR Code em tamanho completo (200px)
- Layout de 2 colunas lado a lado
- Badge de validação dentro dos inputs

## Deploy

O projeto está configurado para deploy no GitHub Pages. Para fazer o deploy:

```bash
# Build do projeto
npm run build

# Commit e push da pasta docs/
git add docs/
git commit -m "Deploy: Atualização do site"
git push origin main
```

O site estará disponível em: `https://gustavorochac.github.io/pix-generator-pro/`

## Desenvolvimento

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

### Testando Responsividade

Para testar a responsividade durante o desenvolvimento:

1. Use as DevTools do navegador (F12)
2. Ative o modo de dispositivo (Ctrl+Shift+M)
3. Teste em diferentes tamanhos de tela:
   - Mobile: 375px, 414px
   - Tablet: 768px, 1024px
   - Desktop: 1280px+

## Licença

Este projeto é de código aberto e está disponível sob a licença MIT.
