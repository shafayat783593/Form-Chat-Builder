import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  {
    q: "How do I add it to my site?",
    a: "After publishing, copy the script tag from the share dialog and paste it anywhere in your HTML. A floating chat bubble appears automatically.",
  },
  {
    q: "Is it free?",
    a: "Free during beta. There is no billing, subscription or pricing page at this stage.",
  },
  {
    q: "What question types exist?",
    a: "Text, textarea, email, number, phone, date, dropdown, radio, checkbox, yes/no, rating, range, NPS, address and full name.",
  },
  {
    q: "Can I change the colours?",
    a: "Yes — pick a preset theme or enter any hex colour in the Style tab. The launcher label and position are configurable too.",
  },
  {
    q: "Where do I see responses?",
    a: "Every submission appears in the Responses tab of your dashboard, with a timestamp and one column per question.",
  },
  {
    q: "Is my visitors' data safe?",
    a: "Answers are stored in your own PostgreSQL database. The widget only sends answers over HTTPS to the API that hosts the form.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="scroll-mt-16 border-b">
      <div className="mx-auto max-w-3xl px-4 py-16 md:py-20">
        <h2 className="text-3xl font-semibold tracking-tight">Frequently asked questions</h2>
        <Accordion type="single" collapsible className="mt-8">
          {faqs.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent>{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
