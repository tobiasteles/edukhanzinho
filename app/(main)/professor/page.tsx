import { getTeacher, getTurmas } from "@/lib/professor";
import Link from "next/link";
import { NovaTurmaForm } from "./forms";

const ProfessorPage = async () => {
  const teacher = await getTeacher();

  if (!teacher) {
    return (
      <div className="mx-auto max-w-xl px-6 py-10 text-center font-ui">
        <h1 className="mb-3 text-2xl font-semibold text-edu-ink">Área do professor</h1>
        <p className="text-edu-ink/70">
          Esta área é só para professores cadastrados. Peça ao responsável pelo Edukhanzinho na sua escola para liberar o seu acesso.
        </p>
      </div>
    );
  }

  const turmas = await getTurmas(teacher.userId);

  return (
    <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-y-6 px-6 pb-10 font-ui">
      <h1 className="text-2xl font-semibold text-edu-ink">Olá, {teacher.nome}!</h1>
      <section className="flex flex-col gap-3 rounded-3xl border-2 border-b-[6px] border-edu-line bg-white p-5">
        <h2 className="text-lg font-semibold text-edu-ink">Nova turma</h2>
        <NovaTurmaForm />
      </section>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-edu-ink">Minhas turmas</h2>
        {turmas.length === 0 && <p className="text-edu-ink/70">Você ainda não tem turmas. Crie a primeira acima.</p>}
        {turmas.map((t) => (
          <Link
            key={t.id}
            href={`/professor/turma/${t.id}`}
            className="flex items-center justify-between rounded-2xl border-2 border-b-4 border-edu-line bg-white px-5 py-4 text-edu-ink hover:bg-edu-cream"
          >
            <span className="font-semibold">{t.nome}</span>
            <span className="text-sm text-edu-ink/70">{t.alunos} aluno(s)</span>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default ProfessorPage;
