import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"

def test():
    results = {}
    try:
        # 1. Login
        login_res = requests.post(f"{BASE_URL}/auth/login", data={"username": "admin", "password": "admin"})
        if login_res.status_code != 200:
            results["error"] = f"Login failed: {login_res.text}"
        else:
            token = login_res.json()["access_token"]
            headers = {"Authorization": f"Bearer {token}"}
            results["login"] = "success"

            # 2. Patient
            p_res = requests.post(f"{BASE_URL}/patients/", json={
                "name": "Test P", "age": 20, "gender": "Male", "phone": "123", "address": "Addr"
            }, headers=headers)
            if p_res.status_code not in [200, 201]: 
                results["error"] = f"Patient fail: {p_res.status_code} - {p_res.text}"
            else:
                patient = p_res.json()
                results["patient_id"] = patient.get("id")

                # 3. Supplier
                s_res = requests.post(f"{BASE_URL}/suppliers/", json={
                    "supplier_name": "Test S", "phone": "123", "email": "s@s.com", "address": "Addr", "gst_number": "GST"
                }, headers=headers)
                if s_res.status_code not in [200, 201]: 
                    results["error"] = f"Supplier fail: {s_res.status_code} - {s_res.text}"
                else:
                    supplier = s_res.json()
                    results["supplier_id"] = supplier.get("id")

                    # 4. Product
                    pr_res = requests.post(f"{BASE_URL}/products/", json={
                        "medicine_name": "Test M", "category": "Tab", "manufacturer": "M", "batch_number": "B",
                        "expiry_date": "2030-01-01", "purchase_price": 10, "selling_price": 20, "stock_quantity": 0,
                        "supplier_id": supplier.get("id"), "hsn_code": "HSN", "mrp": 25, "unit": "Strip"
                    }, headers=headers)
                    if pr_res.status_code not in [200, 201]: 
                        results["error"] = f"Product fail: {pr_res.status_code} - {pr_res.text}"
                    else:
                        product = pr_res.json()
                        results["product_id"] = product.get("id")

                        # 5. Purchase
                        pur_res = requests.post(f"{BASE_URL}/purchases/", json={
                            "supplier_id": supplier.get("id"), 
                            "invoice_number": "INV-001",
                            "total_amount": 100.0,
                            "items": [{
                                "product_id": product.get("id"), 
                                "quantity": 10, 
                                "purchase_price": 10.0, 
                                "batch_number": "BATCH-X",
                                "expiry_date": "2030-01-01"
                            }]
                        }, headers=headers)
                        if pur_res.status_code not in [200, 201]: 
                            results["error"] = f"Purchase fail: {pur_res.status_code} - {pur_res.text}"
                        else:
                            results["purchase"] = "success"

                            # 6. Sale
                            sal_res = requests.post(f"{BASE_URL}/sales/", json={
                                "patient_id": patient.get("id"), "total_amount": 20, "payment_mode": "Cash",
                                "items": [{"product_id": product.get("id"), "quantity": 1, "price": 20}]
                            }, headers=headers)
                            if sal_res.status_code not in [200, 201]: 
                                results["error"] = f"Sale fail: {sal_res.status_code} - {sal_res.text}"
                            else:
                                results["sale"] = "success"

                                # 7. Token
                                tok_res = requests.post(f"{BASE_URL}/tokens/", json={
                                    "patient_id": patient.get("id"), "token_number": 999, "date": datetime.now().strftime("%Y-%m-%d"), "status": "Waiting"
                                }, headers=headers)
                                if tok_res.status_code not in [200, 201]: 
                                    results["error"] = f"Token fail: {tok_res.status_code} - {tok_res.text}"
                                else:
                                    results["token"] = "success"

                                    # Final Stock
                                    stock_res = requests.get(f"{BASE_URL}/products/{product.get('id')}", headers=headers)
                                    results["final_stock"] = stock_res.json().get("stock_quantity")

    except Exception as e:
        results["exception"] = str(e)

    with open("api_test_report.json", "w") as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    test()
