import { getListings } from "@/src/services/listingService";
import { ListingCard } from "@/src/components/listings/ListingCard";

export default async function ListingsPage() {
  const listings = await getListings(); // dữ liệu dạng Listing[]

  return (
    <main className="max-w-7xl mx-auto py-10 px-6">
      {/* Tiêu đề và thanh tìm kiếm */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-blue-600">Danh sách xe bán</h1>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Tìm kiếm xe..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700">
            <option value="">Tất cả hãng</option>
            <option value="Toyota">Toyota</option>
            <option value="Honda">Honda</option>
            <option value="Mazda">Mazda</option>
            <option value="Ford">Ford</option>
          </select>

          <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700">
            <option value="">Mức giá</option>
            <option value="0-300">Dưới 300 triệu</option>
            <option value="300-700">300 - 700 triệu</option>
            <option value="700-1000">700 - 1 tỷ</option>
            <option value="1000+">Trên 1 tỷ</option>
          </select>

          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
            🔍 Tìm
          </button>
        </div>
      </div>

      {/* Grid danh sách xe */}
      <div className="space-y-4">
        {listings.map((car) => (
          <ListingCard key={car.id} data={car} />
        ))}
      </div>
    </main>
  );
}