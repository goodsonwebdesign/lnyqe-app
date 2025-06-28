/**
 * @description The definitive User model, aligned with the backend API response.
 * This interface represents a user account in the system.
 */
export interface User {
  id?: number;
  auth0_id?: string;
  email: string;
  email_verified: boolean;
  name: string;
  first_name: string;
  last_name: string;
  avatar: string;
  role: string;
  created_at: string;
  updated_at: string;
  last_login: string;
}
