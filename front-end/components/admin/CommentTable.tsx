"use client";

interface CommentItem {
  id: string;
  authorName: string;
  content: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  blog?: { title: string };
}

interface CommentTableProps {
  comments: CommentItem[];
  onUpdateStatus: (id: string, newStatus: "APPROVED" | "REJECTED") => void;
}

export default function CommentTable({
  comments,
  onUpdateStatus,
}: CommentTableProps) {
  // ฟังก์ชันพ่นป้ายไฟสถานะปัจจุบัน
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            อนุมัติแล้ว
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            ปฏิเสธแล้ว
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            รอตรวจสอบ
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-200 text-gray-600 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6">ผู้เขียน</th>
              <th className="py-4 px-6">ข้อความความคิดเห็น</th>
              <th className="py-4 px-6">จากบทความ</th>
              <th className="py-4 px-6 text-center">สถานะปัจจุบัน</th>
              <th className="py-4 px-6 text-center">เปิด / ปิดการอนุมัติ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {comments.map((comment) => (
              <tr
                key={comment.id}
                className="hover:bg-gray-50/50 transition-colors"
              >
                {/* 1. ผู้เขียน */}
                <td className="py-4 px-6 font-medium text-gray-900 whitespace-nowrap">
                  {comment.authorName}
                </td>

                {/* 2. เนื้อหาข้อความ */}
                <td className="py-4 px-6 max-w-md break-words text-gray-600 line-clamp-2">
                  {comment.content}
                </td>

                {/* 3. อ้างอิงบทความ */}
                <td className="py-4 px-6 max-w-xs truncate text-gray-500">
                  {comment.blog?.title || (
                    <span className="text-gray-400 italic">
                      🤷‍♂️ ไม่ระบุบทความ
                    </span>
                  )}
                </td>

                {/* 4. สถานะปัจจุบัน */}
                <td className="py-4 px-6 text-center whitespace-nowrap">
                  {getStatusBadge(comment.status)}
                </td>

                {/* 5. ปุ่มสวิตช์กลมเลื่อน (Toggle Switch) สวยๆ */}
                <td className="py-4 px-6 text-center whitespace-nowrap">
                  <div className="flex items-center justify-center">
                    <button
                      onClick={() => {
                        // สลับสถานะไปมา: ถ้าตอนนี้เป็น APPROVED ให้สับเป็น REJECTED, นอกนั้นให้เป็น APPROVED
                        const nextStatus =
                          comment.status === "APPROVED"
                            ? "REJECTED"
                            : "APPROVED";
                        onUpdateStatus(comment.id, nextStatus);
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        comment.status === "APPROVED"
                          ? "bg-emerald-500 focus:ring-emerald-500"
                          : comment.status === "REJECTED"
                            ? "bg-rose-400 focus:ring-rose-500"
                            : "bg-gray-200 focus:ring-amber-500" // เคส PENDING
                      }`}
                    >
                      {/* ปุ่มกลมๆ ด้านในที่จะเลื่อนซ้าย-ขวา */}
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                          comment.status === "APPROVED"
                            ? "translate-x-6"
                            : comment.status === "REJECTED"
                              ? "translate-x-1"
                              : "translate-x-3.5" // อยู่ตรงกลางสวยๆ ตอนรอตรวจ
                        }`}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
