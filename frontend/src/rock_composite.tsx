import "./rock_composite.css";
type RockCompositeProps = {
	hat: number;
	eyes: number;
	base: number;
	tint: string;
};
export function RockComposite({ hat, eyes, base, tint }: RockCompositeProps) {
	const src_link = "./assets/rocks/";
	const hat_src_img = src_link + "hat" + hat.toString() + ".png";
	const eye_src_img = src_link + "eye" + eyes.toString() + ".png";
	const base_src_img = src_link + "body" + base.toString() + ".png";

	return (
		<div className="avatarContainer">
			<img id="hat" src={hat_src_img} className="layer" />
			<img id="eye" src={eye_src_img} className="layer" />
			<img id="base" src={base_src_img} className="layer" />

			<div className="colorOverlay" style={{ backgroundColor: tint }} />
		</div>
	);
}
