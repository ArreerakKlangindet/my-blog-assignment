"use client";

export default function HeroSection() {
  return (
    <div className="text-center max-w-3xl mx-auto px-4 pt-4 pb-2">
      {/* ลูกเล่น Gradient Text ไล่สีม่วง-น้ำเงินสไตล์ Tech */}
      <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
        ยินดีต้อนรับสู่ My Blog 🚀
      </h1>
      <p className="text-gray-500 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
        พื้นที่แบ่งปันความรู้แชร์ทริคเด็ด ๆ เกี่ยวกับเทคโนโลยี พัฒนาเว็บด้วย{" "}
        <span className="font-semibold text-indigo-600">Next.js</span> และ{" "}
        <span className="font-semibold text-purple-600">NestJS</span>
      </p>
    </div>
  );
}
