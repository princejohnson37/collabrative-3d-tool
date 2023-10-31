import { useEffect, useState } from "react";
import { useThree, useFrame, extend, Canvas } from "react-three-fiber";
import { Raycaster } from "three";
import { Html } from "@react-three/drei";
import { io } from "socket.io-client";

extend({ Raycaster });
const socket = io("ws://localhost:3500");

const useRaycaster = (onClick) => {
  const { camera, mouse, scene } = useThree();
  const raycaster = new Raycaster();
  let isClicked = false;
  const [clickedPoint, setClickedPoint] = useState(null);

  const handleClick = () => {
    isClicked = true;
  };

  const handleUnclick = () => {
    isClicked = false;
  };

  useFrame(() => {
    if (isClicked) {
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children);

      if (intersects.length > 0) {
        setClickedPoint(intersects[0].point);
        onClick(clickedPoint);
      }

      isClicked = false;
    }
  });

  return { handleClick, handleUnclick, clickedPoint };
};
function Dot({ position }) {
  return (
    <mesh position={position}>
      <circleGeometry args={[0.05, 16]} />
      <meshBasicMaterial color={0xff0000} />
    </mesh>
  );
}

function Cube(redDots) {
  const [isTextBoxOpen, setTextBoxOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [dots, setDots] = useState([redDots]); // Add state to store dots
  const { handleClick, handleUnclick, clickedPoint } = useRaycaster(
    (clickedPoint) => {
      console.log(clickedPoint);
      setTextBoxOpen(true);
    }
  );

  const handleCloseTextBox = () => {
    setTextBoxOpen(false);
  };

  const handleTextChange = (e) => {
    setTypedText(e.target.value);
  };

  const handleSendData = () => {
    // Send both raycaster point and typed text data to the server via socket
    socket.emit("message", {
      type: "data",
      point: clickedPoint,
      text: typedText,
    });
    setDots((prevDots) => [...prevDots, clickedPoint]);
    handleCloseTextBox();

    socket.on("message", (data) => {
      // Update dots and text based on the data received
      setDots((prevDots) => [...prevDots, data.point]);
      // Update text logic if needed
      console.log(data);
    });
  };

  return (
    <mesh onClick={handleClick} onPointerUp={handleUnclick}>
      <boxGeometry args={[1, 1, 1]} />
      <meshBasicMaterial color={0x00ff00} />
      {isTextBoxOpen && (
        <Html>
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <input
              type="text"
              value={typedText}
              onChange={handleTextChange}
              placeholder="Type here"
            />
            <button onClick={handleSendData}>Send</button>
          </div>
        </Html>
      )}
      {dots && dots.map((dot, index) => <Dot key={index} position={dot} />)}
    </mesh>
  );
}

function App() {
  // Listen for messages from the server

  return (
    <div style={{ height: "100vh" }}>
      <Canvas>
        <Cube />
      </Canvas>
    </div>
  );
}

export default App;
