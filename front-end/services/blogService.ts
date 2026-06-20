import { Blog, BlogPaginatedResponse } from "@/types/blog";

// ตรวจสอบพอร์ต: ถ้าหลังบ้าน NestJS เป็นพอร์ต 5000 ให้แก้ตรงนี้เป็น 5000 นะครับ
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export const blogService = {
  // 🛠️ แก้ไข: เพิ่ม parameter 'search' และให้รับ page กับ limit เข้ามาจากหน้าแรก
  async getPublishedBlogs(
    page = 1,
    limit = 10,
    search = "",
  ): Promise<BlogPaginatedResponse> {
    try {
      // สร้าง URL หลักสำหรับการทำ Pagination
      let url = `${API_URL}/blogs?page=${page}&limit=${limit}`;

      // 🛠️ เพิ่มเติม: ถ้ามีการพิมพ์ค้นหา ให้ใส่ query string '&search=...' เข้าไปด้วย
      if (search.trim() !== "") {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const res = await fetch(url, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Failed to fetch blogs");
      return await res.json();
    } catch (error) {
      console.error("Error fetching blogs:", error);
      return {
        data: [],
        meta: {
          totalItems: 0,
          currentPage: 1,
          itemsPerPage: limit,
          totalPages: 0,
        },
      };
    }
  },

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    try {
      const res = await fetch(`${API_URL}/blogs/public/${slug}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch blog detail");
      }

      return await res.json();
    } catch (error) {
      console.error("Error fetching blog detail:", error);
      return null;
    }
  },
};
