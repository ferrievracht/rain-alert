import { NewLocationClient } from "./ui";
import { Suspense } from "react";

export default function NewLocationPage() {
  return (
    <Suspense>
      <NewLocationClient />
    </Suspense>
  );
}
