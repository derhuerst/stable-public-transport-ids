'use strict'

const {dataVersion: v} = require('./package.json')
const {grid} = require('./lib/helpers')

const stopIds = (dataSource, normalizeName) => (s) => {
	const nName = normalizeName(s.station && s.station.name || s.name)
	const lat = s.location.latitude
	const lon = s.location.longitude
	return [
		s.wikidataId || null,
		s.osmId || null,
		dataSource + ':' + s.id,
		s.station ? dataSource + ':station:' + s.station.id : null,
		// overlapping grids to ensure we always match nearby pairs
		// todo: breaks closer to/further from the equator
		[nName, ...grid(lat, lon)].join(':'),
		[nName, ...grid(lat, lon + .001)].join(':'),
		[nName, ...grid(lat, lon + .002)].join(':'),
		[nName, ...grid(lat + .001, lon)].join(':'),
		[nName, ...grid(lat + .002, lon)].join(':')
		// todo: Onestop ID
		// https://github.com/transitland/transitland-datastore/blob/46fedd0d3293fe61ae04e90d0648187dba86064e/app/models/stop.rb#L387-L398
	]
	.filter(id => id !== null)
	.map(id => v + ':' + id)
}

module.exports = stopIds
