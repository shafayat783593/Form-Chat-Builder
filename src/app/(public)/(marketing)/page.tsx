import { DemoSection } from '@/modules/public/home/demo-section'
import { Features } from '@/modules/public/home/features'
import { Hero } from '@/modules/public/home/hero'
import { HowItWorks } from '@/modules/public/home/how-it-works'

function page() {
  return (
    <div>

      <Hero />
      <Features />
      <HowItWorks />
      <DemoSection />
    </div>
  )
}

export default page