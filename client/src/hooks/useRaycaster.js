import { useState } from "react";
import { useThree, useFrame, extend } from "react-three-fiber";
import { Raycaster } from "three";

extend({ Raycaster });

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
        onClick(intersects[0].point);
      }

      isClicked = false;
    }
  });

  return { handleClick, handleUnclick, clickedPoint };
};

export default useRaycaster;
