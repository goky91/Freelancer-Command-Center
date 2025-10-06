export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface Client {
  id: number;
  name: string;
  email?: string;
  company?: string;
  address?: string;
  pib?: string;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: number;
  client: number;
  client_name: string;
  month: number;
  year: number;
  hours: string;
  hourly_rate: string;
  description?: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: number;
  client: number;
  client_name: string;
  time_entry: number;
  time_entry_details: TimeEntry;
  invoice_number: string;
  issue_date: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid';
  notes?: string;
  total_amount: string;
  created_at: string;
  updated_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
