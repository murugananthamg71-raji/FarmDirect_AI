import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, ForeignKey, DateTime, Enum as SQLEnum, Text, Numeric, Table, Index
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    BUYER = "BUYER"
    LOGISTICS = "LOGISTICS"
    ADMIN = "ADMIN"

class VerificationStatus(str, enum.Enum):
    UNVERIFIED = "UNVERIFIED"
    DEMO_VERIFIED = "DEMO_VERIFIED"

class BuyerType(str, enum.Enum):
    INDIVIDUAL = "INDIVIDUAL"
    RETAILER = "RETAILER"
    BULK_BUYER = "BULK_BUYER"

class OrderStatus(str, enum.Enum):
    PLACED = "PLACED"
    CONFIRMED = "CONFIRMED"
    PACKED = "PACKED"
    READY_FOR_PICKUP = "READY_FOR_PICKUP"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    COD_PENDING = "COD_PENDING"

class PaymentMethod(str, enum.Enum):
    UPI = "UPI"
    CARD = "CARD"
    COD = "COD"

class DeliveryStatus(str, enum.Enum):
    UNASSIGNED = "UNASSIGNED"
    ASSIGNED = "ASSIGNED"
    ACCEPTED = "ACCEPTED"
    PICKED_UP = "PICKED_UP"
    IN_TRANSIT = "IN_TRANSIT"
    DELIVERED = "DELIVERED"
    DECLINED = "DECLINED"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    farmer_profile = relationship("FarmerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    buyer_profile = relationship("BuyerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    logistics_profile = relationship("LogisticsProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class FarmerProfile(Base):
    __tablename__ = "farmer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    farm_name = Column(String, nullable=False)
    is_fpo = Column(Boolean, default=False)
    member_count = Column(Integer, default=1)
    verification_status = Column(SQLEnum(VerificationStatus), default=VerificationStatus.UNVERIFIED)
    district = Column(String, index=True, nullable=False)
    state = Column(String, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)

    user = relationship("User", back_populates="farmer_profile")
    products = relationship("Product", back_populates="farmer", cascade="all, delete-orphan")

class BuyerProfile(Base):
    __tablename__ = "buyer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    buyer_type = Column(SQLEnum(BuyerType), default=BuyerType.INDIVIDUAL)
    business_name = Column(String, nullable=True)
    delivery_address = Column(Text, nullable=False)
    district = Column(String, index=True, nullable=False)
    state = Column(String, nullable=False)

    user = relationship("User", back_populates="buyer_profile")

class LogisticsProfile(Base):
    __tablename__ = "logistics_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    vehicle_type = Column(String, nullable=False)
    vehicle_number = Column(String, nullable=False)
    max_capacity_kg = Column(Float, default=1000.0)
    current_district = Column(String, index=True, nullable=False)

    user = relationship("User", back_populates="logistics_profile")
    deliveries = relationship("Delivery", back_populates="partner")

class ProductCategory(Base):
    __tablename__ = "product_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True, nullable=False)
    description = Column(String, nullable=True)
    icon_name = Column(String, nullable=True)

class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id", ondelete="CASCADE"), nullable=False)
    name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    description = Column(Text, nullable=False)
    image_url = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String, nullable=False)  # kg, quintal, ton, dozen, piece
    price_per_unit = Column(Float, nullable=False)
    harvest_date = Column(String, nullable=False)
    district = Column(String, index=True, nullable=False)
    state = Column(String, nullable=False)
    latitude = Column(Float, default=11.0168)
    longitude = Column(Float, default=76.9558)
    is_organic = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    farmer = relationship("FarmerProfile", back_populates="products")
    price_tiers = relationship("ProductPriceTier", back_populates="product", cascade="all, delete-orphan")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")

__table_args__ = (
    Index("idx_products_filter", Product.category, Product.district, Product.price_per_unit, Product.is_active),
)

class ProductPriceTier(Base):
    __tablename__ = "product_price_tiers"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    min_quantity = Column(Float, nullable=False)
    price_per_unit = Column(Float, nullable=False)

    product = relationship("Product", back_populates="price_tiers")

class CartItem(Base):
    __tablename__ = "cart_items"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Float, nullable=False)

    product = relationship("Product")

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="RESTRICT"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("farmer_profiles.id", ondelete="RESTRICT"), nullable=False)
    delivery_address = Column(Text, nullable=False)
    delivery_slot = Column(String, nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.PLACED, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")
    payment = relationship("Payment", back_populates="order", uselist=False, cascade="all, delete-orphan")
    delivery = relationship("Delivery", back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="RESTRICT"), nullable=False)
    product_name = Column(String, nullable=False)
    unit = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    price_per_unit = Column(Float, nullable=False)
    subtotal = Column(Float, nullable=False)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    from_status = Column(SQLEnum(OrderStatus), nullable=True)
    to_status = Column(SQLEnum(OrderStatus), nullable=False)
    notes = Column(String, nullable=True)
    created_by_role = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    order = relationship("Order", back_populates="status_history")

class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    amount = Column(Float, nullable=False)
    method = Column(SQLEnum(PaymentMethod), nullable=False)
    status = Column(SQLEnum(PaymentStatus), default=PaymentStatus.PENDING, nullable=False)
    payment_reference = Column(String, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    order = relationship("Order", back_populates="payment")

class Delivery(Base):
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False)
    logistics_partner_id = Column(Integer, ForeignKey("logistics_profiles.id", ondelete="SET NULL"), nullable=True)
    pickup_district = Column(String, nullable=False)
    pickup_lat = Column(Float, default=11.0168)
    pickup_lng = Column(Float, default=76.9558)
    drop_district = Column(String, nullable=False)
    drop_address = Column(Text, nullable=False)
    drop_lat = Column(Float, default=11.0300)
    drop_lng = Column(Float, default=76.9700)
    status = Column(SQLEnum(DeliveryStatus), default=DeliveryStatus.UNASSIGNED, nullable=False)
    distance_km = Column(Float, default=15.0)
    estimated_minutes = Column(Integer, default=45)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    order = relationship("Order", back_populates="delivery")
    partner = relationship("LogisticsProfile", back_populates="deliveries")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    product = relationship("Product", back_populates="reviews")
    buyer = relationship("User")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="notifications")

class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    reporter_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), nullable=True)
    reason = Column(String, nullable=False)
    details = Column(Text, nullable=False)
    status = Column(String, default="PENDING")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class DemandForecast(Base):
    __tablename__ = "demand_forecasts"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
    forecast_week = Column(String, nullable=False)
    predicted_demand_kg = Column(Float, nullable=False)
    demand_level = Column(String, nullable=False)  # LOW, MEDIUM, HIGH
    confidence_score = Column(Float, default=0.88)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class MarketPriceDemo(Base):
    __tablename__ = "market_prices_demo"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, index=True, nullable=False)
    category = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
    min_price = Column(Float, nullable=False)
    modal_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class AuditLog(Base):
    __tablename__ = "audit_log"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String, nullable=False)
    performed_by_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

