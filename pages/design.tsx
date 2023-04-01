import React from "react";
// import img from "next/img";

const WhiteBoard = () => {
  const dots = [];

  for (let i = 1; i <= 1000; i++) {
    dots.push(<span key={`span${i + 1}`}></span>);
  }

  return (
    <div className="whiteboard">
      <div className="whiteboard__top">
        <img src="/images/Logo.png" alt="" />
      </div>
      <div className="whiteboard__screen">
        <div className="whiteboard__screen__top">
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
        </div>
        <div className="screen__chat">
          <div className="screen">
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
          </div>
          <div className="chat">
            <div className="chat_content">
              <div className="sentImages">
                <img
                  src="https://media.istockphoto.com/id/1291318636/photo/put-more-in-get-more-out.jpg?s=612x612&w=0&k=20&c=KRvn1x6r9x9GmYMLpW6AVZzkvOA0bmn14fKle-O6CVc="
                  alt=""
                />
              </div>
              <div className="sentImages">
                <img
                  src="https://media.istockphoto.com/id/1163576185/photo/excited-happy-afro-american-man-looking-at-laptop-computer-screen-and-celebrating-the-win.jpg?s=612x612&w=0&k=20&c=xLRYAZAJwnqr9Ue1BPbx8rGxSW2gTAjohUFIqlJ7FzY="
                  alt=""
                />
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
                  <div className="imageInnerDiv">
                    <img src="/images/fluent_camera-24-regular.png" alt="" />
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
                <p>Type your message</p>
                <button>Send</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteBoard;
