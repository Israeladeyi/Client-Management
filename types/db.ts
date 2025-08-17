/**
 * This file will contain the TypeScript types for the database tables.
 * For example, based on the `clients` table in `schema.sql`, we can define a type:
 *
 * export type Client = {
 *   id: string; // UUID is a string
 *   name: string;
 *   business_name?: string | null;
 *   email: string;
 *   phone?: string | null;
 *   industry?: string | null;
 *   status: 'Lead' | 'Discovery' | 'Proposal' | 'Active' | 'Completed' | 'Archived';
 *   notes?: string | null;
 *   created_at: string; // timestamptz is a string
 * };
 *
 * These types can be generated automatically from the Supabase schema in a more advanced setup.
 * For the MVP, we will define them manually as needed.
 */
