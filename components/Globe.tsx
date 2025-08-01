"use client";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars, MeshWobbleMaterial } from "@react-three/drei";

export default function Globe3D() {
  return (
    <div style={{ width: "350px", height: "350px", margin: "0 auto" }}>
      <Canvas camera={{ position: [0, 0, 4] }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} />
        <mesh>
          <sphereGeometry args={[1.2, 64, 64]} />
          <MeshWobbleMaterial
            color="#8b5cf6"
            speed={1.5}
            factor={0.3}
            wireframe={false}
          />
        </mesh>
        <Stars radius={10} depth={50} count={2000} factor={4} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
      </Canvas>
    </div>
  );
}