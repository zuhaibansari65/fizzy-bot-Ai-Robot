import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, Html, Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Bot, ChevronDown, ChevronUp, CircleHelp,
  Expand, Gauge, MessageCircle, MoveUpRight, Play, RotateCcw, Send, Sparkles as SparkleIcon,
  WandSparkles, X, Zap,
} from 'lucide-react'

type Direction = { x: number; z: number }
type ChatMessage = { role: 'bot' | 'user'; text: string }

const initialGreeting = 'Hi there! I’m Fizzy. Ask me anything about AI, robotics, science or the future of technology.'

function useMovementKeys(setDirection: (value: Direction) => void, setRunning: (value: boolean) => void) {
  const pressed = useRef(new Set<string>())
  useEffect(() => {
    const isTyping = (target: EventTarget | null) => target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
    const update = () => {
      const keys = pressed.current
      const x = Number(keys.has('d') || keys.has('arrowright')) - Number(keys.has('a') || keys.has('arrowleft'))
      const z = Number(keys.has('w') || keys.has('arrowup')) - Number(keys.has('s') || keys.has('arrowdown'))
      const magnitude = Math.hypot(x, z) || 1
      setDirection({ x: x / magnitude, z: z / magnitude })
      setRunning(x !== 0 || z !== 0)
    }
    const down = (event: KeyboardEvent) => {
      if (isTyping(event.target)) return
      const key = event.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key)) event.preventDefault()
      if (key === ' ') { pressed.current.clear(); setDirection({ x: 0, z: 0 }); setRunning(false); return }
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
        pressed.current.add(key); update()
      }
    }
    const up = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()
      pressed.current.delete(key)
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) update()
    }
    const clear = () => { pressed.current.clear(); setDirection({ x: 0, z: 0 }); setRunning(false) }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', clear)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', clear) }
  }, [setDirection, setRunning])
}

function CameraRig({ zoom, angle }: { zoom: number; angle: number }) {
  const { camera } = useThree()
  useEffect(() => {
    const perspective = camera as THREE.PerspectiveCamera
    const radians = THREE.MathUtils.degToRad(angle)
    const distance = zoom
    // The camera is deliberately world-locked: no orbit controls and no robot-relative transforms.
    perspective.position.set(0, Math.sin(radians) * distance + 0.15, Math.cos(radians) * distance)
    perspective.lookAt(0, 1.1, 0)
    perspective.updateProjectionMatrix()
  }, [camera, zoom, angle])
  return null
}

function Robot({ running, direction, resetToken }: { running: boolean; direction: Direction; resetToken: number }) {
  const root = useRef<THREE.Group>(null)
  const leftLeg = useRef<THREE.Group>(null)
  const rightLeg = useRef<THREE.Group>(null)
  const leftArm = useRef<THREE.Group>(null)
  const rightArm = useRef<THREE.Group>(null)
  const head = useRef<THREE.Group>(null)
  const phase = useRef(0)
  const { camera } = useThree()
  useEffect(() => { if (root.current) { root.current.position.set(0, 0, 0); root.current.rotation.y = 0 } }, [resetToken])
  useFrame((state, delta) => {
    if (!root.current) return
    const pace = running ? 1 : 0
    phase.current += delta * (running ? 9.5 : 2.2)
    const bob = running ? Math.abs(Math.sin(phase.current)) * 0.07 : Math.sin(state.clock.elapsedTime * 1.2) * 0.025
    root.current.position.y = THREE.MathUtils.damp(root.current.position.y, bob, 8, delta)
    if (running) {
      const speed = 2.35 * delta
      root.current.position.x = THREE.MathUtils.clamp(root.current.position.x + direction.x * speed, -4.15, 4.15)
      root.current.position.z = THREE.MathUtils.clamp(root.current.position.z + direction.z * speed, -2.5, 2.2)
    }
    const stride = Math.sin(phase.current) * 0.62 * pace
    if (leftLeg.current) leftLeg.current.rotation.x = stride
    if (rightLeg.current) rightLeg.current.rotation.x = -stride
    if (leftArm.current) leftArm.current.rotation.x = -stride * 0.72 - 0.08
    if (rightArm.current) rightArm.current.rotation.x = stride * 0.72 - 0.08
    if (head.current) { head.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.7) * 0.045; head.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.9) * 0.025 }
    // Keep the model facing the direction of travel while leaving the exhibition camera untouched.
    if (direction.x !== 0 || direction.z !== 0) {
      const target = Math.atan2(direction.x, direction.z)
      root.current.rotation.y = THREE.MathUtils.damp(root.current.rotation.y, target, 8, delta)
    }
    void camera
  })
  const shell = '#d9ecf4'
  const dark = '#182943'
  const cyan = '#47f5ee'
  const purple = '#a178ff'
  return <group ref={root} position={[0, 0, 0]}>
    <mesh position={[0, 0.14, 0]} castShadow><cylinderGeometry args={[0.62, 0.72, 0.22, 48]} /><meshStandardMaterial color="#182238" metalness={0.8} roughness={0.26} /></mesh>
    <mesh position={[0, 0.29, 0]}><torusGeometry args={[0.59, 0.035, 12, 64]} /><meshBasicMaterial color={cyan} /></mesh>
    <group position={[0, 1.35, 0]}>
      <mesh castShadow><capsuleGeometry args={[0.43, 0.53, 8, 24]} /><meshStandardMaterial color={shell} metalness={0.44} roughness={0.27} /></mesh>
      <mesh position={[0, 0.13, 0.405]}><boxGeometry args={[0.5, 0.12, 0.055]} /><meshStandardMaterial color={dark} metalness={0.65} roughness={0.2} /></mesh>
      <mesh position={[0, 0.13, 0.44]}><torusGeometry args={[0.11, 0.017, 10, 32]} /><meshBasicMaterial color={cyan} /></mesh>
      <mesh position={[0, -0.29, 0.12]}><sphereGeometry args={[0.065, 16, 16]} /><meshBasicMaterial color={purple} /></mesh>
      <mesh position={[-0.5, 0.14, 0]}><sphereGeometry args={[0.13, 20, 20]} /><meshStandardMaterial color="#293854" metalness={0.75} roughness={0.2} /></mesh>
      <mesh position={[0.5, 0.14, 0]}><sphereGeometry args={[0.13, 20, 20]} /><meshStandardMaterial color="#293854" metalness={0.75} roughness={0.2} /></mesh>
      <mesh position={[-0.505, 0.14, 0.08]}><sphereGeometry args={[0.055, 16, 16]} /><meshBasicMaterial color={cyan} /></mesh>
      <mesh position={[0.505, 0.14, 0.08]}><sphereGeometry args={[0.055, 16, 16]} /><meshBasicMaterial color={purple} /></mesh>
    </group>
    <group ref={head} position={[0, 2.32, 0]}>
      <mesh castShadow><boxGeometry args={[1.16, 0.82, 0.86]} /><meshStandardMaterial color={shell} metalness={0.45} roughness={0.22} /></mesh>
      <mesh position={[0, -0.02, 0.44]}><boxGeometry args={[0.91, 0.5, 0.045]} /><meshStandardMaterial color="#101b2e" metalness={0.4} roughness={0.18} /></mesh>
      <mesh position={[-0.22, 0.03, 0.477]}><sphereGeometry args={[0.095, 24, 24]} /><meshBasicMaterial color={cyan} /></mesh>
      <mesh position={[0.22, 0.03, 0.477]}><sphereGeometry args={[0.095, 24, 24]} /><meshBasicMaterial color={cyan} /></mesh>
      <mesh position={[-0.22, 0.03, 0.49]}><sphereGeometry args={[0.035, 16, 16]} /><meshBasicMaterial color="#efffff" /></mesh>
      <mesh position={[0.22, 0.03, 0.49]}><sphereGeometry args={[0.035, 16, 16]} /><meshBasicMaterial color="#efffff" /></mesh>
      <mesh position={[0, -0.2, 0.485]} rotation={[0, 0, Math.PI / 2]}><capsuleGeometry args={[0.025, 0.12, 4, 8]} /><meshBasicMaterial color={purple} /></mesh>
      <mesh position={[0, 0.45, 0]}><sphereGeometry args={[0.13, 16, 16]} /><meshStandardMaterial color="#283854" metalness={0.6} /></mesh>
      <mesh position={[0, 0.46, 0.04]}><sphereGeometry args={[0.07, 16, 16]} /><meshBasicMaterial color={purple} /></mesh>
      <mesh position={[-0.62, 0, 0]}><sphereGeometry args={[0.15, 20, 20]} /><meshStandardMaterial color="#93aebe" metalness={0.7} /></mesh>
      <mesh position={[0.62, 0, 0]}><sphereGeometry args={[0.15, 20, 20]} /><meshStandardMaterial color="#93aebe" metalness={0.7} /></mesh>
    </group>
    {[leftArm, rightArm].map((ref, i) => <group key={i} ref={ref} position={[i === 0 ? -0.59 : 0.59, 1.62, 0]}>
      <mesh position={[0, -0.29, 0]} castShadow><capsuleGeometry args={[0.16, 0.42, 6, 16]} /><meshStandardMaterial color={shell} metalness={0.45} roughness={0.25} /></mesh>
      <mesh position={[0, -0.57, 0]}><sphereGeometry args={[0.2, 20, 20]} /><meshStandardMaterial color="#b6d0dc" metalness={0.55} /></mesh>
      <mesh position={[0, -0.58, 0.17]}><sphereGeometry args={[0.055, 12, 12]} /><meshBasicMaterial color={i === 0 ? cyan : purple} /></mesh>
      <mesh position={[0, -0.75, 0.04]}><boxGeometry args={[0.24, 0.16, 0.23]} /><meshStandardMaterial color="#c7dce5" metalness={0.45} roughness={0.28} /></mesh>
      {[-0.08, 0, 0.08].map((x) => <mesh key={x} position={[x, -0.85, 0.13]}><sphereGeometry args={[0.045, 12, 12]} /><meshStandardMaterial color="#d9ecf4" metalness={0.4} /></mesh>)}
    </group>)}
    {[leftLeg, rightLeg].map((ref, i) => <group key={i} ref={ref} position={[i === 0 ? -0.24 : 0.24, 0.75, 0]}>
      <mesh position={[0, -0.28, 0]} castShadow><capsuleGeometry args={[0.19, 0.43, 6, 16]} /><meshStandardMaterial color="#b6cedb" metalness={0.45} roughness={0.27} /></mesh>
      <mesh position={[0, -0.61, 0.09]} castShadow><boxGeometry args={[0.37, 0.2, 0.55]} /><meshStandardMaterial color="#273954" metalness={0.72} roughness={0.23} /></mesh>
      <mesh position={[0, -0.62, 0.37]}><boxGeometry args={[0.23, 0.04, 0.025]} /><meshBasicMaterial color={i === 0 ? cyan : purple} /></mesh>
    </group>)}
    <pointLight position={[0, 1.1, 0.65]} color={cyan} intensity={1.1} distance={2.4} />
  </group>
}

function ExhibitRoom({ running, direction, resetToken, zoom, angle }: { running: boolean; direction: Direction; resetToken: number; zoom: number; angle: number }) {
  return <Canvas shadows dpr={[1, 1.7]} camera={{ position: [0, 6, 10], fov: 43 }} gl={{ antialias: true, powerPreference: 'high-performance' }}>
    <color attach="background" args={['#081321']} />
    <fog attach="fog" args={['#081321', 13, 25]} />
    <CameraRig zoom={zoom} angle={angle} />
    <ambientLight intensity={0.8} />
    <hemisphereLight color="#c2ecff" groundColor="#19223b" intensity={1.2} />
    <directionalLight position={[-4, 8, 5]} intensity={2.2} color="#d9f5ff" castShadow shadow-mapSize={[1024, 1024]} />
    <pointLight position={[0, 4.6, -2]} intensity={13} color="#6948ff" distance={9} />
    <pointLight position={[-4, 2.5, -1]} intensity={9} color="#18cbd2" distance={8} />
    <pointLight position={[4, 2.5, -1]} intensity={8} color="#5a50d8" distance={8} />
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow><planeGeometry args={[200, 200]} /><meshStandardMaterial color="#0a1423" metalness={0.35} roughness={0.42} /></mesh>
    <gridHelper args={[200, 100, '#1a6375', '#14253a']} position={[0, 0.006, 0]} />
    <mesh position={[0, 4, -5]}><boxGeometry args={[15, 8, 0.25]} /><meshStandardMaterial color="#101c2d" metalness={0.5} roughness={0.4} /></mesh>
    <mesh position={[0, 2.2, -4.84]}><planeGeometry args={[8.5, 3.1]} /><meshBasicMaterial color="#111c2f" /></mesh>
    <mesh position={[0, 3.83, -4.7]}><boxGeometry args={[7.3, 0.025, 0.035]} /><meshBasicMaterial color="#35e3e6" /></mesh>
    <mesh position={[0, 0.7, -4.72]}><boxGeometry args={[5.1, 0.018, 0.035]} /><meshBasicMaterial color="#7b58ff" /></mesh>
    <Html position={[0, 3.02, -4.65]} center distanceFactor={8} transform><div className="wall-title">FIZZY <span>LAB</span><small>EXPLORE · IMAGINE · CREATE</small></div></Html>
    {[-1, 1].map((side) => <group key={side} position={[side * 5.25, 0, -1.4]}>
      <mesh position={[0, 1.45, 0]}><boxGeometry args={[0.08, 2.9, 0.08]} /><meshStandardMaterial color="#273750" metalness={0.6} /></mesh>
      <mesh position={[0, 2.92, 0]}><boxGeometry args={[0.12, 0.12, 0.12]} /><meshBasicMaterial color={side < 0 ? '#36f2e7' : '#9d70ff'} /></mesh>
      <mesh position={[side * -0.5, 0.86, -1]}><boxGeometry args={[0.76, 0.07, 0.75]} /><meshStandardMaterial color="#28344b" metalness={0.7} /></mesh>
      <mesh position={[side * -0.5, 1.28, -1]}><sphereGeometry args={[0.28, 24, 24]} /><meshStandardMaterial color={side < 0 ? '#1acfd1' : '#7c59ed'} emissive={side < 0 ? '#1acfd1' : '#7c59ed'} emissiveIntensity={0.75} roughness={0.2} /></mesh>
      <mesh position={[side * -0.5, 1.28, -1]}><torusGeometry args={[0.37, 0.02, 8, 40]} /><meshBasicMaterial color={side < 0 ? '#44e6e6' : '#a17aff'} /></mesh>
    </group>)}
    {[-1, 1].map((x) => <mesh key={x} position={[x * 6.9, 2.3, 0]}><boxGeometry args={[0.07, 4.6, 0.08]} /><meshBasicMaterial color="#247887" /></mesh>)}
    <mesh position={[0, 0.05, 0]}><cylinderGeometry args={[1.05, 1.08, 0.08, 64]} /><meshStandardMaterial color="#13233a" metalness={0.76} roughness={0.25} /></mesh>
    <mesh position={[0, 0.1, 0]}><torusGeometry args={[1, 0.035, 12, 64]} /><meshBasicMaterial color="#38e8e8" /></mesh>
    <Robot running={running} direction={direction} resetToken={resetToken} />
    <Sparkles count={38} scale={[12, 5, 10]} size={1.8} speed={0.2} opacity={0.45} color="#77dff2" />
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}><mesh position={[-3.7, 2.9, -1.3]}><octahedronGeometry args={[0.15]} /><meshBasicMaterial color="#38e8e8" wireframe /></mesh></Float>
    <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}><mesh position={[3.5, 3.2, -2]}><icosahedronGeometry args={[0.17]} /><meshBasicMaterial color="#9c76ff" wireframe /></mesh></Float>
  </Canvas>
}

function getAnswer(question: string) {
  const q = question.toLowerCase()
  if (/(hello|hi|hey|namaste)/.test(q)) return 'Hello, explorer! I’m Fizzy Bot, your friendly guide to all things curious. What would you like to discover?'
  if (/(robot|robotics|sensor|motor)/.test(q)) return 'Robots use sensors to understand their surroundings, a controller to make decisions, and motors to move. My glowing eyes are a fun way to show how a robot can communicate its status!'
  if (/(artificial intelligence|\bai\b|machine learning|neural)/.test(q)) return 'Artificial intelligence helps computers find patterns and make useful predictions. Machine learning is one way to build AI: the system learns from examples instead of following only a fixed list of rules.'
  if (/(space|planet|mars|astronomy)/.test(q)) return 'Space is full of amazing questions! Rovers use cameras, wheels and scientific instruments to explore other worlds. A day on Mars is about 24 hours and 37 minutes long.'
  if (/(science|physics|energy|light)/.test(q)) return 'Science is a way of asking questions, testing ideas and learning from evidence. For example, light travels incredibly fast—about 300,000 kilometres per second in a vacuum.'
  if (/(technology|future|computer|internet)/.test(q)) return 'Technology is at its best when it helps people solve real problems. From accessible learning tools to cleaner energy, the future is something we get to build together.'
  return 'That’s a fascinating question! I’m running in exhibition demo mode, so I can answer common questions about AI, robotics, science and technology. Try asking me how robots work or what AI means.'
}

function App() {
  const [running, setRunning] = useState(false)
  const [direction, setDirection] = useState<Direction>({ x: 0, z: 0 })
  const [zoom, setZoom] = useState(10.6)
  const [angle, setAngle] = useState(28)
  const [resetToken, setResetToken] = useState(0)
  const [chat, setChat] = useState<ChatMessage[]>([{ role: 'bot', text: initialGreeting }])
  const [draft, setDraft] = useState('')
  const [mobileChatOpen, setMobileChatOpen] = useState(false)
  const [touchDirection, setTouchDirection] = useState<Direction | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  useMovementKeys(setDirection, setRunning)
  useEffect(() => {
    if (touchDirection) { setDirection(touchDirection); setRunning(true) }
    else { setDirection({ x: 0, z: 0 }); setRunning(false) }
  }, [touchDirection])
  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' }) }, [chat])
  const stop = useCallback(() => { setRunning(false); setDirection({ x: 0, z: 0 }); setTouchDirection(null) }, [])
  const go = (dir: Direction) => { setTouchDirection(dir) }
  const sendMessage = (event: React.FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    setChat((items) => [...items, { role: 'user', text }, { role: 'bot', text: getAnswer(text) }])
    setDraft('')
  }
  const resetCamera = () => { setZoom(10.6); setAngle(28) }
  return <main className="app-shell">
    <header className="topbar">
      <a className="brand" href="#top" aria-label="Fizzy Bot home"><span className="brand-icon"><Bot size={22} /></span><span>FIZZY<span className="brand-light">LAB</span><small>INTERACTIVE EXHIBITION</small></span></a>
      <div className="topbar-center"><span className="live-dot" /> EXHIBITION LIVE <span className="topbar-divider" /> STUDENT SHOWCASE 2025</div>
      <button className="help-button" onClick={() => document.getElementById('controls')?.scrollIntoView({ behavior: 'smooth' })}><CircleHelp size={16} /> <span>How to explore</span></button>
    </header>
    <section className="intro" id="top">
      <div className="eyebrow"><span className="eyebrow-line" /> THE FUTURE IS FRIENDLY</div>
      <div className="intro-row"><div><h1>Fizzy Bot AI Robot Exhibition</h1><p>Meet Fizzy Bot — Your Interactive AI Robot</p></div><div className="intro-note"><SparkleIcon size={15} /> A little curiosity goes a long way.</div></div>
    </section>
    <section className="experience-layout">
      <div className="exhibit-column">
        <div className="stage-card">
          <div className="stage-topline"><span className="stage-label"><span className="live-dot" /> LIVE ROBOT FEED</span><span className="scene-name">01 <i>/</i> FUTURE LAB</span><span className="stage-fullscreen"><Expand size={14} /> IMMERSIVE VIEW</span></div>
          <div className="canvas-wrap"><ExhibitRoom running={running} direction={direction} resetToken={resetToken} zoom={zoom} angle={angle} />
            <div className="robot-caption"><span className="caption-orb"><Bot size={16} /></span><span><b>Fizzy Bot</b><small>{running ? 'On the move · say hello!' : 'Ready to explore with you'}</small></span><span className={`status-pill ${running ? 'is-moving' : ''}`}><i />{running ? 'MOVING' : 'STANDBY'}</span></div>
            <div className="camera-controls"><div className="camera-label"><span>CAMERA</span><small>FIXED VIEW</small></div><div className="camera-divider" />
              <button title="Zoom in" aria-label="Zoom in" onClick={() => setZoom((v) => Math.max(7.2, v - 0.8))}><span>＋</span><small>ZOOM</small></button>
              <button title="Zoom out" aria-label="Zoom out" onClick={() => setZoom((v) => Math.min(15, v + 0.8))}><span>−</span><small>ZOOM</small></button>
              <div className="camera-divider" />
              <button title="Camera angle up" aria-label="Camera angle up" onClick={() => setAngle((v) => Math.min(48, v + 4))}><ChevronUp size={18} /><small>ANGLE</small></button>
              <button title="Camera angle down" aria-label="Camera angle down" onClick={() => setAngle((v) => Math.max(12, v - 4))}><ChevronDown size={18} /><small>ANGLE</small></button>
              <button className="reset-camera" title="Reset camera" aria-label="Reset camera" onClick={resetCamera}><RotateCcw size={15} /><small>RESET</small></button>
            </div>
            <div className="axis-badge"><span className="axis-dot" /> Fixed horizontal axis</div>
          </div>
          <div className="stage-footer"><span><span className="key-hint">W</span><span className="key-hint">A</span><span className="key-hint">S</span><span className="key-hint">D</span> or arrow keys to move</span><span className="stage-footer-right"><span className="key-hint space-key">SPACE</span> to stop <span className="footer-separator">·</span> Drag disabled</span></div>
        </div>
        <div className="action-bar">
          <button className={`primary-action ${running ? 'active' : ''}`} onClick={() => { setTouchDirection(null); setDirection({ x: 0, z: 1 }); setRunning(true) }}>{running ? <Zap size={17} /> : <Play size={17} fill="currentColor" />}{running ? 'Walking' : 'Start walking'}</button>
          <button className="secondary-action" onClick={stop}><span className="stop-square" /> Stop</button>
          <button className="secondary-action" onClick={() => { stop(); setResetToken((n) => n + 1) }}><RotateCcw size={15} /> Reset position</button>
          <div className="action-spacer" />
          <div className="movement-state"><span className={running ? 'state-dot active' : 'state-dot'} />{running ? 'Fizzy is moving' : 'Fizzy is standing by'}</div>
        </div>
        <div className="lower-cards" id="controls">
          <article className="info-card controls-card"><div className="card-heading"><span className="card-icon cyan-icon"><Gauge size={16} /></span><div><h3>Take the controls</h3><p>Guide Fizzy around the exhibition floor</p></div><span className="card-tag">YOUR TURN</span></div><div className="controls-content"><div className="keyboard-grid"><span /><kbd>W</kbd><span /><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div><span className="control-or">OR</span><div className="dpad"><button aria-label="Move forward" onPointerDown={() => go({ x: 0, z: 1 })} onPointerUp={() => setTouchDirection(null)} onPointerLeave={() => setTouchDirection(null)}><ArrowUp size={16} /></button><div><button aria-label="Move left" onPointerDown={() => go({ x: -1, z: 0 })} onPointerUp={() => setTouchDirection(null)} onPointerLeave={() => setTouchDirection(null)}><ArrowLeft size={16} /></button><button aria-label="Move backward" onPointerDown={() => go({ x: 0, z: -1 })} onPointerUp={() => setTouchDirection(null)} onPointerLeave={() => setTouchDirection(null)}><ArrowDown size={16} /></button><button aria-label="Move right" onPointerDown={() => go({ x: 1, z: 0 })} onPointerUp={() => setTouchDirection(null)} onPointerLeave={() => setTouchDirection(null)}><ArrowRight size={16} /></button></div></div><span className="controls-tip"><span className="key-hint space-key">SPACE</span> quick stop</span></div></article>
          <article className="info-card camera-card"><div className="card-heading"><span className="card-icon purple-icon"><Expand size={16} /></span><div><h3>Camera controls</h3><p>World-locked view · independent of Fizzy</p></div></div><div className="camera-feature-row"><div className="feature-chip"><span>＋ / −</span><small>ZOOM</small></div><div className="feature-chip"><span>⌃ / ⌄</span><small>ANGLE</small></div><div className="feature-chip fixed-chip"><span><span className="lock-dot" /> FIXED</span><small>NO ROTATION</small></div></div><div className="camera-note"><span className="mini-check">✓</span> Dragging is disabled to keep your view steady.</div></article>
        </div>
      </div>
      <aside className={`chat-panel ${mobileChatOpen ? 'chat-open' : ''}`}>
        <div className="chat-heading"><div className="chat-avatar"><Bot size={20} /><span /></div><div className="chat-title"><h2>Chat with Fizzy</h2><span><i /> HERE TO HELP YOU EXPLORE</span></div><button className="chat-close" onClick={() => setMobileChatOpen(false)} aria-label="Close chat"><X size={17} /></button><button className="chat-more" aria-label="Chat options"><span>•••</span></button></div>
        <div className="chat-intro"><div className="tiny-star"><SparkleIcon size={14} /></div><div><b>Your curious companion</b><p>Ask me anything. Let’s figure it out together!</p></div></div>
        <div className="chat-messages" ref={scrollRef}>{chat.map((message, index) => <div key={`${index}-${message.role}`} className={`message-row ${message.role}`}>
          {message.role === 'bot' && <div className="message-avatar"><Bot size={14} /></div>}<div className="message-bubble">{message.text}<span className="message-time">{index === 0 ? 'JUST NOW' : 'NOW'}</span></div>
        </div>)}</div>
        <div className="suggestions-label">TRY ASKING <span>✦</span></div>
        <div className="suggestions"><button onClick={() => setDraft('How do robots work?')}>How do robots work?</button><button onClick={() => setDraft('What is AI?')}>What is AI?</button></div>
        <form className="chat-form" onSubmit={sendMessage}><input aria-label="Ask Fizzy a question" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask Fizzy anything..." /><button type="submit" aria-label="Send message" disabled={!draft.trim()}><Send size={16} /></button></form>
        <div className="demo-disclaimer"><span className="demo-spark">✦</span> DEMO MODE <span className="demo-dot" /> Answers are pre-programmed</div>
        <div className="chat-mobile-tip"><MoveUpRight size={13} /> Chat with Fizzy</div>
      </aside>
    </section>
    <footer className="site-footer"><div><span className="footer-mark"><Bot size={15} /></span> Made for curious minds <span className="footer-dot">·</span> Fizzy Bot AI Robot Exhibition</div><div className="footer-right"><span>BUILT TO INSPIRE</span><WandSparkles size={14} /></div></footer>
    <button className="mobile-chat-fab" onClick={() => setMobileChatOpen(true)}><MessageCircle size={18} /> Chat with Fizzy</button>
  </main>
}

export default App
