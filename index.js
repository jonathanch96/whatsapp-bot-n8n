require('dotenv').config() // Load .env
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js')
const qrcode = require('qrcode')
const express = require('express')
const axios = require('axios')

const app = express()
app.use(express.json())
let latestQr = null

const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: process.env.SESSION_PATH || './LocalAuth',
  }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
})

console.log('Using session path:', process.env.SESSION_PATH + '/LocalAuth')

client.on('qr', (qr) => {
  latestQr = qr
  console.log('QR RECEIVED', qr)
})

client.on('ready', () => {
  console.log('Client is ready!')
})

client.on('message', async (msg) => {
  if (msg.body === '!ping') {
    msg.reply('pong')
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) return

  let mediaDataArray = []

  if (msg.hasMedia || msg.type === 'image') {
    try {
      const media = await msg.downloadMedia()
      if (media) {
        mediaDataArray.push({
          mimetype: media.mimetype,
          data: media.data,
          filename: media.filename || 'media',
        })
      }
    } catch (err) {
      console.error('[ERROR] Failed to download media:', err.message)
    }
  }

  //   does't support video and audio
  if (msg.type === 'video' || msg.type === 'audio') {
    return
  }

  try {
    await axios.post(webhookUrl, {
      from: msg.from,
      to: msg.to,
      body: msg.body,
      timestamp: msg.timestamp,
      type: msg.type,
      id: msg.id._serialized,
      media: mediaDataArray,
    })
  } catch (error) {
    console.error('Error forwarding to n8n webhook:', error.message)
  }
})

client.initialize()

app.get('/', async (req, res) => {
  if (!latestQr) {
    return res.send('No QR generated yet or already scanned.')
  }
  const qrImg = await qrcode.toDataURL(latestQr)
  res.send(`<h2>Scan QR with WhatsApp</h2><img src="${qrImg}" />`)
})

app.post('/send', async (req, res) => {
  const { to, message } = req.body
  if (!to || !message) {
    return res
      .status(400)
      .json({ error: 'Missing "to" or "message" in request body' })
  }
  try {
    await client.sendMessage(to, message)
    res.json({ status: 'Message sent' })
  } catch (err) {
    console.error('Error sending message:', err.message)
    res.status(500).json({ error: 'Failed to send message' })
  }
})

app.listen(3000, () =>
  console.log('QR server running on http://localhost:3000')
)
