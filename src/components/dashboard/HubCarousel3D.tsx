import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import MarketingHubMockup from "@/components/hub-mockups/MarketingHubMockup";
import FinanceHubMockup from "@/components/hub-mockups/FinanceHubMockup";
import OpsHubMockup from "@/components/hub-mockups/OpsHubMockup";
import LegalHubMockup from "@/components/hub-mockups/LegalHubMockup";
import HRHubMockup from "@/components/hub-mockups/HRHubMockup";

const hubs = [
  {
    id: "marketing",
    name: "Marketing Hub",
    color: "accent",
    component: MarketingHubMockup,
    route: "/marketing"
  },
  {
    id: "finance",
    name: "Finance Hub",
    color: "green-500",
    component: FinanceHubMockup,
    route: "/finance"
  },
  {
    id: "ops",
    name: "Operations Hub",
    color: "blue-500",
    component: OpsHubMockup,
    route: "/operations"
  },
  {
    id: "legal",
    name: "Legal Hub",
    color: "amber-500",
    component: LegalHubMockup,
    route: "/legal"
  },
  {
    id: "hr",
    name: "HR Hub",
    color: "pink-500",
    component: HRHubMockup,
    route: "/hr"
  }
];

interface CylinderItemProps {
  position: [number, number, number];
  rotation: number;
  hub: typeof hubs[0];
  onClick: () => void;
  isActive: boolean;
}

function CylinderItem({ position, rotation, hub, onClick, isActive }: CylinderItemProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const HubComponent = hub.component;

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <Html
        transform
        distanceFactor={8}
        position={[0, 0, 0]}
        style={{
          width: "400px",
          transition: "all 0.3s ease",
          transform: isActive ? "scale(1.1)" : "scale(0.9)",
          opacity: isActive ? 1 : 0.6,
          pointerEvents: "auto",
        }}
      >
        <div
          onClick={onClick}
          className="cursor-pointer bg-background/95 backdrop-blur rounded-xl border border-border overflow-hidden shadow-2xl hover:shadow-primary/20 transition-all duration-300"
          style={{
            boxShadow: isActive ? `0 0 30px rgba(147, 51, 234, 0.3)` : "none"
          }}
        >
          <div className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full bg-${hub.color}`} />
              <h3 className="font-semibold text-sm">{hub.name}</h3>
            </div>
            <div className="scale-[0.65] origin-top-left pointer-events-none">
              <HubComponent />
            </div>
          </div>
        </div>
      </Html>
    </group>
  );
}

interface CarouselSceneProps {
  activeIndex: number;
  onRotate: (direction: number) => void;
  onHubClick: (index: number) => void;
}

function CarouselScene({ activeIndex, onRotate, onHubClick }: CarouselSceneProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [targetRotation, setTargetRotation] = useState(0);

  useEffect(() => {
    const anglePerItem = (Math.PI * 2) / hubs.length;
    setTargetRotation(-activeIndex * anglePerItem);
  }, [activeIndex]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        targetRotation,
        0.1
      );
    }
  });

  const radius = 6;
  const anglePerItem = (Math.PI * 2) / hubs.length;

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />
      
      <group ref={groupRef}>
        {hubs.map((hub, index) => {
          const angle = index * anglePerItem;
          const x = Math.sin(angle) * radius;
          const z = Math.cos(angle) * radius;
          
          return (
            <CylinderItem
              key={hub.id}
              position={[x, 0, z]}
              rotation={angle}
              hub={hub}
              onClick={() => onHubClick(index)}
              isActive={index === activeIndex}
            />
          );
        })}
      </group>

      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableRotate={false}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 2}
      />
    </>
  );
}

const HubCarousel3D = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);

  const rotateCarousel = (direction: number) => {
    setActiveIndex((prev) => {
      let newIndex = prev + direction;
      if (newIndex < 0) newIndex = hubs.length - 1;
      if (newIndex >= hubs.length) newIndex = 0;
      return newIndex;
    });
  };

  const handleHubClick = (index: number) => {
    setActiveIndex(index);
    // Navigate after a short delay to show the selection
    setTimeout(() => {
      navigate(hubs[index].route);
    }, 300);
  };

  const handleBadgeClick = (index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="container mx-auto px-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Your Hubs</h2>
        <p className="text-muted-foreground">
          Rotate through your hubs or click to dive in
        </p>
      </div>

      {/* Hub Selector Badges */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {hubs.map((hub, index) => (
          <Badge
            key={hub.id}
            variant={index === activeIndex ? "default" : "outline"}
            className="cursor-pointer px-4 py-2 text-sm transition-all"
            onClick={() => handleBadgeClick(index)}
          >
            {hub.name}
          </Badge>
        ))}
      </div>

      {/* 3D Carousel */}
      <div className="relative w-full h-[600px] bg-gradient-to-b from-background to-secondary/20 rounded-2xl overflow-hidden border border-border">
        <Canvas
          camera={{ position: [0, 0, 12], fov: 50 }}
          style={{ background: "transparent" }}
        >
          <CarouselScene
            activeIndex={activeIndex}
            onRotate={rotateCarousel}
            onHubClick={handleHubClick}
          />
        </Canvas>

        {/* Navigation Arrows */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-background/80 backdrop-blur"
            onClick={() => rotateCarousel(-1)}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="w-12 h-12 rounded-full bg-background/80 backdrop-blur"
            onClick={() => rotateCarousel(1)}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>

        {/* Active Hub Indicator */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
          <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full bg-background/80 backdrop-blur border border-accent/50`}>
            <div className={`w-2 h-2 rounded-full bg-accent animate-pulse`} />
            <span className="font-semibold">{hubs[activeIndex].name}</span>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-muted-foreground">
        Use arrow buttons or click badges to navigate • Click on a hub to open it
      </div>
    </div>
  );
};

export default HubCarousel3D;
