export interface Photographer {
  id: number;
  email: string;
  studioName: string;
}

export interface Client {
  id: number;
  name: string;
  email?: string;
  unique_link: string;
  uniqueLink?: string;
  photo_count?: number;
  selected_count?: number;
  created_at: string;
  studio_name?: string;
}

export interface Photo {
  id: number;
  client_id: number;
  photographer_id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  is_selected: boolean;
  is_favorite?: boolean;
  like_count?: number;
  uploaded_at: string;
}

export interface AuthResponse {
  token: string;
  photographer: Photographer;
}
