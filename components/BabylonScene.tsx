"use client";
import { useEffect, useRef } from "react";
import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, MeshBuilder, StandardMaterial, Color3 } from "@babylonjs/core";

export default function BabylonScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);
    scene.clearColor.set(0, 0, 0, 0); // Set background to transparent

    // Create a basic camera and light
    const camera = new ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 2.5,
      4,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(canvasRef.current, true);

    const light = new HemisphericLight(
      "light",
      new Vector3(1, 1, 0),
      scene
    );

    // Create a torus knot
    const torusKnot = MeshBuilder.CreateTorusKnot(
      "torusKnot",
      { radius: 0.6, tube: 0.2, radialSegments: 128, tubularSegments: 64, p: 2, q: 3 },
      scene
    );

    // Add a colorful material
    const mat = new StandardMaterial("mat", scene);
    mat.diffuseColor = new Color3(0.4, 0.2, 0.8);
    mat.emissiveColor = new Color3(0.2, 0.8, 0.6);
    torusKnot.material = mat;

    // Animate the torus knot
    engine.runRenderLoop(() => {
      torusKnot.rotation.y += 0.01;
      torusKnot.rotation.x += 0.005;
      scene.render();
    });

    // Clean up
    return () => {
      engine.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "350px", height: "350px", display: "block", margin: "0 auto" }}
    />
  );
}
