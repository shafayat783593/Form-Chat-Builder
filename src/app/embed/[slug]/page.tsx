import { Suspense } from "react";
import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublishedFormBySlug } from "@/modules/form/form.service";
import { ChatFrame } from "@/modules/chat/chat-frame";
import { ViewportBox } from "@/modules/chat/viewport-box";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
};

export default function EmbedPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <ViewportBox className="flex flex-col overflow-hidden bg-white">
      <Suspense fallback={<div className="h-full w-full animate-pulse bg-white" />}>
        <EmbedChat params={params} searchParams={searchParams} />
      </Suspense>
    </ViewportBox>
  );
}

async function EmbedChat({
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

  // Validate the optional color override.
  const colorParam = typeof query.color === "string" ? query.color : undefined;
  const colorOverride =
    colorParam && /^#[0-9a-fA-F]{6}$/.test(colorParam) ? colorParam : undefined;

  const srcParam = typeof query.src === "string" ? query.src : undefined;

  return (
    <ChatFrame
      form={{
        slug: form.slug,
        title: form.title,
        description: form.description,
        welcomeText: form.welcomeText,
        completionText: form.completionText,
        themeColor: colorOverride ?? form.themeColor,
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
      sourceOrigin={srcParam}
      closeMode="host"
      hideClose={false}
    />
  );
}
