import {matrix} from './lib/helpers.js'
import {versionedId, idWithoutVersion as unversionedId} from './lib/versioned-id.js'

// todo: use these IDs without version prefix
const createGetStableArrivalDepartureIds = (stopIds, tripIds, routeIds, lineIds, normalizePlatform) => (type, _) => {
	const when = Math.round(Date.parse(_.plannedWhen) / 1000)
	const platform = _.plannedPlatform
		? normalizePlatform(_.plannedPlatform, _)
		: null

	// todo: arr time
	const byStopAndTrip = matrix(stopIds, tripIds)
	.map(([[stopId, stopSpecif], [tripId, tripSpecif]]) => [
		versionedId([
			type.slice(0, 3),
			unversionedId(stopId),
			unversionedId(tripId),
		].join(':')),
		stopSpecif + tripSpecif + 20,
	])

	// This assumes that there are no two vehicles
	// - running for the same route,
	// - stopping at the same stop/station,
	// - at the same time.
	const fuzzyByRoute = !Number.isNaN(when)
		? matrix(stopIds, routeIds).map(([[stopId, stopSpecif], [routeId, routeSpecif]]) => [
			versionedId([
				type.slice(0, 3),
				unversionedId(stopId),
				unversionedId(routeId),
				when,
			].join(':')),
			stopSpecif + routeSpecif + 30,
		])
		: []

	// This assumes that there are no two vehicles
	// - running for the same line,
	// - stopping at the same stop/station,
	// - at the same platform,
	// - at the same time.
	const fuzzyByLine = !Number.isNaN(when) && platform
		? matrix(stopIds, lineIds).map(([[stopId, stopSpecif], [lineId, lineSpecif]]) => [
			versionedId([
				type.slice(0, 3),
				unversionedId(stopId),
				unversionedId(lineId),
				when,
				platform,
			].join(':')),
			stopSpecif + lineSpecif + 30,
		])
		: []

	return [
		...byStopAndTrip,
		...fuzzyByRoute,
		...fuzzyByLine
	]
}

const createGetStableArrivalIds = (...args) => {
	const getStableArrivalIds = createGetStableArrivalDepartureIds(...args).bind(null, 'arrival')
	return getStableArrivalIds
}
const createGetStableDepartureIds = (...args) => {
	const getStableDepartureIds = createGetStableArrivalDepartureIds(...args).bind(null, 'departure')
	return getStableDepartureIds
}

export {
	createGetStableArrivalDepartureIds,
	createGetStableArrivalIds,
	createGetStableDepartureIds,
}
