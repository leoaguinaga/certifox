import { HeroSection } from "@/features/landing/components/hero-section";
import { FeaturedCourses } from "@/features/catalog/components/featured-courses";
import { CertificateVerificationSection } from "@/features/certificates/components/certificate-verification-section";
import { InstitutionsSection } from "@/features/landing/components/institutions-section";
import { FaqSection } from "@/features/landing/components/faq-section";
import { CtaBanner } from "@/features/landing/components/cta-banner";

export default function LandingPage() {
  return (
    <div className="flex flex-col w-full">
      <HeroSection />
      <FeaturedCourses />
      <CertificateVerificationSection />
      <InstitutionsSection />
      <FaqSection />
      <CtaBanner />
    </div>
  );
}
