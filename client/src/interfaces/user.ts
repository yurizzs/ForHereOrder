export type Theme = 'light' | 'dark' | 'system';
export type Role = 'vendor' | 'admin' | 'student';

export interface User {
  id: number;
  slug: string;
  avatar: string | null;
  name: string;
  username: string;
  email: string | null;
  phone: string | null;
  role: Role;
  theme: Theme;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Student extends User {
  role: 'student';
}
