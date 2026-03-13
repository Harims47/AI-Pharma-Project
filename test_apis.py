import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"

def test_workflow():
    # 1. Login
    print("Logging in...")
    login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "admin"})
    if login_res.status_code != 200:
        print(f"Login failed: {login_res.text}")
        return
    
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("Login successful.")

    # 2. Insert Patient
    print("\nInserting Patient...")
    patient_data = {
        "name": "John Doe",
        "age": 35,
        "gender": "Male",
        "phone": "9876543210",
        "alternate_phone": "0123456789",
        "email": "john.doe@example.com",
        "address": "123 Clinic St, Medical Center"
    }
    patient_res = requests.post(f"{BASE_URL}/patients/", json=patient_data, headers=headers)
    patient = patient_res.json()
    print(f"Patient created: ID {patient['id']}")

    # 3. Insert Supplier
    print("\nInserting Supplier...")
    supplier_data = {
        "supplier_name": "PharmaCorp India",
        "phone": "8888877777",
        "email": "sales@pharmacorp.in",
        "address": "Pharma Park, Zone 5",
        "gst_number": "22AAAAA0000A1Z5"
    }
    supplier_res = requests.post(f"{BASE_URL}/suppliers/", json=supplier_data, headers=headers)
    supplier = supplier_res.json()
    print(f"Supplier created: ID {supplier['id']}")

    # 4. Insert Product (Medicine)
    print("\nInserting Product...")
    product_data = {
        "medicine_name": "Paracetamol 500mg",
        "category": "Tablet",
        "manufacturer": "HealthCare Ltd",
        "batch_number": "BT-101",
        "expiry_date": (datetime.now() + timedelta(days=365)).strftime("%Y-%m-%d"),
        "purchase_price": 10.0,
        "selling_price": 15.0,
        "stock_quantity": 0,  # Will increase via purchase
        "supplier_id": supplier['id'],
        "hsn_code": "3004",
        "mrp": 20.0,
        "unit": "Strip"
    }
    product_res = requests.post(f"{BASE_URL}/products/", json=product_data, headers=headers)
    product = product_res.json()
    print(f"Product created: ID {product['id']}")

    # 5. Insert Purchase
    print("\nInserting Purchase...")
    purchase_data = {
        "supplier_id": supplier['id'],
        "total_amount": 1000.0,
        "items": [
            {
                "product_id": product['id'],
                "quantity": 100,
                "unit_price": 10.0,
                "expiry_date": product_data["expiry_date"]
            }
        ]
    }
    purchase_res = requests.post(f"{BASE_URL}/purchases/", json=purchase_data, headers=headers)
    print(f"Purchase recorded. Stock updated.")

    # 6. Insert Sale
    print("\nInserting Sale...")
    sale_data = {
        "patient_id": patient['id'],
        "total_amount": 30.0,
        "payment_mode": "Cash",
        "items": [
            {
                "product_id": product['id'],
                "quantity": 2,
                "price": 15.0
            }
        ]
    }
    sale_res = requests.post(f"{BASE_URL}/sales/", json=sale_data, headers=headers)
    print(f"Sale recorded. Stock updated.")

    # 7. Insert Token
    print("\nInserting Token...")
    token_data = {
        "patient_id": patient['id'],
        "token_number": 1,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "status": "Waiting"
    }
    token_res = requests.post(f"{BASE_URL}/tokens/", json=token_data, headers=headers)
    print(f"Token generated: #{token_res.json()['token_number']}")

    print("\nFinal stock check...")
    final_prod_res = requests.get(f"{BASE_URL}/products/{product['id']}", headers=headers)
    print(f"Current stock of {product['medicine_name']}: {final_prod_res.json()['stock_quantity']}")

if __name__ == "__main__":
    test_workflow()
