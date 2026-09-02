const STATE_NAMES: Record<string, string> = {
  AZ: "Arizona",
  CO: "Colorado",
  FL: "Florida",
  GA: "Georgia",
  KS: "Kansas",
  LA: "Louisiana",
  MO: "Missouri",
  MS: "Mississippi",
  NC: "North Carolina",
  NV: "Nevada",
  OK: "Oklahoma",
  SC: "South Carolina",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VA: "Virginia",
};

export function getStateRoute(state: string) {
  const name = STATE_NAMES[state] || state;
  return {
    name,
    href: `/locations/${name.toLowerCase().replace(/\s+/g, "-")}`,
  };
}
