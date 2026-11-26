# Plano de ação — Edukhanzinho

Atualizado a cada etapa. Legenda: [x] feito · [~] em andamento · [ ] a fazer.

## Já feito
- [x] **Fase 1** — Segurança (rotas admin, Server Actions, webhook Stripe, rotas logadas).
- [x] **Fase 2** — Visual lúdico (design system, lição animada, parallax, voz pt-BR, interface em português).
- [x] **Fase 3** — Gerador de atividades em Python (um curso novo por execução, capas diferentes).
- [x] **4.0/4.1** — Sem vidas (2 erros mostram a resposta) e pergunta falada sozinha.
- [x] **4.2** — Montar a palavra · [x] **4.3** — Forca do balão · [x] **4.3b** — Todas as lições liberadas.

## Em andamento — Fase 4.5: Álbum, personagem e itens (recompensas)
Decisões: personagem base = **bichinho** que a criança escolhe e veste; itens com **função pedagógica**
(sem armas, sem sorteio, sem compra com dinheiro, sem ranking de itens); "chefão" fica para depois da Fase 5.
- [~] **A. Álbum de figurinhas** — cada palavra com figura vira uma figurinha (1 estrela ao acertar, 3 = dominada).
- [ ] **B. Personagem e guarda-roupa** — escolher o bichinho e vestir roupas/acessórios (SVG em camadas).
- [ ] **C. Equipamentos e itens de apoio** — Lupa da letra, Fone mágico, Pena da dica, Corda extra, Pulo, Mochila leve.
- [ ] **D. Avatar no lugar da foto** — perfil e classificação usam só apelido + bichinho.

## Depois
- [ ] **4.4** Revisão inteligente (letras/sílabas erradas voltam mais).
- [ ] **4.6** Mascote e história na trilha · [ ] **4.7** Mini-livros com leitura acompanhada · [ ] **4.8** Fichas para imprimir (PDF).
- [ ] **Fase 5 — Escola**: turmas, login por código/QR (professor cria as contas), painel do professor,
      meta da turma no lugar do ranking, revisão jurídica (ECA Digital/LGPD) e **chefão** de fim de unidade.

## Pendências técnicas
- [ ] Testar o webhook da Stripe de ponta a ponta · [ ] `npm audit` (vulnerabilidades) · [ ] renomear `middleware.ts` → `proxy.ts`.
- [ ] Testar o app com crianças reais (3–5) antes de ampliar.
