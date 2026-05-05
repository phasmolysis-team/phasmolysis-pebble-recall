import { useState, useEffect, useRef } from "react"
import stone from './assets/stone.png'
import { Logo } from "./logo"
import { ThrowHUD, PebbleTossHUD } from './pebble_toss_hud.tsx'
import {PebbleLogListScreen} from './pebbles_log_list.tsx'
import { ValenceScreen } from './valence_screen.tsx'
import { SideEffectsJournalPopup } from "./side_effects_popup.tsx"


interface Ripple {
  x: number
  y: number
  radius: number
  alpha: number
  growth: number
}

interface Stain {
  x: number
  y: number
  radius: number
  alpha: number
}

interface Point {
  x: number
  y: number
}

interface Stone {
  active: boolean

  points: Point[]

  current: number
  progress: number

  x: number
  y: number

  sinkX: number
  sinkY: number
}

export function Pond() {
  const [page, setPage] = useState("pond");
  const canvasRef =
  useRef<HTMLCanvasElement | null>(null)

  const ripples = useRef<Ripple[]>([])
    const stains = useRef<Stain[]>([])
    const stones = useRef<Stone[]>([])

  const mouse = useRef<{
  x: number
  power: number
}>({
  x: window.innerWidth / 2,
  power: 90
})

  useEffect(() => {
    const stoneImage = new Image()

    stoneImage.src = stone

    const canvas = canvasRef.current

    if (!canvas) return

    const ctx = canvas.getContext("2d")

    if (!ctx) return

    let width = 0;
    let height = 0;

    // ---------------------------------
    // Resize
    // ---------------------------------
    const resize = () => {
    width = window.innerWidth
    height = window.innerHeight

    canvas.width = width
    canvas.height = height
    }
    resize();

    window.addEventListener("resize", resize)

    // ---------------------------------
    // Helpers
    // ---------------------------------
   const lerp = (
    a: number,
    b: number,
    t: number
    ) => {
      return a + (b - a) * t
    }

    const easeOutCubic = (t: number) => {
      return 1 - Math.pow(1 - t, 3)
    }

    // ---------------------------------
    // Ripple
    // ---------------------------------
    const createRipple = (
    x: number,
    y: number,
    size: number = 1
    ) => {
      ripples.current.push({
        x,
        y,
        radius: 5,
        alpha: 0.2,
        growth: 0.7 * size
      })
    }

    // ---------------------------------
    // Dye Stain
    // ---------------------------------
    const createStain = (x:number, y:number) => {
      stains.current.push({
        x,
        y,
        radius: 20 + Math.random() * 30,
        alpha: 0.04
      })
    }

    // ---------------------------------
    // Throw Stone
    // ---------------------------------
    const throwStone = (targetX:number, power:number) => {
      const startX =
        width * 0.5 +
        (Math.random() - 0.5) * 40

      const startY = height + 80

      const distance = power * 5

      const skips =
        Math.floor(3 + Math.random() * 5)

      const spacing = distance / skips

      const points = []

      for (let i = 0; i < skips; i++) {
        const progress = i / skips

        points.push({
          x:
            lerp(startX, targetX, progress) +
            (Math.random() - 0.5) * 25,

          y:
            startY -
            spacing * (i + 1) +
            (Math.random() - 0.5) * 15
        })
      }

      stones.current.push({
        active: true,

        points,
        current: 0,
        progress: 0,

        x: startX,
        y: startY,

        sinkX:
          points[points.length - 1].x,

        sinkY:
          points[points.length - 1].y
      })
    }

    // ---------------------------------
    // Input
    // ---------------------------------
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX
    }

    const onClick = () => {
      throwStone(
        mouse.current.x,
        mouse.current.power
      )
    }

    window.addEventListener("mousemove", onMove)
    window.addEventListener("click", onClick)

    // ---------------------------------
    // Water Texture
    // ---------------------------------
    let time = 0

    const drawWater = () => {
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, width, height)

      ctx.strokeStyle = "black"
      ctx.lineWidth = 1

      // subtle moving contour lines
      for (let row = 0; row < height; row += 28) {
        ctx.beginPath()

        for (let x = 0; x <= width; x += 12) {
          const y =
            row +
            Math.sin(
              x * 0.008 +
                time +
                row * 0.02
            ) *
              2 +
            Math.sin(
              x * 0.02 +
                time * 0.5
            ) *
              1.5

          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        ctx.globalAlpha = 0.15
        ctx.stroke()
      }

      ctx.globalAlpha = 1
    }

    // ---------------------------------
    // Animation
    // ---------------------------------
    const animate = () => {
      time += 0.01

      drawWater()

      // ---------------------------------
      // Ambient Ripples
      // ---------------------------------
      if (Math.random() < 0.02) {
        createRipple(
          Math.random() * width,
          Math.random() * height,
          0.5
        )
      }

      // ---------------------------------
      // Stains
      // ---------------------------------
      for (const stain of stains.current) {
        ctx.save()

        ctx.globalAlpha = stain.alpha

        ctx.beginPath()

        ctx.arc(
          stain.x,
          stain.y,
          stain.radius,
          0,
          Math.PI * 2
        )

        ctx.fillStyle = "black"

        ctx.shadowBlur = 30
        ctx.shadowColor = "black"

        ctx.fill()

        ctx.restore()
      }

      // ---------------------------------
      // Ripples
      // ---------------------------------
      ripples.current =
        ripples.current.filter(
          ripple => ripple.alpha > 0.01
        )

      for (const ripple of ripples.current) {
        ripple.radius += ripple.growth
        ripple.alpha *= 0.986

        ctx.save()

        ctx.globalAlpha = ripple.alpha

        ctx.beginPath()

        ctx.arc(
          ripple.x,
          ripple.y,
          ripple.radius,
          0,
          Math.PI * 2
        )

        ctx.strokeStyle = "black"
        ctx.lineWidth = 1

        ctx.stroke()

        ctx.restore()
      }

      // ---------------------------------
      // Stones
      // ---------------------------------
      for (const stone of stones.current) {
        if (!stone.active) continue

        const target =
          stone.points[stone.current]

        const start =
          stone.current === 0
            ? {
                x: stone.x,
                y: stone.y
              }
            : stone.points[
                stone.current - 1
              ]

        stone.progress += 0.035

        const t = easeOutCubic(
          stone.progress
        )

        const x = lerp(start.x, target.x, t)

        const y = lerp(start.y, target.y, t)


        // shadow
        ctx.save()

        ctx.globalAlpha = 0.08

        ctx.beginPath()

        ctx.ellipse(
          x,
          y + 10,
          10,
          4,
          0,
          0,
          Math.PI * 2
        )

        ctx.fillStyle = "black"
        ctx.fill()

        ctx.restore()

       ctx.save()

        ctx.translate(x, y)

        ctx.rotate(t * Math.PI * 2)

        ctx.drawImage(
        stoneImage,
        -16,
        -16,
        32,
        32
        )

        ctx.restore()

        // trail ripple
        if (Math.random() < 0.25) {
          createRipple(x, y, 0.4)
        }

        // impact
        if (stone.progress >= 1) {
          createRipple(target.x, target.y, 1.5)

          stone.current++
          stone.progress = 0

          // sink
          if (
            stone.current >=
            stone.points.length
          ) {
            stone.active = false

            createRipple(
              stone.sinkX,
              stone.sinkY,
              3
            )

            createStain(
              stone.sinkX,
              stone.sinkY
            )
          }
        }
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener(
        "resize",
        resize
      )

      window.removeEventListener(
        "mousemove",
        onMove
      )

      window.removeEventListener(
        "click",
        onClick
      )
    }
  }, [])

  return (
    
    <>
    <Logo></Logo>
    {page === "pond" && (
      <PebbleTossHUD openNewRockMenu={() => setPage("valence")} openLogList={() => setPage("log_list")} openSideEffectJournal={() => setPage("side_effect")}/>
    )}
    {page === "valence" &&(
      <ValenceScreen dismissValenceScreenAndReopenHUD={() => setPage("pond")} goToEnergyBarScreen={() => setPage("throw")}/>
    )}
    {page === "throw" && (
      <ThrowHUD returnToPondHUD={() => setPage("pond")}/>
    )}
     {page === "log_list" &&(
      <PebbleLogListScreen dismissPebbleLogListScreenAndShowHUD={() => setPage("pond")}/>
    )}
     {page === "side_effect" &&(
      <SideEffectsJournalPopup dismissScreenAndReopenHUD={() => setPage("pond")}/>
    )}
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "white"
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
        }}
      />

      {/* UI */}
      <div
        style={{
          position: "fixed",
          left: 20,
          bottom: 20,
          color: "black",
          fontFamily: "sans-serif"
        }}
      >
       
      </div>
    </div>
    </>
  )
}

 /*
        <div>Power</div>

        <input
          type="range"
          min="20"
          max="180"
          defaultValue="90"
          onInput={(
            e: Event & {
                currentTarget: HTMLInputElement
            }
            ) => {
           mouse.current.power =
        Number(e.currentTarget.value)
          }}
        />*/