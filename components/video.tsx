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
const token: string | null =
  "006a9a93ac27e184ee4bd333586bc90eff9IAC99KN7P6SMdcdShELdosaHowgBSe0FIXuYPDUqmHI8g+Lcsooh39v0IgDCL3CJ4nooZAQAAQDiF15kAgDiF15kAwDiF15kBADiF15k";
// const uid = 2882341272;
export default function VideoCallMain(props: propType) {
  const router = useRouter();

  //   const { sToken, sUid } = router.query;

  //   const token: string = typeof sToken === "string" ? sToken : "";

  //   const uid: string = typeof sUid === "string" ? sUid : "";
  //   console.log("token", token, uid, typeof token, typeof uid);
  const [inCall, setInCall] = useState<boolean>(false);
  //   const [channelName, setChannelName] = useState<string>("test1");

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
      <form className="join">
        {appId === "" && (
          <p style={{ color: "red" }}>
            Please enter your Agora App ID in App.tsx and refresh the page
          </p>
        )}
        {/* <input
          type="text"
          placeholder="Enter Channel Name"
          onChange={(e: any) => setChannelName(e.target.value)}
          value={channelName}
        /> */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setInCall(true);
          }}
        >
          Join
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
              {/*<div className="whiteboard__screen__top">
                <div className="backIcon__logo">
                  <img src="/images/Frame 10.png" alt="" />
                  <img
                    className="whiteboard__logo"
                    src="/images/Frame 6638.png"
                    alt=""
                  />
                </div>
                <div className="upload__message">
                  <img src="/images/Group 11.png" alt="" />
                  <img src="/images/Group 8.png" alt="" />
                </div>

                <div className="emptyDiv"></div>
      </div>*/}
              {props?.roomData !== null && (
                <Whiteboard roomData={props?.roomData} />
              )}
              <div className="screen__chat">
                {/*<div className="screen">
                  {dots}

                  <div className="toolbar1">
                    <div className="toolbar1__subDiv1">
                      <img src="/images/Rectangle 8.png" alt="" />
                    </div>
                    <div className="toolbar1__subDiv2">
                      <img src="/images/Frame 14.png" alt="" />
                      <img src="/images/Frame 15.png" alt="" />
                      <img src="/images/Frame 16.png" alt="" />
                      <img src="/images/Frame 17.png" alt="" />
                    </div>
                  </div>
                  <div className="toolbar2">
                    <div className="toolbar2__subDiv1">
                      <img src="/images/Frame.png" alt="" />
                      <img src="/images/Rectangle 7.png" alt="" />
                      <img src="/images/Frame (1).png" alt="" />
                      <img src="/images/Line 1.png" alt="" />
                      <img src="/images/Frame (2).png" alt="" />
                      <img src="/images/Frame (3).png" alt="" />
                    </div>
                    <div className="toolbar2__subDiv2">
                      <img src="/images/Frame (4).png" alt="" />
                      <img src="/images/Frame (5).png" alt="" />
                      <img src="/images/Frame (7).png" alt="" />
                      <img src="/images/Frame (6).png" alt="" />
                    </div>
                  </div>
                  <div className="pagination">
                    <div style={{ border: "1px solid #7F56D9" }}>1</div>
                    <div>2</div>
                    <div>3</div>
                    <div>4</div>
                  </div>
                  <div className="zoom">
                    <img src="/images/Frame (9).png" alt="" />
                    <p>62%</p>
                    <img src="/images/Frame (10).png" alt="" />
                  </div>
                </div> */}
                <div className="chat">
                  <div className="chat_content">
                    <div className="sentImages">
                      {/* <img
                        src="https://media.istockphoto.com/id/1291318636/photo/put-more-in-get-more-out.jpg?s=612x612&w=0&k=20&c=KRvn1x6r9x9GmYMLpW6AVZzkvOA0bmn14fKle-O6CVc="
                        alt=""
                      /> */}
                      <VideoCall />
                    </div>
                    {/* <div className="sentImages">
                      <img
                        src="https://media.istockphoto.com/id/1163576185/photo/excited-happy-afro-american-man-looking-at-laptop-computer-screen-and-celebrating-the-win.jpg?s=612x612&w=0&k=20&c=xLRYAZAJwnqr9Ue1BPbx8rGxSW2gTAjohUFIqlJ7FzY="
                        alt=""
                      />
                    </div> */}
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
                        <div className="imageInnerDiv">
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
                  <div className="type_message">
                    <div>
                      <ChatRoom />
                      {/* <p>Type your message</p>
                      <button>Send</button> */}
                    </div>
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
