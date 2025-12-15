import json
from pages.auth_modal import AuthModal
from pages.create_listing_page import CreateListingPage

def test_login_create_listing_upload_submit_verify(driver, base_url, test_user):
    assert test_user["email"] and test_user["password"], "Thiếu TEST_EMAIL/TEST_PASSWORD"

    # 1) Mở trang chủ
    driver.get(base_url)

    # 2) Login bằng modal
    auth = AuthModal(driver)
    auth.open()
    auth.login(test_user["email"], test_user["password"])

    # 3) Vào create listing
    page = CreateListingPage(driver)
    page.open(base_url)

    # 4) Fill form + upload
    with open("data/create_listing_valid.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    page.fill_min_required(data, "assets/car1.jpg")

    # 5) Submit + verify
    page.submit_and_verify_redirect(expected_title=data["title"])
