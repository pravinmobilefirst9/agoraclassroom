import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import {
  ClientConfig,
  IAgoraRTCRemoteUser,
  ICameraVideoTrack,
  IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import {
  AgoraVideoPlayer,
  createClient,
  createMicrophoneAndCameraTracks,
} from "agora-rtc-react";

const ChatRoom = dynamic(() => import("../components/chat"), {
  ssr: false,
});

const Whiteboard = dynamic(() => import("../components/whiteBoard"), {
  ssr: false,
});

const config: ClientConfig = {
  mode: "rtc",
  codec: "vp8",
};

interface propType {
  roomData: any;
}

const appId: string = "a9a93ac27e184ee4bd333586bc90eff9";

export default function VideoCallMain(props: propType) {
  const [inCall, setInCall] = useState<boolean>(false);

  useEffect(() => {
    console.log("window.innerHeight", window.innerHeight);
  }, []);

  const useClient = createClient(config);
  const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

  const VideoCall = () => {
    // const { setInCall, channelName } = props;
    const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [start, setStart] = useState<boolean>(false);
    const client = useClient();
    const { ready, tracks } = useMicrophoneAndCameraTracks();

    useEffect(() => {
      // function to initialise the SDK
      let init = async () => {
        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          console.log("subscribe success");
          if (mediaType === "video") {
            setUsers((prevUsers) => {
              return [...prevUsers, user];
            });
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", (user, type) => {
          console.log("unpublished", user, type);
          if (type === "audio") {
            user.audioTrack?.stop();
          }
          if (type === "video") {
            setUsers((prevUsers) => {
              return prevUsers.filter((User) => User.uid !== user.uid);
            });
          }
        });

        client.on("user-left", (user) => {
          console.log("leaving", user);
          setUsers((prevUsers) => {
            return prevUsers.filter((User) => User.uid !== user.uid);
          });
        });
        console.log("joinnn");
        await client.join(
          appId,
          props.roomData.display_name,
          props.roomData.videoToken,
          null
        );
        if (tracks) await client.publish([tracks[0], tracks[1]]);
        setStart(true);
      };

      if (ready && tracks) {
        console.log("init ready");
        init();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [, /* channelName */ client, ready, tracks]);
    return (
      <div className="App">
        {ready && tracks && (
          <Controls tracks={tracks} setStart={setStart} setInCall={setInCall} />
        )}
        {start && tracks && <Videos users={users} tracks={tracks} />}
      </div>
    );
  };

  const Videos = (props: {
    users: IAgoraRTCRemoteUser[];
    tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
  }) => {
    const { users, tracks } = props;
    console.log("users", users, tracks);
    return (
      <div>
        <div id="videos">
          <AgoraVideoPlayer
            className="vid"
            style={{ width: "150px", height: "150px" }}
            videoTrack={tracks[1]}
          />
          {users.length > 0 &&
            users.map((user) => {
              if (user.videoTrack) {
                return (
                  <AgoraVideoPlayer
                    className="vid"
                    style={{ width: "150px", height: "150px" }}
                    videoTrack={user.videoTrack}
                    key={user.uid}
                  />
                );
              } else return null;
            })}
        </div>
      </div>
    );
  };

  const Controls = (props: { tracks: any; setStart: any; setInCall: any }) => {
    const client = useClient();
    const { tracks, setStart, setInCall } = props;
    const [trackState, setTrackState] = useState({ video: true, audio: true });

    const mute = async (type: "audio" | "video") => {
      if (type === "audio") {
        await tracks[0].setEnabled(!trackState.audio);
        setTrackState((ps) => {
          return { ...ps, audio: !ps.audio };
        });
      } else if (type === "video") {
        await tracks[1].setEnabled(!trackState.video);
        setTrackState((ps) => {
          return { ...ps, video: !ps.video };
        });
      }
    };

    const leaveChannel = async () => {
      await client.leave();
      client.removeAllListeners();
      tracks[0].close();
      tracks[1].close();
      setStart(false);
      setInCall(false);
    };

    return (
      <div className="controls">
        <p
          className={trackState.audio ? "on" : ""}
          onClick={() => mute("audio")}
        >
          {trackState.audio ? "MuteAudio" : "UnmuteAudio"}
        </p>
        <p
          className={trackState.video ? "on" : ""}
          onClick={() => mute("video")}
        >
          {trackState.video ? "MuteVideo" : "UnmuteVideo"}
        </p>
        {<p onClick={() => leaveChannel()}>Leave</p>}
      </div>
    );
  };

  const ChannelForm = () => {
    return (
      <form
        className="join"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "#e990c5",
        }}
      >
        {appId === "" && (
          <p style={{ color: "red" }}>
            Please enter your Agora App ID in App.tsx and refresh the page
          </p>
        )}
        {/* <h1></h1> */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setInCall(true);
          }}
          style={{
            height: "56px",
            // width: "108px",
            padding: "4px 20px",
            fontSize: "24px",
            margin: "auto",
            borderRadius: "8px",
            border: "none",
          }}
        >
          Welcome To Skylone
        </button>
      </form>
    );
  };

  const dots = [];

  for (let i = 1; i <= 1000; i++) {
    dots.push(<span key={`span${i + 1}`}></span>);
  }

  return (
    <>
      {inCall ? (
        <>
          <div className="whiteboard">
            <div className="whiteboard__top">
              <img src="/images/Logo.png" alt="" />
            </div>
            <div className="whiteboard__screen">
              {props?.roomData !== null && (
                <Whiteboard roomData={props?.roomData} />
              )}
              <div className="screen__chat">
                <div className="chat">
                  <div className="chat_content">
                    <div className="sentImages">
                      <VideoCall />
                    </div>
                    <div className="saveAttachImageEnd">
                      <div className="saveMainDiv">
                        <div className="saveInnerDiv">
                          <img src="/images/Frame (8).png" alt="" />
                        </div>
                        <div className="saveText">
                          <p>Save</p>
                        </div>
                      </div>
                      <div className="attachMainDiv">
                        <div className="attachInnerDiv">
                          <img
                            src="/images/ant-design_paper-clip-outlined.png"
                            alt=""
                          />
                        </div>
                        <div className="attachText">
                          <p>Attach</p>
                        </div>
                      </div>
                      <div className="imageMainDiv">
                        <div
                          className="imageInnerDiv"
                          //   onClick={() => mute("video")}
                        >
                          <img
                            src="/images/fluent_camera-24-regular.png"
                            alt=""
                          />
                        </div>
                        <div className="imageText">
                          <p>img</p>
                        </div>
                      </div>
                      <div className="endMainDiv">
                        <div
                          className="endInnerDiv"
                          style={{ background: "#FF7A7A" }}
                        >
                          <img src="/images/log-in.png" alt="" />
                        </div>
                        <div className="endText">
                          <p>End</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <ChatRoom roomData={props.roomData} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <ChannelForm />
      )}
    </>
  );
}
