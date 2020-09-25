'use strict'

const {matrix} = require('./lib/helpers')
const {versionedId} = require('./lib/versioned-id')

// todo: use these IDs without version prefix
const arrivalDepartureIds = (stopIds, tripIds, routeIds, lineIds, normalizePlatform) => (type, _) => {
	const when = Math.round(Date.parse(_.plannedWhen) / 1000)
	const platform = _.plannedPlatform
		? normalizePlatform(_.plannedPlatform, _)
		: null

	// This assumes that there are no two vehicles
	// - running for the same route,
	// - stopping at the same station,
	// - at the same time.
	const fuzzyByRoute = !Number.isNaN(when)
		? matrix(stopIds, routeIds).map(id => [...id, when])
		: []

	// This assumes that there are no two vehicles
	// - running for the same line,
	// - stopping at the same station,
	// - at the same platform,
	// - at the same time.
	const fuzzyByLine = !Number.isNaN(when) && platform
		? matrix(stopIds, lineIds).map(id => [...id, when, platform])
		: []
	return [
		...matrix(stopIds, tripIds), // todo: arr time
		...fuzzyByRoute,
		...fuzzyByLine
	]
	.map(id => versionedId([type, ...id].join(':')))
}

module.exports = arrivalDepartureIds
