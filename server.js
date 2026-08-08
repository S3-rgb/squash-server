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

	const Canvas = createCanvas(1200, 1200)
	const Ctx = Canvas.getContext("2d")

	Ctx.fillStyle = "#1e1e1e"
	Ctx.fillRect(0, 0, 1200, 1200)

	for (const Stroke of Data.strokes) {
		Ctx.save()
		Ctx.translate(Stroke.X * 2, Stroke.Y * 2)
		Ctx.rotate((Stroke.R * Math.PI) / 180)
		Ctx.fillStyle = "#ffffff"
		Ctx.fillRect(-Stroke.SX, -Stroke.SY, Stroke.SX * 2, Stroke.SY * 2)
		Ctx.restore()
	}

	const Buffer = Canvas.toBuffer("image/png")
	const Form = new FormData()
	
	Form.append("file", Buffer, { filename: "drawing.png" })
	Form.append("payload_json", JSON.stringify({
		content: `Player **${Data.player}** submitted a drawing! Cash Earned: $${Data.cash}`
	}))

	try {
		const Response = await Fetch(DiscordWebhookUrl, {
			method: "POST",
			body: Form,
			headers: Form.getHeaders()
		})
		
		const ResponseText = await Response.text()
		console.log("Discord Status:", Response.status)
		console.log("Discord Response:", ResponseText)

		if (!Response.ok) {
			return Res.status(500).send(ResponseText)
		}
		
		Res.sendStatus(200)
	} catch (Error) {
		console.error("Fetch Error:", Error)
		Res.status(500).send(Error.message)
	}
})

const Port = process.env.PORT || 3000
App.listen(Port, () => {
	console.log(`Server is running on port ${Port}`)
})
