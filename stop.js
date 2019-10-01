'use strict'

const {dataVersion: v} = require('./package.json')

const grid = (lat, lon, offset) => [
	Math.round((lat + offset) * 100) / 100,
	Math.round((lon + offset) * 100) / 100
].map(x => x.toFixed(2))

const stopIds = (dataSource, normalizeName) => (s) => {
	const nName = normalizeName(s.station && s.station.name || s.name)
	const lat = s.location.latitude
	const lon = s.location.longitude
	return [
		dataSource + ':' + s.id,
		s.station ? dataSource + ':station:' + s.station.id : null,
		// overlapping grids to ensure we always match nearby pairs
		// todo: breaks closer to/further from the equator
		[nName, ...grid(lat, lon, 0)].join(':'),
		[nName, ...grid(lat, lon, .333)].join(':'),
		[nName, ...grid(lat, lon, .666)].join(':')
	]
	.filter(id => id !== null)
	.map(id => v + ':' + id)
}

module.exports = stopIds
