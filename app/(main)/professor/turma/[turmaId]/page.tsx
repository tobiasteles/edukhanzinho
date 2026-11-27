import { Avatar } from "@/components/avatar/avatar";
import { getTeacher, getTurma } from "@/lib/professor";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdicionarAlunosForm, BotaoExcluirTurma, BotaoRemover } from "../../forms";

const TurmaPage = async ({ params }: { params: Promise<{ turmaId: string }> }) => {
  const teacher = await getTeacher();
  const id = Number((await params).turmaId);

  if (!teacher || !Number.isInteger(id)) redirect("/professor");

  const dados = await getTurma(teacher.userId, id);
  if (!dados) redirect("/professor");

  return (
    <div className="relative z-10 mx-auto flex max-w-3xl flex-col gap-y-6 px-6 pb-10 font-ui">
      <div>
        <Link href="/professor" className="text-sm text-edu-blue hover:underline">
          ← Minhas turmas
        </Link>
        <h1 className="text-2xl font-semibold text-edu-ink">{dados.turma.nome}</h1>
      </div>

      <section className="flex flex-col gap-3 rounded-3xl border-2 border-b-[6px] border-edu-line bg-white p-5">
        <h2 className="text-lg font-semibold text-edu-ink">Adicionar alunos</h2>
        <AdicionarAlunosForm turmaId={dados.turma.id} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold text-edu-ink">Alunos ({dados.alunos.length})</h2>
        {dados.alunos.length === 0 && <p className="text-edu-ink/70">Ainda não há alunos nesta turma.</p>}
        {dados.alunos.map((a) => (
          <div key={a.id} className="flex items-center gap-4 rounded-2xl border-2 border-b-4 border-edu-line bg-white px-4 py-3">
            <Avatar look={{ animal: a.animal }} size={48} />
            <div className="flex-1">
              <p className="font-semibold text-edu-ink">{a.nomeInterno}</p>
              <p className="text-sm text-edu-ink/70">Apelido para as crianças: {a.apelido}</p>
            </div>
            <BotaoRemover alunoId={a.id} />
          </div>
        ))}
      </section>

      <div>
        <BotaoExcluirTurma turmaId={dados.turma.id} />
      </div>
    </div>
  );
};

export default TurmaPage;
