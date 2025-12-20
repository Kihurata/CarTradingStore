import json
import os
from pathlib import Path

import pytest
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, UnexpectedAlertPresentException
from selenium.common.exceptions import ElementClickInterceptedException
from selenium.webdriver.common.keys import Keys
from selenium_tests.conftest import driver

def _css(testid: str):
    return (By.CSS_SELECTOR, f"[data-testid='{testid}']")


def accept_alert_if_any(driver, timeout=10) -> bool:
    try:
        WebDriverWait(driver, timeout).until(EC.alert_is_present()).accept()
        return True
    except Exception:
        return False

def fill_react_input(driver, wait, locator, value):
    """
    Điền dữ liệu vào React Controlled Input/Textarea một cách an toàn cho CI/CD.
    Sử dụng Native Value Setter để bypass cơ chế tracking của React.
    """
    element = wait.until(EC.element_to_be_clickable(locator))
    
    # Scroll để chắc chắn element nằm trong view
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", element)
    
    val_str = str(value)

    # Đoạn script này cực kỳ quan trọng đối với React
    # Nó tìm 'setter' gốc của HTML prototype và gọi trực tiếp
    # giúp React nhận biết được change event.
    driver.execute_script("""
        let input = arguments[0];
        let value = arguments[1];
        
        let lastValue = input.value;
        input.value = value;
        
        let event = new Event('input', { bubbles: true });
        
        // Hack cho React 15/16+
        let tracker = input._valueTracker;
        if (tracker) {
            tracker.setValue(lastValue);
        }
        
        // Gọi native setter tuỳ theo loại thẻ
        let nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 
            "value"
        ).set;
        
        let nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, 
            "value"
        ).set;

        if (input.tagName.toLowerCase() === 'textarea') {
            nativeTextAreaValueSetter.call(input, value);
        } else {
            nativeInputValueSetter.call(input, value);
        }
        
        input.dispatchEvent(event);
    """, element, val_str)

    # Verification (Optional but recommended for CI/CD)
    # Đợi một chút để React cập nhật state nếu cần
    try:
        wait.until(lambda d: element.get_attribute("value") == val_str)
    except TimeoutException:
        print(f"⚠️ Warning: Field {locator} might not have updated correctly. Expected: {val_str}, Actual: {element.get_attribute('value')}")

def js_click(driver, locator):
    el = driver.find_element(*locator)
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", el)
    driver.execute_script("arguments[0].click();", el)


def select_first_non_empty(driver, wait, locator) -> str:
    """
    Chọn option đầu tiên có giá trị.
    Tự động đợi cho đến khi Select box có dữ liệu (API load xong).
    """
    try:
        # Lấy string selector từ locator (VD: "listing-create-province-select")
        # Giả định locator dạng (By.CSS_SELECTOR, "[data-testid='...']")
        # Chúng ta cần đợi thẻ <option> thứ 2 xuất hiện (option 1 thường là "Chọn...")
        selector = locator[1]
        
        # LOGIC QUAN TRỌNG: Đợi cho đến khi có ít nhất 2 thẻ option trong select này
        # Điều này đồng nghĩa với việc API đã load xong data
        wait.until(lambda d: len(d.find_elements(By.CSS_SELECTOR, f"{selector} option")) > 1)
        
        # Tìm lại element để tránh lỗi StaleElementReferenceException
        select_el = driver.find_element(*locator)
        sel = Select(select_el)
        
        for opt in sel.options:
            v = (opt.get_attribute("value") or "").strip()
            if v:
                sel.select_by_value(v)
                return v
        return ""
    except TimeoutException:
        print(f"⚠️ Timeout: Dropdown {locator} không tải được dữ liệu (Kiểm tra lại seed data!)")
        return ""

def fill(driver, locator, value):
    el = driver.find_element(*locator)
    el.clear()
    el.send_keys(str(value))


@pytest.mark.e2e
def test_e2e_login_create_listing_all_fields_except_youtube(driver, base_url, creds):
    assert creds["email"] and creds["password"], "Thiếu TEST_EMAIL/TEST_PASSWORD"

    wait = WebDriverWait(driver, 180)
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

    # Brand
    assert select_first_non_empty(driver, wait, _css("listing-create-brand-select")), "Không chọn được brand"

    #Model
    wait.until(EC.element_to_be_clickable(_css("listing-create-model-select")))
    assert select_first_non_empty(driver, wait, _css("listing-create-model-select")), "Không chọn được model"

    # Required inputs
    fill_react_input(driver, wait, _css("listing-create-year-input"), data["year"])
    
    # Số KM
    fill_react_input(driver, wait, _css("listing-create-mileage-input"), data["mileage_km"])
    
    # Giá bán
    fill_react_input(driver, wait, _css("listing-create-price-input"), data["price_million"])
    
    # Tiêu đề
    fill_react_input(driver, wait, _css("listing-create-title-input"), data["title"])

    # Origin
    origin_locator = (By.CSS_SELECTOR, "input[name='origin'][value='trong-nuoc']")
    origin_el = wait.until(EC.presence_of_element_located(origin_locator))

    # kéo vào giữa màn hình để tránh sticky header che
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", origin_el)
    driver.execute_script("window.scrollBy(0, -120);")  # bù header cao ~64px (h-16) + dư

    try:
        wait.until(EC.element_to_be_clickable(origin_locator))
        origin_el.click()
    except ElementClickInterceptedException:
        driver.execute_script("arguments[0].click();", origin_el)  # fallback chắc ăn


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
    assert select_first_non_empty(driver, wait, _css("listing-create-bodytype-select")), "Không chọn được body_type"

    # Description
    fill_react_input(driver, wait, _css("listing-create-description-textarea"), data["description"])

    # Province -> District (dynamic)
    assert select_first_non_empty(driver, wait, _css("listing-create-province-select")), "Không chọn được province (Kiểm tra DB!)"

    wait.until(EC.element_to_be_clickable(_css("listing-create-district-select")))
    assert select_first_non_empty(driver, wait, _css("listing-create-district-select")), "Không chọn được district"

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
