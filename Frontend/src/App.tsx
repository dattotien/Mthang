import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import VideoOverlay from "./components/VideoOverlay";

function App() {
  const [info, setInfo] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime; // giây
        const frame = Math.floor(currentTime * 25); // 25 fps
        axios
          .get(`http://127.0.0.1:8000/info?frame=${frame}&video_id=269`)
          .then((res) => {
            setInfo(res.data);
          })
          .catch((err) => {
            console.error(err);
          });
      }
    }, 1000); // gọi API mỗi giây

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "black",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
        }}
      >
        <video
          ref={videoRef}
          src="http://127.0.0.1:8000/video"
          style={{
            width: "100%",
            height: "100%",
          }}
          autoPlay
          muted
          loop
        />
        {info && <VideoOverlay info={info} />}
      </div>
    </div>
  );
}

export default App;
