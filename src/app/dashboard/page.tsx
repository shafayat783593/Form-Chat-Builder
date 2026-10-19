import { requireUserPage } from "@/lib/session";
import { FormRow } from "@/modules/form/components/form-row";
import { NewFormForm } from "@/modules/form/components/new-form-form";
import { getDashboardStats, listForms } from "@/modules/form/form.service";


export default async function DashboardPage() {
  const user = await requireUserPage();
  const [stats, forms] = await Promise.all([
    getDashboardStats(user.id),
    listForms(user.id),
  ]);

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-2 gap-4">
        <Stat label="Total forms" value={stats.forms} />
        <Stat label="Total responses" value={stats.responses} />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Create a form</h2>
        <NewFormForm />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your forms</h2>
        {forms.length === 0 ? (
          <p className="rounded-md border border-dashed bg-white p-6 text-center text-sm text-gray-500">
            No forms yet. Create your first one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {forms.map((f) => (
              <FormRow
                key={f.id}
                form={{
                  id: f.id,
                  title: f.title,
                  slug: f.slug,
                  status: f.status,
                  responses: f._count.responses,
                  questions: f._count.questions,
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}