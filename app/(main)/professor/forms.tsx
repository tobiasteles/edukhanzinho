"use client";

import { adicionarAlunos, criarTurma, excluirTurma, removerAluno } from "@/actions/professor";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

const erro = (e: unknown) => toast.error(e instanceof Error ? e.message : "Ops! Algo deu errado. Tente de novo.");

export const NovaTurmaForm = () => {
  const [nome, setNome] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        maxLength={60}
        placeholder="Nome da turma (ex.: 1º ano A)"
        className="h-12 min-w-[240px] flex-1 rounded-2xl border-2 border-edu-line bg-white px-4 font-ui text-edu-ink"
      />
      <Button
        variant="secondary"
        disabled={pending || !nome.trim()}
        onClick={() =>
          start(() => {
            criarTurma(nome)
              .then((t) => router.push(`/professor/turma/${t.id}`))
              .catch(erro);
          })
        }
      >
        Criar turma
      </Button>
    </div>
  );
};

export const AdicionarAlunosForm = ({ turmaId }: { turmaId: number }) => {
  const [texto, setTexto] = useState("");
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="flex flex-col gap-3">
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={6}
        placeholder={"Um primeiro nome por linha\nAna\nBruno\nCarla"}
        className="w-full rounded-2xl border-2 border-edu-line bg-white p-4 font-ui text-edu-ink"
      />
      <p className="font-ui text-sm text-edu-ink/70">
        Use só o primeiro nome (sem sobrenome nem dados pessoais). As crianças verão apenas um apelido de bichinho.
      </p>
      <Button
        variant="secondary"
        disabled={pending || !texto.trim()}
        onClick={() =>
          start(() => {
            adicionarAlunos(turmaId, texto.split("\n"))
              .then((r) => {
                toast.success(`${r.adicionados} aluno(s) adicionado(s)!`);
                setTexto("");
                router.refresh();
              })
              .catch(erro);
          })
        }
      >
        Adicionar alunos
      </Button>
    </div>
  );
};

export const BotaoRemover = ({ alunoId }: { alunoId: number }) => {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="dangerOutline"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Remover este aluno da turma?")) return;
        start(() => {
          removerAluno(alunoId)
            .then(() => router.refresh())
            .catch(erro);
        });
      }}
    >
      Remover
    </Button>
  );
};

export const BotaoExcluirTurma = ({ turmaId }: { turmaId: number }) => {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="dangerOutline"
      disabled={pending}
      onClick={() => {
        if (!window.confirm("Excluir esta turma e todos os alunos dela? Isso não pode ser desfeito.")) return;
        start(() => {
          excluirTurma(turmaId)
            .then(() => router.push("/professor"))
            .catch(erro);
        });
      }}
    >
      Excluir turma
    </Button>
  );
};
