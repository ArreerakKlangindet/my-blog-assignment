"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 🛠️ ยิง API ไปที่ NestJS หลังบ้านพอร์ต 5000 ตามโครงสร้างระบบของหนู
      const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // 🛠️ ส่งคีย์เป็น email และ password ตามที่ Validator ของหลังบ้านกำหนดไว้เป๊ะ ๆ
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("📦 ข้อมูลที่ NestJS ส่งกลับมา:", data); // เอาไว้กด F12 ตรวจสอบของจริงได้บนเบราว์เซอร์

      if (!res.ok) {
        throw new Error(data.message || "อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      }

      // 🛠️ ตรวจสอบแกะคีย์ Token ให้ครอบคลุมทุกรูปแบบ (ทั้งแบบ camelCase และ snake_case)
      const token = data.access_token || data.accessToken || data.token;

      if (token) {
        // บันทึก Token ลงเครื่องด้วยคีย์ 'token' เพื่อให้ฟังก์ชัน apiRequest / หน้าอื่น ๆ ดึงไปใช้งานต่อได้ง่าย
        localStorage.setItem("token", token);

        // 🚀 ดีดหน้าแอดมินข้ามฝั่งไปที่หน้าจัดการบทความทันที
        router.push("/admin/blogs");
        router.refresh();
      } else {
        throw new Error("ล็อกอินสำเร็จ แต่เซิร์ฟเวอร์ไม่ได้ส่ง Token กลับมา");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("เกิดข้อผิดพลาดในการเชื่อมต่อระบบ");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          เข้าสู่ระบบแอดมิน 🔐
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          ระบบควบคุมเนื้อหาและจัดการความคิดเห็น
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-medium px-4 py-3 rounded-xl">
                ⚠️ {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                อีเมลแอดมิน (Email)
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                รหัสผ่าน (Password)
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 transition-colors cursor-pointer"
              >
                {loading ? "กำลังตรวจสอบข้อมูล..." : "ลงชื่อเข้าใช้งาน"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
