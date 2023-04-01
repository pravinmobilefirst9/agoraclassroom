import React from "react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import { useRouter } from "next/router";
import axios from "axios";
//import {AgoraEduSDK} from 'agora-classNameroom-sdk'

const VideoCall = dynamic(() => import("../components/video"), {
  ssr: false,
});

export default function VideoCallPage() {
  useEffect(() => {
    console.log("page load");
  }, []);

  const [roomData, setRoomData] = useState<any>(null);

  const router = useRouter();

  const { room } = router.query;
  //   AgoraEduSDK.config({
  //     appId: 'a9a93ac27e184ee4bd333586bc90eff9',
  //     region: 'NA'
  // });

  console.log(room);

  const timestamp = new Date().getTime();

  useEffect(() => {
    if (room !== undefined) {
      getRoomDetails();
    }
  }, [room]);

  const getRoomDetails = async () => {
    const { data } = await axios.get(
      `https://agoramobilefirstapi-production.up.railway.app/api/get-room-by-id/${room}`
    );

    console.log("data", data);
    setRoomData(data);
  };

  return (
    <div style={{ height: "100vh", padding: "100px 50px" }}>
      <VideoCall roomData={roomData} /* uuid={uuid} */ />
    </div>
  );
}
