'use strict'

const slugg = require('slugg')
const getOperatorIds = require('./operator')
const getStopIds = require('./stop')
const getLineIds = require('./line')
const getArrDepIds = require('./arrival-departure')

const dataSource = 'some-data-source'
const normalizeName = slugg

const operator = {
	type: 'operator',
	id: 'foo',
	name: 'Foo Transit',
	serviceArea: {
		type: 'Feature',
		properties: {},
		geometry: {
			type: 'Polygon',
			coordinates: [[
				[-81, 41],
				[-88, 36],
				[-84, 31],
				[-80, 33],
				[-77, 39],
				[-81, 41]
			]]
		}
	}
}
const operatorIds = getOperatorIds(dataSource, normalizeName)(operator)
console.log(operatorIds)

const stop = {
	type: 'station',
	id: '900000024101',
	name: 'S Charlottenburg',
	location: {
		type: 'location',
		latitude: 52.504806,
		longitude: 13.303846
	}
}
const stopIds = getStopIds(dataSource, normalizeName)(stop)
console.log(stopIds)

const line = {
	type: 'line',
	id: '18299',
	product: 'suburban',
	public: true,
	name: 'S9'
}
const lineIds = getLineIds(dataSource, normalizeName)(line)
console.log(lineIds)

const dep = {
	tripId: 'trip-12345',
	stop,
	when: null,
	plannedWhen: '2017-12-17T19:32:00+01:00',
	platform: null,
	plannedPlatform: '2',
	line,
	fahrtNr: '12345',
	direction: 'S Spandau'
}
const routeIds = []
const tripIds = [dep.tripId]
const getIds = getArrDepIds(stopIds, tripIds, routeIds, lineIds, normalizeName)
console.log(getIds('departure', dep))
