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
- [x] **A. Álbum de figurinhas** — cada palavra com figura vira uma figurinha (1 estrela ao acertar, 3 = dominada).
- [x] **B. Personagem e guarda-roupa** — 6 bichinhos (gato, leão, urso, coelho, elefante, sapo) e 10 peças em 4 posições (chapéu, rosto, pescoço, costas), liberadas por regras: atividades concluídas, figurinhas e palavras dominadas. Página `/personagem`.
- [x] **C1. Poderes das peças** — Fone de ouvido (voz mais devagar) e Óculos redondos (letras maiores). As demais peças são só visuais.
- [x] **C2. Itens de apoio** — Pena da dica (tira opção errada / revela letra na forca / põe a próxima peça) e Corda extra (forca). Começa com 2 penas e 1 corda, limite 3 (5 com a Mochila); +1 pena a cada 5 atividades, +1 corda por palavra dominada.
- [ ] **C3 (opcional)**: Pulo e Mochila leve (lição com 3 atividades).
- [~] **D. Avatar no lugar da foto** — passa para a etapa 5.4 (apelido + bichinho no lugar de nome e foto, e fim da Classificação).

## Depois
- [ ] **4.4** Revisão inteligente (letras/sílabas erradas voltam mais).
- [ ] **4.6** Mascote e história na trilha · [ ] **4.7** Mini-livros com leitura acompanhada · [ ] **4.8** Fichas para imprimir (PDF).
## Fase 5 — Escola (turmas e professores)
Decisões: o professor cadastra só o **primeiro nome**; as crianças veem apenas **apelido + bichinho**; sem sobrenome, sem foto.
- [~] **5.1 Professor e turmas** — tabelas (`teachers`, `classes`, `class_students`), script para liberar professores e a área `/professor` (criar turma, adicionar/remover alunos, apelidos automáticos).
- [ ] **5.2 Login do aluno por código/QR** — o professor cria as contas; a criança entra com um cartão (QR/código) impresso, sem e-mail. Depende de configurar o Clerk (usuário sem e-mail).
- [ ] **5.3 Painel do professor** — progresso da turma, letras/sílabas mais erradas, quem travou (exige registrar os erros) — também alimenta a 4.4 (revisão inteligente).
- [ ] **5.4 Meta da turma + avatar (D)** — meta coletiva no lugar da Classificação; apelido e bichinho no lugar de nome e foto em todo o app.
- [ ] **5.5 Conformidade** — termo de consentimento, política de privacidade, exclusão de dados, dados no Clerk (exterior), revisão jurídica (ECA Digital/LGPD).
- [ ] **Chefão** de fim de unidade (só depois das turmas funcionarem).

## Pendências técnicas
- [ ] Testar o webhook da Stripe de ponta a ponta · [ ] `npm audit` (vulnerabilidades) · [ ] renomear `middleware.ts` → `proxy.ts`.
- [ ] Testar o app com crianças reais (3–5) antes de ampliar.
