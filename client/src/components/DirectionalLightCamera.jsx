import React from "react";
import { useFrame, useThree } from "@react-three/fiber";
// import { PointLight } from 'three'
import { DirectionalLightHelper } from "three";

const DirectionalLightFollowingCamera = () => {
  const camera = useThree((state) => {
    return state.camera;
  });

  const lightRef = React.useRef(null);
  const lightHelperRef = React.useRef(null);
  useFrame(() => {
    if (lightRef.current) {
      // Update light position to match camera position
      lightRef.current.position.copy(camera.position);

      // Update light target to match target position
      camera.getWorldDirection(lightRef.current.target.position);
      // Update light helper
      if (lightHelperRef.current) {
        lightHelperRef.current.update();
      }
    }
  });

  return (
    <>
      <directionalLight
        ref={lightRef}
        position={lightRef.current?.position}
        target={lightRef.current?.target}
        intensity={1}
        color="white"
      />
      {lightRef.current && (
        <directionalLightHelper ref={lightHelperRef} light={lightRef.current} />
      )}
    </>
  );
};

// const DirectionalLightFollowingCamera: React.FC = () => {
//   const lightRef = React.useRef<PointLight>(null);
//   const camera = useThree((state) => {
//     return state.camera;
//   });
//   useFrame(() => {
//     if (lightRef.current) {
//       lightRef.current.position.copy(camera.position);
//     }
//   });
//   return(
//     <>
//       <pointLight 
//         ref={lightRef}
//         intensity={100}
//       />
//     </>
//   )
// };

export { DirectionalLightFollowingCamera };