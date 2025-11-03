import { Lightbulb } from "lucide-react";
import { Link } from "react-router-dom";

export const DataPromptBanner = () => {
  return (
    <div className="mb-6 rounded-lg border border-amber-300/40 bg-amber-50 text-amber-900 p-4">
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 mt-0.5" />
        <div className="text-sm">
          <div className="font-medium">Add your data to unlock analytics</div>
          <div className="mt-1 text-amber-800/90">
            Some widgets show placeholders until you enter company info or connect sources.
            Update your profile or connect Google to see real insights.
          </div>
          <div className="mt-2 flex gap-3 text-xs">
            <Link to="/profile-settings" className="underline">Complete profile</Link>
            <a href="#" className="underline" onClick={(e) => e.preventDefault()}>Connect Google (Calendar/Tasks)</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataPromptBanner;


