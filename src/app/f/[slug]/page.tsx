import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getPublishedFormBySlug } from "@/modules/form/form.service";
import { Chat } from "@/modules/chat/chat";

export default async function FormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Opt into request-time rendering (cacheComponents is enabled).
  await connection();
  const { slug } = await params;
  const form = await getPublishedFormBySlug(slug);
  if (!form) notFound();

  return (
    <div className="m-0 p-0 bg-[#f8fafc] font-sans antialiased text-slate-900 min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h1 className="text-xl font-semibold tracking-tight">{form.title}</h1>
            {form.description && (
              <p className="mt-1 text-sm text-slate-500">{form.description}</p>
            )}
          </div>
          <Chat form={form} />
        </div>
      </div>
    </div>
  );
}
