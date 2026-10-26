import React from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Sky } from "@react-three/drei";

function Avatar({ x, z, avatar = {} }) {
  return <group position={[x, 0, z]}>
    <mesh position={[0,1.1,0]} castShadow><capsuleGeometry args={[0.28,0.55,5,12]}/><meshStandardMaterial color={avatar.outfit || "#7256d8"}/></mesh>
    <mesh position={[0,1.85,0]} castShadow><sphereGeometry args={[0.3,24,20]}/><meshStandardMaterial color={avatar.skin || "#d99a72"}/></mesh>
    <mesh position={[0,2.02,-0.035]} castShadow><sphereGeometry args={[0.305,20,12,0,Math.PI*2,0,Math.PI*0.45]}/><meshStandardMaterial color={avatar.hair || "#392a2b"}/></mesh>
    <mesh position={[-0.13,1.88,0.265]}><sphereGeometry args={[0.028,10,10]}/><meshBasicMaterial color="#202531"/></mesh>
    <mesh position={[0.13,1.88,0.265]}><sphereGeometry args={[0.028,10,10]}/><meshBasicMaterial color="#202531"/></mesh>
    <mesh position={[-0.13,0.35,0]} castShadow><capsuleGeometry args={[0.1,0.34,4,8]}/><meshStandardMaterial color="#263343"/></mesh>
    <mesh position={[0.13,0.35,0]} castShadow><capsuleGeometry args={[0.1,0.34,4,8]}/><meshStandardMaterial color="#263343"/></mesh>
  </group>;
}
function Tree({ position }) { return <group position={position}><mesh position={[0,.55,0]} castShadow><cylinderGeometry args={[.12,.16,1.1,8]}/><meshStandardMaterial color="#79513b"/></mesh><mesh position={[0,1.4,0]} castShadow><coneGeometry args={[.7,1.4,8]}/><meshStandardMaterial color="#3b9b72"/></mesh></group>; }
function Building({ position, color }) { return <group position={position}><mesh position={[0,1.4,0]} castShadow><boxGeometry args={[1.8,2.8,1.5]}/><meshStandardMaterial color={color}/></mesh><mesh position={[0,2.95,0]}><coneGeometry args={[1.3,.45,4]}/><meshStandardMaterial color="#d99c64"/></mesh><mesh position={[0,.85,.77]}><planeGeometry args={[.42,.5]}/><meshStandardMaterial color="#bde9ed" emissive="#4e8b9a" emissiveIntensity={.2}/></mesh></group>; }
function Furniture({ item, index }) {
  const slots = [[-1.5,0,-1.15],[1.45,0,-1.2],[-1.4,0,1.05],[1.4,0,1.1],[0,0,-1.5],[0,0,1.35]];
  const p = slots[index % slots.length];
  if (item.id === "plant") return <group position={p}><mesh position={[0,.18,0]}><cylinderGeometry args={[.22,.17,.35,12]}/><meshStandardMaterial color="#b77d5a"/></mesh><mesh position={[0,.65,0]}><sphereGeometry args={[.4,12,10]}/><meshStandardMaterial color="#3b9b72"/></mesh></group>;
  if (item.id === "lamp") return <group position={p}><mesh position={[0,.35,0]}><cylinderGeometry args={[.06,.08,.7,8]}/><meshStandardMaterial color="#e2c47d"/></mesh><mesh position={[0,.78,0]}><coneGeometry args={[.28,.35,12]}/><meshStandardMaterial color="#f6e4aa" emissive="#f0c76b" emissiveIntensity={.35}/></mesh></group>;
  return <group position={p}><mesh position={[0,.22,0]} rotation={[0,.3,0]}><boxGeometry args={[.85,.35,.65]}/><meshStandardMaterial color="#9a82d5" roughness={.95}/></mesh></group>;
}
function Scene({ room, x, z, avatar, furniture, remotePositions = {} }) {
  const home = room === "home";
  return <>
    <color attach="background" args={[home ? "#e7d9c7" : "#b7dce8"]}/>
    {!home && <Sky distance={450000} sunPosition={[4,8,3]}/>}
    <ambientLight intensity={1.2}/>
    <directionalLight position={[5,9,5]} intensity={2} castShadow/>
    <fog attach="fog" args={[home ? "#e7d9c7" : "#b7dce8",15,32]}/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.05,0]} receiveShadow><planeGeometry args={[home ? 9 : 40,home ? 9 : 40]}/><meshStandardMaterial color={home ? "#caa98a" : "#8fc5a0"}/></mesh>
    {home ? <>
      <mesh position={[0,2.1,-4.35]}><boxGeometry args={[9,4.3,.2]}/><meshStandardMaterial color="#f0dfc9"/></mesh>
      <mesh position={[-4.35,2.1,0]}><boxGeometry args={[.2,4.3,9]}/><meshStandardMaterial color="#e9d3bb"/></mesh>
      <mesh position={[4.35,2.1,0]}><boxGeometry args={[.2,4.3,9]}/><meshStandardMaterial color="#e9d3bb"/></mesh>
      <mesh position={[0,4.25,0]}><boxGeometry args={[9,.2,9]}/><meshStandardMaterial color="#8b766b"/></mesh>
      <mesh position={[0,.18,-3.9]}><boxGeometry args={[2.2,.36,.25]}/><meshStandardMaterial color="#8a593f"/></mesh>
      <mesh position={[0,.38,-3.9]}><boxGeometry args={[1.1,.06,.08]}/><meshStandardMaterial color="#e8b987"/></mesh>
      {furniture.map((item,i)=><Furniture key={item.id+"-"+i} item={item} index={i}/>)}
    </> : <>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,.005,0]}><planeGeometry args={[5.4,25]}/><meshStandardMaterial color="#e9dfc9"/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,.012,0]}><planeGeometry args={[25,4.2]}/><meshStandardMaterial color="#e9dfc9"/></mesh>
      <Building position={[-4.2,0,-3.5]} color="#f1c28b"/><Building position={[-1.8,0,-5.2]} color="#e7a6a1"/><Building position={[3.8,0,-3.7]} color="#f1d99c"/><Building position={[5.6,0,-1.8]} color="#a9c8d9"/>
      <Tree position={[-5.2,0,1.1]}/><Tree position={[-4.6,0,4]}/><Tree position={[4.7,0,3.5]}/><Tree position={[6,0,1]}/>
      <mesh position={[0,.18,-1.6]} castShadow><cylinderGeometry args={[1.25,1.4,.36,32]}/><meshStandardMaterial color="#d8b18b"/></mesh>
      <mesh position={[0,.38,-1.6]}><cylinderGeometry args={[.95,.95,.08,32]}/><meshStandardMaterial color="#77b8a3"/></mesh>
    </>}
    <Avatar x={x} z={z} avatar={avatar}/>
    {Object.entries(remotePositions).map(([id,p])=><Avatar key={id} x={p.x} z={p.z} avatar={{outfit:"#42bba5",skin:"#d99a72",hair:"#392a2b"}}/>)}
    <ContactShadows position={[0,-.025,0]} opacity={.25} scale={18} blur={2.5} far={7}/>
    <OrbitControls makeDefault target={[0,1,0]} minDistance={home ? 7 : 7} maxDistance={home ? 15 : 17} maxPolarAngle={Math.PI/2.05} minPolarAngle={.38} enablePan={false}/>
  </>;
}
export default function V2World(props) {
  return <Canvas shadows camera={{position: props.room === "home" ? [7,6,8] : [8,7.5,10],fov:42}} dpr={[1,1.5]}><Scene {...props}/></Canvas>;
}