import PriceBucketsSection from "@/src/components/home/PriceBucketsSection";
import PopularBodyTypesSection from "@/src/components/home/PopularBodyTypesSection";

export default function HomePage() {
  return (
    <main className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <PriceBucketsSection />
        <PopularBodyTypesSection />
      </div>
    </main>
  );
}