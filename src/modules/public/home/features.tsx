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
    <section id="features" className="scroll-mt-16 border-b bg-gradient-to-br from-muted/20 to-background">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">Everything you need to collect answers</h2>
          <p className="mt-2 max-w-prose text-lg text-muted-foreground">
            A focused set of features to build, publish and manage conversational forms.
          </p>
        </div>
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <li 
              key={title} 
              className="group rounded-xl border bg-card p-6 text-card-foreground transition-all duration-300 hover:border-primary/20 hover:bg-card/80 hover:shadow-md"
            >
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all">
                <Icon className="size-6" />
              </div>
              <h3 className="text-lg font-semibold group-hover:text-primary">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              <div className="mt-4 h-0.5 w-12 bg-gradient-to-r from-primary/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}