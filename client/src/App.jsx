import { useEffect, useState } from "react";
import { useThree, useFrame, extend, Canvas } from "react-three-fiber";
import { Raycaster } from "three";
import { Html, useGLTF } from "@react-three/drei";
import { io } from "socket.io-client";
import { OrbitControls } from "@react-three/drei";

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
      <sphereGeometry args={[1, 16]} />
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
      // console.log(clickedPoint);
      setTextBoxOpen(true);
    }
  );
  const { scene } = useGLTF("./p_001.glb");

  const handleCloseTextBox = () => {
    setTypedText("");
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
      if (data.type === "data") {
        // Update dots based on the data received
        setDots((prevDots) => {
          console.log("prevDots: ", ...prevDots);
          return [...prevDots, data.point];
        });
        console.log(dots);
      }
    });
  };

  return (
    <mesh onClick={handleClick} onPointerUp={handleUnclick}>
      <primitive object={scene} />
      {isTextBoxOpen && (
        <>
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
        </>
      )}
      {dots && dots.map((dot, index) => <Dot key={index} position={dot} />)}
    </mesh>
  );
}

function App() {
  // Listen for messages from the server
  useEffect(() => {
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  const [data, setData] = useState({});

  return (
    <div style={{ height: "100vh" }}>
      <Canvas camera={{ fov: 75, position: [-10, 45, 250] }}>
        <ambientLight intensity={1} />
        <Cube data={{ data, setData }} />
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default App;
