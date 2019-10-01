'use strict'

const {dataVersion: v} = require('./package.json')

// [1,2], [3,4] -> [[1,3], [1,4], [2,3], [2,4]]
const matrix = (n, m) => m.reduce((l, m) => {
	return [...l, ...n.map(n => [n, m])]
}, [])

const arrivalDepartureIds = (stopIds, tripIds, routeIds, lineIds, normalizePlatform) => (type, _) => {
	const when = new Date(_.plannedWhen) / 1000 | 0
	const platform = _.plannedPlatform ? normalizePlatform(_.plannedPlatform) : null

	// This assumes that no two vehicles
	// - running for the same route
	// - stop at the same station
	// - at the same time.
	const fuzzyByRoute = !Number.isNaN(when)
		? matrix(stopIds, routeIds).map(id => [...id, when])
		: []

	// This assumes that no two vehicles
	// - running for the same line
	// - stop at the same station
	// - at the same platform
	// - at the same time.
	const fuzzyByLine = !Number.isNaN(when) && platform
		? matrix(stopIds, lineIds).map(id => [...id, when, platform])
		: []
	return [
		...matrix(stopIds, tripIds),
		...fuzzyByRoute,
		...fuzzyByLine
	].map(id => [v, type, ...id].join(':'))
}

module.exports = arrivalDepartureIds
