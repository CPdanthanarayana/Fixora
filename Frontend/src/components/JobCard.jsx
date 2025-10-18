import { MessageCircle, Wrench, Cog, Hammer, Trash2 } from "lucide-react";
import { useState } from "react";
import { FaBroom, FaHardHat } from "react-icons/fa";

const getCategoryIcon = (categoryName) => {
  if (!categoryName) return <Hammer className="w-5 h-5 text-gray-500" />;

  const categoryLower = categoryName.toLowerCase().trim();

  switch (categoryLower) {
    case "cleaning":
      return <FaBroom className="w-5 h-5 text-teal-500" />;
    case "repair":
      return <Wrench className="w-5 h-5 text-teal-500" />;
    case "maintenance":
      return <Cog className="w-5 h-5 text-teal-500" />;
    case "installation":
      return <FaHardHat className="w-5 h-5 text-teal-500" />;
    default:
      return <Hammer className="w-5 h-5 text-teal-500" />;
  }
};

function JobCard({ job, onChat, onDelete, currentUserId }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongDescription = job.description && job.description.length > 150;

  return (
    <div className="rounded-2xl shadow-md p-5 hover:shadow-lg transition h-full flex flex-col relative">
      {/* Category Icon - Top Right */}
      <div className="absolute top-4 right-4">
        {getCategoryIcon(job.category_name)}
      </div>

      {/* Content Area */}
      <div className="flex-1 pr-8">
        {/* Job Title */}
        <h3 className="text-lg font-semibold text-black">{job.title}</h3>

        {/* Company / Category */}
        <p className="text-sm text-black/80">{job.category_name}</p>

        {/* Description */}
        <div className="mt-2">
          <div className="h-16">
            {" "}
            {/* Fixed height container */}
            <div
              className={`text-sm text-black/90 h-full ${
                isExpanded
                  ? "overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-transparent"
                  : isLongDescription
                  ? "line-clamp-3"
                  : ""
              }`}
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#14b8a6 transparent",
              }}
            >
              {job.description}
            </div>
          </div>
          {isLongDescription && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs text-orange-500 hover:text-orange-600 mt-1 font-medium"
            >
              {isExpanded ? "See Less" : "See More"}
            </button>
          )}
        </div>
      </div>

      {/* Bottom row - Always at bottom */}
      <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100">
        {/* Left side - Price and Delete Button */}
        <div className="flex items-center gap-2">
          <div className="bg-teal-500 rounded-lg px-3 py-1 inline-block">
            <span className="text-sm font-medium text-white/90">
              {job.salary ? `Rs. ${job.salary}` : "Negotiable"}
            </span>
          </div>
          {/* Delete Button (only for user's own jobs) */}
          {(job.user_id === currentUserId ||
            job.created_by === currentUserId) &&
            onDelete && (
              <button
                onClick={() => onDelete(job)}
                className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition"
                title="Delete this service"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
        </div>

        {/* Right side - Chat Icon */}
        <div className="flex items-center">
          <button
            onClick={() => onChat(job)}
            className="p-2 rounded-full bg-black/10 text-black/50 hover:bg-black/30 transition"
            title="Chat about this service"
          >
            <MessageCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default JobCard;
