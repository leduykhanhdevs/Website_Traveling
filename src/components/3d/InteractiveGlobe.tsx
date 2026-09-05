import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { DESTINATIONS } from '../../data/destinations';
import { Destination } from '../../types';
import { Compass, ZoomIn, ZoomOut, RotateCcw, Crosshair, MapPin, Navigation } from 'lucide-react';

// Convert lat/lng to 3D sphere coordinate
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

interface UserLocation {
  lat: number;
  lng: number;
  label: string;
  isExact: boolean;
}

export const InteractiveGlobe: React.FC<{
  onSelectCity?: (city: Destination) => void;
  selectedCityId?: string;
}> = ({ onSelectCity, selectedCityId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCity, setActiveCity] = useState<Destination>(DESTINATIONS[0]);
  const [userLocation, setUserLocation] = useState<UserLocation>({
    lat: 21.0285,
    lng: 105.8542,
    label: 'Hà Nội, Việt Nam',
    isExact: false,
  });
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [zoomRatio, setZoomRatio] = useState<number>(1);
  const [hasWebGLError, setHasWebGLError] = useState<boolean>(false);

  // References for external button controls (zoom, reset, re-center)
  const zoomControlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetView: () => void;
    focusLocation: (lat: number, lng: number) => void;
  } | null>(null);

  // Sync selected destination
  useEffect(() => {
    if (selectedCityId) {
      const found = DESTINATIONS.find((d) => d.id === selectedCityId);
      if (found) {
        setActiveCity(found);
        if (zoomControlsRef.current) {
          zoomControlsRef.current.focusLocation(found.lat, found.lng);
        }
      }
    }
  }, [selectedCityId]);

  // Request actual user geolocation with high accuracy
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({
            lat,
            lng,
            label: 'Vị trí hiện tại của bạn',
            isExact: true,
          });
          setIsLocating(false);
        },
        (error) => {
          console.warn('Geolocation access fallback to Vietnam default:', error.message);
          // Standard Vietnam coordinate fallback
          setUserLocation({
            lat: 21.0285,
            lng: 105.8542,
            label: 'Hà Nội, Việt Nam (Mặc định)',
            isExact: false,
          });
          setIsLocating(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    } else {
      setIsLocating(false);
    }
  }, []);

  // Initialize Three.js Realistic 3D Earth
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 1100;
    const height = container.clientHeight || 620;

    // 1. Scene, Camera, WebGL Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    const MIN_DISTANCE = 95; // Close-up zoom in limit
    const MAX_DISTANCE = 250; // Deep space zoom out limit
    const DEFAULT_DISTANCE = 175;
    let currentCameraDistance = DEFAULT_DISTANCE;
    let targetCameraDistance = DEFAULT_DISTANCE;

    camera.position.set(0, 0, currentCameraDistance);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
    } catch {
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
      } catch (e) {
        console.warn('WebGL initialization failed on InteractiveGlobe, using static fallback:', e);
        setHasWebGLError(true);
        return;
      }
    }
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // Globe Radius
    const GLOBE_RADIUS = 60;
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // 2. Texture Loader with local planetary textures
    const textureLoader = new THREE.TextureLoader();
    const earthDayMap = textureLoader.load('/textures/earth_atmos_2048.jpg');
    const earthCloudsMap = textureLoader.load('/textures/earth_clouds_1024.png');
    const earthLightsMap = textureLoader.load('/textures/earth_lights_2048.png');

    // Earth Surface Sphere
    const earthGeometry = new THREE.SphereGeometry(GLOBE_RADIUS, 64, 64);
    const earthMaterial = new THREE.MeshStandardMaterial({
      map: earthDayMap,
      roughness: 0.75,
      metalness: 0.1,
      emissive: new THREE.Color('#0a1b3a'),
      emissiveMap: earthLightsMap,
      emissiveIntensity: 0.45,
    });
    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    globeGroup.add(earthMesh);

    // Dynamic Cloud Sphere (spinning at slightly different velocity for realism)
    const cloudsGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.012, 64, 64);
    const cloudsMaterial = new THREE.MeshStandardMaterial({
      map: earthCloudsMap,
      transparent: true,
      opacity: 0.45,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });
    const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    globeGroup.add(cloudsMesh);

    // Atmosphere Outer Glow Halo
    const atmosphereGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.14, 48, 48);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.62 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
          gl_FragColor = vec4(0.22, 0.74, 0.97, 1.0) * intensity * 0.85;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // Subtle coordinate ring outer cage
    const wireGeometry = new THREE.SphereGeometry(GLOBE_RADIUS * 1.004, 36, 18);
    const wireMaterial = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      wireframe: true,
      transparent: true,
      opacity: 0.04,
    });
    const wireMesh = new THREE.Mesh(wireGeometry, wireMaterial);
    globeGroup.add(wireMesh);

    // 3. User Geolocation Pinpoint & Radar Beacon
    const userBeaconGroup = new THREE.Group();
    globeGroup.add(userBeaconGroup);

    const userPos = latLngToVector3(userLocation.lat, userLocation.lng, GLOBE_RADIUS);

    // Gold/Emerald Core Sphere Pin
    const userPinGeo = new THREE.SphereGeometry(1.8, 24, 24);
    const userPinMat = new THREE.MeshBasicMaterial({
      color: 0x10b981, // Emerald green
    });
    const userPinMesh = new THREE.Mesh(userPinGeo, userPinMat);
    userPinMesh.position.copy(userPos);
    userBeaconGroup.add(userPinMesh);

    // Pulsing Radar Rings
    const radarGeo1 = new THREE.RingGeometry(1.6, 2.5, 32);
    const radarMat1 = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const radarMesh1 = new THREE.Mesh(radarGeo1, radarMat1);
    radarMesh1.position.copy(userPos.clone().multiplyScalar(1.006));
    radarMesh1.lookAt(userPos.clone().multiplyScalar(2));
    userBeaconGroup.add(radarMesh1);

    const radarGeo2 = new THREE.RingGeometry(2.4, 3.4, 32);
    const radarMat2 = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const radarMesh2 = new THREE.Mesh(radarGeo2, radarMat2);
    radarMesh2.position.copy(userPos.clone().multiplyScalar(1.007));
    radarMesh2.lookAt(userPos.clone().multiplyScalar(2));
    userBeaconGroup.add(radarMesh2);

    // Luminous Altitude Beam pointing outward from user location
    const beamCurve = new THREE.LineCurve3(
      userPos,
      userPos.clone().multiplyScalar(1.15)
    );
    const beamGeo = new THREE.TubeGeometry(beamCurve, 12, 0.4, 8, false);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.8,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    userBeaconGroup.add(beamMesh);

    // 4. World City Marker Pins
    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);

    const cityPinGeo = new THREE.SphereGeometry(1.0, 16, 16);
    DESTINATIONS.forEach((dest) => {
      const pos = latLngToVector3(dest.lat, dest.lng, GLOBE_RADIUS);

      const pinMat = new THREE.MeshBasicMaterial({
        color: dest.id === activeCity.id ? 0x38bdf8 : 0x818cf8,
      });
      const pin = new THREE.Mesh(cityPinGeo, pinMat);
      pin.position.copy(pos);
      pinGroup.add(pin);

      // Subtle city ring
      const ringGeo = new THREE.RingGeometry(1.2, 1.8, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.5,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.copy(pos.clone().multiplyScalar(1.004));
      ring.lookAt(pos.clone().multiplyScalar(2));
      pinGroup.add(ring);
    });

    // 5. Global Flight Trajectory Arcs
    const flightPairs: [string, string][] = [
      ['hcmc', 'tokyo'],
      ['tokyo', 'paris'],
      ['hcmc', 'da-nang'],
      ['da-nang', 'bali'],
      ['bangkok', 'singapore'],
      ['seoul', 'tokyo'],
      ['hoi-an', 'kyoto'],
      ['paris', 'rome'],
      ['london', 'barcelona'],
      ['amsterdam', 'paris'],
    ];

    const arcGroup = new THREE.Group();
    globeGroup.add(arcGroup);

    flightPairs.forEach(([fromId, toId]) => {
      const fromCity = DESTINATIONS.find((d) => d.id === fromId);
      const toCity = DESTINATIONS.find((d) => d.id === toId);
      if (!fromCity || !toCity) return;

      const start = latLngToVector3(fromCity.lat, fromCity.lng, GLOBE_RADIUS);
      const end = latLngToVector3(toCity.lat, toCity.lng, GLOBE_RADIUS);

      const mid = start.clone().add(end).multiplyScalar(0.5);
      const distance = start.distanceTo(end);
      mid.normalize().multiplyScalar(GLOBE_RADIUS + distance * 0.26);

      const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
      const points = curve.getPoints(45);
      const arcGeometry = new THREE.BufferGeometry().setFromPoints(points);

      const arcMaterial = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.4,
      });
      const arcLine = new THREE.Line(arcGeometry, arcMaterial);
      arcGroup.add(arcLine);
    });

    // 6. Realistic Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8e7, 2.2);
    sunLight.position.set(150, 100, 140);
    scene.add(sunLight);

    const nightFillLight = new THREE.DirectionalLight(0x38bdf8, 0.7);
    nightFillLight.position.set(-150, -60, -100);
    scene.add(nightFillLight);

    // 7. Mouse Drag & Touch Orbit Rotation with Momentum
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0;

    // Programmatic target rotation for smooth focus transitions
    let targetRotationX: number | null = null;
    let targetRotationY: number | null = null;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      targetRotationX = null;
      targetRotationY = null;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      rotationVelocityY = deltaX * 0.005;
      rotationVelocityX = deltaY * 0.005;

      globeGroup.rotation.y += rotationVelocityY;
      globeGroup.rotation.x += rotationVelocityX;

      // Restrict vertical tilt to avoid tumbling
      globeGroup.rotation.x = THREE.MathUtils.clamp(globeGroup.rotation.x, -Math.PI / 2.3, Math.PI / 2.3);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch support (1 finger drag, 2 fingers pinch to zoom)
    let initialPinchDistance = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        targetRotationX = null;
        targetRotationY = null;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        isDragging = false;
        initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - prevMouseX;
        const deltaY = e.touches[0].clientY - prevMouseY;
        prevMouseX = e.touches[0].clientX;
        prevMouseY = e.touches[0].clientY;

        globeGroup.rotation.y += deltaX * 0.005;
        globeGroup.rotation.x += deltaY * 0.005;
        globeGroup.rotation.x = THREE.MathUtils.clamp(globeGroup.rotation.x, -Math.PI / 2.3, Math.PI / 2.3);
      } else if (e.touches.length === 2 && initialPinchDistance > 0) {
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const diff = initialPinchDistance - currentDistance;
        targetCameraDistance = THREE.MathUtils.clamp(
          targetCameraDistance + diff * 0.2,
          MIN_DISTANCE,
          MAX_DISTANCE
        );
        initialPinchDistance = currentDistance;
      }
    };

    const onTouchEnd = () => {
      isDragging = false;
      initialPinchDistance = 0;
    };

    // Wheel Zoom listener with strict limits
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      targetCameraDistance = THREE.MathUtils.clamp(
        targetCameraDistance + e.deltaY * 0.12,
        MIN_DISTANCE,
        MAX_DISTANCE
      );
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);
    container.addEventListener('wheel', onWheel, { passive: false });

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight || 620;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Focus function to rotate globe towards specific lat/lng
    const focusLocation = (lat: number, lng: number) => {
      targetRotationX = (lat * Math.PI) / 180;
      targetRotationY = -((lng + 90) * Math.PI) / 180;
      targetCameraDistance = 125; // Zoom in slightly on focus
    };

    // Initial orientation focusing on Vietnam & East Asia
    globeGroup.rotation.x = 0.25;
    globeGroup.rotation.y = -3.4;

    // Provide controls via ref to UI buttons
    zoomControlsRef.current = {
      zoomIn: () => {
        targetCameraDistance = Math.max(MIN_DISTANCE, targetCameraDistance - 25);
      },
      zoomOut: () => {
        targetCameraDistance = Math.min(MAX_DISTANCE, targetCameraDistance + 25);
      },
      resetView: () => {
        targetCameraDistance = DEFAULT_DISTANCE;
        targetRotationX = 0.25;
        targetRotationY = -3.4;
      },
      focusLocation,
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animationFrameId: number;
    const clock = new THREE.Clock();

    // 8. Render Animation Loop
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera zoom interpolation
      currentCameraDistance += (targetCameraDistance - currentCameraDistance) * 0.08;
      camera.position.z = currentCameraDistance;

      // Update HUD zoom ratio for user feedback
      const ratio = Number(((DEFAULT_DISTANCE / currentCameraDistance)).toFixed(1));
      setZoomRatio(ratio);

      // Smooth programmatic rotation interpolation when focusing
      if (targetRotationX !== null && targetRotationY !== null) {
        globeGroup.rotation.x += (targetRotationX - globeGroup.rotation.x) * 0.06;
        globeGroup.rotation.y += (targetRotationY - globeGroup.rotation.y) * 0.06;

        if (
          Math.abs(targetRotationX - globeGroup.rotation.x) < 0.005 &&
          Math.abs(targetRotationY - globeGroup.rotation.y) < 0.005
        ) {
          targetRotationX = null;
          targetRotationY = null;
        }
      } else {
        // Idle gentle planet rotation
        if (!isDragging && !prefersReducedMotion) {
          globeGroup.rotation.y += 0.0014;
        }

        // Momentum damping on drag inertia
        if (!isDragging) {
          rotationVelocityX *= 0.94;
          rotationVelocityY *= 0.94;
          globeGroup.rotation.x += rotationVelocityX;
          globeGroup.rotation.y += rotationVelocityY;
          globeGroup.rotation.x = THREE.MathUtils.clamp(globeGroup.rotation.x, -Math.PI / 2.3, Math.PI / 2.3);
        }
      }

      // Clouds rotation at subtle independent rate
      cloudsMesh.rotation.y += 0.0006;

      // Radar Wave Pulse on User Location
      const pulseProgress1 = (elapsedTime * 1.6) % 1;
      radarMesh1.scale.setScalar(1 + pulseProgress1 * 1.8);
      radarMat1.opacity = Math.max(0, 1 - pulseProgress1);

      const pulseProgress2 = ((elapsedTime * 1.6) + 0.5) % 1;
      radarMesh2.scale.setScalar(1 + pulseProgress2 * 2.2);
      radarMat2.opacity = Math.max(0, (1 - pulseProgress2) * 0.8);

      // Subtle atmospheric halo breathing
      atmosphereMesh.scale.setScalar(1.0 + Math.sin(elapsedTime * 2) * 0.006);

      renderer.render(scene, camera);
    };

    animate();

    // 9. Cleanup on Unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('wheel', onWheel);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      earthGeometry.dispose();
      earthMaterial.dispose();
      earthDayMap.dispose();
      earthCloudsMap.dispose();
      earthLightsMap.dispose();
      cloudsGeometry.dispose();
      cloudsMaterial.dispose();
      atmosphereGeometry.dispose();
      atmosphereMaterial.dispose();
      wireGeometry.dispose();
      wireMaterial.dispose();
      userPinGeo.dispose();
      userPinMat.dispose();
      radarGeo1.dispose();
      radarMat1.dispose();
      radarGeo2.dispose();
      radarMat2.dispose();
      beamGeo.dispose();
      beamMat.dispose();
      cityPinGeo.dispose();
      renderer.dispose();
    };
  }, [userLocation]);

  if (hasWebGLError) {
    return (
      <div className="relative w-full h-[540px] md:h-[640px] rounded-3xl overflow-hidden glass-panel border border-border-subtle group select-none flex flex-col justify-between p-6">
        {/* Top HUD */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/85 backdrop-blur-md border border-emerald-500/30 text-xs text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <span>Định vị: <strong className="text-white">{userLocation.label}</strong></span>
          </div>
          <div className="px-3 py-1 rounded-full bg-surface/80 border border-border-subtle text-xs text-slate-400">
            Chế độ hiển thị 2D tối ưu
          </div>
        </div>

        {/* Center Static Globe Artwork */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-full overflow-hidden border-2 border-sky-400/30 shadow-2xl shadow-sky-500/20 flex items-center justify-center my-4">
          <img
            src="/textures/earth_atmos_2048.jpg"
            alt="Bản đồ địa cầu du lịch toàn cầu"
            className="w-full h-full object-cover rounded-full filter brightness-90 contrast-110"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-sky-500/20 via-transparent to-indigo-500/30 pointer-events-none" />
          <div className="absolute inset-0 rounded-full border border-sky-400/40 pointer-events-none" />
          {/* Pulsing User Location Beacon */}
          <div className="absolute top-1/3 left-2/3 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <span className="w-4 h-4 rounded-full bg-emerald-400 animate-ping absolute" />
            <span className="w-3 h-3 rounded-full bg-emerald-400 relative border-2 border-white shadow-lg shadow-emerald-400" />
          </div>
        </div>

        {/* Bottom City Strip */}
        <div className="bg-surface/90 backdrop-blur-xl border border-border-subtle rounded-2xl p-4 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={activeCity.image}
                alt={activeCity.name}
                className="w-14 h-14 rounded-xl object-cover border border-primary/30 flex-shrink-0"
              />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{activeCity.name}</h4>
                  <span className="text-xs text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                    {activeCity.country}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{activeCity.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none no-scrollbar">
              {DESTINATIONS.slice(0, 8).map((city) => (
                <button
                  key={city.id}
                  onClick={() => {
                    setActiveCity(city);
                    if (onSelectCity) onSelectCity(city);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    activeCity.id === city.id
                      ? 'bg-primary text-slate-950 font-bold shadow-lg shadow-primary/25'
                      : 'bg-surface-light text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {city.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[540px] md:h-[640px] rounded-3xl overflow-hidden glass-panel border border-border-subtle group select-none">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[540px] md:min-h-[640px] cursor-grab active:cursor-grabbing"
        title="Kéo chuột để xoay quả cầu 3D, lăn chuột để phóng to/thu nhỏ"
      />

      {/* Top Left HUD: Status & User Geolocation Pinpoint */}
      <div className="absolute top-5 left-5 right-5 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* User Geolocation Badge */}
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface/85 backdrop-blur-md border border-emerald-500/30 text-xs text-emerald-300 pointer-events-auto shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <div className="flex items-center gap-1.5 font-medium">
              <span>Định vị:</span>
              <strong className="text-white">{userLocation.label}</strong>
              <span className="text-slate-400 text-[11px] font-mono hidden sm:inline">
                ({userLocation.lat.toFixed(2)}°N, {userLocation.lng.toFixed(2)}°E)
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/80 backdrop-blur-md border border-border-subtle text-xs text-primary pointer-events-auto">
            <Compass className="w-3.5 h-3.5" />
            <span>Trái Đất 3D Thời Gian Thực</span>
          </div>
        </div>

        {/* Top Right HUD: Zoom Controls & Re-center */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Quick Locate User Button */}
          <button
            onClick={() => {
              if (zoomControlsRef.current) {
                zoomControlsRef.current.focusLocation(userLocation.lat, userLocation.lng);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-semibold transition-all backdrop-blur-md cursor-pointer active:scale-95 shadow-lg"
            title="Xoay Trái Đất về vị trí của bạn"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Tọa độ của tôi</span>
          </button>

          {/* Zoom In Button */}
          <button
            onClick={() => zoomControlsRef.current?.zoomIn()}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-white hover:border-primary/50 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
            title="Phóng to Trái Đất (Lăn chuột lên)"
            aria-label="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out Button */}
          <button
            onClick={() => zoomControlsRef.current?.zoomOut()}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-white hover:border-primary/50 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
            title="Thu nhỏ Trái Đất (Lăn chuột xuống)"
            aria-label="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          {/* Reset View Button */}
          <button
            onClick={() => zoomControlsRef.current?.resetView()}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-white hover:border-primary/50 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
            title="Đặt lại góc nhìn Trái Đất"
            aria-label="Đặt lại góc nhìn"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Zoom Ratio Display */}
          <div className="hidden md:flex items-center px-2.5 py-1 rounded-full bg-surface/80 border border-border-subtle text-[11px] font-mono text-slate-400">
            {zoomRatio}x
          </div>
        </div>
      </div>

      {/* Floating Instruction Hint */}
      <div className="absolute top-20 right-5 hidden lg:block pointer-events-none text-right">
        <div className="text-[11px] text-slate-400 bg-surface/75 backdrop-blur-md px-3 py-1.5 rounded-full border border-border-subtle">
          Kéo để xoay • Lăn chuột để Zoom • Click điểm đến bên dưới để định vị
        </div>
      </div>

      {/* City Quick Selection Strip at Bottom */}
      <div className="absolute bottom-5 left-5 right-5 bg-surface/90 backdrop-blur-xl border border-border-subtle rounded-2xl p-4 transition-all shadow-2xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={activeCity.image}
              alt={activeCity.name}
              className="w-16 h-16 rounded-xl object-cover border border-primary/30 flex-shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-white">{activeCity.name}</h4>
                <span className="text-xs text-primary font-medium px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
                  {activeCity.country}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-md line-clamp-1">
                {activeCity.description}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1.5">
                <span>Thời điểm lý tưởng: <strong className="text-slate-200">{activeCity.bestTime}</strong></span>
                <span>•</span>
                <span>Ngân sách TB: <strong className="text-emerald-400">{activeCity.avgBudgetPerDay}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick City Pill Chips with smooth zero scrollbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-none no-scrollbar">
            {DESTINATIONS.slice(0, 8).map((city) => (
              <button
                key={city.id}
                onClick={() => {
                  setActiveCity(city);
                  if (onSelectCity) onSelectCity(city);
                  if (zoomControlsRef.current) {
                    zoomControlsRef.current.focusLocation(city.lat, city.lng);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeCity.id === city.id
                    ? 'bg-primary text-slate-950 font-bold shadow-lg shadow-primary/25'
                    : 'bg-surface-light text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                {city.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
