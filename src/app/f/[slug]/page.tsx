import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublishedFormBySlug } from "@/modules/form/form.service";
import { ChatFrame } from "@/modules/chat/chat-frame";

export default function FormPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="m-0 min-h-screen bg-[#f8fafc] font-sans antialiased text-slate-900 flex items-center justify-center p-4">
      <div className="h-[min(720px,calc(100dvh-5rem))] w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <Suspense fallback={<div className="h-full w-full animate-pulse bg-white" />}>
          <FormChat params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function FormChat({
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

  return (
    <ChatFrame
      form={{
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
      }}
      searchParams={query}
      closeMode="local"
      hideClose={false}
    />
  );
}
