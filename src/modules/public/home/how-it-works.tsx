const steps = [
  { title: "Create", text: "Add your questions in the form builder and preview the chat." },
  { title: "Publish", text: "Publish the form to get its public link and embed snippet." },
  { title: "Embed", text: "Paste one script tag on your website. A chat bubble appears." },
  { title: "Collect", text: "Visitors answer in the chat; you review submissions in the dashboard." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-16 border-b bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <span className="mb-3 flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="font-medium">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}