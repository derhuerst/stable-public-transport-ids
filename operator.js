'use strict'

const {default: centerOfMass} = require('@turf/center-of-mass')
const {default: bbox} = require('@turf/bbox')
const {default: distance} = require('@turf/distance')
const {point} = require('@turf/helpers')
const {encode: toGeohash} = require('ngeohash')

// We don't follow the OneStop ID scheme exactly, so we prefix IDs
// with a custom version to indicate that they are proprietary.
// see also derhuerst/stable-public-transport-ids#2
const CUSTOM_ONESTOP_PREFIX = 'custom'

// https://transit.land/documentation/onestop-id-scheme/
const ONESTOP_OPERATOR_PREFIX = 'o'

const areaBbox = (area) => {
	// https://tools.ietf.org/html/rfc7946#section-5
	if (Array.isArray(area.bbox)) return area.bbox
	const center = centerOfMass(area)
	const [lon, lat] = center.geometry.coordinates
	return bbox(area)
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

// https://github.com/mi-sec/geonet-geohash/blob/0fc1387a79f57e48d04620560af7894a49d83bbd/README.md
const precisions = [
	[5000e3, 5000e3, 1], // 5km x 5km
	[1250e3, 625e3,  2],
	[156e3,  156e3,  3],
	[39.1e3, 19.5e3, 4],
	[4.89e3, 4.89e3, 5],
	[1.22e3, 0.61e3, 6],
	[153,    153,    7],
	[38.2,   19.1,   8],
	[4.77,   4.77,   9]
]

// This roughly follows the OneStop operator ID scheme.
// https://transit.land/documentation/onestop-id-scheme/
// todo: standalone, verified & unit-tested implementation
const operatorGeohash = (area) => {
	// using the bounding box is very sensitive to remote specks of
	// the service area changing over time
	// todo: improve this
	const bbox = areaBbox(area)
	const {width, height} = bboxSize(bbox)

	// rather pick a too low precision
	const level = precisions.find(([w, h]) => w <= width || h <= height)
	const precision = level ? level[2] : 1

	const center = centerOfMass(area)
	const [lon, lat] = center.geometry.coordinates
	return toGeohash(lat, lon, precision)
}

const operatorIds = (dataSource, normalizeName) => (o) => {
	let onestopId = null
	if (o.serviceArea) {
		onestopId = [
			CUSTOM_ONESTOP_PREFIX,
			ONESTOP_OPERATOR_PREFIX,
			operatorGeohash(o.serviceArea),
			normalizeName(o.name).replace(/-/, '').replace(/\W/, '~')
		].join('-')
	}

	return [
		onestopId
		// todo: other IDs
	].filter(id => id !== null)
}

module.exports = operatorIds
