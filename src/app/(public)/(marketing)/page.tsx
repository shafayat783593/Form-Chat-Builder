import { connection } from "next/server";
import { Hero } from "@/modules/public/home/hero";
import { Features } from "@/modules/public/home/features";
import { HowItWorks } from "@/modules/public/home/how-it-works";
import { TemplatesStrip } from "@/modules/public/home/templates-strip";
import { DemoSection } from "@/modules/public/home/demo-section";
import { FAQ } from "@/modules/public/home/faq";
import { FinalCTA } from "@/modules/public/home/cta";
import { Footer } from "@/components/layout/public/footer";

export default async function MarketingPage() {
  await connection();

  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <TemplatesStrip />
      <DemoSection />
      <FAQ />
      <FinalCTA />
      <Footer />
    </>
  );
}
