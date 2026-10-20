import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublishedFormBySlug } from "@/modules/form/form.service";
import { ClassicForm, type RuntimeForm } from "@/modules/form-runtime/classic-form";
import { Chat } from "@/modules/chat/chat";
import { CloseBar } from "@/modules/chat/close-bar";

export default async function EmbedPage({
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

  // FOCUS = one question at a time (chat), CLASSIC = the whole form on one page.
  const isFocus = form.displayMode === "FOCUS";

  return (
    <div
      className="m-0 flex min-h-screen flex-col bg-white font-sans antialiased"
      style={{ color: "#0f172a" }}
    >
      <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="grid size-8 place-items-center rounded-full text-[11px] font-medium shadow-sm"
            style={{ backgroundColor: form.themeColor, color: "#ffffff" }}
          >
            {form.title.charAt(0).toUpperCase()}
          </div>
          <div className="truncate text-sm font-medium">{form.title}</div>
        </div>
        <CloseBar />
      </header>

      <div className="flex-1 overflow-y-auto">
        {isFocus ? (
          <Chat form={runtimeForm} searchParams={query} />
        ) : (
          <div className="px-4 py-6">
            <ClassicForm form={runtimeForm} live searchParams={query} />
          </div>
        )}
      </div>
    </div>
  );
}
