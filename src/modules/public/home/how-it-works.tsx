const steps = [
  { title: "Create", text: "Add your questions in the form builder and preview the chat." },
  { title: "Publish", text: "Publish the form to get its public link and embed snippet." },
  { title: "Embed", text: "Paste one script tag on your website. A chat bubble appears." },
  { title: "Collect", text: "Visitors answer in the chat; you review submissions in the dashboard." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-b bg-gradient-to-br from-background to-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <div className="mb-12">
          <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">How it works</h2>
          <p className="mt-2 text-lg text-muted-foreground">
            Four simple steps to create a conversational form and start collecting answers.
          </p>
        </div>
        <ol className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="group relative">
              <div className="flex items-center gap-4">
                <div className="relative flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-sm font-semibold text-primary-foreground shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all">
                  <span>{i + 1}</span>
                  {i < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 hidden h-0.5 w-8 -translate-y-1/2 bg-gradient-to-r from-primary/30 to-transparent md:block" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold group-hover:text-primary">{s.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}