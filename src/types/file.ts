export type HouseFile = {
  id: string;
  house_id: string;
  storage_path: string;
  file_name: string;
  size_bytes: number | null;
  position: number;
  created_at: string;
};

export type TokenStatus = "active" | "used" | "expired" | "revoked";

export type FileToken = {
  id: string;
  label: string;
  expires_at: string;
  used_at: string | null;
  revoked_at: string | null;
  created_at: string;
  status: TokenStatus;
};

export type FileTokenRow = Omit<FileToken, "status">;

export type AdminFile = HouseFile & { tokens: FileToken[] };