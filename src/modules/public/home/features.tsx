import {
  Code2, Inbox, LayoutList, MessageSquare, Palette, ShieldCheck,
} from "lucide-react";

const features = [
  {
    icon: MessageSquare,
    title: "Chat-style forms",
    text: "Questions appear one at a time, with answer buttons for yes/no and multiple choice.",
  },
  {
    icon: LayoutList,
    title: "Simple form builder",
    text: "Add text, email, multiple-choice and yes/no questions. Reorder, edit, and mark them required.",
  },
  {
    icon: Code2,
    title: "One-line embed",
    text: "Paste a script tag on any website to get a floating chat widget. No framework needed.",
  },
  {
    icon: Palette,
    title: "Make it yours",
    text: "Set your own colour and welcome message so the widget fits your brand.",
  },
  {
    icon: ShieldCheck,
    title: "Validated answers",
    text: "Required fields and email format are checked in the chat and again on the server.",
  },
  {
    icon: Inbox,
    title: "Responses dashboard",
    text: "See every submission with its timestamp, and publish or unpublish a form at any time.",
  },
];

export function Features() {
  return (
    <section id="features" className="scroll-mt-16 border-b">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight">Everything you need to collect answers</h2>
        <p className="mt-2 max-w-prose text-muted-foreground">
          A focused set of features to build, publish and manage conversational forms.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <li key={title} className="rounded-xl border bg-card p-5 text-card-foreground">
              <div className="mb-3 inline-flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="font-medium">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}