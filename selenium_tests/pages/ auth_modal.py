from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class AuthModal:
    OPEN_BTN = (By.XPATH, "//button[contains(normalize-space(),'Đăng Nhập / Đăng ký')]")
    EMAIL = (By.XPATH, "//input[@placeholder='Email *']")
    PASSWORD = (By.XPATH, "//input[@placeholder='Mật khẩu *']")
    SUBMIT = (By.XPATH, "//button[@type='submit' and (contains(.,'Đăng nhập') or contains(.,'Đang xử lý'))]")

    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, 15)

    def open(self):
        self.wait.until(EC.element_to_be_clickable(self.OPEN_BTN)).click()

    def login(self, email: str, password: str):
        self.wait.until(EC.visibility_of_element_located(self.EMAIL)).clear()
        self.driver.find_element(*self.EMAIL).send_keys(email)

        self.driver.find_element(*self.PASSWORD).clear()
        self.driver.find_element(*self.PASSWORD).send_keys(password)

        self.driver.find_element(*self.SUBMIT).click()

        # App dùng alert() → phải accept
        alert = self.wait.until(EC.alert_is_present())
        alert.accept()
