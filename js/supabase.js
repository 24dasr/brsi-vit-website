// Replace these with your actual Supabase Project URL and Anon Key
const SUPABASE_URL = https://yjxnrynbrkgqhzdyxvam.supabase.co/rest/v1/;
const SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqeG5yeW5icmtncWh6ZHl4dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MDM5MzgsImV4cCI6MjA5NDQ3OTkzOH0.7o0WyGw82xbn7oDFMSU29hA6-sgHTn5mXXcHDKXxpVU;

// Initialize Supabase client
// Make sure <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> is loaded before this
window.supabaseClient = supabase.createClient(https://yjxnrynbrkgqhzdyxvam.supabase.co/rest/v1/, eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqeG5yeW5icmtncWh6ZHl4dmFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg5MDM5MzgsImV4cCI6MjA5NDQ3OTkzOH0.7o0WyGw82xbn7oDFMSU29hA6-sgHTn5mXXcHDKXxpVU);

// Helper function to get public image URL
window.getPublicUrl = function(bucket, path) {
  if (!path) return 'assets/placeholder.png';
  if (path.startsWith('http')) return path; // Already a full URL
  const { data } = window.supabaseClient.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};


