// Seed data for the Light Up Ogun infrastructure sheet.
//
// TEMPORARY. Nothing in GeoQuest's schema models an infrastructure asset: its
// `quests` table has lat/lng, title, instructions and a reward, but no asset
// type, delivery status, progress, allocation count or site contact. Until the
// monorepo restructure adds a real `assets` table, this file is the source of
// truth so the UI can be built and reviewed against the mockups now.
//
// Coordinates are real locations in Ogun State, so relative pin positions on the
// map panel are geographically honest even though the records are not.
//
// To go live later, replace loadAssets() with a Supabase query — the shape it
// returns is the only contract the UI depends on:
//
//   const { data } = await supabase.from('assets')
//       .select('id, name, kind, status, district, lga, lat, lng, allocated, unit, pct, contact_name, contact_phone');
//   return data;

export const DISTRICTS = ['Ogun West', 'Ogun Central', 'Ogun East'];

const ASSETS = [
    // ── Solar ────────────────────────────────────────────────────────────────
    { id: 's1',  kind: 'solar',    name: 'Brewery–Ita Oshin Road',      lga: 'Abeokuta North',  district: 'Ogun Central', lat: 7.1760, lng: 3.3210, status: 'completed', pct: 100, allocated: 200, unit: 'Poles Allocated', contactName: 'Ladi A.',     contactPhone: '07037956163' },
    { id: 's2',  kind: 'solar',    name: 'Kuto–Sapon Corridor',         lga: 'Abeokuta South',  district: 'Ogun Central', lat: 7.1457, lng: 3.3501, status: 'completed', pct: 100, allocated: 160, unit: 'Poles Allocated', contactName: 'Bisi O.',     contactPhone: '08034412907' },
    { id: 's3',  kind: 'solar',    name: 'Sagamu Interchange Approach', lga: 'Sagamu',          district: 'Ogun East',    lat: 6.8485, lng: 3.6460, status: 'ongoing',   pct: 64,  allocated: 240, unit: 'Poles Allocated', contactName: 'Tunde F.',    contactPhone: '08121330455' },
    { id: 's4',  kind: 'solar',    name: 'Ilaro Township Ring',         lga: 'Yewa South',      district: 'Ogun West',    lat: 6.8868, lng: 3.0168, status: 'completed', pct: 100, allocated: 180, unit: 'Poles Allocated', contactName: 'Morounke S.', contactPhone: '07061228834' },
    { id: 's5',  kind: 'solar',    name: 'Ota–Idiroko Expressway',      lga: 'Ado-Odo/Ota',     district: 'Ogun West',    lat: 6.6804, lng: 3.2353, status: 'ongoing',   pct: 38,  allocated: 320, unit: 'Poles Allocated', contactName: 'Kayode B.',   contactPhone: '08059903317' },
    { id: 's6',  kind: 'solar',    name: 'Ijebu-Ode Market Axis',       lga: 'Ijebu-Ode',       district: 'Ogun East',    lat: 6.8200, lng: 3.9170, status: 'completed', pct: 100, allocated: 140, unit: 'Poles Allocated', contactName: 'Adunni L.',   contactPhone: '07088214476' },
    { id: 's7',  kind: 'solar',    name: 'Ayetoro Civic Centre Link',   lga: 'Yewa North',      district: 'Ogun West',    lat: 7.2436, lng: 3.0320, status: 'ongoing',   pct: 71,  allocated: 120, unit: 'Poles Allocated', contactName: 'Segun A.',    contactPhone: '08143007729' },
    { id: 's8',  kind: 'solar',    name: 'Odeda Farm Settlement Road',  lga: 'Odeda',           district: 'Ogun Central', lat: 7.2333, lng: 3.5333, status: 'ongoing',   pct: 22,  allocated: 90,  unit: 'Poles Allocated', contactName: 'Folake R.',   contactPhone: '07012558860' },
    { id: 's9',  kind: 'solar',    name: 'Ago-Iwoye Campus Belt',       lga: 'Ijebu North',     district: 'Ogun East',    lat: 6.9333, lng: 4.0000, status: 'completed', pct: 100, allocated: 150, unit: 'Poles Allocated', contactName: 'Ifeanyi U.',  contactPhone: '08036671204' },
    { id: 's10', kind: 'solar',    name: 'Ifo–Agbado Junction',         lga: 'Ifo',             district: 'Ogun Central', lat: 6.8167, lng: 3.2000, status: 'ongoing',   pct: 55,  allocated: 210, unit: 'Poles Allocated', contactName: 'Yemi D.',     contactPhone: '07099341158' },

    // ── Boreholes ────────────────────────────────────────────────────────────
    { id: 'b1',  kind: 'borehole', name: 'Owode Ijako Market Borehole', lga: 'Ado-Odo/Ota',     district: 'Ogun West',    lat: 6.7120, lng: 3.1480, status: 'completed', pct: 100, allocated: 2400, unit: 'Households Served', contactName: 'Rasheed K.',  contactPhone: '08023387741' },
    { id: 'b2',  kind: 'borehole', name: 'Ayetoro I Motorised Borehole', lga: 'Yewa North',     district: 'Ogun West',    lat: 7.2390, lng: 3.0410, status: 'ongoing',   pct: 62,  allocated: 1800, unit: 'Households Served', contactName: 'Grace N.',    contactPhone: '07066120093' },
    { id: 'b3',  kind: 'borehole', name: 'Imeko Cluster Solar Borehole', lga: 'Imeko-Afon',     district: 'Ogun West',    lat: 7.4406, lng: 2.8286, status: 'ongoing',   pct: 78,  allocated: 1200, unit: 'Households Served', contactName: 'Dare O.',     contactPhone: '08130094462' },
    { id: 'b4',  kind: 'borehole', name: 'Obantoko Community Borehole', lga: 'Odeda',           district: 'Ogun Central', lat: 7.2050, lng: 3.4210, status: 'completed', pct: 100, allocated: 1500, unit: 'Households Served', contactName: 'Halima Y.',   contactPhone: '07044118825' },
    { id: 'b5',  kind: 'borehole', name: 'Ewekoro Quarry Belt Borehole', lga: 'Ewekoro',        district: 'Ogun Central', lat: 6.9333, lng: 3.2167, status: 'ongoing',   pct: 44,  allocated: 950,  unit: 'Households Served', contactName: 'Peter I.',    contactPhone: '08055672210' },
    { id: 'b6',  kind: 'borehole', name: 'Iperu Remo Water Point',      lga: 'Ikenne',          district: 'Ogun East',    lat: 6.9167, lng: 3.6667, status: 'completed', pct: 100, allocated: 1100, unit: 'Households Served', contactName: 'Toyin E.',    contactPhone: '07021996654' },
    { id: 'b7',  kind: 'borehole', name: 'Abigi Waterside Borehole',    lga: 'Ogun Waterside',  district: 'Ogun East',    lat: 6.4667, lng: 4.3500, status: 'ongoing',   pct: 17,  allocated: 700,  unit: 'Households Served', contactName: 'Ebun A.',     contactPhone: '08177230091' },
    { id: 'b8',  kind: 'borehole', name: 'Ijebu-Igbo Central Borehole', lga: 'Ijebu North',     district: 'Ogun East',    lat: 6.9667, lng: 4.0167, status: 'completed', pct: 100, allocated: 1600, unit: 'Households Served', contactName: 'Nurudeen B.', contactPhone: '07038845512' },
    { id: 'b9',  kind: 'borehole', name: 'Ipokia Border Community',     lga: 'Ipokia',          district: 'Ogun West',    lat: 6.6500, lng: 2.8500, status: 'ongoing',   pct: 31,  allocated: 800,  unit: 'Households Served', contactName: 'Sade M.',     contactPhone: '08091774403' },
    { id: 'b10', kind: 'borehole', name: 'Sagamu GRA Borehole',         lga: 'Sagamu',          district: 'Ogun East',    lat: 6.8390, lng: 3.6510, status: 'completed', pct: 100, allocated: 1300, unit: 'Households Served', contactName: 'Chuka V.',    contactPhone: '07055310028' },
];

// Headline figures shown above the map. These are the campaign's stated
// programme totals, not a count of the rows above — the rows are a sample.
export const PROGRAMME_TOTALS = {
    solar:    { completed: 3505, ongoing: 2330, label: 'Solar Lights Grid' },
    borehole: { completed: 38,   ongoing: 22,   label: 'Borehole Network' },
};

// Both kinds, in one list. The map shows them together and the sheet filters.
export function loadAssets() {
    return ASSETS;
}
