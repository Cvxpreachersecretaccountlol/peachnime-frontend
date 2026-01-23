import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rbxdnypsktkwtbuntmst.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJieGRueXBza3Rrd3RidW50bXN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTE2NTQsImV4cCI6MjA4NDY2NzY1NH0.vwGNE4SK1b26XkcoNDLZIE3gnuTT3KdO17RBfJySLn0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
