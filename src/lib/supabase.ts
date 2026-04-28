import { createClient } from '@supabase/supabase-js';

// @ts-ignore
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
// @ts-ignore
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validation helper for Supabase URL
const isValidUrl = (url: string) => {
  try {
    return url && (url.startsWith('http://') || url.startsWith('https://')) && url.includes('.');
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl : 'https://abcdefghijklm.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder';

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
  console.warn('Supabase credentials are missing or invalid. Using placeholders. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your project settings.');
}

export const supabase = createClient(finalUrl, finalKey);

/**
 * SQL SCHEMA FOR SUPABASE:
 * 
 * -- Profiles Table (Extended User Data)
 * CREATE TABLE profiles (
 *   id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
 *   email TEXT UNIQUE NOT NULL,
 *   full_name TEXT,
 *   role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Enable RLS
 * ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
 * CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);
 * 
 * -- Testimonials Table
 * CREATE TABLE testimonials (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   user_name TEXT NOT NULL,
 *   avatar_url TEXT,
 *   content TEXT NOT NULL,
 *   rating INTEGER CHECK (rating >= 1 AND rating <= 5),
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Enable RLS
 * ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Anyone can read testimonials." ON testimonials FOR SELECT USING (true);
 * CREATE POLICY "Authenticated users can insert testimonials." ON testimonials FOR INSERT WITH CHECK (auth.role() = 'authenticated');
 * 
 * -- Products Table
 * CREATE TABLE products (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   name TEXT NOT NULL,
 *   description TEXT,
 *   price NUMERIC NOT NULL,
 *   images TEXT[] DEFAULT '{}',
 *   category TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Orders Table
 * CREATE TABLE orders (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   items JSONB NOT NULL,
 *   total NUMERIC NOT NULL,
 *   status TEXT DEFAULT 'pending',
 *   payment_method TEXT,
 *   payment_id TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Chat Threads Table
 * CREATE TABLE chat_threads (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   user_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   product_id UUID REFERENCES products ON DELETE SET NULL,
 *   user_email TEXT,
 *   product_name TEXT,
 *   last_message TEXT,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Enable RLS for chat_threads
 * ALTER TABLE chat_threads ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can see their own threads." ON chat_threads FOR SELECT USING (auth.uid() = user_id);
 * CREATE POLICY "Admins can see all threads." ON chat_threads FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
 * 
 * -- Chat Messages Table
 * CREATE TABLE chat_messages (
 *   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
 *   thread_id UUID REFERENCES chat_threads ON DELETE CASCADE,
 *   sender_id UUID REFERENCES auth.users ON DELETE CASCADE,
 *   content TEXT NOT NULL,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * -- Enable RLS for chat_messages
 * ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
 * CREATE POLICY "Users can see messages in their threads." ON chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM chat_threads WHERE id = thread_id AND user_id = auth.uid()));
 * CREATE POLICY "Admins can see all messages." ON chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
 */
