export type LineStatus =
  | 'ACTIEF'
  | 'PILOT_ACTIEF'
  | 'VOORSTEL_ONDERZOEK'
  | 'GESTOPT_OPGESCHORT';

export type TariffRegime =
  | 'REGULIER_OVPAY'
  | 'NACHTTOESLAG'
  | 'ONBEPAALD';

export type DirectionCategory =
  | 'THUISBRENGER'
  | 'TWEERICHTING'
  | 'GEDEELTELIJK_ASYMMETRISCH'
  | 'ONBEPAALD';

export type ColorMode = 'status' | 'tarief' | 'richting';

export type BasemapId = 'pdok' | 'osm' | 'esri';

export type ViewMode = 'map' | 'table';

export type SortMode = 'STATUS' | 'LINE_ASC' | 'PROV_ASC' | 'VERVOERDER_ASC';

export interface NightBusStop {
  name: string;
  lat: number;
  lon: number;
  minOffset: number;
  passageTime: string;
  isHub?: boolean;
  ndovCode?: string;
  note?: string;
}

export interface NightBusLine {
  line_id: string;
  lijnnummer: string;
  naam: string;
  status: LineStatus;
  provincies: string[];
  regioCluster: string;
  concessie: string;
  vervoerder: string;
  richtingCategorie: DirectionCategory;
  richtingstypeLabel: string;
  richtingsomschrijving: string;
  rijnachten: string[];
  vertrektijden: string[];
  bekende_tijden: string;
  tariefRegime: TariffRegime;
  tariefLabel: string;
  tariefBedrag: number | null;
  overstaphubs: string[];
  chb_ndov_sleutel: string | null;
  aantalHaltesBron?: number;
  bijzonderheden: string;
  verificatieOpmerking?: string;
  bronType: 'PRIMAIR' | 'SECUNDAIR' | 'ONDERZOEK';
  bronUrl: string;
  isSteenwijkerlandRelevant?: boolean;
  routeVerloopWegen?: string;
  routeWaypoints?: [number, number][];
  haltes: NightBusStop[];
}

export interface ProvinceConcessionSummary {
  provincie: string;
  concessie: string;
  vervoerder: string;
  statusSamenvatting: string;
  aantalGeverifieerd: string;
  kernwaarnemingen: string;
  heeftNachtgat: boolean;
}

export interface FilterState {
  search: string;
  provincie: string;
  vervoerder: string;
  richting: string;
  tarief: string;
  activeStatuses: LineStatus[];
}

export type PrivateLineStatus =
  | 'PARTICULIER_ACTIEF'
  | 'PARTICULIER_SEIZOEN_MAANDELIJKS'
  | 'PARTICULIER_GESTOPT_2022_2026';

export type PrivateStopAccuracy = 'EXACTE_HALTE' | 'KERN_CENTROID';

export interface PrivateNightBusStop {
  volgnr: number;
  haltenaam: string;
  woonplaats: string;
  gemeente: string;
  lat: number;
  lon: number;
  nauwkeurigheid: PrivateStopAccuracy;
  tijd_heen: string | null;
  tijd_terug: string | null;
}

export interface PrivateNightBusLine {
  line_id: string;
  naam_verbinding: string;
  corridor: string;
  status: PrivateLineStatus;
  vervoerder: string;
  provincies: string[];
  bediende_gemeenten: string;
  frequentie: string;
  tijden_heen: string;
  tijden_terug: string;
  tarief: string;
  toelichting_en_historie: string;
  bron_url: string;
  route_verloop_wegen: string;
  stops: PrivateNightBusStop[];
  route_waypoints: [number, number][];
}

