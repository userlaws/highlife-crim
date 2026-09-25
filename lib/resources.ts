// Criminal activity reference, compiled from the public Highlife Wiki. Anything the Wiki
// deliberately leaves out is marked as in-city knowledge rather than guessed.
// Bump resourcesUpdated whenever these tables change.
export const resourcesUpdated = '2026-09-25';

export const inCity = 'Learn in-city';

export const robberies = [
  { crime: 'House Robbery', people: '3', vehicles: '1', how: 'Find a robbable house and use the entry equipment and minigame. The Wiki only calls it “specialist equipment.”', rep: '2', notes: '200+ locations, two property variations.' },
  { crime: 'Store', people: '3', vehicles: '1', how: 'Two types: register and computer. Both need the right tools; exact names are not public.', rep: '3 register · 5 computer', notes: 'Stores close for a while after being hit.' },
  { crime: 'ATM', people: '3', vehicles: '1', how: inCity, rep: '—', notes: 'Only the crew limit is documented.' },
  { crime: 'Commercial / Container', people: '4', vehicles: '2', how: 'Find commercial crates around the map, use break-in equipment, then a unique minigame.', rep: '5', notes: 'Valuables and useful items. Inspector perk can add loot.' },
  { crime: 'Bank', people: '4', vehicles: '2', how: 'Vault robbery with a hacking minigame. Entry equipment is not public.', rep: '10 + cash', notes: 'Map: red unavailable, green available, green + check ready.' },
  { crime: 'Vangelico', people: '4', vehicles: '2', how: 'Jewellery smash-and-grab. Equipment required; not named publicly.', rep: '8', notes: 'One location. Open 9 AM–10 PM in-city.' },
  { crime: 'Convoy', people: '6 per group', vehicles: '3 per group', how: inCity, rep: '—', notes: 'Several groups can contest the same convoy, each with its own cap.' },
  { crime: 'Humane Labs', people: '6', vehicles: '3', how: inCity, rep: '—', notes: 'Higher-tier robbery.' },
  { crime: 'Union Depository', people: '8', vehicles: '4', how: 'Multiple entrances and exits, a wall stage, then protected cages. Specialist equipment, deliberately unspecified.', rep: '5 wall · 5 per cage', notes: 'Outside spotters count toward the 8.' },
] as const;

export const activities = [
  { name: 'Chop Shop', needs: 'A Chop Shop laptop for a target vehicle, and a way to force the vehicle open.', matters: 'Higher class pays more; damage cuts the payout. 2 Chop Shop points skip a target. 1/4 chance of rep.' },
  { name: 'Street Racing', needs: 'A phone for race notifications. Race tokens let you create races.', matters: 'Races roughly every 40–60 min. 1/12 chance of 1 group rep for finishing.' },
  { name: 'Street drug selling', needs: 'Sellable drugs. Hot zones need the matching phone device.', matters: 'Locals only sometimes buy. Hot zones raise chance and pay. Rep 1/30, or 1/24 with police clocked in.' },
  { name: 'Meth cooking', needs: 'Cooking supplies, cooking apparatus, an applicable vehicle, and PPE.', matters: 'Rep 1/6, 1/5 with LSPD online, 1/4 with BCSO online. See the meth section below.' },
  { name: 'Cocaine', needs: 'The right contact to call a Drug Supply Drop. Processing needs a cocaine lab; blueprints can come through shipments.', matters: 'Coke shipments have a 1/2 chance of rep (not blueprint shipments).' },
  { name: 'Weed', needs: 'Seed, pot, water, and food. Outdoors needs daylight; indoors needs constant light.', matters: 'Up to 16 pots in normal interiors, 24 in dedicated grow spaces.' },
  { name: 'LSD', needs: 'Trash searching, or buy from players.', matters: 'Cannot be sold to locals. Used for various tasks.' },
  { name: 'Gun Shipment', needs: inCity, matters: '10 group rep.' },
] as const;

export const items = [
  { name: 'Lockpick / vehicle-opening tool', about: 'Used for vehicle crime. Chop Shop needs “a way to forcefully open a vehicle.”' },
  { name: 'DES Cracker', about: 'Criminal item. The Cracker perk gives a 10–30% chance to keep it on use. Which robbery uses it is not public.' },
  { name: 'USB SSO Key', about: 'Criminal item. Tech Guy gives a 10–30% chance to keep it on use. Which robbery uses it is not public.' },
  { name: 'Industrial drill, glass cutter, other specialist gear', about: 'Known to exist, but no confirmed item-to-robbery mapping yet.' },
  { name: 'C2', about: 'Higher-end explosive equipment. Not a confirmed standard robbery requirement.' },
] as const;

export const rep = [
  ['Bank', '10'], ['Gun Shipment', '10'], ['Vangelico', '8'], ['Commercial Crate', '5'],
  ['Store Computer / USB', '5'], ['Union Wall', '5'], ['Union Cage', '5 each'], ['Store Register', '3'],
  ['House', '2'], ['Coke shipment', '1/2 chance'], ['Chop Shop', '1/4 chance of 1'], ['Meth RV', '1/6 · 1/5 LSPD · 1/4 BCSO'],
  ['Street Race', '1/12 chance of 1'], ['Drug sale', '1/30 · 1/24 with police'],
] as const;

export const perks = [
  ['99 Thieving', 'Easier locks, 30% chance a lockpick does not break'],
  ['Cat Purse', 'Up to 15% more cash from cash robberies'],
  ['Chop Chop', 'Up to 25% more Chop Shop money'],
  ['Cracker', 'Up to 30% chance to keep the DES Cracker'],
  ['Inspector', 'Up to 25% chance of an extra Commercial Crate item'],
  ['Intimidation', 'Up to 25% higher drug-sale acceptance'],
  ['Launderette', 'Up to 95% dirty-cash conversion'],
  ['Let Him Cook', 'Lowers the meth tray divisor from 33 to 31 / 29 / 27'],
  ['Low Flying', 'Up to 30% less chance PD hears about drug shipments'],
  ['Plain Sight', 'Up to 30% lower police notification chance while cooking'],
  ['Point Collector', 'Up to 30% chance of an extra Chop Shop point'],
  ['Slave Labour', 'Coke bricks process up to 15 minutes faster'],
  ['Socialite', 'Up to 25% chance of an extra drug sale'],
  ['Street Dealer', 'Up to 30% lower chance PD hears about street sales'],
  ['Tech Guy', 'Up to 30% chance to keep the USB SSO key'],
] as const;

// Cook Score (0–125) / divisor, rounded down. Four-tray rows for Tier I and II are disputed on the Wiki.
export const methTrays = [
  { perk: 'None', divisor: 33, one: '33–65', two: '66–98', three: '99–125', four: 'Impossible' },
  { perk: 'Let Him Cook I', divisor: 31, one: '31–61', two: '62–92', three: '93–123', four: '124–125?' },
  { perk: 'Let Him Cook II', divisor: 29, one: '29–57', two: '58–86', three: '87–115', four: '116–125?' },
  { perk: 'Let Him Cook III', divisor: 27, one: '27–53', two: '54–80', three: '81–107', four: '108–125' },
] as const;

export function formatUpdated(date = resourcesUpdated) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
}

// Where the facts on the Resources page come from. Check these first when updating anything above.
const wiki = 'https://wiki.highliferoleplay.net/books';
const repo = 'https://github.com/Jarrrk/HighLife';
export const sources = [
  { group: 'Highlife Wiki', links: [
    { title: 'Meth', url: `${wiki}/drugs/page/meth`, note: 'Requirements, Cook Score, the 33 divisor, tray thresholds, recipe caps, monthly scrambling, the green-zone note.' },
    { title: 'Criminal Perks', url: `${wiki}/group-system/page/criminal-perks`, note: 'Let Him Cook and every other crim perk.' },
    { title: 'Reputation Points', url: `${wiki}/group-system/page/reputation-points`, note: 'Rep for every crime, including meth cooking.' },
    { title: 'Group Specialty', url: `${wiki}/group-system/page/group-specialty`, note: 'Top Shotta and specialty meth perks.' },
  ] },
  { group: 'Meth Wiki revisions', links: [
    { title: 'Revision #405', url: `${wiki}/drugs/page/meth/revisions/405/changes`, note: 'Older version with Tier I and II four-tray ranges.' },
    { title: 'Revision #1249', url: `${wiki}/drugs/page/meth/revisions/1249/changes`, note: 'Later version that changed them to “Not Possible.”' },
    { title: 'Revision #380', url: `${wiki}/drugs/page/meth/revisions/380`, note: 'Older wording tying the cook to quality and quantity.' },
    { title: 'Full revision history', url: `${wiki}/drugs/page/meth/revisions`, note: 'How the meth docs changed over time.' },
  ] },
  { group: 'Highlife GitHub', links: [
    { title: 'Jarrrk/HighLife', url: repo, note: 'Public config and issue tracker, not the full server source.' },
    { title: 'Public config folder', url: `${repo}/tree/master/config`, note: 'No meth script or recipe algorithm is exposed.' },
    { title: 'Issue #267: Drug System', url: `${repo}/issues/267`, note: 'Early push toward mobile/RV meth.' },
    { title: 'Issue #294: The new meth as of 06/05', url: `${repo}/issues/294`, note: 'How the old meth loop worked.' },
    { title: 'Issue #2930: Cocaine vs Meth', url: `${repo}/issues/2930`, note: 'Recipe-based cooking already in place.' },
  ] },
  { group: 'Community suggestions', links: [
    { title: 'Meth tray/bag yield', url: 'https://highliferoleplay.net/suggestions/667d3c9f4c8e4bb3012722e7', note: '16–20 bags per tray report.' },
    { title: 'Warehouse meth lab', url: 'https://highliferoleplay.net/suggestions/67205112ff26e9608e2a63fc', note: 'Whitelisted lab and blue/green meth.' },
  ] },
] as const;
