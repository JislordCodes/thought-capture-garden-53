// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://iyyxvvdjhmuxznoubofh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5eXh2dmRqaG11eHpub3Vib2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNTc0NzQsImV4cCI6MjA1NjkzMzQ3NH0.S3uM7uRQZwfBYKPJhEuemjBBHrXoPbWLb9-5eSQKjpg";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);