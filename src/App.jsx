import { Canvas } from "@react-three/fiber";
import Experience from "./components/Experience";
import { ScrollControls } from "@react-three/drei";
import { EffectComposer, Noise } from "@react-three/postprocessing";
import { Overlay } from "./components/Overlay";

function App() {
    return (
      <>
        <Canvas camera={{
          position: [0, 0, 5],
          fov: 30,
        }}>
          <color attach="background" args={["#ececec"]} />
          <ScrollControls pages={30} damping={0.8}>
            <Experience />
          </ScrollControls>
          <EffectComposer>
            <Noise opacity={0.025} />
          </EffectComposer>
        </Canvas>
        <Overlay />
      </>
    );
  }
  
  export default App;