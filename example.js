import slugg from 'slugg'
import {createGetStableOperatorIds as getOperatorIds} from './operator.js'
import {createGetStableStopIds as getStopIds} from './stop.js'
import {createGetStableLineIds as getLineIds} from './line.js'
import {createGetStableTripIds as getTripIds} from './trip.js'
import {createGetStableArrivalDepartureIds as getArrDepIds} from './arrival-departure.js'

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
console.log('operatorIds', operatorIds)

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
console.log('stopIds', stopIds)

const line = {
	type: 'line',
	id: '18299',
	product: 'suburban',
	public: true,
	name: 'S9',
	fahrtNr: '12345',
}
const lineIds = getLineIds(dataSource, normalizeName)(line)
console.log('lineIds', lineIds)



// 19:32 S Charlottenburg 2b
// |
// 19:35 U Moritzplatz 3a
// 19:36 U Moritzplatz 3b
// |
// 19:40 S Charlottenburg 4a
const trip = {
	id: 'trip-12345',
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

const depIds = trip.stopovers.map((st) => {
	const stopIds = getStopIds(dataSource, normalizeName)(st.stop)
	return getArrDepIds(stopIds, [[trip.id, 20]], [], lineIds, normalizeName)('departure', st)
})
console.log('depIds', depIds)
const arrIds = trip.stopovers.map((st) => {
	const stopIds = getStopIds(dataSource, normalizeName)(st.stop)
	return getArrDepIds(stopIds, [[trip.id, 20]], [], lineIds, normalizeName)('arrival', st)
})
console.log('arrIds', arrIds)

{
	const tripIds = getTripIds(dataSource, lineIds, depIds, arrIds)(trip)
	console.log('tripIds', tripIds)
}

const dep0 = {
	tripId: trip.id,
	stop,
	plannedWhen: trip.stopovers[0].plannedDeparture,
	plannedPlatform: trip.stopovers[0].plannedDeparturePlatform,
	line,
	fahrtNr: trip.fahrtNr,
	direction: trip.direction,
}
const routeIds = []
const tripIds = [[dep0.tripId, 20]]
const getDep0Ids = getArrDepIds(stopIds, tripIds, routeIds, lineIds, normalizeName)
console.log('dep0Ids', getDep0Ids('departure', dep0))
