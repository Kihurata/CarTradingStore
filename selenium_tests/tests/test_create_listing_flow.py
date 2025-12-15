import json
import os
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException

def _css(testid: str):
    return (By.CSS_SELECTOR, f"[data-testid='{testid}']")

    
def accept_alert_if_any(driver, timeout=10):
    try:
        WebDriverWait(driver, timeout).until(EC.alert_is_present()).accept()
        return True
    except Exception:
        return False

def test_e2e_login_create_listing_all_fields_except_youtube(driver, base_url, creds):
    assert creds["email"] and creds["password"], "Thiếu TEST_EMAIL/TEST_PASSWORD"

    wait = WebDriverWait(driver, 20)

    # 1) Open home
    driver.get(base_url)

    # 2) Open login modal
    wait.until(EC.element_to_be_clickable(_css("auth-open-login-btn"))).click()

    # 3) Fill login + submit
    wait.until(EC.visibility_of_element_located(_css("auth-login-email-input"))).send_keys(creds["email"])
    driver.find_element(*_css("auth-login-password-input")).send_keys(creds["password"])
    driver.find_element(*_css("auth-login-submit-btn")).click()

    # App dùng alert("✅ Đăng nhập thành công!") + reload
    assert accept_alert_if_any(driver, 15), "Không thấy alert login"
    wait.until(lambda d: d.execute_script("return document.readyState") == "complete")

    token = driver.execute_script("return localStorage.getItem('token')")
    print("TOKEN:", token)
    assert token, "Login xong nhưng không có token trong localStorage"

    # 4) Go to create listing page
    driver.get(base_url + "/create-listing")
    wait.until(EC.presence_of_element_located(_css("listing-create-submit-btn")))

    # Load test data
    with open(os.path.join("data", "create_listing_valid.json"), "r", encoding="utf-8") as f:
        data = json.load(f)

    # 5) Fill ALL fields (trừ YouTube)
    # Brand / Model (API load -> select index 1 để luôn có value)
    brand_select = Select(wait.until(
    EC.presence_of_element_located(_css("listing-create-brand-select"))
    ))

    # đợi options load xong
    wait.until(lambda d: len(brand_select.options) > 1)

    # chọn option có value khác ""
    for opt in brand_select.options:
        if opt.get_attribute("value"):
            brand_select.select_by_value(opt.get_attribute("value"))
            break

    # model bị disable khi chưa chọn brand, nên chờ enable
    brand_select = Select(driver.find_element(*_css("listing-create-brand-select")))
    wait.until(lambda d: len(brand_select.options) > 1)

    brand_value = None
    for opt in brand_select.options:
        if opt.get_attribute("value"):
            brand_value = opt.get_attribute("value")
            brand_select.select_by_value(brand_value)
            break

    # đợi model enable + load
    model_select = Select(driver.find_element(*_css("listing-create-model-select")))
    wait.until(lambda d: model_select.options and len(model_select.options) > 1)

    for opt in model_select.options:
        if opt.get_attribute("value"):
            model_select.select_by_value(opt.get_attribute("value"))
            break

    # Year / Mileage
    y = driver.find_element(*_css("listing-create-year-input"))
    y.clear(); y.send_keys(data["year"])

    km = driver.find_element(*_css("listing-create-mileage-input"))
    km.clear(); km.send_keys(data["mileage_km"])

    # Origin: chọn theo name/value (vì testid có thể trùng) :contentReference[oaicite:2]{index=2}
    driver.find_element(By.CSS_SELECTOR, "input[name='origin'][value='trong-nuoc']").click()

    # Color ext/int: nếu bạn đã thêm testid thì dùng, còn chưa thì bỏ qua phần chọn màu (không bắt buộc)
    def select_first_non_empty(testid):
        el = driver.find_element(*_css(testid))
        sel = Select(el)
        wait.until(lambda d: len(sel.options) > 1)
        for opt in sel.options:
            v = opt.get_attribute("value")
            if v and v.strip():
                sel.select_by_value(v)
                return v
        return ""

    try:
        print("color_ext:", select_first_non_empty("listing-create-color-ext-select"))
        print("color_int:", select_first_non_empty("listing-create-color-int-select"))
    except Exception as e:
        print("Skip color select:", e)

    # Gearbox/Fuel/Seats: nếu bạn đã thêm testid thì set luôn (không bắt buộc theo requiredFields) :contentReference[oaicite:3]{index=3}
    try:
        Select(driver.find_element(*_css("listing-create-gearbox-select"))).select_by_value("so-tu-dong")
        Select(driver.find_element(*_css("listing-create-fuel-select"))).select_by_value("xang")
        Select(driver.find_element(*_css("listing-create-seats-select"))).select_by_value("5")
    except Exception:
        pass

    # Body type (required) :contentReference[oaicite:4]{index=4}
    body_el = driver.find_element(*_css("listing-create-bodytype-select"))
    body_sel = Select(body_el)
    wait.until(lambda d: len(body_sel.options) > 1)

    for opt in body_sel.options:
        v = opt.get_attribute("value")
        if v:
            body_sel.select_by_value(v)
            break

    # Price (triệu) + Title
    p = driver.find_element(*_css("listing-create-price-input"))
    p.clear(); p.send_keys(data["price_million"])

    t = driver.find_element(*_css("listing-create-title-input"))
    t.clear(); t.send_keys(data["title"])

    # Description (textarea hiện chưa có testid trong snippet bạn gửi :contentReference[oaicite:5]{index=5}, nên mình fallback theo label)
    try:
        dsc = driver.find_element(*_css("listing-create-description-textarea"))
    except Exception:
        dsc = driver.find_element(By.XPATH, "//label[contains(.,'Mô tả')]/following::textarea[1]")
    dsc.clear(); dsc.send_keys(data["description"])

    # Province
    province_el = wait.until(EC.presence_of_element_located(_css("listing-create-province-select")))
    province_select = Select(province_el)

    wait.until(lambda d: len(province_select.options) > 1)

    # chọn province đầu tiên có value != ""
    for opt in province_select.options:
        v = opt.get_attribute("value")
        if v:
            province_select.select_by_value(v)
            break

    # District (phụ thuộc province)
    district_el = wait.until(EC.presence_of_element_located(_css("listing-create-district-select")))

    # chờ select được enable
    wait.until(lambda d: d.find_element(*_css("listing-create-district-select")).is_enabled())

    # QUAN TRỌNG: chờ district options load xong (len > 1)
    def district_ready(d):
        sel = Select(d.find_element(*_css("listing-create-district-select")))
        return len(sel.options) > 1

    wait.until(district_ready)

    district_select = Select(driver.find_element(*_css("listing-create-district-select")))

    # chọn district đầu tiên có value != ""
    selected = False
    for opt in district_select.options:
        v = opt.get_attribute("value")
        if v:
            district_select.select_by_value(v)
            selected = True
            break

    assert selected, "Không chọn được district (options vẫn rỗng hoặc toàn value='')"

    # verify value đã khác rỗng
    district_value = driver.find_element(*_css("listing-create-district-select")).get_attribute("value")
    assert district_value.strip() != "", "District vẫn rỗng sau khi select"

    # YouTube link: BỎ QUA (để trống)

    # Upload image (required) :contentReference[oaicite:7]{index=7}
    img_path = os.path.abspath(os.path.join("assets", "bmw-x5-2.webp"))
    driver.find_element(*_css("listing-create-image-upload")).send_keys(img_path)

    # Verify address_line không rỗng (nếu bạn đã thêm testid)
    addr = driver.find_element(By.CSS_SELECTOR, "[data-testid='listing-create-address-line']").get_attribute("value")
    print("ADDRESS_LINE =", addr)
    assert addr and addr.strip(), "Tài khoản test chưa có address => form sẽ không submit được"

    # Verify ảnh thật sự đã chọn (required)
    img_val = driver.find_element(*_css("listing-create-image-upload")).get_attribute("value")
    print("IMAGE_VALUE =", img_val)
    assert img_val, "Ảnh chưa được chọn thực sự => form sẽ fail required"

    def val(testid):
        el = driver.find_element(By.CSS_SELECTOR, f"[data-testid='{testid}']")
        return el.get_attribute("value")

    print("brand:", val("listing-create-brand-select"))
    print("model:", val("listing-create-model-select"))
    print("body_type:", val("listing-create-bodytype-select"))
    print("province:", val("listing-create-province-select"))
    print("district:", val("listing-create-district-select"))

    # 6) Submit (scroll + click chắc chắn)
    btn = driver.find_element(*_css("listing-create-submit-btn"))
    driver.execute_script("arguments[0].scrollIntoView({block:'center'});", btn)

    # click bằng JS để tránh bị overlay/React nuốt click
    driver.execute_script("arguments[0].click();", btn)

    accept_alert_if_any(driver, 5)
    # DEBUG: kiểm tra có bắn request fetch/xhr không
    import time
    time.sleep(2)

    entries = driver.execute_script("""
    return performance.getEntriesByType('resource')
    .filter(e => e.initiatorType === 'fetch' || e.initiatorType === 'xmlhttprequest')
    .slice(-10)
    .map(e => e.name);
    """)
    print("LAST XHR/FETCH:")
    for u in entries:
        print(" -", u)

    # chờ redirect tối đa 60s (manual ~20s)
    from selenium.common.exceptions import TimeoutException
    try:
        WebDriverWait(driver, 30).until(EC.url_contains("/listings/self"))
    except TimeoutException:
        print("URL after 30s:", driver.current_url)
        raise


    # 7) Verify: thấy title trên page
    wait.until(EC.presence_of_element_located(
        (By.XPATH, f"//h3[contains(normalize-space(),\"{data['title']}\")]")
    ))
