'use strict'

const {Suite} = require('benchmark')
const getOperatorIds = require('./operator')
const getStopIds = require('./stop')
const getLineIds = require('./line')
const getTripIds = require('./trip')
const getArrDepIds = require('./arrival-departure')

const dataSource = 'src'
const normalizeName = n => n.toLowerCase()

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
const operatorIds = getOperatorIds(dataSource, normalizeName)

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
const stopIds = getStopIds(dataSource, normalizeName)

const line = {
	type: 'line',
	id: '18299',
	product: 'suburban',
	public: true,
	name: 'S9'
}
const lineIds = getLineIds(dataSource, normalizeName)

// 19:32 S Charlottenburg 2b
// |
// 19:35 U Moritzplatz 3a
// 19:36 U Moritzplatz 3b
// |
// 19:40 S Charlottenburg 4a
const trip = {
	id: 'trip-12345',
	fahrtNr: '12345',
	direction: 'S Spandau',
	line,

	stopovers: [{
		stop,
		plannedArrival: null,
		plannedArrivalPlatform: null,
		plannedDeparture: '2017-12-17T19:32:00+01:00',
		plannedDeparturePlatform: '2b',
	}, {
		stop: {
			type: 'station',
			id: '900000013101',
			name: 'U Moritzplatz',
			location: {latitude: 52.503737, longitude: 13.410944},
		},
		plannedArrival: '2017-12-17T19:35:00+01:00',
		plannedArrivalPlatform: '3a',
		plannedDeparture: '2017-12-17T19:36:00+01:00',
		plannedDeparturePlatform: '3b',
	}, {
		stop,
		plannedArrival: '2017-12-17T19:40:00+01:00',
		plannedArrivalPlatform: '4a',
		plannedDeparture: null,
		plannedDeparturePlatform: null,
	}],
}

const tripLineIds = lineIds(trip.line)
const tripDepIds = trip.stopovers.map((st) => {
	return getArrDepIds(
		stopIds(st.stop),
		[trip.id], // trip IDs
		[], // route IDs
		tripLineIds,
		normalizeName,
	)('departure', st)
})
const tripArrIds = trip.stopovers.map((st) => {
	return getArrDepIds(
		stopIds(st.stop),
		[trip.id], // trip IDs
		[], // route IDs
		tripLineIds,
		normalizeName,
	)('arrival', st)
})
const tripIds = getTripIds(dataSource, tripLineIds, tripDepIds, tripArrIds)

const dep0 = {
	tripId: trip.id,
	stop,
	plannedWhen: trip.stopovers[0].plannedDeparture,
	plannedPlatform: trip.stopovers[0].plannedDeparturePlatform,
	line,
	fahrtNr: trip.fahrtNr,
	direction: trip.direction,
}
const dep0Ids = getArrDepIds(
	stopIds(dep0.stop),
	[dep0.tripId], // trip IDs
	[], // route IDs
	lineIds(dep0.line),
	normalizeName,
)

const s = new Suite()

s.add('operator IDs', () => {
	operatorIds(operator)
})

s.add('stop IDs', () => {
	stopIds(stop)
})

s.add('line IDs', () => {
	lineIds(line)
})

dep0Ids('departure', dep0)
s.add('1st departure IDs', () => {
	dep0Ids('departure', dep0)
})

s.add('trip IDs', () => {
	tripIds(trip)
})

s.add('all IDs of a trip', () => {
	const _lineIds = lineIds(trip.line)
	const _depIds = trip.stopovers.map((st) => {
		return getArrDepIds(
			stopIds(st.stop),
			[trip.id], // trip IDs
			[], // route IDs
			_lineIds,
			normalizeName,
		)('departure', st)
	})
	const _arrIds = trip.stopovers.map((st) => {
		const arrIds = getArrDepIds(
			stopIds(st.stop),
			[trip.id], // trip IDs
			[], // route IDs
			_lineIds,
			normalizeName,
		)
		return arrIds('arrival', st)
	})
	getTripIds(dataSource, _lineIds, _depIds, _arrIds)(trip)
})

s.on('error', (err) => {
	console.error(err)
	process.exitCode = 1
})
s.on('cycle', (e) => {
	console.log(e.target.toString())
})
s.run()
