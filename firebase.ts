import { createClient } from '@supabase/supabase-js';

// --- SUPABASE STORAGE IMPLEMENTATION ---
// Configured to use Environment Variables for secure and consistent access.
// Ensure SUPABASE_URL and SUPABASE_KEY are set in your deployment environment (e.g., Vercel).

const supabaseUrl = process.env.SUPABASE_URL || 'https://gfnbojmshrfezvsbszeu.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmbmJvam1zaHJmZXp2c2JzemV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNzE3MzYsImV4cCI6MjA4Mjc0NzczNn0.lG7E1uO_XL95hxeLQbg7eG8qOz_0AKt8guguTJWoVgg';

// Initialize the client once
const supabase = createClient(supabaseUrl, supabaseKey);

export const saveWishToCloud = async (data: any) => {
  if (!supabaseUrl || !supabaseKey) {
      throw new Error("Configuration Error: Missing Supabase Environment Variables.");
  }

  try {
      const cleanData = JSON.parse(JSON.stringify(data));

      // Requires table: create table wishes (id uuid default uuid_generate_v4() primary key, data jsonb);
      const { data: result, error } = await supabase
        .from('wishes')
        .insert([
            { data: cleanData }
        ])
        .select()
        .single();

      if (error) throw error;
      return result.id;

  } catch (e: any) {
    console.error("Supabase Save Error:", e);
    throw e;
  }
};

export const getWishFromCloud = async (id: string) => {
  if (!supabaseUrl || !supabaseKey) {
      console.error("Configuration Error: Missing Supabase Environment Variables.");
      return null;
  }

  try {
    const { data, error } = await supabase
        .from('wishes')
        .select('data')
        .eq('id', id)
        .single();

    if (error) {
        console.warn("Supabase Fetch Error (Check ID or Table Permissions):", error.message);
        return null;
    }
    
    return data?.data || null;

  } catch (e) {
    console.error("Error fetching wish:", e);
    return null;
  }
};