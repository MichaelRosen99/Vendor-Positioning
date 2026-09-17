export type TargetMarket = "Consumer" | "SMB" | "Mid-Market" | "Large Enterprise";

export type SentimentLabel = "Positive" | "Mixed" | "Negative";

export interface VendorRow {
  name: string;
  product?: string;
  revenue: string;
  employees: string;
  hqLocation: string;
  products: string[];
  targetMarket: TargetMarket[];
  representativeClients: string[];
  sentiment: {
    label: SentimentLabel;
    summary: string;
  };
}

export interface VendorLookupResult {
  vendor: VendorRow;
  competitors: VendorRow[];
}

export interface AddCompanyResult {
  row: VendorRow;
}
