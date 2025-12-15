import json
import os
from pathlib import Path

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, UnexpectedAlertPresentException


def _css(testid: str):
    return (By.CSS_SELECTOR, f"[data-testid='{testid}']")


def accept_alert_if_any(driver, timeout=10) -> bool:
    try:
        WebDriverWait(driver, timeout).until(EC.alert_is_present()).accept()
        return True
    except Exception:
        return False


def js_click(driver, locator):
    el = driver.find_element(*locator)
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
    driver.execute_script("arguments[0].click();", el)


def select_first_non_empty(wait: WebDriverWait, select_el) -> str:
    sel = Select(select_el)
    wait.until(lambda d: len(sel.options) > 1)
    for opt in sel.options:
        v = (opt.get_attribute("value") or "").strip()
        if v:
            sel.select_by_value(v)
            return v
    return ""


def fill(driver, locator, value):
    el = driver.find_element(*locator)
    el.clear()
    el.send_keys(str(value))


@pytest.mark.e2e
def test_e2e_login_create_listing_all_fields_except_youtube(driver, base_url, creds):
    assert creds["email"] and creds["password"], "Thiếu TEST_EMAIL/TEST_PASSWORD"

    wait = WebDriverWait(driver, int(os.getenv("E2E_WAIT", "25")))
    submit_wait = int(os.getenv("E2E_SUBMIT_WAIT", "120"))
    alert_wait = int(os.getenv("E2E_ALERT_WAIT", "40"))

    base_dir = Path(__file__).resolve().parent.parent  # selenium_tests/
    data_path = base_dir / "data" / os.getenv("E2E_DATA_FILE", "create_listing_valid.json")
    img_path = (base_dir / "assets" / os.getenv("E2E_IMAGE_FILE", "bmw-x5-2.webp")).resolve()

    assert data_path.exists(), f"Không tìm thấy test data: {data_path}"
    assert img_path.exists(), f"Không tìm thấy ảnh test: {img_path}"

    # 1) Home
    driver.get(base_url)

    # 2) Open login modal
    wait.until(EC.element_to_be_clickable(_css("auth-open-login-btn"))).click()

    # 3) Login
    wait.until(EC.visibility_of_element_located(_css("auth-login-email-input"))).send_keys(creds["email"])
    driver.find_element(*_css("auth-login-password-input")).send_keys(creds["password"])
    driver.find_element(*_css("auth-login-submit-btn")).click()

    # login alert + reload
    assert accept_alert_if_any(driver, alert_wait), "Không thấy alert login"
    wait.until(lambda d: d.execute_script("return localStorage.getItem('token')") not in (None, ""))
    token = driver.execute_script("return localStorage.getItem('token')")
    assert token, "Login xong nhưng không có token trong localStorage"

    # 4) Go create listing
    driver.get(base_url + "/create-listing")
    wait.until(EC.presence_of_element_located(_css("listing-create-submit-btn")))

    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 5) Fill ALL fields (trừ YouTube)

    # Brand -> Model (dynamic)
    brand_el = wait.until(EC.presence_of_element_located(_css("listing-create-brand-select")))
    assert select_first_non_empty(wait, brand_el), "Không chọn được brand"

    model_el = wait.until(EC.presence_of_element_located(_css("listing-create-model-select")))
    wait.until(lambda d: model_el.is_enabled())
    assert select_first_non_empty(wait, model_el), "Không chọn được model"

    # Required inputs
    fill(driver, _css("listing-create-year-input"), data["year"])
    fill(driver, _css("listing-create-mileage-input"), data["mileage_km"])
    fill(driver, _css("listing-create-price-input"), data["price_million"])
    fill(driver, _css("listing-create-title-input"), data["title"])

    # Origin
    driver.find_element(By.CSS_SELECTOR, "input[name='origin'][value='trong-nuoc']").click()

    # Optional selects (nếu có)
    for tid in ("listing-create-color-ext-select", "listing-create-color-int-select"):
        try:
            select_first_non_empty(wait, driver.find_element(*_css(tid)))
        except Exception:
            pass

    try:
        Select(driver.find_element(*_css("listing-create-gearbox-select"))).select_by_value("so-tu-dong")
        Select(driver.find_element(*_css("listing-create-fuel-select"))).select_by_value("xang")
        Select(driver.find_element(*_css("listing-create-seats-select"))).select_by_value("5")
    except Exception:
        pass

    # Body type (required)
    body_el = driver.find_element(*_css("listing-create-bodytype-select"))
    assert select_first_non_empty(wait, body_el), "Không chọn được body_type"

    # Description
    try:
        dsc = driver.find_element(*_css("listing-create-description-textarea"))
    except Exception:
        dsc = driver.find_element(By.XPATH, "//label[contains(.,'Mô tả')]/following::textarea[1]")
    dsc.clear()
    dsc.send_keys(data["description"])

    # Province -> District (dynamic)
    province_el = driver.find_element(*_css("listing-create-province-select"))
    assert select_first_non_empty(wait, province_el), "Không chọn được province"

    district_el = driver.find_element(*_css("listing-create-district-select"))
    wait.until(lambda d: district_el.is_enabled())
    assert select_first_non_empty(wait, district_el), "Không chọn được district"

    # Upload image (required)
    driver.find_element(*_css("listing-create-image-upload")).send_keys(str(img_path))

    # address_line required, readonly
    addr = driver.find_element(*_css("listing-create-address-line")).get_attribute("value") or ""
    assert addr.strip(), "address_line rỗng (tài khoản test chưa có address)"

    # 6) Submit (JS click để tránh overlay/scroll)
    js_click(driver, _css("listing-create-submit-btn"))

    # 7) Accept success alert (nếu có) để tránh UnexpectedAlertPresentException
    for _ in range(3):
        if accept_alert_if_any(driver, 15):
            break

    # 8) Verify redirect
    try:
        WebDriverWait(driver, submit_wait).until(EC.url_contains("/listings/self"))
    except UnexpectedAlertPresentException:
        accept_alert_if_any(driver, 10)
        WebDriverWait(driver, submit_wait).until(EC.url_contains("/listings/self"))

    # 9) Verify: title xuất hiện
    WebDriverWait(driver, 60).until(
        EC.presence_of_element_located((By.XPATH, f"//*[contains(normalize-space(),\"{data['title']}\")]"))
    )
