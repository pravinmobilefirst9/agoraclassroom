import React from "react";
import dynamic from "next/dynamic";

const VideoCall = dynamic(() => import("../components/video"), {
  ssr: false,
});

export default function VideoCallPage() {
  return (
    <div style={{ height: "100vh", padding: "100px 50px" }}>
      <VideoCall />
    </div>
  );
}
