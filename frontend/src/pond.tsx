import { useEffect, useRef, useState } from "react";
import stone from "./assets/stone.png";
import { Logo } from "./logo";
import { PebbleTossHUD, ThrowHUD } from "./pebble_toss_hud.tsx";
import { PebbleLogListScreen } from "./pebbles_log_list.tsx";
import { SideEffectsJournalPopup } from "./side_effects_popup.tsx";
import { ValenceScreen } from "./valence_screen.tsx";

interface Ripple {
	x: number;
	y: number;
	radius: number;
	alpha: number;
	growth: number;

	color: string;
}
interface Stain {
	x: number;
	y: number;
	radius: number;
	alpha: number;

	color: string;
}

interface Point {
	x: number;
	y: number;
}

interface Stone {
	active: boolean;

	points: Point[];

	current: number;
	progress: number;

	x: number;
	y: number;

	sinkX: number;
	sinkY: number;

	value: number;
}

export function Pond() {
	const [page, setPage] = useState("pond");
	const [hat, setHat] = useState(0);
	const [eyes, setEyes] = useState(0);
	const [base, setBase] = useState(0);
	const widthRef = useRef(0);
	const heightRef = useRef(0);
	const [valence, setValence] = useState(0);

	const setTintValence = (_value: string) => {};
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	const ripples = useRef<Ripple[]>([]);
	const stains = useRef<Stain[]>([]);
	const stones = useRef<Stone[]>([]);

	const receiveAndSetValence = (val: number) => {
		setValence(val);
	};

	const receiveEnergyAndThrowRock = (energy: number) => {
		throwStone(valence, energy);

		console.log("got here: valence: " + valence + " energy: " + energy);
		setPage("pond");
	};
	const goToValenceScreen = () => {
		randomizeRock();
		setPage("valence");
	};
	const randomizeRock = () => {
		setHat(Math.floor(Math.random() * 4) + 1);
		setEyes(Math.floor(Math.random() * 4) + 1);
		setBase(Math.floor(Math.random() * 4) + 1);
	};
	const throwStone = (xPercent: number, powerPercent: number) => {
		const width = widthRef.current;
		const height = heightRef.current;

		const targetX = (xPercent / 100) * width;

		const startX = width * 0.5 + (Math.random() - 0.5) * 40;

		const startY = height + 80;
		const normalizedPower = 0.12 + (powerPercent / 100) * 0.88;

		const distance = normalizedPower * height;

		const skips = Math.max(1, Math.floor(1 + powerPercent / 22));
		const spacing = distance / skips;

		const points: Point[] = [];

		for (let i = 0; i < skips; i++) {
			const progress = i / skips;

			points.push({
				x: lerp(startX, targetX, progress) + (Math.random() - 0.5) * 25,

				y: startY - spacing * (i + 1) + (Math.random() - 0.5) * 15,
			});
		}

		stones.current.push({
			active: true,

			points,
			current: 0,
			progress: 0,

			x: startX,
			y: startY,

			sinkX: points[points.length - 1].x,

			sinkY: points[points.length - 1].y,

			value: valence,
		});
	};

	// ---------------------------------
	// Helpers
	// ---------------------------------
	const lerp = (a: number, b: number, t: number) => {
		return a + (b - a) * t;
	};

	const easeOutCubic = (t: number) => {
		return 1 - (1 - t) ** 3;
	};

	const getColorFromValue = (value: number) => {
		const gradient = [
			{
				stop: 0,
				color: {
					r: 31,
					g: 154,
					b: 194,
				},
			},

			{
				stop: 100,
				color: {
					r: 243,
					g: 180,
					b: 56,
				},
			},
		];

		for (let i = 0; i < gradient.length - 1; i++) {
			const a = gradient[i];
			const b = gradient[i + 1];

			if (value >= a.stop && value <= b.stop) {
				const t = (value - a.stop) / (b.stop - a.stop);

				const r = Math.round(a.color.r + (b.color.r - a.color.r) * t);

				const g = Math.round(a.color.g + (b.color.g - a.color.g) * t);

				const blue = Math.round(a.color.b + (b.color.b - a.color.b) * t);

				return `rgb(${r}, ${g}, ${blue})`;
			}
		}

		return "white";
	};

	useEffect(() => {
		const stoneImage = new Image();

		stoneImage.src = stone;

		const canvas = canvasRef.current;

		if (!canvas) return;

		const ctx = canvas.getContext("2d");

		if (!ctx) return;

		let width = 0;
		let height = 0;

		// ---------------------------------
		// Resize
		// ---------------------------------
		const resize = () => {
			widthRef.current = window.innerWidth;
			heightRef.current = window.innerHeight;

			width = widthRef.current;
			height = heightRef.current;

			canvas.width = width;
			canvas.height = height;
		};
		resize();

		window.addEventListener("resize", resize);

		// ---------------------------------
		// Ripple
		// ---------------------------------
		const createRipple = (
			x: number,
			y: number,
			value: number,
			size: number = 10,
		) => {
			ripples.current.push({
				x,
				y,
				radius: 5,
				alpha: 0.7,
				growth: 0.7 * size,

				color: getColorFromValue(value),
			});
		};
		// ---------------------------------
		// Dye Stain
		// ---------------------------------
		const createStain = (x: number, y: number, value: number) => {
			stains.current.push({
				x,
				y,
				radius: 20 + Math.random() * 30,
				alpha: 0.4,
				color: getColorFromValue(value),
			});
		};

		// ---------------------------------
		// Water Texture
		// ---------------------------------
		let time = 0;

		const drawWater = () => {
			ctx.fillStyle = "white";
			ctx.fillRect(0, 0, width, height);

			ctx.fillRect(0, 0, width, height);

			ctx.strokeStyle = "black";
			ctx.lineWidth = 1;

			// subtle moving contour lines
			for (let row = 0; row < height; row += 28) {
				ctx.beginPath();

				for (let x = 0; x <= width; x += 12) {
					const y =
						row +
						Math.sin(x * 0.008 + time + row * 0.02) * 2 +
						Math.sin(x * 0.02 + time * 0.5) * 1.5;

					if (x === 0) {
						ctx.moveTo(x, y);
					} else {
						ctx.lineTo(x, y);
					}
				}

				ctx.globalAlpha = 0.15;
				ctx.stroke();
			}

			ctx.globalAlpha = 1;
		};

		// ---------------------------------
		// Animation
		// ---------------------------------
		const animate = () => {
			time += 0.01;

			drawWater();

			// ---------------------------------
			// Ambient Ripples
			// ---------------------------------
			if (Math.random() < 0.02) {
				createRipple(Math.random() * width, Math.random() * height, 50, 3);
			}

			// ---------------------------------
			// Stains
			// ---------------------------------
			for (const stain of stains.current) {
				ctx.save();

				ctx.globalAlpha = stain.alpha;

				ctx.fillStyle = stain.color;
				ctx.shadowColor = stain.color;
				ctx.shadowBlur = 25;

				ctx.beginPath();

				ctx.arc(stain.x, stain.y, stain.radius, 0, Math.PI * 2);

				ctx.fill();

				ctx.restore();
			}

			// ---------------------------------
			// Ripples
			// ---------------------------------
			ripples.current = ripples.current.filter((ripple) => ripple.alpha > 0.01);

			for (const ripple of ripples.current) {
				ripple.radius += ripple.growth;
				ripple.alpha *= 0.986;

				ctx.save();

				ctx.globalAlpha = ripple.alpha;

				ctx.beginPath();

				ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);

				ctx.strokeStyle = ripple.color;
				ctx.lineWidth = 1;

				ctx.stroke();

				ctx.restore();
			}

			// ---------------------------------
			// Stones
			// ---------------------------------
			for (const stone of stones.current) {
				if (!stone.active) continue;

				const target = stone.points[stone.current];

				const start =
					stone.current === 0
						? {
								x: stone.x,
								y: stone.y,
							}
						: stone.points[stone.current - 1];

				stone.progress += 0.035;

				const t = easeOutCubic(stone.progress);

				const x = lerp(start.x, target.x, t);

				const y = lerp(start.y, target.y, t);

				// shadow
				ctx.save();

				ctx.globalAlpha = 0.08;

				ctx.beginPath();

				ctx.ellipse(x, y + 10, 10, 4, 0, 0, Math.PI * 2);

				ctx.fillStyle = "black";
				ctx.fill();

				ctx.restore();

				ctx.save();

				ctx.translate(x, y);

				ctx.rotate(t * Math.PI * 2);

				ctx.drawImage(stoneImage, -16, -16, 32, 32);

				ctx.restore();

				// trail ripple
				if (Math.random() < 0.25) {
					createRipple(x, y, stone.value, 4);
				}

				// impact
				if (stone.progress >= 1) {
					createRipple(target.x, target.y, 5);

					stone.current++;
					stone.progress = 0;

					// sink
					if (stone.current >= stone.points.length) {
						stone.active = false;

						createRipple(stone.sinkX, stone.sinkY, 3);

						createStain(stone.sinkX, stone.sinkY, stone.value);
					}
				}
			}

			requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", resize);
		};
	}, []);

	return (
		<>
			<Logo></Logo>
			{page === "pond" && (
				<PebbleTossHUD
					openNewRockMenu={goToValenceScreen}
					openLogList={() => setPage("log_list")}
					openSideEffectJournal={() => setPage("side_effect")}
				/>
			)}
			{page === "valence" && (
				<ValenceScreen
					dismissValenceScreenAndReopenHUD={() => setPage("pond")}
					hat={hat}
					eyes={eyes}
					base={base}
					setTintFromValence={setTintValence}
					setValenceThrow={receiveAndSetValence}
					goToEnergyBarScreen={() => setPage("throw")}
				/>
			)}
			{page === "throw" && (
				<ThrowHUD
					returnToPondHUD={() => setPage("pond")}
					receiveEnergyAndThrowRock={receiveEnergyAndThrowRock}
				/>
			)}
			{page === "log_list" && (
				<PebbleLogListScreen
					dismissPebbleLogListScreenAndShowHUD={() => setPage("pond")}
				/>
			)}
			{page === "side_effect" && (
				<SideEffectsJournalPopup
					dismissScreenAndReopenHUD={() => setPage("pond")}
				/>
			)}
			<div
				style={{
					width: "100vw",
					height: "100vh",
					overflow: "hidden",
					background: "white",
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
						fontFamily: "sans-serif",
					}}
				></div>
			</div>
		</>
	);
}
