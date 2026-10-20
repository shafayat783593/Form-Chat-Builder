import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublishedFormBySlug } from "@/modules/form/form.service";
import { ClassicForm, type RuntimeForm } from "@/modules/form-runtime/classic-form";
import { Chat } from "@/modules/chat/chat";
import { CloseBar } from "@/modules/chat/close-bar";

export default async function EmbedPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Opt into request-time rendering (cacheComponents is enabled).
  await connection();
  const { slug } = await params;
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
      placeholder: q.placeholder,
      textColor: q.textColor,
      fontSize: q.fontSize,
      fontWeight: q.fontWeight,
      fontStyle: q.fontStyle,
    })),
  };

  // FOCUS = one question at a time (chat), CLASSIC = the whole form on one page.
  if (form.displayMode === "FOCUS") {
    return (
      <div className="m-0 p-0 bg-white font-sans antialiased text-black min-h-screen flex flex-col">
        <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <div
              className="size-8 rounded-full flex items-center justify-center text-[11px] font-medium shadow-sm"
              style={{ backgroundColor: form.themeColor, color: "#ffffff" }}
            >
              {form.title.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-sm font-medium truncate">{form.title}</div>
          </div>
          <CloseBar />
        </header>
        <div className="flex-1 w-full overflow-hidden">
          <Chat form={runtimeForm} />
        </div>
      </div>
    );
  }

  return (
    <div className="m-0 p-0 bg-white font-sans antialiased text-black min-h-screen flex flex-col">
      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200 bg-white shrink-0">
        <div className="flex items-center gap-2">
          <div
            className="size-8 rounded-full flex items-center justify-center text-[11px] font-medium shadow-sm"
            style={{ backgroundColor: form.themeColor, color: "#ffffff" }}
          >
            {form.title.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 text-sm font-medium truncate">{form.title}</div>
        </div>
        <CloseBar />
      </header>
      <div className="flex-1 w-full overflow-y-auto px-4 py-6">
        <ClassicForm form={runtimeForm} live />
      </div>
    </div>
  );
}
