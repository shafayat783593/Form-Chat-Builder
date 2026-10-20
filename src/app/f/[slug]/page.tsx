import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublishedFormBySlug } from "@/modules/form/form.service";
import { ClassicForm, type RuntimeForm } from "@/modules/form-runtime/classic-form";

export default async function FormPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Opt into request-time rendering (cacheComponents is enabled).
  await connection();
  const { slug } = await params;
  const query = await searchParams;

  const form = await getPublishedFormBySlug(slug);
  if (!form) notFound();

  const runtimeForm: RuntimeForm = {
    slug: form.slug,
    title: form.title,
    description: form.description,
    welcomeText: form.welcomeText,
    completionText: form.completionText,
    themeColor: form.themeColor,
    submitButtonText: form.submitButtonText,
    displayMode: form.displayMode,
    showProgress: form.showProgress,
    multiPageForm: form.multiPageForm,
    questions: form.questions.map((q) => ({
      id: q.id,
      type: q.type,
      label: q.label,
      options: q.options,
      required: q.required,
      prefillKey: q.prefillKey,
      placeholder: q.placeholder,
      textColor: q.textColor,
      fontSize: q.fontSize,
      fontWeight: q.fontWeight,
      fontStyle: q.fontStyle,
    })),
  };

  return (
    <div className="m-0 min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-900">
      <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ color: form.themeColor }}
          >
            {form.title}
          </h1>
          {form.description ? (
            <p className="mt-1.5 text-sm text-slate-500">{form.description}</p>
          ) : null}

          <div className="mt-8">
            <ClassicForm form={runtimeForm} live searchParams={query} />
          </div>
        </div>
      </div>
    </div>
  );
}
