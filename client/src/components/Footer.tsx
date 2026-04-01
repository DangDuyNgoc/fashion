import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <div className="mt-16 flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-between md:gap-0 bg-gray-800 p-8 rounded-lg">
      <div className="flex flex-col gap-4 items-center md:items-start">
        <Link href="/" className="flex items-center">
          <Image src="/logo.png" alt="Fashion" width={36} height={36} />
          <p className="hidden md:block text-md font-medium tracking-wider text-white">
            Code-Team.
          </p>
        </Link>
        <p className="text-sm text-gray-400">© 2026 Code-Team.</p>
        <p className="text-sm text-gray-400">Đã đăng ký bản quyền.</p>
      </div>
      <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start">
        <p className="text-sm text-amber-50">Liên kết</p>
        <Link href="/">Trang chủ</Link>
        <Link href="/">Liên hệ</Link>
        <Link href="/">Điều khoản dịch vụ</Link>
        <Link href="/">Chính sách bảo mật</Link>
      </div>
      <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start">
        <p className="text-sm text-amber-50">Sản phẩm</p>
        <Link href="/">Tất cả sản phẩm</Link>
        <Link href="/">Hàng mới về</Link>
        <Link href="/">Bán chạy nhất</Link>
        <Link href="/">Khuyến mãi</Link>
      </div>
      <div className="flex flex-col gap-4 text-sm text-gray-400 items-center md:items-start">
        <p className="text-sm text-amber-50">Giới thiệu</p>
        <Link href="/">Về chúng tôi</Link>
        <Link href="/">Liên hệ</Link>
        <Link href="/">Tin tức</Link>
        <Link href="/">Chương trình liên kết</Link>
      </div>
    </div>
  );
};

export default Footer;
