const MongoClient = require('mongodb').MongoClient
const mongoUrl = 'mongodb://localhost:27017/tempdb'

const geoip = require('geoip-country-lite')
const express = require('express')
const app = express()
const port = 3000

/**
 * Retrieves the IP address from the given Request object and if it starts with
 * the ffff prefix, it is stripped from the String and returned. If it doesn't,
 * the IP is returned as is.
 *
 * @param {request} request
 */
const resolveIp = request => {
  if (request.ip.startsWith('::ffff:')) return request.ip.substring(7)
  else return request.ip
}

/**
 * Converts the given MongoDB document to a Battle.net region. The document is
 * retrieved from the MongoDB using the mongoUrl constant.
 *
 * @param {Doc} doc
 */
const convertDocToRegion = doc => {
  switch (doc.region) {
    case 'Americas':
      return Promise.resolve('US')

    case 'Asia':
      switch (doc['alpha-2']) {
        case 'TW':
          return Promise.resolve('TW')

        case 'CN':
          return Promise.resolve('CW')

        case 'KR':
          return Promise.resolve('KR')

        case 'KP':
          return Promise.resolve('KR')

        default:
          return Promise.resolve('EU')
      }

    case 'Oceania':
      if (doc['alpha-2'] === 'AU') return Promise.resolve('US')
      else return Promise.resolve('EU')

    case 'Europe':
      return Promise.resolve('EU')

    default:
      return Promise.resolve('US')
  }
}

/**
 * Connects to the countries mongodb and retrieves the entry for the given
 * country code. Must be a 2 character String, such as 'US', 'KP', or 'JP'. The
 * region is returned via a Promise.
 *
 * @param {String} country
 */
const getRegion = country => {
  return new Promise((resolve, reject) => {
    // Connect to the MongoDB
    MongoClient.connect(mongoUrl, (err, db) => {
      if (err) console.log(err)

      // Find the entry in the database for the given country
      db.collection('countries').findOne({'alpha-2': country}, (err, doc) => {
        if (err) console.log(err)

        // Convert the Mongo doc to the appropriate Battle.net region
        convertDocToRegion(doc).then(region => resolve(region))

        // Output the Mongo doc for debugging
        console.log(doc)
      })
    })
  })
}

app.get('/', (req, res) => {
  const country = geoip.lookup(resolveIp(req)).country
  getRegion(country).then(region => {
    res.send(region)
  })
})

app.listen(port, () => console.log(`Metanoia listening on port ${port}`))
