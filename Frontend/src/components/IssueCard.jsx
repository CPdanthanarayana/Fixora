import { MessageCircle } from "lucide-react";

function IssueCard({ issue, onChat }) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-md p-5 hover:shadow-lg transition">
      {/* Issue Title */}
      <h3 className="text-lg font-semibold text-white">{issue.title}</h3>

      {/* Category / Status */}
      <p className="text-sm text-white/80">{issue.category}</p>

      {/* Description */}
      <p className="mt-2 text-sm text-white/90 line-clamp-3">
        {issue.description}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm font-medium text-white/90">
          {issue.status || "Open"}
        </span>

        {/* Chat Icon */}
        <button
          onClick={() => onChat(issue)}
          className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default IssueCard;
