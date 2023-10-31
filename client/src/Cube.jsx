import React, { useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import { io } from "socket.io-client";
import useRaycaster from "./hooks/useRaycaster";

const socket = io("ws://192.168.1.5:3500");

function Dot({ position }) {
  return (
    <mesh position={position}>
      <circleGeometry args={[0.05, 16]} />
      <meshBasicMaterial color={0xff0000} />
    </mesh>
  );
}

function Cube() {
  const [dots, setDots] = useState([]);
  const [isTextBoxOpen, setTextBoxOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const { handleClick, handleUnclick, clickedPoint } = useRaycaster(
    (point) => {
      setTextBoxOpen(true);
    }
  );

  useEffect(() => {
    // Listen for messages from the server
    socket.on("message", (data) => {
      if (data.type === "data") {
        // Update dots based on the data received
        setDots((prevDots) => [...prevDots, data.point]);
      }
    });

    // Clean up the socket listener when the component unmounts
    return () => {
      socket.off("message");
    };
  }, []); // Empty dependency array to ensure this effect runs only once

  const handleCloseTextBox = () => {
    setTextBoxOpen(false);
  };

  const handleTextChange = (e) => {
    setTypedText(e.target.value);
  };

  const handleSendData = () => {
    socket.emit("message", {
      type: "data",
      point: clickedPoint,
      text: typedText,
    });

    handleCloseTextBox();
  };

  return (
    <group>
      <mesh onClick={handleClick} onPointerUp={handleUnclick}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color={0x00ff00} />
      </mesh>
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
      {dots.map((dot, index) => (
        <Dot key={index} position={dot} />
      ))}
    </group>
  );
}

export default Cube;
