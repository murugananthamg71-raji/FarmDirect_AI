import datetime
from sqlalchemy.orm import Session
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.db.models import (
    User, UserRole, FarmerProfile, BuyerProfile, LogisticsProfile, BuyerType, VerificationStatus,
    ProductCategory, Product, ProductPriceTier, Order, OrderItem, OrderStatus, OrderStatusHistory,
    Payment, PaymentMethod, PaymentStatus, Delivery, DeliveryStatus, Review, Notification, MarketPriceDemo
)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        print("Seeding database with SIH26033 demo dataset...")

        # 1. Categories
        categories = [
            ProductCategory(name="Vegetables", description="Fresh farm vegetables", icon_name="Carrot"),
            ProductCategory(name="Fruits", description="Fresh seasonal fruits", icon_name="Apple"),
            ProductCategory(name="Grains & Pulses", description="Organic rice, wheat, & pulses", icon_name="Wheat"),
            ProductCategory(name="Spices & Herbs", description="High aroma natural spices", icon_name="Sparkles"),
            ProductCategory(name="Nuts & Oilseeds", description="Groundnuts, coconuts, & seeds", icon_name="Nut"),
        ]
        db.add_all(categories)
        db.commit()

        # 2. Admin User
        admin_user = User(
            email="admin@demo.com",
            hashed_password=get_password_hash("Demo@123"),
            full_name="Platform Administrator",
            role=UserRole.ADMIN,
            phone="+91 9900000001"
        )
        db.add(admin_user)

        # 3. Logistics Users (3 partners)
        logistics_data = [
            ("logistics@demo.com", "Logistics Partner (Coimbatore Hub)", "Mini Truck (1.5 Ton)", "TN-37-AZ-1001", 1500.0, "Coimbatore"),
            ("logistics2@demo.com", "Green Express Logistics", "Heavy Commercial Vehicle (5 Ton)", "TN-59-BX-2002", 5000.0, "Madurai"),
            ("logistics3@demo.com", "AgriTransit Fleet", "Three Wheeler (500 kg)", "TN-01-CV-3003", 500.0, "Chennai"),
        ]
        logistics_profiles = []
        for email, name, v_type, v_num, cap, dist in logistics_data:
            u = User(
                email=email,
                hashed_password=get_password_hash("Demo@123"),
                full_name=name,
                role=UserRole.LOGISTICS,
                phone="+91 9800000000"
            )
            db.add(u)
            db.flush()
            lp = LogisticsProfile(
                user_id=u.id,
                vehicle_type=v_type,
                vehicle_number=v_num,
                max_capacity_kg=cap,
                current_district=dist
            )
            db.add(lp)
            logistics_profiles.append(lp)

        # 4. Farmers & FPOs (12 farmers across districts)
        farmers_raw = [
            ("farmer@demo.com", "Ramanathan K.", "Green Harvest Organics", False, 1, VerificationStatus.DEMO_VERIFIED, "Coimbatore", "Tamil Nadu", 11.0168, 76.9558),
            ("fpo1@demo.com", "Kongu Farmer Producer Co-op", "Kongu Agri FPO", True, 450, VerificationStatus.DEMO_VERIFIED, "Coimbatore", "Tamil Nadu", 11.0250, 76.9600),
            ("farmer2@demo.com", "Murugan V.", "Kovai Fresh Farm", False, 1, VerificationStatus.DEMO_VERIFIED, "Coimbatore", "Tamil Nadu", 11.0300, 76.9400),
            ("farmer3@demo.com", "Senthil Kumar", "Vigorous Agri Fields", False, 1, VerificationStatus.DEMO_VERIFIED, "Erode", "Tamil Nadu", 11.3410, 77.7172),
            ("fpo2@demo.com", "Thanjavur Delta Rice FPO", "Delta Farmers Collective", True, 820, VerificationStatus.DEMO_VERIFIED, "Thanjavur", "Tamil Nadu", 10.7870, 79.1378),
            ("farmer4@demo.com", "Selvam R.", "Madurai Sweet Mangoes", False, 1, VerificationStatus.DEMO_VERIFIED, "Madurai", "Tamil Nadu", 9.9252, 78.1198),
            ("farmer5@demo.com", "Gurpreet Singh", "Punjab Golden Grains", False, 1, VerificationStatus.DEMO_VERIFIED, "Ludhiana", "Punjab", 30.9010, 75.8573),
            ("farmer6@demo.com", "Patil Organics", "Sahyadri Valley Farm", False, 1, VerificationStatus.UNVERIFIED, "Nashik", "Maharashtra", 19.9975, 73.7898),
            ("farmer7@demo.com", "Venkateshappa N.", "Deccan Horticulture", False, 1, VerificationStatus.DEMO_VERIFIED, "Kolar", "Karnataka", 13.1367, 78.1292),
            ("farmer8@demo.com", "Kannan P.", "Nilgiri Herbal Farm", False, 1, VerificationStatus.DEMO_VERIFIED, "Nilgiris", "Tamil Nadu", 11.4102, 76.6950),
            ("farmer9@demo.com", "Anand M.", "Pollachi Coconut Groves", False, 1, VerificationStatus.DEMO_VERIFIED, "Coimbatore", "Tamil Nadu", 10.6587, 77.0083),
            ("farmer10@demo.com", "Devi Farmers Group", "Cauvery Delta Organics", False, 1, VerificationStatus.UNVERIFIED, "Trichy", "Tamil Nadu", 10.7905, 78.7047),
        ]

        farmer_profiles = []
        for email, name, farm_name, is_fpo, m_count, v_stat, dist, st, lat, lng in farmers_raw:
            u = User(
                email=email,
                hashed_password=get_password_hash("Demo@123"),
                full_name=name,
                role=UserRole.FARMER,
                phone="+91 9700000000"
            )
            db.add(u)
            db.flush()
            fp = FarmerProfile(
                user_id=u.id,
                farm_name=farm_name,
                is_fpo=is_fpo,
                member_count=m_count,
                verification_status=v_stat,
                district=dist,
                state=st,
                latitude=lat,
                longitude=lng
            )
            db.add(fp)
            farmer_profiles.append(fp)

        # 5. Buyers (8 buyers)
        buyers_raw = [
            ("buyer@demo.com", "Anita Sharma", BuyerType.INDIVIDUAL, None, "RS Puram, Coimbatore", "Coimbatore", "Tamil Nadu"),
            ("buyer2@demo.com", "FreshBites Supermarket", BuyerType.RETAILER, "FreshBites Retail Ltd", "Avinashi Road, Coimbatore", "Coimbatore", "Tamil Nadu"),
            ("buyer3@demo.com", "Kovai Hotel Grand", BuyerType.BULK_BUYER, "Grand Hotels Group", "Gandhipuram, Coimbatore", "Coimbatore", "Tamil Nadu"),
            ("buyer4@demo.com", "Rajesh Kumar", BuyerType.INDIVIDUAL, None, "Anna Nagar, Chennai", "Chennai", "Tamil Nadu"),
            ("buyer5@demo.com", "Organic Basket Stores", BuyerType.RETAILER, "Organic Basket Pvt Ltd", "KK Nagar, Madurai", "Madurai", "Tamil Nadu"),
            ("buyer6@demo.com", "Priya Nair", BuyerType.INDIVIDUAL, None, "Saibaba Colony, Coimbatore", "Coimbatore", "Tamil Nadu"),
            ("buyer7@demo.com", "Apex Food Processors", BuyerType.BULK_BUYER, "Apex Foods Inc", "SIPCOT Industrial Estate, Erode", "Erode", "Tamil Nadu"),
            ("buyer8@demo.com", "Suresh Patel", BuyerType.INDIVIDUAL, None, "Ramanathapuram, Coimbatore", "Coimbatore", "Tamil Nadu"),
        ]

        buyer_users = []
        for email, name, b_type, b_name, addr, dist, st in buyers_raw:
            u = User(
                email=email,
                hashed_password=get_password_hash("Demo@123"),
                full_name=name,
                role=UserRole.BUYER,
                phone="+91 9600000000"
            )
            db.add(u)
            db.flush()
            bp = BuyerProfile(
                user_id=u.id,
                buyer_type=b_type,
                business_name=b_name,
                delivery_address=addr,
                district=dist,
                state=st
            )
            db.add(bp)
            buyer_users.append(u)

        db.commit()

        # 6. Products (~30+ items focusing on fresh vegetables)
        sample_products = [
            # Vegetables
            (farmer_profiles[0].id, "Country Tomato (Organic)", "Vegetables", "Fresh red country tomatoes harvested daily from Kovai farm.", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600", 800.0, "kg", 28.0, "Coimbatore", "Tamil Nadu", True, 11.0168, 76.9558),
            (farmer_profiles[0].id, "Farm Fresh Red Onion", "Vegetables", "Crisp high-shelf-life red onions harvested from natural soil.", "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600", 1200.0, "kg", 32.0, "Coimbatore", "Tamil Nadu", False, 11.0168, 76.9558),
            (farmer_profiles[2].id, "Small Shallot Onion (Sambar Poondu)", "Vegetables", "Aromatic small onions essential for authentic South Indian cooking.", "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600", 600.0, "kg", 65.0, "Coimbatore", "Tamil Nadu", True, 11.0300, 76.9400),
            (farmer_profiles[8].id, "Ooty Fresh Baby Potato", "Vegetables", "Tender organic baby potatoes grown in cool Nilgiri soil.", "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600", 1500.0, "kg", 35.0, "Nilgiris", "Tamil Nadu", True, 11.4102, 76.6950),
            (farmer_profiles[2].id, "Fresh Green Chilli (Guntur)", "Vegetables", "Spicy dark green chillies picked fresh from farm fields.", "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600", 300.0, "kg", 45.0, "Coimbatore", "Tamil Nadu", False, 11.0300, 76.9400),
            (farmer_profiles[0].id, "Purple Brinjal (Aubergine)", "Vegetables", "Glossy fresh purple brinjals perfect for ennai kathirikai curry.", "https://images.unsplash.com/photo-1613744655060-cc9804b4c73f?w=600", 500.0, "kg", 30.0, "Coimbatore", "Tamil Nadu", True, 11.0168, 76.9558),
            (farmer_profiles[3].id, "Lady's Finger (Okra / Bhendi)", "Vegetables", "Tender crisp green lady's finger harvested early morning.", "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?w=600", 450.0, "kg", 40.0, "Erode", "Tamil Nadu", False, 11.3410, 77.7172),
            (farmer_profiles[8].id, "Ooty Organic Crunchy Carrot", "Vegetables", "Sweet deep-orange carrots rich in Vitamin A direct from Ooty hills.", "https://images.unsplash.com/photo-1598170845058-12ef4a457939?w=600", 900.0, "kg", 48.0, "Nilgiris", "Tamil Nadu", True, 11.4102, 76.6950),
            (farmer_profiles[8].id, "Fresh Farm Cauliflower", "Vegetables", "White clean curds cauliflower free of chemical sprays.", "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?w=600", 700.0, "kg", 35.0, "Kolar", "Karnataka", False, 13.1367, 78.1292),
            (farmer_profiles[8].id, "Green Farm Cabbage", "Vegetables", "Tight crunchy green cabbage heads picked fresh.", "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=600", 1100.0, "kg", 22.0, "Kolar", "Karnataka", False, 13.1367, 78.1292),
            (farmer_profiles[8].id, "Ooty Beetroot (Organic)", "Vegetables", "Deep red sweet beetroots cultivated with natural manure.", "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?w=600", 650.0, "kg", 42.0, "Nilgiris", "Tamil Nadu", True, 11.4102, 76.6950),
            (farmer_profiles[9].id, "Country Drumstick (Murungakkai)", "Vegetables", "Long fibrous green drumsticks for traditional sambar.", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600", 400.0, "kg", 55.0, "Coimbatore", "Tamil Nadu", True, 10.6587, 77.0083),
            (farmer_profiles[9].id, "Fresh Bottle Gourd (Lauki)", "Vegetables", "Hydrating tender bottle gourds harvested fresh.", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600", 850.0, "kg", 25.0, "Coimbatore", "Tamil Nadu", False, 10.6587, 77.0083),
            (farmer_profiles[3].id, "Organic Bitter Gourd (Pavakkai)", "Vegetables", "Dark green crisp bitter gourd packed with health benefits.", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600", 350.0, "kg", 45.0, "Erode", "Tamil Nadu", True, 11.3410, 77.7172),
            (farmer_profiles[3].id, "Ridge Gourd (Peerkangai)", "Vegetables", "Fresh tender ridge gourd ideal for kootu and curry.", "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600", 500.0, "kg", 38.0, "Erode", "Tamil Nadu", False, 11.3410, 77.7172),
            (farmer_profiles[2].id, "Green Capsicum (Bell Pepper)", "Vegetables", "Crisp shiny green capsicum for salads and stir fry.", "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600", 600.0, "kg", 60.0, "Coimbatore", "Tamil Nadu", True, 11.0300, 76.9400),
            (farmer_profiles[2].id, "Red & Yellow Bell Pepper", "Vegetables", "Exotic sweet colorful bell peppers grown in climate-controlled polyhouse.", "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=600", 350.0, "kg", 110.0, "Coimbatore", "Tamil Nadu", True, 11.0300, 76.9400),
            (farmer_profiles[0].id, "Farm Fresh Cucumber (Kakdi)", "Vegetables", "Cool hydrating crisp green cucumbers.", "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=600", 1200.0, "kg", 26.0, "Coimbatore", "Tamil Nadu", False, 11.0168, 76.9558),
            (farmer_profiles[8].id, "Kolar Sweet Corn Cobs", "Vegetables", "Tender juicy sweet corn cobs harvested in cold morning hours.", "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600", 1500.0, "kg", 24.0, "Kolar", "Karnataka", False, 13.1367, 78.1292),
            (farmer_profiles[7].id, "Nashik Red Onion (Export Quality)", "Vegetables", "Large dry red onions suitable for retail stores & hotel bulk supply.", "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600", 4000.0, "kg", 29.0, "Nashik", "Maharashtra", False, 19.9975, 73.7898),
            (farmer_profiles[0].id, "Organic Spinach (Palak)", "Vegetables", "Fresh green leafy palak harvested without pesticides.", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600", 400.0, "kg", 35.0, "Coimbatore", "Tamil Nadu", True, 11.0168, 76.9558),
            (farmer_profiles[0].id, "Fresh Coriander Bunch", "Vegetables", "Aromatic fresh green coriander leaves.", "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=600", 300.0, "kg", 40.0, "Coimbatore", "Tamil Nadu", False, 11.0168, 76.9558),
            (farmer_profiles[2].id, "Country Garlic (Poondu)", "Vegetables", "Strong aromatic country garlic cloves.", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600", 800.0, "kg", 180.0, "Coimbatore", "Tamil Nadu", True, 11.0300, 76.9400),
            (farmer_profiles[2].id, "Fresh Hill Ginger (Inji)", "Vegetables", "Juicy spice hill ginger harvested from Nilgiri slopes.", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600", 950.0, "kg", 110.0, "Coimbatore", "Tamil Nadu", False, 11.0300, 76.9400),
            (farmer_profiles[10].id, "Raw Green Banana (Kaaigal)", "Vegetables", "Fresh green plantains for poriyal and chips.", "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600", 1000.0, "kg", 28.0, "Coimbatore", "Tamil Nadu", True, 10.6587, 77.0083),

            # Fruits, Grains, Spices & Oils
            (farmer_profiles[1].id, "FPO Premium Basmati Rice", "Grains & Pulses", "Long grain aromatic basmati rice cultivated by Kongu FPO members.", "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600", 3500.0, "kg", 88.0, "Coimbatore", "Tamil Nadu", True, 11.0250, 76.9600),
            (farmer_profiles[4].id, "Thanjavur Ponni Rice", "Grains & Pulses", "Traditional boiled Ponni rice directly from Cauvery delta farmers.", "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600", 5000.0, "kg", 54.0, "Thanjavur", "Tamil Nadu", False, 10.7870, 79.1378),
            (farmer_profiles[6].id, "Punjab Organic Wheat Flour", "Grains & Pulses", "Stone ground 100% whole wheat chakki fresh atta.", "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600", 2500.0, "kg", 38.0, "Ludhiana", "Punjab", True, 30.9010, 75.8573),
            (farmer_profiles[5].id, "Madurai Alphonso Mangoes", "Fruits", "Sweet juicy naturally ripened Alphonso mangoes.", "https://images.unsplash.com/photo-1553279768-865429fa0078?w=600", 600.0, "kg", 125.0, "Madurai", "Tamil Nadu", True, 9.9252, 78.1198),
            (farmer_profiles[10].id, "Pollachi Tender Coconut", "Nuts & Oilseeds", "Hydrating sweet tender coconuts direct from Pollachi groves.", "https://images.unsplash.com/photo-1544378730-8b5104b18790?w=600", 2000.0, "piece", 35.0, "Coimbatore", "Tamil Nadu", True, 10.6587, 77.0083),
            (farmer_profiles[1].id, "Turmeric Powder (Pure)", "Spices & Herbs", "High curcumin Salem yellow turmeric powder processed directly by FPO.", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600", 450.0, "kg", 150.0, "Coimbatore", "Tamil Nadu", True, 11.0250, 76.9600),
            (farmer_profiles[3].id, "Erode Yellow Turmeric Finger", "Spices & Herbs", "Unpolished natural turmeric fingers from Erode mandi direct harvest.", "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600", 900.0, "kg", 135.0, "Erode", "Tamil Nadu", False, 11.3410, 77.7172),
        ]

        products_created = []
        for fid, name, cat, desc, img, qty, unit, price, dist, st, org, lat, lng in sample_products:
            p = Product(
                farmer_id=fid,
                name=name,
                category=cat,
                description=desc,
                image_url=img,
                quantity=qty,
                unit=unit,
                price_per_unit=price,
                harvest_date="2026-09-20",
                district=dist,
                state=st,
                is_organic=org,
                latitude=lat,
                longitude=lng
            )
            db.add(p)
            db.flush()

            # Add bulk price tiers
            tier1 = ProductPriceTier(product_id=p.id, min_quantity=100.0, price_per_unit=round(price * 0.90, 2))
            tier2 = ProductPriceTier(product_id=p.id, min_quantity=500.0, price_per_unit=round(price * 0.82, 2))
            db.add_all([tier1, tier2])
            products_created.append(p)

        db.commit()

        # 7. Orders (~30 orders in mixed statuses)
        statuses = [OrderStatus.PLACED, OrderStatus.CONFIRMED, OrderStatus.PACKED, OrderStatus.READY_FOR_PICKUP, OrderStatus.IN_TRANSIT, OrderStatus.DELIVERED]

        for i in range(1, 25):
            buyer_user = buyer_users[i % len(buyer_users)]
            prod = products_created[i % len(products_created)]
            st = statuses[i % len(statuses)]
            order_no = f"FD-2026-09-{1000 + i}"
            qty = 50.0 if i % 2 == 0 else 100.0
            tot = qty * prod.price_per_unit

            order = Order(
                order_number=order_no,
                buyer_id=buyer_user.id,
                farmer_id=prod.farmer_id,
                delivery_address=f"Door {i*4}, Avinashi Road, Coimbatore",
                delivery_slot="Morning (8 AM - 12 PM)",
                total_amount=tot,
                status=st
            )
            db.add(order)
            db.flush()

            item = OrderItem(
                order_id=order.id,
                product_id=prod.id,
                product_name=prod.name,
                unit=prod.unit,
                quantity=qty,
                price_per_unit=prod.price_per_unit,
                subtotal=tot
            )
            db.add(item)

            # Order status history
            hist = OrderStatusHistory(
                order_id=order.id,
                from_status=None,
                to_status=st,
                notes=f"Order {st.value} during initial seed creation",
                created_by_role="SYSTEM"
            )
            db.add(hist)

            # Payment
            pm = Payment(
                order_id=order.id,
                amount=tot,
                method=PaymentMethod.UPI if i % 2 == 0 else PaymentMethod.COD,
                status=PaymentStatus.SUCCESS if st == OrderStatus.DELIVERED else PaymentStatus.PENDING,
                payment_reference=f"PAY-UPI-DEMO-{8000 + i}"
            )
            db.add(pm)

            # Delivery
            deliv_st = DeliveryStatus.DELIVERED if st == OrderStatus.DELIVERED else (
                DeliveryStatus.ACCEPTED if st in [OrderStatus.PACKED, OrderStatus.READY_FOR_PICKUP, OrderStatus.IN_TRANSIT] else DeliveryStatus.UNASSIGNED
            )

            deliv = Delivery(
                order_id=order.id,
                logistics_partner_id=logistics_profiles[0].id if deliv_st != DeliveryStatus.UNASSIGNED else None,
                pickup_district=prod.district,
                pickup_lat=prod.latitude,
                pickup_lng=prod.longitude,
                drop_district="Coimbatore",
                drop_address=f"Door {i*4}, Avinashi Road, Coimbatore",
                drop_lat=11.0300 + (i * 0.001),
                drop_lng=76.9700 + (i * 0.001),
                status=deliv_st,
                distance_km=14.5 + i,
                estimated_minutes=35 + i
            )
            db.add(deliv)

            # Add review for delivered items
            if st == OrderStatus.DELIVERED:
                rev = Review(
                    product_id=prod.id,
                    buyer_id=buyer_user.id,
                    rating=5,
                    comment="Outstanding fresh harvest quality! Delivered fast with zero damage."
                )
                db.add(rev)

        # 8. Market Price Demo data
        demo_prices = [
            ("Tomato", "Vegetables", "Coimbatore", 22.0, 28.0, 34.0),
            ("Onion", "Vegetables", "Coimbatore", 26.0, 32.0, 40.0),
            ("Potato", "Vegetables", "Coimbatore", 20.0, 25.0, 30.0),
            ("Basmati Rice", "Grains & Pulses", "Coimbatore", 75.0, 85.0, 98.0),
            ("Ponni Rice", "Grains & Pulses", "Thanjavur", 48.0, 54.0, 62.0),
        ]
        for p_name, cat, dist, min_p, mod_p, max_p in demo_prices:
            mp = MarketPriceDemo(
                product_name=p_name,
                category=cat,
                district=dist,
                min_price=min_p,
                modal_price=mod_p,
                max_price=max_p
            )
            db.add(mp)

        db.commit()
        print("Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

