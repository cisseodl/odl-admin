export interface Configuration {
  id: number;
  activate: boolean;
  createdAt?: Date | null;
  created_by?: string | null;
  updatedAt?: Date | null;
  modified_by?: string | null;
  aboutImageUrl?: string | null;
  aboutText?: string | null;
  homepageImageUrl?: string | null;
  homepageText?: string | null;
  loginImageUrl?: string | null;
}
