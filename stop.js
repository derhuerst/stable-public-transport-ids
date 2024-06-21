import {grid} from './lib/helpers.js'
import {versionedId, versionPrefixLength} from './lib/versioned-id.js'

const STATION_SPECIFICITY_PENALTY = 50

const createGetStableStopIds = (namespace, normalizeName) => {
	const _getStableStopIds = (s, baseSpecificity) => {
		const nName = s.name ? normalizeName(s.name, s) : null
		const lat = s.location.latitude
		const lon = s.location.longitude
		// todo: stop code, e.g. like in GTFS?

		const stableIds = [
			// third-party IDs
			// todo: lower-case?
			s.wikidataId ? [s.wikidataId, baseSpecificity + 10] : null,
			s.osmId ? [s.osmId, baseSpecificity + 10] : null,

			// data-source-native ID
			[namespace + ':' + s.id, baseSpecificity + 20],

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
			const _stationIds = _getStableStopIds(
				s.station,
				baseSpecificity + STATION_SPECIFICITY_PENALTY,
			)

			stableIds.push(
				// These IDs a clearly marked as only describing the stop's parent station …
				..._stationIds.map(([id, specificity]) => [
					// add `station:` prefix to already versioned ID
					id.slice(0, versionPrefixLength) + 'station:' + id.slice(versionPrefixLength),
					specificity,
				]),
				// … but it might be that another data source only has the parent station, so that its stable IDs would never match our "parent-station-based" IDs. So we add regular ones along with an even lower specificity.
				..._stationIds.map(([id, specificity]) => [
					id,
					STATION_SPECIFICITY_PENALTY + specificity,
				]),
			)
		}

		return stableIds
		.filter(id => id !== null)
		.map(([id, specificity]) => [versionedId(id), specificity])
	}

	const getStableStopIds = (s) => {
		// If >1 data source has a stop/station hierarchy, we always want to prefer matching stop IDs with each other, "locally". However, if both data sources only have parentless stops/stations, or if hierarchic and non-hierarchic data sources are mixed, we still want to be able to obtain a match.
		const baseSpecificity = s.station ? 0 : STATION_SPECIFICITY_PENALTY
		return _getStableStopIds(s, baseSpecificity)
	}
	return getStableStopIds
}

export {
	createGetStableStopIds,
}
