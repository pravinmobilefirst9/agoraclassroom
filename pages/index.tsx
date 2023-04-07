import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

const sdkToken =
  "NETLESSSDK_YWs9WDdhMzFxU3FQTkF0c3hOSyZub25jZT1lYjExNjBjMC1kNTA5LTExZWQtOTlkYy01MTgzNDAyNjk3N2Mmcm9sZT0wJnNpZz1lY2I4YWZjMjY5NjY5ZmIzY2ZjODhiMTI3MjNiZWEyMjBkMmQ1ZmE5NzIxMzI0NDQwODBmYTk0YjQ4MTI0MmNh";
const appIdentifier = "4GEE8NUJEe2Z3FGDQCaXfA/v9_1Ayyl_ViGZg";
const region = "cn-hz";
interface paramsType {
  uuid: string;
  roomToken: string;
}

interface savParamsType {
  channel: string;
  uuid: string;
  roomToken: string;
  videoToken: string;
}

export default function Home() {
  const [name, setName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (name === "" || roomId === "") {
      alert("Please fill the data of name and room id to continue.");
      return false;
    }
    var roomUUID = "";
    createRoom()
      .then(function (roomJSON) {
        // The room is created successfully, get the roomJSON describing the content of the room
        roomUUID = roomJSON.uuid;
        return createRoomToken(roomUUID);
      })
      .then(function (roomToken) {
        // The roomToken of the room has been checked out
        let params: paramsType = {
          uuid: roomUUID,
          roomToken: roomToken,
        };

        return createVideoToken(params);
      })
      .then(function (data) {
        return handleSaveDetail(data);
      });
  };

  function createRoom() {
    var url = "https://shunt-api.netless.link/v5/rooms";
    var requestInit = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        token: sdkToken,
        region: region,
      },
    };
    return window.fetch(url, requestInit).then(function (response) {
      return response.json();
    });
  }

  function createRoomToken(roomUUID: string) {
    var url = "https://shunt-api.netless.link/v5/tokens/rooms/" + roomUUID;
    var requestInit = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        token: sdkToken,
        region: region,
      },
      body: JSON.stringify({
        lifespan: 0, // indicates that the Room Token will never expire
        role: "admin", // indicates that Room Token has Admin authority
      }),
    };
    return window.fetch(url, requestInit).then(function (response) {
      return response.json();
    });
  }

  async function createVideoToken(param: paramsType) {
    // let uid = uuidv4();
    let obj = {
      channelName: name,
      uId: "0",
    };

    var url =
      "https://agoramobilefirstapi-production.up.railway.app/api/rtc-token";
    let { status, data } = await axios.post(url, obj);
    console.log("data", data);
    return { ...param, videoToken: data.key, channel: name };
  }

  const handleSaveDetail = async (params: savParamsType) => {
    const param = {
      displayName: name,
      uId: 0,
      roomId: Number(roomId),
      whiteBoardToken: params.roomToken,
      whiteBoardUuid: params.uuid,
      videoToken: params.videoToken,
    };
    const { data } = await axios.post(
      "https://agoramobilefirstapi-production.up.railway.app/api/set-platform-data",
      param
    );
    console.log("dataaaaaaa", data);
    if (data?.message === "Created successfully!") {
      window.location.href = `/videoCallPage?room=${data?.id}`;
      sessionStorage.setItem("display_name", name);
    }

    console.log("data", data);
  };

  return (
    <>
      <Script
        defer
        type="text/javascript"
        src={`https://edu-sdk.vercel.app/js/agora-rtm-sdk-1.5.1.js`}
        onLoad={() => {
          console.log("agora-rtm-sdk-1.5.1 Script has loaded");
        }}
      />
      <Script src="https://edu-sdk.vercel.app/js/lobby.js" />
      <header id="nav">
        <div className="nav--list">
          <h3 id="logo">
            <span>Virtual Classroom</span>
          </h3>
        </div>
      </header>
      <main id="room__lobby__container">
        <div id="form__container">
          <div id="form__container__header">
            <p>Create or Join Room</p>
          </div>
          <form id="lobby__form">
            <div className="form__field__wrapper">
              <label>Room Name</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your room name..."
              />
            </div>
            <div className="form__field__wrapper">
              <label>Room ID</label>
              <input
                type="text"
                name="room"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                required
                placeholder="Enter room id..."
              />
            </div>
            <div className="form__field__wrapper">
              <button type="submit" onClick={(e) => handleSubmit(e)}>
                Join Meeting
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
}
