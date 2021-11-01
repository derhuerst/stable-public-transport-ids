'use strict'

const {grid} = require('./lib/helpers')
const {versionedId} = require('./lib/versioned-id')

const stopIds = (dataSource, normalizeName) => (s) => {
	const stationOrStop = s.station || s
	const nName = normalizeName(stationOrStop.name, stationOrStop)
	const lat = s.location.latitude
	const lon = s.location.longitude
	// todo: stop code, e.g. like in GTFS?
	return [
		s.wikidataId ? [s.wikidataId, 10] : null,
		s.osmId ? [s.osmId, 10] : null,
		[dataSource + ':' + s.id, 20],
		// overlapping grids to ensure we always match nearby pairs
		// todo: breaks closer to/further from the equator
		[[nName, ...grid(lat, lon)].join(':'), 30],
		[[nName, ...grid(lat, lon + .001)].join(':'), 31],
		[[nName, ...grid(lat, lon - .001)].join(':'), 31],
		[[nName, ...grid(lat + .001, lon)].join(':'), 31],
		[[nName, ...grid(lat - .001, lon)].join(':'), 31],
		[[nName, ...grid(lat + .001, lon + .001)].join(':'), 32],
		[[nName, ...grid(lat + .001, lon - .001)].join(':'), 32],
		[[nName, ...grid(lat - .001, lon + .001)].join(':'), 32],
		[[nName, ...grid(lat - .001, lon - .001)].join(':'), 32],
		s.station ? [dataSource + ':station:' + s.station.id, 50] : null,
		// todo: Onestop ID
		// https://github.com/transitland/transitland-datastore/blob/46fedd0d3293fe61ae04e90d0648187dba86064e/app/models/stop.rb#L387-L398
	]
	.filter(id => id !== null)
	.map(([id, specificity]) => [versionedId(id), specificity])
}

module.exports = stopIds
