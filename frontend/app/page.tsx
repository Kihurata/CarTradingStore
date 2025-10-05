import { Header } from "../src/layout/Header";
import { Footer } from "../src/layout/Footer";
//import { PageContainer } from "@/components/layout/PageContainer";
import { HeroSearch } from "../src/components/home/HeroSearch";
import { ListingSection } from "@/components/home/ListingSection";
import { PopularSection } from "@/components/home/PopularSection";
import { SalonSection } from "@/components/home/SalonSection";
import { NewsSection } from "@/components/home/NewsSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <HeroSearch />
        <PageContainer>
          <BrandCarousel />
          <ListingSection title="Tin bán xe theo khoảng giá" endpoint="/listings?bucket=by-price" />
          <ListingSection title="Xe ô tô cũ theo hãng" endpoint="/listings?bucket=by-brand" />
          <PopularSection />
          <SalonSection />
          <NewsSection />
        </PageContainer>
      </main>
      <Footer />
    </>
  );
}
