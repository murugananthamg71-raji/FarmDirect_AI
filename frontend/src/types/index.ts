export type UserRole = 'FARMER' | 'BUYER' | 'LOGISTICS' | 'ADMIN';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  is_active: boolean;
  farmer_profile?: FarmerProfile;
  buyer_profile?: BuyerProfile;
  logistics_profile?: LogisticsProfile;
}

export interface FarmerProfile {
  id: number;
  user_id: number;
  farm_name: string;
  is_fpo: boolean;
  member_count?: number;
  verification_status: 'UNVERIFIED' | 'DEMO_VERIFIED';
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
}

export interface BuyerProfile {
  id: number;
  user_id: number;
  buyer_type: 'INDIVIDUAL' | 'RETAILER' | 'BULK_BUYER';
  business_name?: string;
  delivery_address: string;
  district: string;
  state: string;
}

export interface LogisticsProfile {
  id: number;
  user_id: number;
  vehicle_type: string;
  vehicle_number: string;
  max_capacity_kg: number;
  current_district: string;
}

export interface ProductPriceTier {
  id: number;
  product_id: number;
  min_quantity: number;
  price_per_unit: number;
}

export interface Product {
  id: number;
  farmer_id: number;
  farmer_name?: string;
  farm_name?: string;
  is_fpo?: boolean;
  verification_status?: 'UNVERIFIED' | 'DEMO_VERIFIED';
  name: string;
  category: string;
  description: string;
  image_url: string;
  quantity: number;
  unit: string;
  price_per_unit: number;
  harvest_date: string;
  district: string;
  state: string;
  latitude: number;
  longitude: number;
  is_organic: boolean;
  is_active: boolean;
  price_tiers: ProductPriceTier[];
  created_at: string;
}

export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  quantity: number;
  price_per_unit: number;
}

export type OrderStatus =
  | 'PLACED'
  | 'CONFIRMED'
  | 'PACKED'
  | 'READY_FOR_PICKUP'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REJECTED';

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  unit: string;
  quantity: number;
  price_per_unit: number;
  subtotal: number;
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  from_status?: OrderStatus;
  to_status: OrderStatus;
  notes?: string;
  created_by_role: string;
  created_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  amount: number;
  method: 'UPI' | 'CARD' | 'COD';
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'COD_PENDING';
  payment_reference: string;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  buyer_id: number;
  farmer_id: number;
  farmer_name?: string;
  farm_name?: string;
  buyer_name?: string;
  delivery_address: string;
  delivery_slot: string;
  total_amount: number;
  status: OrderStatus;
  items: OrderItem[];
  status_history: OrderStatusHistory[];
  payment?: Payment;
  created_at: string;
}

export interface Delivery {
  id: number;
  order_id: number;
  logistics_partner_id?: number;
  partner_name?: string;
  pickup_district: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_district: string;
  drop_address: string;
  drop_lat: number;
  drop_lng: number;
  status: 'UNASSIGNED' | 'ASSIGNED' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'DECLINED';
  distance_km: number;
  estimated_minutes: number;
  order?: Order;
  created_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  buyer_id: number;
  buyer_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface ImpactStats {
  estimated_farmer_uplift_pct: number;
  estimated_consumer_savings_pct: number;
  route_km_saved: number;
  total_farmers: number;
  total_buyers: number;
  total_orders: number;
  total_gmv: number;
}

export interface DemandResult {
  category: string;
  district: string;
  predicted_demand_kg: number;
  demand_level: string;
  confidence_score: number;
  chart_data: { week: string; demand_kg: number; is_forecast: boolean }[];
  stock_planning_recommendation: string;
  explanation: string;
}

export interface PriceResult {
  product_name: string;
  category: string;
  district: string;
  suggested_min: number;
  suggested_recommended: number;
  suggested_max: number;
  current_price_status: string;
  demand_indicator: string;
  fair_price_breakdown: Record<string, number>;
  explanation: string;
}

export interface StopPoint {
  id: number;
  type: 'PICKUP' | 'DROP';
  name: string;
  district: string;
  latitude: number;
  longitude: number;
  order_id: number;
}

export interface RouteResult {
  ordered_stops: StopPoint[];
  total_distance_km: number;
  estimated_minutes: number;
  km_saved_vs_naive: number;
  polyline: number[][];
}

