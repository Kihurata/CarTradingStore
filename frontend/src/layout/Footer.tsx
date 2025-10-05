export function Footer() {
  return (
    <footer className="mt-12 border-t bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-4 gap-6 text-sm">
        <div>
          <div className="font-semibold mb-2">Về chúng tôi</div>
          <p className="text-muted-foreground">Nền tảng mua bán ô tô trực tuyến.</p>
        </div>
        <div>
          <div className="font-semibold mb-2">Hỗ trợ</div>
          <ul className="space-y-1">
            <li>Trung tâm trợ giúp</li><li>Hướng dẫn đăng tin</li><li>Chính sách</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Liên hệ</div>
          <ul className="space-y-1">
            <li>Email: support@autorizz.dev</li><li>Hotline: 0900 000 000</li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-2">Tải ứng dụng</div>
          <div className="h-24 rounded bg-slate-200" />
        </div>
      </div>
    </footer>
  );
}
