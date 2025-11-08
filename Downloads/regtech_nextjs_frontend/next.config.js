/** @type {import('next').NextConfig} */
const nextConfig = {
  // BẮT BUỘC: Vô hiệu hóa SWC để chuyển sang Webpack (vì SWC gây lỗi Rayon/Thread Panic do thiếu tài nguyên)
  swcMinify: false,
  
  // Tùy chọn env vẫn được giữ
  env: {
    NEXT_WEBPACK_TRANSPILE_MODULES: 'true', 
  },
};

module.exports = nextConfig;