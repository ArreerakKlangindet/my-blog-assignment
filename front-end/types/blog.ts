export interface Blog {
  id: string;
  title: string;
  content: string;
  slug: string;
  coverImageUrl?: string | null;
  images?: BlogImage[];
  comments?: CommentData[];
  viewCount: number;
  status: "DRAFT" | "PUBLISHED" | "UNPUBLISHED";
  createdAt: string;
  updatedAt: string;
}

export interface BlogImage {
  id: string;
  fileName: string;
  filePath: string;
  displayOrder?: number;
}

export interface CommentData {
  id: string;
  authorName: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface PaginationMeta {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
}

export interface BlogPaginatedResponse {
  data: Blog[];
  meta: PaginationMeta;
}

export interface EditBlogPageProps {
  params: Promise<{ id: string }>;
}

export interface UpdateBlogPayload {
  title?: string;
  slug?: string;
  content?: string;
  coverImageUrl?: string | null;
}
