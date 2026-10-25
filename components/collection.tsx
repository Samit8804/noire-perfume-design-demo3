"use client";

import CollectionExperience from "./collection-experience";
import { FRAGRANCES } from "@/lib/collection-data";

export default function Collection() {
  return <CollectionExperience fragrances={FRAGRANCES} />;
}