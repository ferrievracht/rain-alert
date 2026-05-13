import { LocationDetailClient } from "./ui";

export default function LocationDetailPage({ params }: { params: { id: string } }) {
  return <LocationDetailClient id={params.id} />;
}
