import { VideoIcon } from "lucide-react";

function CallButton({ handleVideoCall }) {
  return (
    <div className="absolute z-10 right-3 top-2">
      <button
        type="button"
        onClick={handleVideoCall}
        aria-label="Start video call"
        className="btn btn-ghost btn-sm btn-circle"
      >
        <VideoIcon className="size-5" />
      </button>
    </div>
  );
}

export default CallButton;
