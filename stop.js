'use strict'

const {grid} = require('./lib/helpers')
const {versionedId} = require('./lib/versioned-id')

const STATION_SPECIFICITY_PENALTY = 20

const createGetStableStopIds = (dataSource, normalizeName) => {
	const getStableStopIds = (s) => {
		// If >1 data source has a stop/station hierarchy, we always want to prefer matching stop IDs with each other. However, if both data sources only have parentless stops/stations, or if hierarchic and non-hierarchic data sources are mixed, we still want to be able to obtain a match.
		const baseSpecificity = s.station ? 0 : STATION_SPECIFICITY_PENALTY

		const stationOrStop = s.station || s
		const nName = normalizeName(stationOrStop.name, stationOrStop)
		const lat = s.location.latitude
		const lon = s.location.longitude
		// todo: stop code, e.g. like in GTFS?

		const stableIds = [
			// third-party IDs
			s.wikidataId ? [s.wikidataId, baseSpecificity + 10] : null,
			s.osmId ? [s.osmId, baseSpecificity + 10] : null,

			// data-source-native ID
			[dataSource + ':' + s.id, baseSpecificity + 20],

			// location-based IDs
			// overlapping grids to ensure we always match nearby pairs
			// todo: breaks closer to/further from the equator
			...(nName ? [
				[[nName, ...grid(lat, lon)].join(':'), baseSpecificity + 30],
				[[nName, ...grid(lat, lon + .001)].join(':'), baseSpecificity + 31],
				[[nName, ...grid(lat, lon - .001)].join(':'), baseSpecificity + 31],
				[[nName, ...grid(lat + .001, lon)].join(':'), baseSpecificity + 31],
				[[nName, ...grid(lat - .001, lon)].join(':'), baseSpecificity + 31],
				[[nName, ...grid(lat + .001, lon + .001)].join(':'), baseSpecificity + 32],
				[[nName, ...grid(lat + .001, lon - .001)].join(':'), baseSpecificity + 32],
				[[nName, ...grid(lat - .001, lon + .001)].join(':'), baseSpecificity + 32],
				[[nName, ...grid(lat - .001, lon - .001)].join(':'), baseSpecificity + 32],
			] : []),

			// todo: Onestop ID
			// https://github.com/transitland/transitland-datastore/blob/46fedd0d3293fe61ae04e90d0648187dba86064e/app/models/stop.rb#L387-L398
		]

		// parent-station-based IDs with lower specificity
		if (s.station) {
			stableIds.push([
				dataSource + ':station:' + s.station.id,
				baseSpecificity + STATION_SPECIFICITY_PENALTY + 30,
			])
		}

		return stableIds
		.filter(id => id !== null)
		.map(([id, specificity]) => [versionedId(id), specificity])
	}
	return getStableStopIds
}

module.exports = createGetStableStopIds
