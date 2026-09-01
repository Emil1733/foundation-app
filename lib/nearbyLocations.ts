import { supabase } from "@/lib/supabase";

const DEFAULT_NEIGHBOR_LIMIT = 6;
const MAX_CROSS_STATE_DISTANCE_MILES = 50;

type NeighborRelationshipRow = {
  neighbor_location_id: string;
  distance_miles: number | string;
  position: number;
};

type LocationRow = {
  id: string;
  city: string;
  state: string;
  slug: string;
};

export type NearbyLocation = {
  id: string;
  city: string;
  state: string;
  slug: string;
  distanceMiles: number;
  position: number;
};

/**
 * Reads precomputed nearby locations without making the page dependent on this
 * optional internal-linking section. Any lookup problem returns an empty list,
 * allowing the primary city or soil-report content to render normally.
 */
export async function getNearbyLocations(
  locationId: string,
  sourceState: string,
  limit = DEFAULT_NEIGHBOR_LIMIT,
): Promise<NearbyLocation[]> {
  if (!locationId || limit < 1) return [];

  const safeLimit = Math.min(Math.floor(limit), DEFAULT_NEIGHBOR_LIMIT);
  const { data: relationshipData, error: relationshipError } = await supabase
    .from("location_neighbors")
    .select("neighbor_location_id, distance_miles, position")
    .eq("location_id", locationId)
    .order("position", { ascending: true })
    .limit(safeLimit);

  if (relationshipError) {
    console.error(
      `[Nearby Locations] Relationship lookup failed for ${locationId}:`,
      relationshipError,
    );
    return [];
  }

  const relationships = (relationshipData ?? []) as NeighborRelationshipRow[];
  if (relationships.length === 0) {
    console.warn(`[Nearby Locations] No relationships found for ${locationId}.`);
    return [];
  }

  const neighborIds = relationships.map((row) => row.neighbor_location_id);
  const { data: locationData, error: locationError } = await supabase
    .from("target_locations")
    .select("id, city, state, slug")
    .in("id", neighborIds);

  if (locationError) {
    console.error(
      `[Nearby Locations] Location lookup failed for ${locationId}:`,
      locationError,
    );
    return [];
  }

  const locationsById = new Map(
    ((locationData ?? []) as LocationRow[]).map((location) => [
      location.id,
      location,
    ]),
  );

  const resolvedNeighbors = relationships.flatMap((relationship) => {
    const location = locationsById.get(relationship.neighbor_location_id);
    if (!location) return [];

    return [
      {
        ...location,
        distanceMiles: Number(relationship.distance_miles),
        position: relationship.position,
      },
    ];
  });

  if (resolvedNeighbors.length !== relationships.length) {
    console.warn(
      `[Nearby Locations] Resolved ${resolvedNeighbors.length} of ${relationships.length} relationships for ${locationId}.`,
    );
  }

  // Keep cross-state links genuinely regional. Same-state links remain useful
  // directory connections even where the stored locations are farther apart.
  return resolvedNeighbors.filter(
    (neighbor) =>
      neighbor.state === sourceState ||
      neighbor.distanceMiles <= MAX_CROSS_STATE_DISTANCE_MILES,
  );
}
