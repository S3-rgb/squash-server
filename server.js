const Express = require("express")
const { createCanvas } = require("canvas")
const Fetch = require("node-fetch")
const FormData = require("form-data")

const App = Express()
App.use(Express.json({ limit: "5mb" }))

const DiscordWebhookUrl = "https://discordapp.com/api/webhooks/1535665516176351402/ySREsk2L4X-1e-FjefelOhb9kKYkq3LdS8dwf0BvYH49HqCwFZ8nLtxkbOLcWMMN1N4s"

App.post("/submit-drawing", async (Req, Res) => {
	const Data = Req.body
	if (!Data || !Data.player || !Data.strokes) {
		return Res.status(400).send("Invalid data")
	}

	const Canvas = createCanvas(1920, 1080)
	const Ctx = Canvas.getContext("2d")

	Ctx.fillStyle = "#1e1e1e"
	Ctx.fillRect(0, 0, 1920, 1080)

	const Scale = 1.5

	for (const Stroke of Data.strokes) {
		Ctx.save()
		Ctx.translate(Stroke.X * Scale, Stroke.Y * Scale)
		Ctx.rotate((Stroke.R * Math.PI) / 180)
		Ctx.fillStyle = "#ffffff"
		Ctx.fillRect(-Stroke.SX * Scale, -Stroke.SY * Scale, Stroke.SX * Scale * 2, Stroke.SY * Scale * 2)
		Ctx.restore()
	}

	const Buffer = Canvas.toBuffer("image/png")
	const Form = new FormData()
	
	Form.append("file", Buffer, { filename: "drawing.png" })
	Form.append("payload_json", JSON.stringify({
		content: `Player **${Data.player}** submitted a drawing! Cash Earned: $${Data.cash}`
	}))

	try {
		await Fetch(DiscordWebhookUrl, {
			method: "POST",
			body: Form,
			headers: Form.getHeaders()
		})
		Res.sendStatus(200)
	} catch (Error) {
		console.error(Error)
		Res.sendStatus(500)
	}
})

const Port = process.env.PORT || 3000
App.listen(Port, () => {
	console.log(`Server is running on port ${Port}`)
})
