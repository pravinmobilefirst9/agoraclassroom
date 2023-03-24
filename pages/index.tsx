import { useState } from "react";
import Script from "next/script";
import Link from "next/link";
export default function Home() {
  const [name, setName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if(name === "" || roomId === "")
    {
      alert("Please fill the data of name and room id to continue.");
      return false;
    }

    sessionStorage.setItem("display_name", name);

    let inviteCode = roomId;
    if (!inviteCode) {
      inviteCode = String(Math.floor(Math.random() * 10000));
    }
    window.location.href = `/room?room=${inviteCode}`;
  };

  return (
    <>
      <Script src="https://edu-sdk.vercel.app/js/lobby.js" />
      <header id="nav">
        <div className="nav--list">
           
            <h3 id="logo">
              <span>Virtual Classroom</span>
            </h3>
           
        </div>
        <div id="nav__links">
          <Link className="nav__link" id="create__room__btn" href="/">
            Create Room
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="#ede0e0"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z" />
            </svg>
          </Link>
        </div>
      </header>
      <main id="room__lobby__container">
        <div id="form__container">
          <div id="form__container__header">
            <p>Create or Join Room</p>
          </div>
          <form id="lobby__form">
            <div className="form__field__wrapper">
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your display name..."
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
