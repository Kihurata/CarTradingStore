export enum ReportType {
  FRAUD = 'fraud',
  UNREACHABLE = 'unreachable',
  WRONG_PRICE = 'wrong_price',
  DUPLICATE = 'duplicate',
  SOLD = 'sold',
  INCORRECT_INFO = 'incorrect_info',
  OTHER = 'other',
}

export enum ReportStatus {
  NEW = 'new',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export interface Report {
  id: string;
  listing_id: string;
  reporter_id?: string | null;
  reporter_phone?: string | null;
  type: ReportType;
  note?: string | null;
  status: ReportStatus;
  created_at: Date;
  reviewed_at?: Date | null;
  reviewed_by?: string | null;
}