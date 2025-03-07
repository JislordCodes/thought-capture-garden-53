
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iyyxvvdjhmuxznoubofh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5eXh2dmRqaG11eHpub3Vib2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk4MTI0MzQsImV4cCI6MjAyNTM4ODQzNH0.Z-1tnpF8SzuWxnj5tKCwMMNjX57nTUr8FBKsYveFcQc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
