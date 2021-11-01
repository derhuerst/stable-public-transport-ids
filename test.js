'use strict'

const test = require('tape')
const {dataVersion: v} = require('./package.json')
const {unique: hash} = require('shorthash')

const operatorIds = require('./operator')
const stopIds = require('./stop')
const lineIds = require('./line')
const arrivalDepartureIds = require('./arrival-departure')
const tripIds = require('./trip')

const normalize = (name, thing) => {
	return [
		name.toLowerCase().trim(),
		thing.id ? thing.id[0].toUpperCase() : '-'
	].join('')
}

test('operator OneStop ID', (t) => {
	const op = {
		type: 'operator',
		id: 'foo',
		wikidataId: 'Q99633',
		name: 'Foo Transit',
		serviceArea: {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'Polygon',
				coordinates: [[
					[-81, 41], [-88, 36], [-84, 31],
					[-80, 33], [-77, 39], [-81, 41]
				]]
			}
		}
	}
	const ids = operatorIds('sauce', normalize)(op)

	const beginsWith = str => ([str2]) => str2.slice(0, str.length) === str
	const onestopId = ids.find(beginsWith(`${v}:custom:o:`))
	t.deepEqual(ids, [
		[[v, op.wikidataId].join(':'), 10],
		[[v, 'sauce', op.id].join(':'), 20],
		[`${v}:custom:o:dn:foo~transitF`, 30],
		[[v, normalize(op.name, op), '36.1340', '-82.3110'].join(':'), 31],
	])

	t.end()
})

test('stop IDs', (t) => {
	const ids = stopIds('sauce', normalize)({
		id: '123',
		name: 'Foo',
		station: {id: '12', name: 'Bar'},
		location: {latitude: 12.345, longitude: 23.456}
	})
	t.deepEqual(ids, [
		[[v, 'sauce', '123'].join(':'), 20], // data src, stop ID
		// normalized stop name, normalized coords
		[[v, 'bar1', 12.345.toFixed(4), 23.456.toFixed(4)].join(':'), 30],
		// normalized stop name, normalized & shifted coords
		[[v, 'bar1', 12.345.toFixed(4), (23.456 + .001).toFixed(4)].join(':'), 31],
		[[v, 'bar1', 12.345.toFixed(4), (23.456 - .001).toFixed(4)].join(':'), 31],
		[[v, 'bar1', (12.345 + .001).toFixed(4), 23.456.toFixed(4)].join(':'), 31],
		[[v, 'bar1', (12.345 - .001).toFixed(4), 23.456.toFixed(4)].join(':'), 31],
		[[v, 'bar1', (12.345 + .001).toFixed(4), (23.456 + .001).toFixed(4)].join(':'), 32],
		[[v, 'bar1', (12.345 + .001).toFixed(4), (23.456 - .001).toFixed(4)].join(':'), 32],
		[[v, 'bar1', (12.345 - .001).toFixed(4), (23.456 + .001).toFixed(4)].join(':'), 32],
		[[v, 'bar1', (12.345 - .001).toFixed(4), (23.456 - .001).toFixed(4)].join(':'), 32],
		[[v, 'sauce', 'station:12'].join(':'), 50], // data src, station ID
	])

	t.end()
})

test('line IDs', (t) => {
	const ids = lineIds('sauce', normalize)({
		id: '1a',
		name: 'Some Line',
		product: 'suburban',
		mode: 'train',
		operator: {id: 'foo-bar baz'}
	})
	t.deepEqual(ids, [
		[[v, 'sauce', '1a'].join(':'), 20], // data src, line ID
		[[v, 'foo-bar baz', 'some line1'].join(':'), 30], // operator ID, normalized name
		[[v, 'suburban', 'some line1'].join(':'), 31], // product, normalized name
		[[v, 'train', 'some line1'].join(':'), 32], // mode, normalized name
	])

	t.end()
})

test('arrival/departure IDs', (t) => {
	const stopIds = [['some-stop', 20], ['another:stop', 31]]
	const routeIds = [['some-route', 10], ['another:route', 20]]
	const tripIds = [['some-trip', 30], ['another:trip', 30]]
	const lineIds = [['some-line', 10], ['another:line', 11]]
	const normalizePlatform = (platform, arrDep) => {
		return platform.toLowerCase().trim() + arrDep.when[0]
	}

	const getIds = arrivalDepartureIds(stopIds, tripIds, routeIds, lineIds, normalizePlatform)
	const ids = getIds('arrival', {
		when: '2019-01-01T10:11+01:00',
		plannedWhen: '2019-01-01T10:10+01:00', // todo: what if null?
		platform: '3',
		plannedPlatform: '2A/B '
	})
	t.deepEqual(ids, [
		// stop ID + trip ID
		[[v, 'arrival', 'some-stop', 'some-trip'].join(':'), 20 + 30 + 20],
		[[v, 'arrival', 'another:stop', 'some-trip'].join(':'), 31 + 30 + 20],
		[[v, 'arrival', 'some-stop', 'another:trip'].join(':'), 20 + 30 + 20],
		[[v, 'arrival', 'another:stop', 'another:trip'].join(':'), 31 + 30 + 20],

		// stop ID + route ID + plannedWhen
		[[v, 'arrival', 'some-stop', 'some-route', 1546333800].join(':'), 20 + 10 + 30],
		[[v, 'arrival', 'another:stop', 'some-route', 1546333800].join(':'), 31 + 10 + 30],
		[[v, 'arrival', 'some-stop', 'another:route', 1546333800].join(':'), 20 + 20 + 30],
		[[v, 'arrival', 'another:stop', 'another:route', 1546333800].join(':'), 31 + 20 + 30],

		// stop ID + line ID + plannedWhen + plannedPlatform
		[[v, 'arrival', 'some-stop', 'some-line', 1546333800, '2a/b2'].join(':'), 20 + 10 + 30],
		[[v, 'arrival', 'another:stop', 'some-line', 1546333800, '2a/b2'].join(':'), 31 + 10 + 30],
		[[v, 'arrival', 'some-stop', 'another:line', 1546333800, '2a/b2'].join(':'), 20 + 11 + 30],
		[[v, 'arrival', 'another:stop', 'another:line', 1546333800, '2a/b2'].join(':'), 31 + 11 + 30],
	])

	t.end()
})

test('trip IDs', (t) => {
	const lineIds = [['some-line', 10], ['another:line', 11]]
	const depsIds = [
		[['dep0a', 40], ['dep0b', 50], ['dep0c', 51]],
		[['dep1a', 40], ['dep1b', 41], ['dep1c', 50]],
		[['dep2a', 30], ['dep2b', 50]], // note: just 2 IDs
	]
	const arrsIds = [
		[['arr0', 42]],
		[['arr1a', 40], ['arr1b', 60]], // note: 2 IDs
		[['arr2', 50]],
	]

	const ids = tripIds('sauce', lineIds, depsIds, arrsIds)({
		id: 'trip-12345',
		direction: 'S Spandau',
		line: {
			id: '1a',
			name: 'Some Line',
			product: 'suburban',
			mode: 'train',
			fahrtNr: '12345',
		},
	})
	t.deepEqual(ids, [
		[[v, 'sauce', 'trip-12345'].join(':'), 20], // data src + trip ID

		// line IDs + fahrt nr
		[[v, 'some-line', '12345'].join(':'), 10 + 30],
		[[v, 'another:line', '12345'].join(':'), 11 + 30],

		// line ID + first departure ID
		[[v, 'some-line', 'dep0a'].join(':'), 40 + 10 + 21],
		[[v, 'another:line', 'dep0a'].join(':'), 40 + 11 + 21],
		[[v, 'some-line', 'dep0b'].join(':'), 50 + 10 + 21],
		[[v, 'another:line', 'dep0b'].join(':'), 50 + 11 + 21],
		[[v, 'some-line', 'dep0c'].join(':'), 51 + 10 + 21],
		[[v, 'another:line', 'dep0c'].join(':'), 51 + 11 + 21],

		// all departures' IDs
		[v + ':' + hash(['dep0a', 'dep1a', 'dep2a'].join(':')), 40 + 20],
		[v + ':' + hash(['dep0b', 'dep1b', 'dep2b'].join(':')), 50 + 20],

		// line ID + first arrival ID
		[[v, 'some-line', 'arr0'].join(':'), 42 + 10 + 21],
		[[v, 'another:line', 'arr0'].join(':'), 42 + 11 + 21],

		// all arrivals' IDs
		[v + ':' + hash(['arr0', 'arr1a', 'arr2'].join(':')), 50 + 20],
	])

	t.end()
})
