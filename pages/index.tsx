import { useState } from "react";
import Script from "next/script";
import axios from "axios";

const sdkToken =
  "NETLESSSDK_YWs9WDdhMzFxU3FQTkF0c3hOSyZub25jZT1lYjExNjBjMC1kNTA5LTExZWQtOTlkYy01MTgzNDAyNjk3N2Mmcm9sZT0wJnNpZz1lY2I4YWZjMjY5NjY5ZmIzY2ZjODhiMTI3MjNiZWEyMjBkMmQ1ZmE5NzIxMzI0NDQwODBmYTk0YjQ4MTI0MmNh";
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
  const [sessionTime, setSessionTime] = useState<string>("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (sessionTime === "") {
      alert("Please fill the data of name and room id to continue.");
      return false;
    }
    var roomUUID = "";
    createRoom()
      .then(function (roomJSON) {
        roomUUID = roomJSON.uuid;
        return createRoomToken(roomUUID);
      })
      .then(function (roomToken) {
        let params: paramsType = {
          uuid: roomUUID,
          roomToken: roomToken,
        };
        return createVideoToken(params);
      })
      .then(function (data) {
        return handleSaveDetail(data);
      })
      .then(function (data) {
        return handleSaveClassroom(data);
      });
  };

  function generateRandomString(length: number) {
    let result = "";
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const charactersLength = characters.length;

    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

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
    let dname = generateRandomString(8);
    let obj = {
      channelName: dname,
      uId: "0",
    };

    var url =
      "https://agoramobilefirstapi-production-b221.up.railway.app/api/rtc-token";
    let { data } = await axios.post(url, obj);
    console.log("data", data);
    return { ...param, videoToken: data.key, channel: dname };
  }

  const handleSaveDetail = async (params: savParamsType) => {
    const param = {
      displayName: params.channel,
      uId: 0,
      whiteBoardToken: params.roomToken,
      whiteBoardUuid: params.uuid,
      videoToken: params.videoToken,
    };
    const { data } = await axios.post(
      "https://agoramobilefirstapi-production-b221.up.railway.app/api/set-platform-data",
      param
    );
    console.log("dataaaaaaa", data);
    return { ...params, data: data };
  };

  const handleSaveClassroom = async (params: any) => {
    let date = new Date(sessionTime);
    date.setHours(date.getHours() + 1);
    let endTime = date.toISOString().slice(0, 16);

    const param = {
      description: "demo testing",
      start_time: `${sessionTime}:00.000Z`,
      end_time: `${endTime}:00.000Z`,
      room_id: params.data.id,
      class_link: `${window.location.origin}/videoCallPage?room=${params?.data?.id}`,
    };
    const { data } = await axios.post(
      "https://agoramobilefirstapi-production-b221.up.railway.app/api/set-classroom-data",
      param
    );
    if (data?.message === "Classroom created successfully!") {
      window.location.href = `/videoCallPage?room=${params?.data?.id}&classId=${data?.id}`;
      // sessionStorage.setItem("display_name", name);
    }
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
            {/* <div className="form__field__wrapper">
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
            </div> */}
            <div className="form__field__wrapper">
              <label>Session Time</label>
              <input
                type="datetime-local"
                name="sessionTime"
                value={sessionTime}
                onChange={(e) => setSessionTime(e.target.value)}
                required
                placeholder="Enter Session Time"
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
