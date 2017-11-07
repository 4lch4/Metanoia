const geoip = require('geoip-country-lite')
const express = require('express')
const path = require('path')
const app = express()
const port = 3000

const resolveIp = request => {
  if (request.ip.startsWith('::ffff:')) return request.ip.substring(7)
  else return request.ip
}

app.get('/', (req, res) => {
  const ip = resolveIp(req)
  console.log(ip)

  res.sendFile(path.join(__dirname, '/index.html'))
})

app.listen(port, () => console.log(`Metanoia listening on port ${port}`))
