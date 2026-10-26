import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublishedFormBySlug } from "@/modules/form/form.service";
import { ChatFrame } from "@/modules/chat/chat-frame";
import { ViewportBox } from "@/modules/chat/viewport-box";

import type { Viewport } from "next";

// Phones shrink the page itself when the keyboard opens, instead of panning over it.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function FormPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ViewportBox className="flex items-center justify-center overflow-hidden bg-[#f8fafc] p-0 font-sans antialiased text-slate-900 sm:p-4">
      <div className="h-full w-full max-w-lg overflow-hidden bg-white sm:h-[min(720px,calc(100%-2rem))] sm:rounded-xl sm:border sm:border-slate-200 sm:shadow-sm">
        <Suspense fallback={<div className="h-full w-full animate-pulse bg-white" />}>
          <FormChat params={params} searchParams={searchParams} />
        </Suspense>
      </div>
    </ViewportBox>
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
