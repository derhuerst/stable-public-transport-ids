import {unique as hash} from 'shorthash'
import {matrix, transpose} from './lib/helpers.js'
import {versionedId, idWithoutVersion as unversionedId} from './lib/versioned-id.js'

const maxSpecif = (ids) => {
	let max = 0
	for (let i = 0; i < ids.length; i++) {
		const specif = ids[i][1]
		if (specif > max) max = specif
	}
	return max
}

// todo: use these IDs without version prefix
const tripIds = (dataSource, lineIds, depsIds, arrsIds) => (_) => {
	if (!Array.isArray(depsIds)) {
		throw new Error('depsIds must be an array')
	}

	// todo: line.adminCode?
	const byLineIdFahrtNr = _.line.fahrtNr
		? lineIds.map(([lineId, lineSpecif]) => [lineId + ':' + _.line.fahrtNr, lineSpecif + 30])
		: []

	let ids = [
		_.id ? [dataSource + ':' + _.id, 20] : null,
		...byLineIdFahrtNr,
		// todo: use _.direction?
		// todo: use geographical shape?
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
		.map(([[lineId, lineSpecif], [dep0Id, dep0Specif]]) => [
			[
				'dep0',
				unversionedId(lineId),
				unversionedId(dep0Id),
			].join(':'),
			lineSpecif + dep0Specif + 21,
		])

		// This assumes that there are no two vehicles
		// - with the same departure IDs at all their stations
		// todo: this is not very helpful if one of the departures is
		// missing a certain "kind" of ID
		// enumerate all possible permutations?
		const byAllDeps = transpose(depsIds)
		.filter(ids => ids.every(id => !!id))
		.map((ids) => [
			'some-dep:' + hash(ids.map(([id]) => unversionedId(id)).join(':')),
			maxSpecif(ids) + 20, // pick highest=weakest specificity of all departures
		])

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
		.map(([[lineId, lineSpecif], [arr0Id, arr0Specif]]) => [
			[
				'arr0',
				unversionedId(lineId),
				unversionedId(arr0Id),
			].join(':'),
			lineSpecif + arr0Specif + 21,
		])

		// This assumes that there are no two vehicles
		// - with the same arrival IDs at all their stations
		// todo: this is not very helpful if one of the arrivals is
		// missing a certain "kind" of ID
		// enumerate all possible permutations?
		const byAllArrs = transpose(arrsIds)
		.filter(ids => ids.every(id => !!id))
		.map((ids) => [
			'some-arr:' + hash(ids.map(([id]) => unversionedId(id)).join(':')),
			maxSpecif(ids) + 20, // pick highest=weakest specificity of all arrivals
		])

		ids = [
			...ids,
			...byLineFirstArr,
			...byAllArrs,
		]
	}

	return ids
	.filter(id => id !== null)
	.map(([id, specificity]) => [versionedId(id), specificity])
}

export {
	tripIds as createGetStableTripIds,
}
