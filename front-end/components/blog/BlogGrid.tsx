"use client";

import { Blog } from "@/types/blog";
import BlogCard from "./BlogCard";

interface BlogGridProps {
  blogs: Blog[];
  apiUrl: string;
}

export default function BlogGrid({ blogs, apiUrl }: BlogGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {blogs.map((blog) => (
        <BlogCard key={blog.id} blog={blog} apiUrl={apiUrl} />
      ))}
    </div>
  );
}