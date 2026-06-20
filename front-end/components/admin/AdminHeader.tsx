import Link from "next/link";

interface AdminHeaderProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonHref?: string;
}

export default function AdminHeader({
  title,
  description,
  buttonText,
  buttonHref,
}: AdminHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </div>
      {buttonText && buttonHref && (
        <Link
          href={buttonHref}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm transition"
        >
          {buttonText}
        </Link>
      )}
    </div>
  );
}
