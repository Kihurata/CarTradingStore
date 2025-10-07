import { Header } from "@/src/components/layout/Header";
import { Footer } from "@/src/components/layout/Footer";
import { PageContainer } from "@/src/components/layout/PageContainer";
import { HeroSearch } from "@/src/components/home/HeroSearch";
import { ListingSection } from "@/src/components/home/ListingSection";

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="bg-white">
        <HeroSearch />
        <PageContainer>
          <ListingSection title="Tin bán xe theo khoảng giá" endpoint="/listings?bucket=by-price" />
          <ListingSection title="Xe ô tô cũ theo hãng" endpoint="/listings?bucket=by-brand" />
        </PageContainer>
      </main>
      <Footer />
    </>
  );
}
