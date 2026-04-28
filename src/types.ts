export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  pricePerGram?: number;
  pricePerHour?: number;
  images: string[];
  category: string;
  colors?: string[];
  sizes?: string[];
  material?: string;
  rating?: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered';
  paymentMethod: 'mercadopago' | 'paypal';
  paymentId?: string;
  createdAt: number;
  customQuote?: CustomQuote;
}

export interface CustomQuote {
  description: string;
  referenceUrl?: string;
  status: 'requested' | 'quoted' | 'accepted' | 'rejected';
  price?: number;
}

export interface Testimonial {
  id: string;
  user_id: string;
  user_name: string;
  avatar_url?: string;
  content: string;
  rating: number;
  created_at: string;
}

export interface ChatThread {
  id: string;
  user_id: string;
  product_id?: string;
  last_message?: string;
  last_sender_id?: string;
  unread_count?: number;
  updated_at: string;
  created_at: string;
  user_email?: string;
  product_name?: string;
}

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  content: string;
  created_at: string;
}
