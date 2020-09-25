'use strict'

const {default: _centerOfMass} = require('@turf/center-of-mass')
const {point} = require('@turf/helpers')
const {default: distance} = require('@turf/distance')
const {deepStrictEqual} = require('assert')

const centerOfMass = (area) => {
	const center = _centerOfMass(area)
	const [longitude, latitude] = center.geometry.coordinates
	return {latitude, longitude}
}

const bboxSize = (bbox) => {
	const nw = point([bbox[0], bbox[3]])
	const sw = point([bbox[0], bbox[1]])
	const ne = point([bbox[2], bbox[3]])
	return {
		width: distance(nw, ne, {units: 'meters'}),
		height: distance(nw, sw, {units: 'meters'})
	}
}

const grid = (lat, lon) => [
	(Math.round(lat * 1000) / 1000).toFixed(4),
	(Math.round(lon * 1000) / 1000).toFixed(4)
]

// [1,2], [3,4] -> [[1,3], [1,4], [2,3], [2,4]]
const matrix = (n, m) => m.reduce((l, m) => {
	return [...l, ...n.map(n => [n, m])]
}, [])

const transpose = (cols) => {
	const width = cols.length
	const height = cols[0].length

	const rows = new Array(height)
	for (let y = 0; y < height; y++) {
		rows[y] = new Array(width)
		for (let x = 0; x < width; x++) {
			rows[y][x] = cols[x][y]
		}
	}
	return rows
}
deepStrictEqual(transpose([
	[1, 2, 3], [10, 20, 30], [100, 200, 300],
]), [
	[1, 10, 100], [2, 20, 200], [3, 30, 300],
])

module.exports = {
	centerOfMass,
	bboxSize,
	grid,
	matrix,
	transpose,
}
