import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
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

const config: ClientConfig = {
  mode: "rtc",
  codec: "vp8",
};

const appId: string = "a9a93ac27e184ee4bd333586bc90eff9";
const token: string | null =
  "007eJxTYOBukMt0/l1+Je/c0TUe9xd/jZSoz9l5frEIt2fITg7L3WoKDImWiZbGiclG5qmGFiapqSZJKcbGxqYWZknJlgapaWmWn2pUUxoCGRmMkhcyMzJAIIjPylCSWlxiyMAAAGFVH2I=";
// const uid = 2882341272;
export default function VideoCallMain() {
  const router = useRouter();

  //   const { sToken, sUid } = router.query;

  //   const token: string = typeof sToken === "string" ? sToken : "";

  //   const uid: string = typeof sUid === "string" ? sUid : "";
  //   console.log("token", token, uid, typeof token, typeof uid);
  const [inCall, setInCall] = useState<boolean>(false);
  const [channelName, setChannelName] = useState<string>("test1");

  useEffect(() => {
    console.log("window.innerHeight", window.innerHeight);
  }, []);

  const useClient = createClient(config);
  const useMicrophoneAndCameraTracks = createMicrophoneAndCameraTracks();

  const VideoCall = (props: {
    setInCall: React.Dispatch<React.SetStateAction<boolean>>;
    channelName: string;
  }) => {
    const { setInCall, channelName } = props;
    const [users, setUsers] = useState<IAgoraRTCRemoteUser[]>([]);
    const [start, setStart] = useState<boolean>(false);
    const client = useClient();
    const { ready, tracks } = useMicrophoneAndCameraTracks();

    useEffect(() => {
      // function to initialise the SDK
      let init = async (name: string) => {
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

        await client.join(appId, name, token, null);
        if (tracks) await client.publish([tracks[0], tracks[1]]);
        setStart(true);
      };

      if (ready && tracks) {
        console.log("init ready");
        init(channelName);
      }
    }, [channelName, client, ready, tracks]);
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
        <input
          type="text"
          placeholder="Enter Channel Name"
          onChange={(e: any) => setChannelName(e.target.value)}
          value={channelName}
        />
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
  return (
    <>
      {inCall ? (
        <VideoCall setInCall={setInCall} channelName={channelName} />
      ) : (
        <ChannelForm />
      )}
    </>
  );
}
