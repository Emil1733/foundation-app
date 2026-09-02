import path from "node:path";
import process from "node:process";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";
import cities from "cities";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(".env.local"), quiet: true });
const apply = process.argv.includes("--apply");
const limitArg = process.argv.find((value) => value.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.split("=")[1]) : Infinity;
const baseUrl = "https://foundationrisk.org/services/foundation-repair/";
const end = new Date(); end.setUTCDate(end.getUTCDate() - 3);
const start = new Date(end); start.setUTCMonth(start.getUTCMonth() - 16);
const date = (value) => value.toISOString().slice(0, 10);
const normalizeUrl = (value) => value.replace("https://www.", "https://").replace(/\/$/, "");

async function all(query, size = 1000) {
  const output = [];
  for (let from = 0; ; from += size) {
    const { data, error } = await query(from, from + size - 1);
    if (error) throw error;
    output.push(...data);
    if (data.length < size) return output;
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const readKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const writeKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !readKey || (apply && !writeKey)) throw new Error("Required Supabase configuration is missing.");
const db = createClient(url, apply ? writeKey : readKey, { auth: { persistSession: false } });

const auth = new google.auth.GoogleAuth({
  keyFile: path.resolve("..", "gsc-credentials.json"),
  scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
});
const searchconsole = google.searchconsole({ version: "v1", auth });
const gscRows = [];
for (let startRow = 0; ; startRow += 25000) {
  const response = await searchconsole.searchanalytics.query({
    siteUrl: "sc-domain:foundationrisk.org",
    requestBody: { startDate: date(start), endDate: date(end), dimensions: ["page"], dataState: "final", rowLimit: 25000, startRow },
  });
  const rows = response.data.rows ?? [];
  gscRows.push(...rows);
  if (rows.length < 25000) break;
}
const protectedUrls = new Set(gscRows.map((row) => normalizeUrl(row.keys[0])));
const locations = await all((from, to) => db.from("target_locations")
  .select("id, slug, city, state, zip_code, latitude, longitude, soil_cache(map_unit_name)")
  .order("id").range(from, to));
const normalizeCity = (value) => value.toLowerCase().replace(/^st[.]? /, "saint ").replace(/[^a-z0-9]/g, "");
function resolvePlaces(location) {
  const matches = [];
  if (/^\d{5}$/.test(location.zip_code) && location.zip_code !== "00000") {
    const match = cities.zipLookup(location.zip_code);
    if (match?.state_abbr === location.state) matches.push(match);
  }
  matches.push(...cities.filter((item) => item.state_abbr === location.state && normalizeCity(item.city) === normalizeCity(location.city)));
  if (Number.isFinite(Number(location.latitude)) && Number.isFinite(Number(location.longitude))) {
    matches.push({ zipcode: location.zip_code, latitude: location.latitude, longitude: location.longitude, source: "stored_coordinates" });
  }
  const seen = new Set();
  return matches.filter((item) => {
    const key = `${Number(item.latitude).toFixed(5)},${Number(item.longitude).toFixed(5)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function soilAt(latitude, longitude) {
  const query = `SELECT mu.musym AS map_unit_symbol, mu.muname AS map_unit_name, c.compname AS component_name, ch.lep_r AS shrink_swell, ch.pi_r AS plasticity_index, c.drainagecl AS drainage_class FROM mapunit mu INNER JOIN component c ON c.mukey=mu.mukey INNER JOIN chorizon ch ON ch.cokey=c.cokey WHERE mu.mukey IN (SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('POINT(${Number(longitude)} ${Number(latitude)})')) AND c.majcompflag='Yes' AND ch.hzdept_r < 50 ORDER BY c.comppct_r DESC, ch.hzdept_r ASC`;
  const response = await fetch("https://sdmdataaccess.nrcs.usda.gov/Tabular/post.rest", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, format: "JSON+COLUMNNAME" }),
  });
  if (!response.ok) throw new Error(`USDA ${response.status}`);
  const body = await response.json();
  if (!body.Table || body.Table.length < 2) return null;
  return Object.fromEntries(body.Table[0].map((key, index) => [key, body.Table[1][index]]));
}

const missing = locations.filter((location) => {
  const relation = Array.isArray(location.soil_cache) ? location.soil_cache[0] : location.soil_cache;
  return !relation?.map_unit_name?.trim() && !protectedUrls.has(normalizeUrl(`${baseUrl}${location.slug}`));
}).slice(0, limit);
const results = [];
for (const location of missing) {
  const places = resolvePlaces(location);
  if (!places.length) { results.push({ slug: location.slug, status: "unresolved_place" }); continue; }
  try {
    let soil = null;
    let place = null;
    for (const candidate of places) {
      soil = await soilAt(candidate.latitude, candidate.longitude);
      if (soil?.map_unit_name) { place = candidate; break; }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    if (!soil?.map_unit_name || !place) { results.push({ slug: location.slug, status: "no_usda_soil", candidates_checked: places.length }); continue; }
    const pi = soil.plasticity_index == null || soil.plasticity_index === "" ? null : Number(soil.plasticity_index);
    const shrink = soil.shrink_swell == null || soil.shrink_swell === "" ? null : Number(soil.shrink_swell);
    const risk = pi == null ? null : pi >= 35 ? "Severe" : pi >= 25 ? "High" : pi >= 15 ? "Moderate" : "Low";
    if (apply) {
      // Do not update zip_code here: it may participate in a generated public
      // slug in some schema revisions. ZIP correction needs redirect planning.
      const { error: soilError } = await db.from("soil_cache").upsert({ location_id: location.id, map_unit_symbol: soil.map_unit_symbol, map_unit_name: soil.map_unit_name, component_name: soil.component_name || null, shrink_swell_potential: shrink, plasticity_index: pi, drainage_class: soil.drainage_class || null, risk_level: risk }, { onConflict: "location_id" });
      if (soilError) throw soilError;
    }
    results.push({ slug: location.slug, status: apply ? "updated" : "ready", zip: place.zipcode, soil: soil.map_unit_name, pi, risk });
  } catch (error) { results.push({ slug: location.slug, status: "error", error: error.message }); }
  await new Promise((resolve) => setTimeout(resolve, 150));
}
const summary = Object.fromEntries([...new Set(results.map((item) => item.status))].map((status) => [status, results.filter((item) => item.status === status).length]));
console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", gscThrough: date(end), targetCount: missing.length, summary, exceptions: results.filter((item) => !["ready", "updated"].includes(item.status)), results }, null, 2));
