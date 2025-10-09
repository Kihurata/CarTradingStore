export function Footer() {
  return (
    <footer className="relative mt-12 border-t">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/wp12254785.jpg')" }}
        aria-hidden
      />
      {/* Overlay màu xanh để chữ dễ đọc */}
      <div className="absolute inset-0 bg-blue-900/70" aria-hidden />

      {/* Nội dung */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-4 gap-6 text-sm text-white">
        <div>
          <div className="font-semibold mb-2">Về chúng tôi</div>
          <p className="opacity-90">Nền tảng mua bán ô tô trực tuyến.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Hỗ trợ</div>
          <ul className="space-y-1 opacity-90">
            <li>Trung tâm trợ giúp</li>
            <li>Hướng dẫn đăng tin</li>
            <li>Chính sách</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Liên hệ</div>
          <ul className="space-y-1 opacity-90">
            <li>Email: support@autorizz.dev</li>
            <li>Hotline: 0900 000 000</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
