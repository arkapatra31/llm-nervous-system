import { useRef, useMemo, useEffect, Suspense } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  Noise,
} from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import * as THREE from 'three'
import { onPulse } from '../../lib/signal'

// Ashima 3D simplex noise — used to organically displace the core's surface.
const SIMPLEX = /* glsl */ `
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
  const vec2 C=vec2(1.0/6.0,1.0/3.0); const vec4 D=vec4(0.0,0.5,1.0,2.0);
  vec3 i=floor(v+dot(v,C.yyy)); vec3 x0=v-i+dot(i,C.xxx);
  vec3 g=step(x0.yzx,x0.xyz); vec3 l=1.0-g; vec3 i1=min(g.xyz,l.zxy); vec3 i2=max(g.xyz,l.zxy);
  vec3 x1=x0-i1+C.xxx; vec3 x2=x0-i2+C.yyy; vec3 x3=x0-D.yyy;
  i=mod289(i);
  vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
  float n_=0.142857142857; vec3 ns=n_*D.wyz-D.xzx;
  vec4 j=p-49.0*floor(p*ns.z*ns.z); vec4 x_=floor(j*ns.z); vec4 y_=floor(j-7.0*x_);
  vec4 x=x_*ns.x+ns.yyyy; vec4 y=y_*ns.x+ns.yyyy; vec4 h=1.0-abs(x)-abs(y);
  vec4 b0=vec4(x.xy,y.xy); vec4 b1=vec4(x.zw,y.zw);
  vec4 s0=floor(b0)*2.0+1.0; vec4 s1=floor(b1)*2.0+1.0; vec4 sh=-step(h,vec4(0.0));
  vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy; vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
  vec3 p0=vec3(a0.xy,h.x); vec3 p1=vec3(a0.zw,h.y); vec3 p2=vec3(a1.xy,h.z); vec3 p3=vec3(a1.zw,h.w);
  vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
  p0*=norm.x; p1*=norm.y; p2*=norm.z; p3*=norm.w;
  vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0); m=m*m;
  return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
`

const VERT = /* glsl */ `
uniform float uTime;
uniform float uDistort;
uniform float uExcite;
varying float vNoise;
varying vec3 vNormalW;
varying vec3 vViewDir;
${SIMPLEX}
void main(){
  float n = snoise(position * 1.1 + vec3(0.0, uTime * 0.18, 0.0));
  float n2 = snoise(position * 2.6 - vec3(uTime * 0.12));
  vNoise = n;
  float amp = uDistort * (1.0 + uExcite * 1.6);
  vec3 displaced = position + normal * (n * 0.55 + n2 * 0.22) * amp;
  vec4 mv = modelViewMatrix * vec4(displaced, 1.0);
  vNormalW = normalize(normalMatrix * normal);
  vViewDir = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`

const FRAG = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uExcite;
varying float vNoise;
varying vec3 vNormalW;
varying vec3 vViewDir;
void main(){
  float fres = pow(1.0 - max(dot(vNormalW, vViewDir), 0.0), 2.4);
  vec3 base = mix(uColorA, uColorB, smoothstep(-0.6, 0.6, vNoise));
  vec3 col = mix(base, uColorC, fres);
  col += uColorC * fres * (0.6 + uExcite);     // glowing rim
  col += uColorB * uExcite * 0.4;              // flush on query pulse
  gl_FragColor = vec4(col, 1.0);
}
`

const CA_OFFSET = new THREE.Vector2(0.0008, 0.0012)

function Core() {
  const matRef = useRef<THREE.ShaderMaterial>(null)
  const meshRef = useRef<THREE.Mesh>(null)
  const excite = useRef(0)

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uDistort: { value: 0.42 },
      uExcite: { value: 0 },
      uColorA: { value: new THREE.Color('#2b1d6b') },
      uColorB: { value: new THREE.Color('#7b6cff') },
      uColorC: { value: new THREE.Color('#54e6ff') },
    }),
    []
  )

  useEffect(() => onPulse((i) => (excite.current = Math.min(1.4, excite.current + i))), [])

  useFrame((state, delta) => {
    excite.current = Math.max(0, excite.current - delta * 0.9)
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = state.clock.elapsedTime
      matRef.current.uniforms.uExcite.value = excite.current
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.12
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.18) * 0.12
    }
  })

  return (
    <mesh ref={meshRef} scale={1.5}>
      <icosahedronGeometry args={[1, 64]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function Halo({ count = 1400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null)
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const palette = [new THREE.Color('#7b6cff'), new THREE.Color('#38d6f0'), new THREE.Color('#f08bdc')]
    for (let i = 0; i < count; i++) {
      // shell distribution around the core with some scatter
      const r = 2.6 + Math.pow(Math.random(), 2) * 4.2
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7
      pos[i * 3 + 2] = r * Math.cos(phi)
      const c = palette[i % palette.length]
      col[i * 3] = c.r
      col[i * 3 + 1] = c.g
      col[i * 3 + 2] = c.b
    }
    return { positions: pos, colors: col }
  }, [count])

  const sprite = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 64
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.35, 'rgba(255,255,255,0.5)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, 64)
    return new THREE.CanvasTexture(c)
  }, [])

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y -= delta * 0.03
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.05
    }
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        map={sprite}
        vertexColors
        transparent
        opacity={0.9}
        alphaTest={0.01}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function Rig() {
  const { camera, pointer } = useThree()
  const target = useRef(new THREE.Vector2())
  useEffect(() => {
    const onScroll = () => {
      const p = window.scrollY / (window.innerHeight || 1)
      target.current.y = Math.min(p, 1.4)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useFrame(() => {
    // gentle parallax toward the cursor + drift down as you scroll past the hero
    camera.position.x += (pointer.x * 0.6 - camera.position.x) * 0.04
    camera.position.y += (-pointer.y * 0.4 - target.current.y * 1.4 - camera.position.y) * 0.04
    camera.lookAt(0, 0, 0)
  })
  return null
}

export function Scene() {
  const wrapRef = useRef<HTMLDivElement>(null)

  // The scene is vivid in the hero, then recedes to a faint ambient backdrop
  // once you scroll into the content — so text and cards stay legible.
  useEffect(() => {
    const onScroll = () => {
      const vh = window.innerHeight || 1
      const p = window.scrollY / vh
      const opacity = Math.max(0.16, 1 - p * 1.15)
      if (wrapRef.current) wrapRef.current.style.opacity = String(opacity)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      ref={wrapRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        transition: 'opacity 0.25s linear',
      }}
      aria-hidden="true"
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 42 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.9]}
      >
        <color attach="background" args={['#08080c']} />
        <fog attach="fog" args={['#08080c', 7, 16]} />
        <Suspense fallback={null}>
          {/* offset right so the left-aligned hero copy stays legible */}
          <group position={[2.1, -0.2, 0]}>
            <Core />
            <Halo />
          </group>
          <Rig />
          <EffectComposer multisampling={0}>
            <Bloom intensity={1.15} luminanceThreshold={0.18} luminanceSmoothing={0.5} mipmapBlur radius={0.8} />
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={CA_OFFSET} radialModulation={false} modulationOffset={0} />
            <Vignette eskil={false} offset={0.2} darkness={0.85} />
            <Noise premultiply blendFunction={BlendFunction.OVERLAY} opacity={0.18} />
          </EffectComposer>
        </Suspense>
      </Canvas>
    </div>
  )
}
