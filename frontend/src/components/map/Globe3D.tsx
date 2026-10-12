"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Sun, Mountain, Box, RefreshCw } from "lucide-react";
import { AnalysisResponse } from "@/lib/types";

interface Globe3DProps {
  center: [number, number];
  analysisData: AnalysisResponse | null;
  heightExaggeration: number;
  onHeightExaggerationChange: (val: number) => void;
  sunAzimuth: number;
  onSunAzimuthChange: (val: number) => void;
  showWireframe: boolean;
  onShowWireframeChange: (val: boolean) => void;
}

export function Globe3D({
  center,
  analysisData,
  heightExaggeration,
  onHeightExaggerationChange,
  sunAzimuth,
  onSunAzimuthChange,
  showWireframe,
  onShowWireframeChange,
}: Globe3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);

  // Mouse interaction state for camera rotation & tilt
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraRotationRef = useRef({ x: 0.6, y: 0.8 });
  const cameraDistanceRef = useRef(42);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x070b13);
    scene.fog = new THREE.FogExp2(0x070b13, 0.015);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    const updateCameraPosition = () => {
      const rx = cameraRotationRef.current.x;
      const ry = cameraRotationRef.current.y;
      const dist = cameraDistanceRef.current;
      camera.position.x = dist * Math.sin(ry) * Math.cos(rx);
      camera.position.y = dist * Math.sin(rx);
      camera.position.z = dist * Math.cos(ry) * Math.cos(rx);
      camera.lookAt(0, 0, 0);
    };
    updateCameraPosition();

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.innerHTML = "";
    mountRef.current.appendChild(renderer.domElement);

    // 4. Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff7ed, 1.8);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);
    dirLightRef.current = dirLight;

    // Secondary subtle fill light
    const fillLight = new THREE.DirectionalLight(0x38bdf8, 0.4);
    fillLight.position.set(-20, 10, -20);
    scene.add(fillLight);

    // 5. Generate 3D Topographic Terrain Mesh
    const planeSize = 32;
    const segments = 128;
    const geometry = new THREE.PlaneGeometry(planeSize, planeSize, segments, segments);

    // Topographic Elevation synthesis using coordinates seed
    const pos = geometry.attributes.position;
    const lat = center[0];
    const lng = center[1];
    const baseFreq = 0.12;

    for (let i = 0; i < pos.count; i++) {
      const u = pos.getX(i);
      const v = pos.getY(i);

      // Multi-octave simplex/perlin approximation
      const d1 = Math.sin((u + lng) * baseFreq) * Math.cos((v + lat) * baseFreq);
      const d2 = Math.sin((u * 2 - lat) * baseFreq * 2) * Math.cos((v * 2 + lng) * baseFreq * 2) * 0.4;
      const d3 = Math.sin((u * 4 + v * 4) * baseFreq * 4) * 0.15;

      // Distance from center to create a subtle island/mountain contour
      const radialFactor = Math.max(0, 1 - Math.sqrt(u * u + v * v) / (planeSize * 0.7));

      const elevation = (d1 + d2 + d3) * radialFactor * heightExaggeration * 2.2;
      pos.setZ(i, elevation);
    }
    geometry.computeVertexNormals();

    // 6. Dynamic Procedural Terrain Texture with Spectral Heatmap
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // Natural terrain base gradient
      const grad = ctx.createLinearGradient(0, 0, 512, 512);
      grad.addColorStop(0, "#1e293b");
      grad.addColorStop(0.5, "#334155");
      grad.addColorStop(1, "#0f172a");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 512, 512);

      // Add topographic contour lines
      ctx.strokeStyle = "rgba(148, 163, 184, 0.15)";
      ctx.lineWidth = 1;
      for (let r = 20; r < 500; r += 25) {
        ctx.beginPath();
        ctx.arc(256, 256, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Drape spectral differencing heatmap clusters if analysis exists
      if (analysisData) {
        const netShift = analysisData.metrics.net_change_pct;
        const lossRatio = analysisData.metrics.loss_area_km2 / Math.max(analysisData.metrics.total_area_km2, 1);

        // Clustered loss (red) and gain (green)
        for (let k = 0; k < 14; k++) {
          const cx = 120 + ((k * 73) % 280);
          const cy = 120 + ((k * 97) % 280);
          const rad = 30 + ((k * 13) % 40);

          const isLoss = k % 3 !== 0; // loss dominant or balanced
          const radialGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, rad);

          if (isLoss) {
            radialGrad.addColorStop(0, "rgba(239, 68, 68, 0.7)");
            radialGrad.addColorStop(1, "rgba(239, 68, 68, 0)");
          } else {
            radialGrad.addColorStop(0, "rgba(34, 197, 94, 0.7)");
            radialGrad.addColorStop(1, "rgba(34, 197, 94, 0)");
          }

          ctx.fillStyle = radialGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.15,
      wireframe: showWireframe,
      flatShading: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    scene.add(mesh);
    meshRef.current = mesh;

    // 7. Ground Wireframe Grid
    const grid = new THREE.GridHelper(40, 20, 0x06b6d4, 0x1e293b);
    grid.position.y = -2;
    scene.add(grid);

    // 8. Animation & Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Update sun direction
      if (dirLightRef.current) {
        const rad = (sunAzimuth * Math.PI) / 180;
        dirLightRef.current.position.set(
          Math.cos(rad) * 30,
          25,
          Math.sin(rad) * 30
        );
      }

      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Listener
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 10. Mouse Interaction for Orbiting
    const domEl = renderer.domElement;

    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraRotationRef.current.y -= deltaX * 0.008;
      cameraRotationRef.current.x = Math.max(
        0.1,
        Math.min(1.4, cameraRotationRef.current.x + deltaY * 0.008)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      updateCameraPosition();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistanceRef.current = Math.max(
        15,
        Math.min(75, cameraDistanceRef.current + e.deltaY * 0.04)
      );
      updateCameraPosition();
    };

    domEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    domEl.addEventListener("wheel", onWheel, { passive: false });

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      domEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      domEl.removeEventListener("wheel", onWheel);
      geometry.dispose();
      material.dispose();
      texture.dispose();
      renderer.dispose();
    };
  }, [center, analysisData, heightExaggeration, showWireframe]);

  return (
    <div className="relative w-full h-full min-h-[460px] bg-slate-950 overflow-hidden">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3D Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 p-3 bg-surface/90 border border-border/80 rounded-xl shadow-2xl backdrop-blur-md max-w-xs">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          3D Topographic Controls
        </span>

        {/* Height Exaggeration */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-accent-cyan" />
              <span>Elevation Extrusion</span>
            </div>
            <span className="font-mono">{heightExaggeration.toFixed(1)}x</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="5.0"
            step="0.2"
            value={heightExaggeration}
            onChange={(e) => onHeightExaggerationChange(Number(e.target.value))}
            className="w-full accent-accent-cyan h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Sunlight Azimuth */}
        <div className="space-y-1 pt-1 border-t border-border/40">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <Sun className="w-3.5 h-3.5 text-accent-amber" />
              <span>Solar Azimuth</span>
            </div>
            <span className="font-mono">{sunAzimuth}°</span>
          </div>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            value={sunAzimuth}
            onChange={(e) => onSunAzimuthChange(Number(e.target.value))}
            className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Wireframe Toggle */}
        <div className="pt-1 border-t border-border/40 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
            <Box className="w-3.5 h-3.5 text-accent-purple" />
            <span>Topographic Wireframe</span>
          </div>
          <button
            type="button"
            onClick={() => onShowWireframeChange(!showWireframe)}
            className={`w-8 h-4 rounded-full transition-colors relative ${
              showWireframe ? "bg-accent-cyan" : "bg-slate-800"
            }`}
          >
            <span
              className={`block w-3 h-3 rounded-full bg-white transition-transform ${
                showWireframe ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Orbit Helper Tip */}
      <div className="absolute bottom-4 left-4 z-20 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-400 backdrop-blur-md pointer-events-none">
        Click + Drag: Orbit & Tilt | Scroll: Zoom Elevation
      </div>
    </div>
  );
}
