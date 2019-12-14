'use strict'

const {dataVersion: v} = require('./package.json')

const grid = (lat, lon) => [
	Math.round(lat * 1000) / 1000,
	Math.round(lon * 1000) / 1000
].map(x => x.toFixed(4))

const stopIds = (dataSource, normalizeName) => (s) => {
	const nName = normalizeName(s.station && s.station.name || s.name)
	const lat = s.location.latitude
	const lon = s.location.longitude
	return [
		dataSource + ':' + s.id,
		s.station ? dataSource + ':station:' + s.station.id : null,
		// overlapping grids to ensure we always match nearby pairs
		// todo: breaks closer to/further from the equator
		[nName, ...grid(lat, lon)].join(':'),
		[nName, ...grid(lat, lon + .001)].join(':'),
		[nName, ...grid(lat, lon + .002)].join(':'),
		[nName, ...grid(lat + .001, lon)].join(':'),
		[nName, ...grid(lat + .002, lon)].join(':')
	]
	.filter(id => id !== null)
	.map(id => v + ':' + id)
}

module.exports = stopIds
