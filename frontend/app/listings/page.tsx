import { getListings } from "@/src/services/listingService";
import { ListingCard } from "@/src/components/listings/ListingCard";

export default async function ListingsPage() {
  const listings = await getListings(); // đã là Listing[]

  return (
    <main className="max-w-7xl mx-auto py-10 px-6">
      <h1 className="text-2xl font-bold mb-6 text-blue-600">Danh sách xe</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((car) => (
          <ListingCard key={car.id} data={car} />
        ))}
      </div>
    </main>
  );
}
