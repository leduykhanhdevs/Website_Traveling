import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

export const HeaderAstrolabe: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isInteractive, setIsInteractive] = useState<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 480;
    const height = container.clientHeight || 480;

    // Three.js Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 110);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Master Group for Parallax & Rotation
    const masterGroup = new THREE.Group();
    scene.add(masterGroup);

    // 1. Central Core: Glowing Polyhedral Waypoint
    const coreGeo = new THREE.IcosahedronGeometry(12, 1);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    masterGroup.add(coreMesh);

    // Inner wireframe glow cage
    const wireCoreGeo = new THREE.IcosahedronGeometry(13.5, 1);
    const wireCoreMat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });
    const wireCoreMesh = new THREE.Mesh(wireCoreGeo, wireCoreMat);
    masterGroup.add(wireCoreMesh);

    // 2. Concentric Astrolabe Coordinate Rings
    const ringMaterials = [
      new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.85, roughness: 0.25 }),
      new THREE.MeshStandardMaterial({ color: 0x818cf8, metalness: 0.9, roughness: 0.2 }),
      new THREE.MeshStandardMaterial({ color: 0x2dd4bf, metalness: 0.8, roughness: 0.3 }),
    ];

    // Ring 1: Celestial Equator
    const ring1Geo = new THREE.TorusGeometry(24, 0.6, 16, 100);
    const ring1Mesh = new THREE.Mesh(ring1Geo, ringMaterials[0]);
    ring1Mesh.rotation.x = Math.PI / 3;
    masterGroup.add(ring1Mesh);

    // Ring 2: Meridian Inclination
    const ring2Geo = new THREE.TorusGeometry(32, 0.5, 16, 100);
    const ring2Mesh = new THREE.Mesh(ring2Geo, ringMaterials[1]);
    ring2Mesh.rotation.y = Math.PI / 4;
    masterGroup.add(ring2Mesh);

    // Ring 3: Ecliptic Outer Ring
    const ring3Geo = new THREE.TorusGeometry(40, 0.4, 16, 120);
    const ring3Mesh = new THREE.Mesh(ring3Geo, ringMaterials[2]);
    ring3Mesh.rotation.z = Math.PI / 6;
    masterGroup.add(ring3Mesh);

    // 3. Orbiting Travel Waypoint Satellites
    const satellites: { mesh: THREE.Mesh; orbitRadius: number; speed: number; angle: number; yOffset: number }[] = [];
    const satGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const satColors = [0x38bdf8, 0x818cf8, 0x2dd4bf, 0xfbbf24];

    for (let i = 0; i < 6; i++) {
      const satMat = new THREE.MeshBasicMaterial({ color: satColors[i % satColors.length] });
      const satMesh = new THREE.Mesh(satGeo, satMat);
      masterGroup.add(satMesh);
      satellites.push({
        mesh: satMesh,
        orbitRadius: 22 + (i * 3.5),
        speed: 0.015 + (i * 0.004),
        angle: (i * Math.PI) / 3,
        yOffset: Math.sin(i) * 8,
      });
    }

    // 4. Subtle Particle Constellation Dust
    const particleCount = 120;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      const radius = 25 + Math.random() * 35;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i + 2] = radius * Math.cos(phi);
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 1.2,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending,
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    masterGroup.add(particlePoints);

    // Lighting
    const pointLight = new THREE.PointLight(0x38bdf8, 3, 150);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight.position.set(50, 50, 80);
    scene.add(dirLight);

    const backDirLight = new THREE.DirectionalLight(0x818cf8, 1);
    backDirLight.position.set(-50, -40, -50);
    scene.add(backDirLight);

    // Interactive pointer parallax tracking & direct drag orbit
    let targetRotationX = 0;
    let targetRotationY = 0;
    let baseRotationX = 0;
    let baseRotationY = 0;
    let isDragging = false;
    let previousPointerPosition = { x: 0, y: 0 };
    let dragVelocityX = 0;
    let dragVelocityY = 0;

    const handlePointerDown = (e: PointerEvent) => {
      isDragging = true;
      previousPointerPosition = { x: e.clientX, y: e.clientY };
      dragVelocityX = 0;
      dragVelocityY = 0;
    };

    const handlePointerUp = () => {
      isDragging = false;
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - previousPointerPosition.x;
        const deltaY = e.clientY - previousPointerPosition.y;
        dragVelocityX = deltaX * 0.008;
        dragVelocityY = deltaY * 0.008;
        baseRotationY += dragVelocityX;
        baseRotationX += dragVelocityY;
        previousPointerPosition = { x: e.clientX, y: e.clientY };
      } else {
        const rect = container.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
        targetRotationY = x * 0.45;
        targetRotationX = -y * 0.45;
      }
    };

    container.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 480;
      const newH = container.clientHeight || 480;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener('resize', handleResize);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Animation Loop
    let animationId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!prefersReducedMotion) {
        // Rotate Core
        coreMesh.rotation.y = elapsed * 0.4;
        coreMesh.rotation.x = elapsed * 0.2;
        wireCoreMesh.rotation.y = -elapsed * 0.25;

        // Rotate Coordinate Rings with distinct multi-axis spin
        ring1Mesh.rotation.z = elapsed * 0.35;
        ring2Mesh.rotation.x = elapsed * 0.25;
        ring3Mesh.rotation.y = elapsed * 0.2;

        // Update Satellites
        satellites.forEach((sat) => {
          sat.angle += sat.speed;
          sat.mesh.position.x = Math.cos(sat.angle) * sat.orbitRadius;
          sat.mesh.position.z = Math.sin(sat.angle) * sat.orbitRadius;
          sat.mesh.position.y = Math.sin(sat.angle * 1.5) * sat.yOffset;
        });

        // Rotate constellation dust
        particlePoints.rotation.y = elapsed * 0.08;
      }

      // Inertia damping for drag
      if (!isDragging) {
        dragVelocityX *= 0.92;
        dragVelocityY *= 0.92;
        baseRotationY += dragVelocityX;
        baseRotationX += dragVelocityY;
      }

      // Smooth Spring / Parallax Damping towards mouse target + drag orientation
      masterGroup.rotation.y += ((baseRotationY + targetRotationY) - masterGroup.rotation.y) * 0.08;
      masterGroup.rotation.x += ((baseRotationX + targetRotationX) - masterGroup.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationId);
      container.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      coreGeo.dispose();
      coreMat.dispose();
      wireCoreGeo.dispose();
      wireCoreMat.dispose();
      ring1Geo.dispose();
      ring2Geo.dispose();
      ring3Geo.dispose();
      ringMaterials.forEach((m) => m.dispose());
      satGeo.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      onMouseEnter={() => setIsInteractive(true)}
      onMouseLeave={() => setIsInteractive(false)}
      className="relative w-full h-[360px] sm:h-[440px] lg:h-[500px] flex items-center justify-center cursor-pointer select-none"
      role="img"
      aria-label="Mô hình không gian 3D tương tác biểu tượng của Traveling, la bàn tinh vân dẫn đường toàn cầu"
    >
      {/* Decorative ambient HUD circle */}
      <div className="absolute inset-0 rounded-full border border-primary/10 pointer-events-none animate-pulse-slow [mask-image:radial-gradient(circle_at_center,transparent_30%,black_100%)]" />
    </div>
  );
};
