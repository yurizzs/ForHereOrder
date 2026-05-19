export type Theme = 'light' | 'dark' | 'system';
export type Role = 'vendor' | 'admin';

export interface User {
  id: number;
  slug: string;
  avatar: string;
  name: string;
  username: string;
  phone: string;
  role: Role;
  theme: Theme;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}