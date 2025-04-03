import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { useRef, useEffect, useState } from "react";
import * as THREE from "three";


// 🎮 PlayerControls Component
function PlayerControls({ speed = 0.02, minHeight = 1 }) {
    const move = useRef({ forward: 0, right: 0 });
    const [yaw, setYaw] = useState(0);
    const [pitch, setPitch] = useState(0);
    const lastMousePos = useRef({ x: 0, y: 0 });
    const isPointerLocked = useRef(false);


    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === "ArrowUp" || e.code === "KeyW") move.current.forward = 1;
            if (e.code === "ArrowDown" || e.code === "KeyS") move.current.forward = -1;
            if (e.code === "ArrowRight" || e.code === "KeyD") move.current.right = -1;
            if (e.code === "ArrowLeft" || e.code === "KeyA") move.current.right = 1;
        };
        const handleKeyUp = (e) => {
            if (["ArrowUp", "KeyW", "ArrowDown", "KeyS"].includes(e.code)) move.current.forward = 0;
            if (["ArrowRight", "KeyD", "ArrowLeft", "KeyA"].includes(e.code)) move.current.right = 0;
        };


        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);


        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, []);


    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isPointerLocked.current) return;
           
            // Calculate movement based on mouse position change
            const movementX = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
            const movementY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
           
            setYaw(prev => prev - movementX * 0.002);
            setPitch(prev => Math.max(-Math.PI / 2, Math.min(Math.PI / 2, prev - movementY * 0.002)));
        };


        const handlePointerLockChange = () => {
            isPointerLocked.current = document.pointerLockElement === document.body;
        };


        document.addEventListener('mousemove', handleMouseMove, false);
        document.addEventListener('pointerlockchange', handlePointerLockChange, false);
        document.addEventListener('mozpointerlockchange', handlePointerLockChange, false);
        document.addEventListener('webkitpointerlockchange', handlePointerLockChange, false);


        return () => {
            document.removeEventListener('mousemove', handleMouseMove, false);
            document.removeEventListener('pointerlockchange', handlePointerLockChange, false);
            document.removeEventListener('mozpointerlockchange', handlePointerLockChange, false);
            document.removeEventListener('webkitpointerlockchange', handlePointerLockChange, false);
        };
    }, []);


    // Enable Pointer Lock on click
    useEffect(() => {
        const handleClick = () => {
            if (!isPointerLocked.current) {
                document.body.requestPointerLock = document.body.requestPointerLock ||
                                                document.body.mozRequestPointerLock ||
                                                document.body.webkitRequestPointerLock;
                document.body.requestPointerLock();
            }
        };


        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);


    useFrame(({ camera }) => {
        // Update camera rotation
        camera.rotation.set(pitch, yaw, 0, 'YXZ');


        // Get movement vectors based on current orientation
        const forward = new THREE.Vector3();
        camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();


        const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();


        // Move camera
        camera.position.addScaledVector(forward, move.current.forward * speed);
        camera.position.addScaledVector(right, move.current.right * speed);


        // Prevent falling below minimum height
        if (camera.position.y < minHeight) {
            camera.position.y = minHeight;
        }
    });


    return null;
}


// 🌍 Load GLB Model
function Model() {
    const { scene } = useGLTF("models/the_most_longest_house_in_moscow_extended.glb");


    scene.position.set(0, 0, 0);  
    scene.scale.set(100, 100, 100);


    return <primitive object={scene} />;
}


// 🎮 Game Component
export default function Game() {
    return (
        <Canvas style={{ width: "100vw", height: "100vh" }} camera={{ position: [0, -10, 10], fov: 75 }}>
            <ambientLight intensity={1} />
            <directionalLight position={[10, 20, 10]} intensity={2} />
            <PlayerControls minHeight={1.5} />
            <Model />
        </Canvas>
    );
}
