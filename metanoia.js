const geoip = require('geoip-country-lite')

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
  let ip
  if (req.ip.startsWith('::ffff:')) ip = req.ip.substring(7)
  else ip = req.ip
  console.log(ip)
  res.send(geoip.lookup(ip))
})

app.listen(port, () => console.log(`Metanoia listening on port ${port}`))
