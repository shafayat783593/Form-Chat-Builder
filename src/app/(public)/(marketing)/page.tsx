import { Suspense } from "react";
import { Hero } from "@/modules/public/home/hero";
import { Features } from "@/modules/public/home/features";
import { HowItWorks } from "@/modules/public/home/how-it-works";
import { TemplatesStrip } from "@/modules/public/home/templates-strip";
import { DemoSection } from "@/modules/public/home/demo-section";
import { FAQ } from "@/modules/public/home/faq";
import { FinalCTA } from "@/modules/public/home/cta";
import { Footer } from "@/components/layout/public/footer";

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <Features />
      <HowItWorks />
      <Suspense fallback={<div className="mx-auto max-w-6xl px-4 py-16" />}>
        <TemplatesStrip />
      </Suspense>
      <DemoSection />
      <FAQ />
      <FinalCTA />
  
    </>
  );
}
