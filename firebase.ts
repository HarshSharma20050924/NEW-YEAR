import { createClient } from '@supabase/supabase-js';

// Helper to read env in Vite or CRA
const getEnvVar = (key: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return '';
};

const supabaseUrl =
  getEnvVar('VITE_SUPABASE_URL') ||
  getEnvVar('REACT_APP_SUPABASE_URL') ||
  getEnvVar('SUPABASE_URL');

const supabaseKey =
  getEnvVar('VITE_SUPABASE_KEY') ||
  getEnvVar('REACT_APP_SUPABASE_KEY') ||
  getEnvVar('SUPABASE_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

// --- SAVE ---
export const saveWishToCloud = async (data: any) => {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase env variables");
  }

  const cleanData = JSON.parse(JSON.stringify(data));

  const { data: result, error } = await supabase
    .from('wishes')
    .insert([{ data: cleanData }])
    .select('id')
    .single();

  if (error) throw error;

  return result.id;
};

// --- LOAD ---
export const getWishFromCloud = async (id: string) => {
  const { data, error } = await supabase
    .from('wishes')
    .select('data')
    .eq('id', id)
    .single();

  if (error) return null;
  return data?.data ?? null;
};
