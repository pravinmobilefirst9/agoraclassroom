import AgoraRTM from "agora-rtm-sdk";
import axios from "axios";

interface propType {
  roomData: any;
}

const APP_ID = "b147b642a2af4b89980e7c016458fd16";

let client = AgoraRTM.createInstance(APP_ID);

import React, { useEffect, useRef, useState } from "react";

export default function ChatRoom(props: propType) {
  const messagesRef: any = useRef();

  const [messages, setMessages] = useState<any>([]);
  const [text, setText] = useState("");
  const [channel, setChannel] = useState<any>(null);
  const [uid] = useState(sessionStorage.getItem("userName"));

  const appendMessage = (message: any) => {
    setMessages((messages: any) => [...messages, message]);
  };

  async function fetchRTMToken() {
    var url = `https://agoramobilefirstapi-production.up.railway.app/api/rtm-token/${uid}`;

    let { data } = await axios.get(url);
    return { token: data?.key, uid: uid };
  }
  +useEffect(() => {
    fetchRTMToken().then(function (response) {
      const connect = async () => {
        await client.login({
          uid: response?.uid !== null ? response?.uid : "",
          token: response?.token,
        });
        const channel = await client.createChannel(props.roomData.display_name);
        await channel.join();
        channel.on("ChannelMessage", (message, peerId) => {
          appendMessage({
            text: message.text,
            uid: peerId,
          });
        });
        setChannel(channel);
        return channel;
      };
      const connection = connect();
      return () => {
        const disconnect = async () => {
          const channel = await connection;
          await channel.leave();
          await client.logout();
        };
        disconnect();
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = (e: any) => {
    e.preventDefault();
    if (text === "") return;
    channel
      .sendMessage({ text: text }, uid)
      .then(() => {
        console.log("Message sent successfully");
      })
      .catch((err: any) => {
        console.log("Failed to send message", err);
      });
    appendMessage({
      text: text,
      uid,
    });
    setText("");
  };

  return (
    <div className="panel">
      <div className="messages" ref={messagesRef}>
        <div className="inner">
          {messages.map((message: any, idx: any) => (
            <div key={idx} className="message">
              {message.uid === uid && (
                <div className="user-self">{message.uid}:&nbsp;</div>
              )}
              {message.uid !== uid && (
                <div className="user-them">{message.uid}:&nbsp;</div>
              )}
              <div className="text">{message.text}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="type_message">
        <form onSubmit={sendMessage}>
          <div className="chat-input-block">
            <input
              placeholder="Type your message"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button>Send</button>
          </div>
        </form>
      </div>
    </div>
  );
}
