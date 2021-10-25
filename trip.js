'use strict'

const {unique: hash} = require('shorthash')
const {matrix, transpose} = require('./lib/helpers')
const {versionedId} = require('./lib/versioned-id')

// todo: use these IDs without version prefix
const tripIds = (dataSource, lineIds, depsIds, arrsIds) => (_) => {
	if (!Array.isArray(depsIds)) {
		throw new Error('depsIds must be an array')
	}

	// todo: line.adminCode?
	const byFahrtNr = _.line.fahrtNr
		? lineIds.map(lineId => lineId + ':' + _.line.fahrtNr)
		: []

	let ids = [
		_.id ? dataSource + ':' + _.id : null,
		...byFahrtNr,
		// todo: use _.direction?
	]

	if (depsIds.length > 0) {
		if (!Array.isArray(depsIds[0])) {
			throw new Error('depsIds[0] must be an array')
		}

		// This assumes that there are no two vehicles
		// - running for the same line
		// - with the same departure IDs at their first station
		// todo: this is not always true, find a solution
		const byLineFirstDep = matrix(lineIds, depsIds[0])
		.map(id => id.join(':'))

		// This assumes that there are no two vehicles
		// - with the same departure IDs at all their stations
		// todo: this is not very helpful if one of the departures is
		// missing a certain "kind" of ID
		const byAllDeps = transpose(depsIds)
		.filter(ids => ids.every(id => !!id))
		.map(ids => hash(ids.join(':')))

		ids = [
			...ids,
			...byLineFirstDep,
			...byAllDeps,
		]
	}

	if (arrsIds.length > 0) {
		if (!Array.isArray(arrsIds[0])) {
			throw new Error('arrsIds[0] must be an array')
		}

		// This assumes that there are no two vehicles
		// - running for the same line
		// - with the same arrival IDs at their first station
		// todo: this is not always true, find a solution
		const byLineFirstArr = matrix(lineIds, arrsIds[0])
		.map(id => id.join(':'))

		// This assumes that there are no two vehicles
		// - with the same arrival IDs at all their stations
		// todo: this is not very helpful if one of the arrivals is
		// missing a certain "kind" of ID
		const byAllArrs = transpose(arrsIds)
		.filter(ids => ids.every(id => !!id))
		.map(ids => hash(ids.join(':')))

		ids = [
			...ids,
			...byLineFirstArr,
			...byAllArrs,
		]
	}

	return ids
	.filter(id => id !== null)
	.map(versionedId)
}

module.exports = tripIds
