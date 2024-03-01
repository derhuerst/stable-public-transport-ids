'use strict'

const {grid} = require('./lib/helpers')
const {versionedId} = require('./lib/versioned-id')

const STATION_SPECIFICITY_PENALTY = 20

const createGetStableStopIds = (dataSource, normalizeName) => {
	const getStableStopIds = (s) => {
		const stationOrStop = s.station || s
		const nName = normalizeName(stationOrStop.name, stationOrStop)
		const lat = s.location.latitude
		const lon = s.location.longitude
		// todo: stop code, e.g. like in GTFS?

		const stableIds = [
			// third-party IDs
			s.wikidataId ? [s.wikidataId, 10] : null,
			s.osmId ? [s.osmId, 10] : null,

			// data-source-native ID
			[dataSource + ':' + s.id, 20],

			// location-based IDs
			// overlapping grids to ensure we always match nearby pairs
			// todo: breaks closer to/further from the equator
			...(nName ? [
				[[nName, ...grid(lat, lon)].join(':'), 30],
				[[nName, ...grid(lat, lon + .001)].join(':'), 31],
				[[nName, ...grid(lat, lon - .001)].join(':'), 31],
				[[nName, ...grid(lat + .001, lon)].join(':'), 31],
				[[nName, ...grid(lat - .001, lon)].join(':'), 31],
				[[nName, ...grid(lat + .001, lon + .001)].join(':'), 32],
				[[nName, ...grid(lat + .001, lon - .001)].join(':'), 32],
				[[nName, ...grid(lat - .001, lon + .001)].join(':'), 32],
				[[nName, ...grid(lat - .001, lon - .001)].join(':'), 32],
			] : []),

			// todo: Onestop ID
			// https://github.com/transitland/transitland-datastore/blob/46fedd0d3293fe61ae04e90d0648187dba86064e/app/models/stop.rb#L387-L398
		]

		// parent-station-based IDs with lower specificity
		if (s.station) {
			stableIds.push([
				dataSource + ':station:' + s.station.id,
				STATION_SPECIFICITY_PENALTY + 30,
			])
		}

		return stableIds
		.filter(id => id !== null)
		.map(([id, specificity]) => [versionedId(id), specificity])
	}
	return getStableStopIds
}

module.exports = createGetStableStopIds
