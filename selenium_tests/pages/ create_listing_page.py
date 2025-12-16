import os
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

class CreateListingPage:
    # Upload input có id="images" (rất ổn định)
    UPLOAD = (By.ID, "images")

    # Các input không có id → dùng label text + following input/select
    def _input_after_label(self, label_text: str):
        return (By.XPATH, f"//label[contains(normalize-space(),'{label_text}')]/following::input[1]")

    def _textarea_after_label(self, label_text: str):
        return (By.XPATH, f"//label[contains(normalize-space(),'{label_text}')]/following::textarea[1]")

    def _select_after_label(self, label_text: str):
        return (By.XPATH, f"//label[contains(normalize-space(),'{label_text}')]/following::select[1]")

    SUBMIT = (By.XPATH, "//button[@type='submit' and contains(.,'Đăng tin')]")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 20)

    def open(self, base_url: str):
        self.driver.get(base_url + "/create-listing")
        self.wait.until(EC.presence_of_element_located(self.SUBMIT))

    def fill_min_required(self, data: dict, image_path: str):
        # Brand / Model (select)
        Select(self.wait.until(EC.presence_of_element_located(self._select_after_label("Hãng xe")))).select_by_index(1)
        Select(self.wait.until(EC.presence_of_element_located(self._select_after_label("Dòng xe")))).select_by_index(1)

        # Năm sản xuất
        year_el = self.wait.until(EC.presence_of_element_located(self._input_after_label("Năm sản xuất")))
        year_el.clear(); year_el.send_keys(str(data["year"]))

        # Số km đã đi
        km_el = self.wait.until(EC.presence_of_element_located(self._input_after_label("Số km đã đi")))
        km_el.clear(); km_el.send_keys(str(data["mileage_km"]))

        # Kiểu dáng (body_type)
        Select(self.wait.until(EC.presence_of_element_located(self._select_after_label("Kiểu dáng")))).select_by_index(1)

        # Giá bán (triệu)
        price_el = self.wait.until(EC.presence_of_element_located(self._input_after_label("Giá bán")))
        price_el.clear(); price_el.send_keys(str(data["price_million_vnd"]))

        # Tiêu đề
        title_el = self.wait.until(EC.presence_of_element_located(self._input_after_label("Tiêu đề")))
        title_el.clear(); title_el.send_keys(data["title"])

        # Mô tả
        desc_el = self.wait.until(EC.presence_of_element_located(self._textarea_after_label("Mô tả")))
        desc_el.clear(); desc_el.send_keys(data["description"])

        # Nơi bán xe: tỉnh / quận
        Select(self.wait.until(EC.presence_of_element_located(self._select_after_label("Nơi bán xe")))).select_by_index(1)
        Select(self.wait.until(EC.presence_of_element_located(self._select_after_label("Quận/Huyện")))).select_by_index(1)

        # Upload ảnh
        abs_img = os.path.abspath(image_path)
        self.driver.find_element(*self.UPLOAD).send_keys(abs_img)

    def submit_and_verify_redirect(self, expected_title: str):
        self.driver.find_element(*self.SUBMIT).click()

        # Alert success
        alert = self.wait.until(EC.alert_is_present())
        alert.accept()

        # Redirect /listings/self
        self.wait.until(EC.url_contains("/listings/self"))

        # Verify title xuất hiện ở danh sách
        self.wait.until(
            EC.presence_of_element_located((By.XPATH, f"//h3[contains(normalize-space(),\"{expected_title}\")]"))
        )
