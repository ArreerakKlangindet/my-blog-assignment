"use client";

import { useState } from "react";
import { Blog } from "@/types/blog";

interface BlogCommentsProps {
  blog: Blog;
  apiUrl: string;
  onCommentSubmitted: () => void;
}

export default function BlogComments({
  blog,
  apiUrl,
  onCommentSubmitted,
}: BlogCommentsProps) {
  const [authorName, setAuthorName] = useState("");
  const [commentText, setCommentText] = useState("");
  const [errorNameMsg, setErrorNameMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const thaiLetterSpaceOnlyRegex = /^[ก-๙\s]*$/;
  const thaiNumberSpaceRegex = /^[ก-๙0-9\s]*$/;

  const approvedComments =
    blog.comments?.filter((c) => c.status === "APPROVED") || [];

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setAuthorName(value);
    if (value && !thaiLetterSpaceOnlyRegex.test(value)) {
      setErrorNameMsg(
        "❌ ช่องชื่อกรอกได้เฉพาะภาษาไทย และเว้นวรรคเท่านั้นจ้า (ห้ามใส่ตัวเลข)!",
      );
    } else {
      setErrorNameMsg("");
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setCommentText(value);
    if (value && !thaiNumberSpaceRegex.test(value)) {
      setErrorMsg(
        "❌ ช่องความคิดเห็นกรอกได้เฉพาะภาษาไทย ตัวเลข และเว้นวรรคเท่านั้นจ้า!",
      );
    } else {
      setErrorMsg("");
    }
  };

  const handleSubmitComment = async () => {
    if (!authorName.trim()) {
      setErrorNameMsg("⚠️ รบกวนพิมพ์ชื่อของคุณก่อนส่งน้า");
      return;
    }
    if (!commentText.trim()) {
      setErrorMsg("⚠️ รบกวนพิมพ์ข้อความคอมเมนต์ก่อนส่งน้า");
      return;
    }

    if (!thaiLetterSpaceOnlyRegex.test(authorName)) {
      alert(
        "❌ ช่องชื่อตรวจพบตัวอักษรหรือตัวเลขห้ามใช้! กรุณาแก้ไขให้เป็นภาษาไทยเท่านั้นครับ",
      );
      return;
    }

    if (!thaiNumberSpaceRegex.test(commentText)) {
      alert(
        "❌ ช่องความคิดเห็นตรวจพบตัวอักษรห้ามใช้! กรุณาแก้ไขให้เป็นภาษาไทยหรือตัวเลขเท่านั้นครับ",
      );
      return;
    }

    try {
      setErrorNameMsg("");
      setErrorMsg("");
      setSuccessMsg("");

      const res = await fetch(`${apiUrl}/blogs/${blog.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName,
          content: commentText,
        }),
      });

      if (!res.ok) throw new Error("Failed to send comment");

      setSuccessMsg(
        "🎉 ส่งความคิดเห็นสำเร็จแล้ว! รอแอดมินตรวจสอบอนุมัตินะครับ",
      );
      setAuthorName("");
      setCommentText("");
      onCommentSubmitted(); // เรียกดึงข้อมูลใหม่เพื่อให้อัปเดต
    } catch (err) {
      console.error(err);
      setErrorMsg("💥 เกิดข้อผิดพลาดในการส่งคอมเมนต์ กรุณาลองใหม่อีกครั้ง");
    }
  };

  return (
    <section className="pt-8 border-t border-gray-100 max-w-3xl mx-auto">
      <h3 className="font-bold text-xl text-gray-800 mb-6">💬 ความคิดเห็น</h3>

      {/* รายการคอมเมนต์ */}
      <div className="space-y-4 mb-8">
        {approvedComments.length > 0 ? (
          approvedComments.map((comment) => (
            <div key={comment.id} className="p-4 bg-gray-50 border rounded-xl">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-sm text-gray-700">
                  👤 {comment.authorName}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(comment.createdAt).toLocaleDateString("th-TH")}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {comment.content}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-400 text-center py-4">
            ยังไม่มีความคิดเห็นที่ผ่านการอนุมัติ
          </p>
        )}
      </div>

      {/* ฟอร์มกรอกคอมเมนต์ */}
      <div className="bg-gray-50 p-4 rounded-xl border mb-6">
        <p className="text-xs text-amber-600 font-medium mb-4">
          ⚠️ หมายเหตุ: ช่องชื่อพิมพ์เฉพาะภาษาไทยเท่านั้น
          ช่องคอมเมนต์พิมพ์ภาษาไทยและตัวเลขได้ครับ
        </p>

        <div className="mb-4">
          <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
            ชื่อผู้แสดงความคิดเห็น:
          </label>
          <input
            type="text"
            value={authorName}
            onChange={handleNameChange}
            className="w-full p-2 text-sm rounded-lg border bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
            placeholder="พิมพ์ชื่อของคุณ (ภาษาไทยเท่านั้น)..."
          />
          {errorNameMsg && (
            <p className="text-xs text-red-500 font-medium mt-1">
              {errorNameMsg}
            </p>
          )}
        </div>

        <div className="mb-2">
          <label className="block text-xs font-bold text-gray-600 mb-1 uppercase">
            ข้อความความคิดเห็น:
          </label>
          <textarea
            rows={3}
            value={commentText}
            onChange={handleCommentChange}
            className="w-full p-3 text-sm rounded-lg border bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800"
            placeholder="พิมพ์ความคิดเห็นภาษาไทยของคุณที่นี่..."
          />
          {errorMsg && (
            <p className="text-xs text-red-500 font-medium mt-1">{errorMsg}</p>
          )}
        </div>

        {successMsg && (
          <p className="text-xs text-green-600 font-medium mt-2">
            {successMsg}
          </p>
        )}

        <div className="flex justify-end mt-3">
          <button
            onClick={handleSubmitComment}
            disabled={!!errorMsg || !!errorNameMsg}
            className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition ${
              errorMsg || errorNameMsg
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            ส่งความคิดเห็น
          </button>
        </div>
      </div>
    </section>
  );
}
