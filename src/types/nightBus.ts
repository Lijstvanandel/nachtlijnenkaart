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
