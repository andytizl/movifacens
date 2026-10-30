# MoviFacens

Aplicativo web de **carona solidária de uso exclusivo da comunidade Facens**. Ele ajuda a reduzir o trânsito e a emissão de carbono nos trajetos acadêmicos, conectando alunos, professores e colaboradores que fazem trajetos e horários parecidos.

> Projeto realizado para o curso de Análise e Desenvolvimento de Sistemas (4º semestre) — Facens
>
> **UPX - Usina de Projetos Experimentais IV / Professor:Fernando Xavier**
> **Grupo: Andressa Tizl Americo - RA: 252295; Isabela Reis Alves - RA: 252222; Nelson Capucho Neto - RA: 252079**

---

## Funcionalidades

- **Acesso restrito à comunidade Facens:** cadastro e login só aceitam email institucional (validação no frontend e também no banco de dados).
- **Oferecer carona:** o motorista informa sentido (ida ou volta), bairro, dias da semana, horário de saída e número de vagas.
- **Buscar carona:** o passageiro informa sentido, bairro, dia e horário e recebe as caronas compatíveis, ordenadas da mais próxima para a mais distante.
- **Solicitar vaga:** o passageiro pede uma vaga na carona escolhida.
- **Minhas caronas:** o motorista vê os pedidos recebidos e **aceita ou recusa**; o passageiro acompanha o status (pendente, aceita ou recusada). Ao aceitar, a vaga é descontada.
- **Painel inicial:** resumo com caronas combinadas, pedidos pendentes e estimativa de CO₂ evitado.

## Como funciona o pareamento de rotas

Uma carona é considerada compatível com a busca quando:

1. tem o **mesmo sentido** (ida: bairro → Facens, volta: Facens → bairro);
2. acontece no **dia da semana** buscado;
3. ainda tem **vagas**;
4. o ponto de origem (na ida) ou de destino (na volta) está a **até 2 km** do bairro do passageiro, calculado pela fórmula de Haversine;
5. o horário de saída tem **até 20 minutos de diferença** do horário desejado.

O resultado é ordenado por distância e, em caso de empate, pela menor diferença de horário. A lógica está em `src/app/services/carona.ts` (método `buscar`) e `src/app/utils/distancia.ts`.

**Estimativa de CO₂:** cada carona aceita conta como 1 trajeto evitado, considerando 10 km por trajeto e cerca de 0,12 kg de CO₂ por km de carro (≈ 1,2 kg por carona). É uma estimativa simples, só para ilustrar o impacto.

## Tecnologias

| Camada | Tecnologia |
| Frontend | Angular (componentes standalone, signals, Reactive Forms, rotas com lazy loading e guard), TypeScript |
| Interface | Angular Material, SCSS |
| Backend | [Supabase](https://supabase.com): autenticação, banco PostgreSQL e Row Level Security |

### Por que Supabase?

O backend planejado para o projeto não ficou disponível a tempo, então o grupo adotou um *Backend-as-a-Service*. O Supabase entrega autenticação por email, banco relacional e regras de segurança por linha sem precisar manter um servidor próprio, e o modelo relacional se encaixa bem no pareamento de caronas. As regras de acesso estão no próprio banco (veja `schema.sql`), então cada usuário só altera os dados que lhe pertencem.

## Arquitetura

```
Angular (navegador)
  ├─ pages/        telas (login, home, oferecer, buscar, minhas caronas)
  ├─ layout/shell  cabeçalho e menu de navegação
  ├─ services/     Auth e CaronaService (único ponto que fala com o banco)
  ├─ guards/       bloqueia rotas para quem não está logado
  ├─ models/       interfaces (Usuario, OfertaCarona, ...)
  └─ utils/        validação do email Facens, distância (Haversine), locais fixos
          │
          ▼  supabase-js
Supabase
  ├─ Auth          cadastro/login (trigger bloqueia emails fora da Facens)
  └─ PostgreSQL    tabelas profiles, ofertas, solicitacoes (com RLS)
```

## Como rodar o projeto

### Pré-requisitos
- Node.js (versão LTS) e npm
- Angular CLI: `npm install -g @angular/cli`
- Uma conta gratuita no Supabase

### 1. Backend (Supabase)
1. Crie um projeto em [supabase.com](https://supabase.com).
2. Em **SQL Editor**, cole e execute o conteúdo de [`schema.sql`](./schema.sql).
3. Em **Authentication → Sign In / Providers → Email**, desative **Confirm email** (apenas para a demonstração; em produção a confirmação por email deve ficar ativa).
4. Em **Project Settings → API**, copie a **URL do projeto** e a **chave pública** (publishable ou anon).

### 2. Frontend
```bash
npm install
```

Crie o arquivo `src/app/supabase.ts` com a URL e a chave pública do seu projeto:

```ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://SEU-PROJETO.supabase.co',
  'SUA_CHAVE_PUBLICA'
);
```

```bash
ng serve
```

Acesse `http://localhost:4200`.

## Roteiro de demonstração

1. **Cadastro com email fora da Facens** → o app recusa.
2. **Cadastro com email institucional** → entra e vê o painel inicial.
3. **Motorista:** *Oferecer* uma carona (ida, bairro, dias, horário e vagas).
4. **Passageiro** (outra conta, em janela anônima): *Buscar* com bairro e horário parecidos → aparece a carona → *Solicitar vaga*.
5. **Motorista:** *Minhas caronas* → *Aceitar* o pedido (a vaga diminui).
6. **Passageiro:** *Minhas caronas* → status **Aceita**; o painel inicial mostra caronas combinadas e o CO₂ estimado.

## Limitações e próximos passos

- Os **bairros são uma lista fixa** com coordenadas aproximadas; o ideal seria escolher o ponto em um mapa (por exemplo, Leaflet + OpenStreetMap) ou usar geocodificação de endereços.
- O pareamento considera ponto de origem/destino e horário, mas **não o trajeto completo** (pontos intermediários da rota).
- A **confirmação de email** está desativada na demonstração; em produção deve ser ativada.
- O desconto de vagas ao aceitar um pedido é feito em duas operações no frontend; em produção convém movê-lo para uma função no banco (transação) para evitar inconsistências com aceites simultâneos.
- Um motorista poderia, por chamada direta à API, solicitar vaga na própria carona; a interface impede isso, mas a regra também deveria existir no banco.
- Faltam funcionalidades como **chat entre os usuários, avaliações, cancelamento de carona e notificações**.
- Não há testes automatizados.
