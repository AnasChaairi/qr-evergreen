import "server-only";

export type PlaceResult = { placeId: string; name: string; address: string };

// Google Places API (New) text search. Only id, name and address are requested
// (the cheapest field mask). Returns null when no key is configured.
export async function searchPlaces(query: string, apiKey: string | undefined, languageCode = "en"): Promise<PlaceResult[] | null> {
  if (!apiKey) return null;
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress",
    },
    body: JSON.stringify({ textQuery: query, languageCode, pageSize: 5 }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Places search failed: ${response.status}`);
  const body = (await response.json()) as {
    places?: { id: string; displayName?: { text?: string }; formattedAddress?: string }[];
  };
  return (body.places ?? []).map((place) => ({
    placeId: place.id,
    name: place.displayName?.text ?? "",
    address: place.formattedAddress ?? "",
  }));
}
