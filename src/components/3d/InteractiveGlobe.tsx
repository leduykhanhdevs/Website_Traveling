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
  const [hoveredCity, setHoveredCity] = useState<Destination | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const activeCityIdRef = useRef<string>(DESTINATIONS[0].id);
  const updatePinHighlightsRef = useRef<((id: string) => void) | null>(null);

  const [userLocation, setUserLocation] = useState<UserLocation>({
    lat: 21.0285,
    lng: 105.8542,
    label: 'Hà Nội, Việt Nam',
    isExact: false,
  });
  const [isLocating, setIsLocating] = useState<boolean>(true);
  const [zoomRatio, setZoomRatio] = useState<number>(1);
  const [hasWebGLError, setHasWebGLError] = useState<boolean>(false);
  const [isLoadingTextures, setIsLoadingTextures] = useState<boolean>(true);
  const [textureProgress, setTextureProgress] = useState<number>(0);
  const [showScrollHint, setShowScrollHint] = useState<boolean>(false);
  const scrollHintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/i.test(navigator.platform || '');

  const triggerScrollHint = useCallback(() => {
    setShowScrollHint(true);
    if (scrollHintTimeoutRef.current) {
      clearTimeout(scrollHintTimeoutRef.current);
    }
    scrollHintTimeoutRef.current = setTimeout(() => {
      setShowScrollHint(false);
    }, 1800);
  }, []);

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
        activeCityIdRef.current = found.id;
        updatePinHighlightsRef.current?.(found.id);
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
    // Initialize orientation to focus directly on Vietnam & East Asia (Hà Nội)
    const initialPhi = (activeCity.lat * Math.PI) / 180;
    const initialTheta = ((activeCity.lng + 180) * Math.PI) / 180;
    globeGroup.rotation.x = initialPhi;
    globeGroup.rotation.y = -initialTheta + Math.PI / 2;
    scene.add(globeGroup);

    // 2. Texture Loader with LoadingManager for tracking progress & safe fallback
    const loadingManager = new THREE.LoadingManager();
    loadingManager.onProgress = (_url, itemsLoaded, itemsTotal) => {
      const percent = Math.round((itemsLoaded / itemsTotal) * 100);
      setTextureProgress(percent);
    };
    loadingManager.onLoad = () => {
      setIsLoadingTextures(false);
    };
    loadingManager.onError = (url) => {
      console.warn('Three.js texture load issue for:', url);
      // Ensure loader closes so user can still see fallback sphere
      setIsLoadingTextures(false);
    };

    // Safety timeout in case texture events hang
    const safetyTimeout = setTimeout(() => {
      setIsLoadingTextures(false);
    }, 6000);

    const textureLoader = new THREE.TextureLoader(loadingManager);
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

    // 3. User Geolocation Pinpoint & High-Precision GPS Radar Beacon
    const userBeaconGroup = new THREE.Group();
    globeGroup.add(userBeaconGroup);

    const userPos = latLngToVector3(userLocation.lat, userLocation.lng, GLOBE_RADIUS);
    const userNormal = userPos.clone().normalize();
    userBeaconGroup.position.copy(userPos);
    userBeaconGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), userNormal);

    // Emerald Center Pin
    const userPinGeo = new THREE.SphereGeometry(1.0, 20, 20);
    const userPinMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const userPinMesh = new THREE.Mesh(userPinGeo, userPinMat);
    userPinMesh.position.set(0, 0.6, 0);
    userBeaconGroup.add(userPinMesh);

    // Refined Pulsing Radar Rings
    const radarGeo1 = new THREE.RingGeometry(1.0, 1.6, 32);
    radarGeo1.rotateX(-Math.PI / 2);
    const radarMat1 = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const radarMesh1 = new THREE.Mesh(radarGeo1, radarMat1);
    radarMesh1.position.set(0, 0.05, 0);
    userBeaconGroup.add(radarMesh1);

    const radarGeo2 = new THREE.RingGeometry(1.4, 2.0, 32);
    radarGeo2.rotateX(-Math.PI / 2);
    const radarMat2 = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const radarMesh2 = new THREE.Mesh(radarGeo2, radarMat2);
    radarMesh2.position.set(0, 0.06, 0);
    userBeaconGroup.add(radarMesh2);

    // Luminous Altitude Laser Beam pointing outward
    const beamGeo = new THREE.CylinderGeometry(0.12, 0.18, 6.0, 12);
    beamGeo.translate(0, 3.0, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.7,
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    userBeaconGroup.add(beamMesh);

    // 4. World City Marker Pins (Luxury 3D Beacons with Reactive Color Switching)
    interface CityPinItem {
      dest: Destination;
      rootGroup: THREE.Group;
      pillarMesh: THREE.Mesh;
      headMesh: THREE.Mesh;
      baseRingMesh: THREE.Mesh;
      pulseRingMesh: THREE.Mesh;
      gyroMesh: THREE.Mesh;
      pillarMat: THREE.MeshBasicMaterial;
      headMat: THREE.MeshBasicMaterial;
      baseRingMat: THREE.MeshBasicMaterial;
      pulseRingMat: THREE.MeshBasicMaterial;
      gyroMat: THREE.MeshBasicMaterial;
      hitMesh: THREE.Mesh;
    }

    const pinGroup = new THREE.Group();
    globeGroup.add(pinGroup);

    const cityPinsList: CityPinItem[] = [];
    const clickTargets: THREE.Object3D[] = [];

    // Shared geometries for optimal memory
    const baseRingGeo = new THREE.RingGeometry(0.8, 1.4, 32);
    baseRingGeo.rotateX(-Math.PI / 2);

    const pulseRingGeo = new THREE.RingGeometry(1.0, 1.9, 32);
    pulseRingGeo.rotateX(-Math.PI / 2);

    const pillarGeo = new THREE.CylinderGeometry(0.12, 0.22, 3.2, 16);
    pillarGeo.translate(0, 1.6, 0);

    const headGeo = new THREE.SphereGeometry(0.75, 18, 18);

    const gyroGeo = new THREE.TorusGeometry(1.25, 0.08, 10, 28);

    const centerDotGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const centerDotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    const hitGeo = new THREE.SphereGeometry(3.8, 8, 8);
    const hitMat = new THREE.MeshBasicMaterial({ visible: false });

    DESTINATIONS.forEach((dest) => {
      const pos = latLngToVector3(dest.lat, dest.lng, GLOBE_RADIUS);
      const normal = pos.clone().normalize();

      const rootGroup = new THREE.Group();
      rootGroup.position.copy(pos);
      rootGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal);
      pinGroup.add(rootGroup);

      const isSelected = dest.id === activeCityIdRef.current;

      // Base ground ring
      const baseRingMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xfbbf24 : 0x38bdf8,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.6,
      });
      const baseRingMesh = new THREE.Mesh(baseRingGeo, baseRingMat);
      baseRingMesh.position.set(0, 0.04, 0);
      rootGroup.add(baseRingMesh);

      // Radar pulse ring (active on selected city)
      const pulseRingMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
      });
      const pulseRingMesh = new THREE.Mesh(pulseRingGeo, pulseRingMat);
      pulseRingMesh.position.set(0, 0.06, 0);
      pulseRingMesh.visible = isSelected;
      rootGroup.add(pulseRingMesh);

      // Vertical 3D Light Pillar
      const pillarMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xfbbf24 : 0x38bdf8,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.7,
      });
      const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
      if (isSelected) {
        pillarMesh.scale.set(1.4, 1.65, 1.4);
      }
      rootGroup.add(pillarMesh);

      // Floating Gem Star at tip of pillar
      const headMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xfffbeb : 0x38bdf8,
      });
      const headMesh = new THREE.Mesh(headGeo, headMat);
      headMesh.position.set(0, isSelected ? 3.2 * 1.65 : 3.2, 0);
      if (isSelected) {
        headMesh.scale.set(1.4, 1.4, 1.4);
      }
      rootGroup.add(headMesh);

      // Orbital Gyro Ring around the gem
      const gyroMat = new THREE.MeshBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.85,
      });
      const gyroMesh = new THREE.Mesh(gyroGeo, gyroMat);
      gyroMesh.position.set(0, isSelected ? 3.2 * 1.65 : 3.2, 0);
      gyroMesh.rotation.x = 0.45;
      gyroMesh.visible = isSelected;
      rootGroup.add(gyroMesh);

      // Center Ground Dot
      const centerDot = new THREE.Mesh(centerDotGeo, centerDotMat);
      centerDot.position.set(0, 0.15, 0);
      rootGroup.add(centerDot);

      // Raycaster hit target for clicking
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.position.set(0, 2.0, 0);
      hitMesh.userData = { destId: dest.id, dest };
      rootGroup.add(hitMesh);
      clickTargets.push(hitMesh);

      cityPinsList.push({
        dest,
        rootGroup,
        pillarMesh,
        headMesh,
        baseRingMesh,
        pulseRingMesh,
        gyroMesh,
        pillarMat,
        headMat,
        baseRingMat,
        pulseRingMat,
        gyroMat,
        hitMesh,
      });
    });

    // Reactive Pin Highlighting: When city changes, instantly change colors and beacon scale
    const updatePinHighlights = (activeId: string) => {
      activeCityIdRef.current = activeId;
      cityPinsList.forEach((item) => {
        const isSelected = item.dest.id === activeId;
        if (isSelected) {
          // Radiant Golden Amber
          item.headMat.color.setHex(0xfffbeb);
          item.pillarMat.color.setHex(0xfbbf24);
          item.baseRingMat.color.setHex(0xfbbf24);
          item.pulseRingMat.color.setHex(0xfbbf24);
          item.pillarMat.opacity = 0.95;
          item.baseRingMat.opacity = 0.95;
          item.pillarMesh.scale.set(1.4, 1.65, 1.4);
          item.headMesh.position.y = 3.2 * 1.65;
          item.headMesh.scale.set(1.4, 1.4, 1.4);
          item.gyroMesh.position.y = 3.2 * 1.65;
          item.pulseRingMesh.visible = true;
          item.gyroMesh.visible = true;
        } else {
          // Sleek Electric Cyan
          item.headMat.color.setHex(0x38bdf8);
          item.pillarMat.color.setHex(0x38bdf8);
          item.baseRingMat.color.setHex(0x38bdf8);
          item.pillarMat.opacity = 0.7;
          item.baseRingMat.opacity = 0.6;
          item.pillarMesh.scale.set(1.0, 1.0, 1.0);
          item.headMesh.position.y = 3.2;
          item.headMesh.scale.set(1.0, 1.0, 1.0);
          item.pulseRingMesh.visible = false;
          item.gyroMesh.visible = false;
        }
      });
    };
    updatePinHighlightsRef.current = updatePinHighlights;
    updatePinHighlights(activeCityIdRef.current);

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

    // 7. Mouse Drag, Touch Orbit Rotation & 3D Pin Interaction (Raycasting)
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let clickStartX = 0;
    let clickStartY = 0;
    let rotationVelocityX = 0;
    let rotationVelocityY = 0;

    // Raycaster for hovering and clicking 3D pins directly on the globe
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Programmatic target rotation for smooth focus transitions
    let targetRotationX: number | null = null;
    let targetRotationY: number | null = null;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      targetRotationX = null;
      targetRotationY = null;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
      clickStartX = e.clientX;
      clickStartY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        // Raycast hover check over 3D city pins
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickTargets, false);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const dest = hit.userData.dest as Destination;
          renderer.domElement.style.cursor = 'pointer';
          setHoveredCity(dest);
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        } else {
          renderer.domElement.style.cursor = 'grab';
          setHoveredCity(null);
        }
        return;
      }

      setHoveredCity(null);
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

    const onMouseUp = (e: MouseEvent) => {
      isDragging = false;
      const dist = Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY);
      if (dist < 6) {
        // Direct click on canvas - check raycast for city pin
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickTargets, false);
        if (intersects.length > 0) {
          const hit = intersects[0].object;
          const dest = hit.userData.dest as Destination;
          if (dest) {
            setActiveCity(dest);
            activeCityIdRef.current = dest.id;
            updatePinHighlights(dest.id);
            if (onSelectCity) onSelectCity(dest);
            focusLocation(dest.lat, dest.lng);
          }
        }
      }
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
        clickStartX = e.touches[0].clientX;
        clickStartY = e.touches[0].clientY;
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
          targetCameraDistance + diff * 0.15,
          MIN_DISTANCE,
          MAX_DISTANCE
        );
        initialPinchDistance = currentDistance;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isDragging && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const dist = Math.hypot(touch.clientX - clickStartX, touch.clientY - clickStartY);
        if (dist < 8) {
          const rect = renderer.domElement.getBoundingClientRect();
          mouse.x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
          mouse.y = -((touch.clientY - rect.top) / rect.height) * 2 + 1;
          raycaster.setFromCamera(mouse, camera);
          const intersects = raycaster.intersectObjects(clickTargets, false);
          if (intersects.length > 0) {
            const hit = intersects[0].object;
            const dest = hit.userData.dest as Destination;
            if (dest) {
              setActiveCity(dest);
              activeCityIdRef.current = dest.id;
              updatePinHighlights(dest.id);
              if (onSelectCity) onSelectCity(dest);
              focusLocation(dest.lat, dest.lng);
            }
          }
        }
      }
      isDragging = false;
      initialPinchDistance = 0;
    };

    // Wheel zoom with Ctrl/Meta key modifier
    const onWheel = (e: WheelEvent) => {
      const hasModifier = e.ctrlKey || e.metaKey;
      if (!hasModifier) {
        triggerScrollHint();
        return;
      }

      e.preventDefault();
      const zoomStep = e.deltaY * 0.08;
      targetCameraDistance = THREE.MathUtils.clamp(
        targetCameraDistance + zoomStep,
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

    // Window Resize Responsive Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Focus Location Helper (Smooth camera angle to center on city lat/lng)
    const focusLocation = (lat: number, lng: number) => {
      const phi = lat * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);

      targetRotationX = phi;
      targetRotationY = -theta + Math.PI / 2;
      targetCameraDistance = Math.min(targetCameraDistance, 140);
    };

    zoomControlsRef.current = {
      zoomIn: () => {
        targetCameraDistance = Math.max(MIN_DISTANCE, targetCameraDistance - 25);
      },
      zoomOut: () => {
        targetCameraDistance = Math.min(MAX_DISTANCE, targetCameraDistance + 25);
      },
      resetView: () => {
        targetCameraDistance = DEFAULT_DISTANCE;
        focusLocation(activeCity.lat, activeCity.lng);
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

      // Active City Pin Radar Wave & Gyro Animation
      const activePin = cityPinsList.find((p) => p.dest.id === activeCityIdRef.current);
      if (activePin) {
        const pulseLoop = (elapsedTime * 1.8) % 1;
        const pulseScale = 1.0 + pulseLoop * 2.2;
        activePin.pulseRingMesh.scale.set(pulseScale, pulseScale, 1);
        activePin.pulseRingMat.opacity = Math.max(0, 0.9 * (1 - pulseLoop));

        // Rotate the orbital gyro ring around the pin
        activePin.gyroMesh.rotation.z += 0.035;
        activePin.gyroMesh.rotation.y += 0.02;

        // Gentle breathing on the golden head
        const breath = 1.35 + Math.sin(elapsedTime * 4.5) * 0.12;
        activePin.headMesh.scale.set(breath, breath, breath);
      }

      // Radar Wave Pulse on User Location (Refined GPS)
      const pulseProgress1 = (elapsedTime * 1.6) % 1;
      radarMesh1.scale.setScalar(1 + pulseProgress1 * 1.5);
      radarMat1.opacity = Math.max(0, 0.8 * (1 - pulseProgress1));

      const pulseProgress2 = ((elapsedTime * 1.6) + 0.5) % 1;
      radarMesh2.scale.setScalar(1 + pulseProgress2 * 1.8);
      radarMat2.opacity = Math.max(0, 0.6 * (1 - pulseProgress2));

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
      clearTimeout(safetyTimeout);

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

      baseRingGeo.dispose();
      pulseRingGeo.dispose();
      pillarGeo.dispose();
      headGeo.dispose();
      gyroGeo.dispose();
      centerDotGeo.dispose();
      centerDotMat.dispose();
      hitGeo.dispose();
      hitMat.dispose();
      cityPinsList.forEach((item) => {
        item.pillarMat.dispose();
        item.headMat.dispose();
        item.baseRingMat.dispose();
        item.pulseRingMat.dispose();
        item.gyroMat.dispose();
      });

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
      {/* Texture Loading Overlay */}
      {isLoadingTextures && (
        <div
          aria-live="polite"
          aria-busy="true"
          className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-surface/90 backdrop-blur-md rounded-3xl transition-opacity duration-500"
        >
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary motion-safe:animate-spin" />
            <Compass className="w-7 h-7 text-primary" aria-hidden="true" />
          </div>
          <div className="text-sm font-bold text-white mb-2">Đang Khởi Tạo Trái Đất 3D</div>
          <div className="w-48 h-1.5 rounded-full bg-slate-800 overflow-hidden mb-2">
            <div
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
              style={{ width: `${Math.max(textureProgress, 15)}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {textureProgress > 0 ? `${textureProgress}%` : 'Đang nạp'} • Bản đồ địa hình & khí quyển
          </div>
        </div>
      )}

      {/* Modifier Scroll Zoom Toast Notice */}
      {showScrollHint && (
        <div
          role="status"
          aria-live="polite"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none px-4 py-2.5 rounded-2xl bg-black/85 backdrop-blur-md border border-primary/40 text-xs text-white shadow-2xl flex items-center gap-2 animate-fade-in"
        >
          <Compass className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
          <span>Giữ <strong>{isMac ? '⌘' : 'Ctrl'}</strong> và cuộn chuột để thu phóng địa cầu</span>
        </div>
      )}

      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        className="w-full h-full min-h-[540px] md:min-h-[640px] cursor-grab active:cursor-grabbing"
        title={`Kéo chuột để xoay quả cầu 3D, giữ ${isMac ? '⌘' : 'Ctrl'} + cuộn chuột để phóng to/thu nhỏ`}
      />

      {/* 3D Pin Hover Tooltip Badge */}
      {hoveredCity && (
        <div
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y - 42}px` }}
          className="absolute z-30 pointer-events-none -translate-x-1/2 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-primary/50 text-xs font-semibold text-white shadow-xl flex items-center gap-1.5 animate-fade-in"
        >
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <span>{hoveredCity.name}, {hoveredCity.country}</span>
        </div>
      )}

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
            title={`Phóng to Trái Đất (${isMac ? '⌘' : 'Ctrl'} + Lăn chuột lên)`}
            aria-label="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          {/* Zoom Out Button */}
          <button
            onClick={() => zoomControlsRef.current?.zoomOut()}
            className="w-8 h-8 rounded-full glass-panel flex items-center justify-center text-slate-300 hover:text-white hover:border-primary/50 hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
            title={`Thu nhỏ Trái Đất (${isMac ? '⌘' : 'Ctrl'} + Lăn chuột xuống)`}
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
          Kéo để xoay • {isMac ? '⌘' : 'Ctrl'} + Cuộn để Zoom • Click điểm đến bên dưới để định vị
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
            {DESTINATIONS.map((city) => (
              <button
                key={city.id}
                onClick={() => {
                  setActiveCity(city);
                  activeCityIdRef.current = city.id;
                  updatePinHighlightsRef.current?.(city.id);
                  if (onSelectCity) onSelectCity(city);
                  if (zoomControlsRef.current) {
                    zoomControlsRef.current.focusLocation(city.lat, city.lng);
                  }
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  activeCity.id === city.id
                    ? 'bg-primary text-slate-950 font-bold shadow-lg shadow-primary/25 ring-2 ring-primary/40'
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
