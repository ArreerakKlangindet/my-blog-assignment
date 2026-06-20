import { redirect } from "next/navigation";

export default function AdminPage() {
  // เมื่อแอดมินวิ่งเข้ามาที่หน้า /admin ให้ส่งไปหน้าจัดการบล็อกทันที
  redirect("/admin/blogs");
}
