// app/(main)/listings/[id]/edit/page.tsx
import ListingForm from "@/src/components/listings/ListingForm";

type Props = {
  params: { id: string };
};

export default function EditListingPage({ params }: Props) {
  return <ListingForm mode="edit-user" listingId={params.id} />;
}
