import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import axios from "axios";

const VideoCall = dynamic(() => import("../components/video"), {
  ssr: false,
});

export default function VideoCallPage() {
  const [roomData, setRoomData] = useState<any>(null);

  const router = useRouter();
  const { room } = router.query;

  useEffect(() => {
    if (room !== undefined) {
      getRoomDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room]);

  const getRoomDetails = async () => {
    const { data } = await axios.get(
      `https://agoramobilefirstapi-production-0666.up.railway.app/api/get-room-by-id/${room}`
    );

    console.log("data", data);
    setRoomData(data);
  };

  return (
    <>
      <div style={{ height: "100vh" }}>
        <VideoCall roomData={roomData} /* uuid={uuid} */ />
      </div>
    </>
  );
}
