'use strict'

const {default: _centerOfMass} = require('@turf/center-of-mass')
const {point} = require('@turf/helpers')
const {default: distance} = require('@turf/distance')

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

module.exports = {
	centerOfMass,
	bboxSize,
	grid
}
