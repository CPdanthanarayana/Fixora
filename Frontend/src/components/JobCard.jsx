import { MessageCircle } from "lucide-react";

function JobCard({ job, onChat }) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-md p-5 hover:shadow-lg transition">
      {/* Job Title */}
      <h3 className="text-lg font-semibold text-white">{job.title}</h3>

      {/* Company / Category */}
      <p className="text-sm text-white/80">{job.category}</p>

      {/* Description */}
      <p className="mt-2 text-sm text-white/90 line-clamp-3">
        {job.description}
      </p>

      {/* Bottom row */}
      <div className="flex items-center justify-between mt-4">
        <span className="text-sm font-medium text-white/90">
          {job.salary ? `Rs. ${job.salary}` : "Negotiable"}
        </span>

        {/* Chat Icon */}
        <button
          onClick={() => onChat(job)}
          className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default JobCard;
