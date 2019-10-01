'use strict'

const test = require('tape')
const {dataVersion: v} = require('./package.json')

const stopIds = require('./stop')
const lineIds = require('./line')
const arrivalDepartureIds = require('./arrival-departure')

const normalize = n => n.toLowerCase().trim()

test('stop IDs', (t) => {
	const ids = stopIds('sauce', normalize)({
		id: '123',
		name: 'Foo',
		station: {id: '12', name: 'Bar'},
		location: {latitude: 12.345, longitude: 23.456}
	})
	t.deepEqual(ids, [
		[v, 'sauce', '123'].join(':'), // data src, stop ID
		[v, 'sauce', 'station:12'].join(':'), // data src, station ID, name
		[v, 'bar', 12.35, 23.46].join(':'), // normalized name, normalized coords
		// normalized name, normalized & shifted coords
		[v, 'bar', 12.35 + .33, 23.46 + .33].join(':'),
		[v, 'bar', 12.35 + .66, 23.46 + .66].join(':')
	])

	t.end()
})

test('line IDs', (t) => {
	const ids = lineIds('sauce', normalize)({
		id: '1a',
		name: 'Some Line',
		product: 'suburban'
	})
	t.deepEqual(ids, [
		[v, 'sauce', '1a'].join(':'), // data src, line ID
		[v, 'suburban', 'some line'].join(':') // product, normalized name
	])

	t.end()
})

test('arrival/departure IDs', (t) => {
	const stopIds = ['some-stop', 'another:stop']
	const routeIds = ['some-route', 'another:route']
	const tripIds = ['some-trip', 'another:trip']
	const lineIds = ['some-line', 'another:line']
	const normalizePlatform = p => p.toLowerCase().trim()

	const getIds = arrivalDepartureIds(stopIds, tripIds, routeIds, lineIds, normalizePlatform)
	const ids = getIds('arrival', {
		when: '2019-01-01T10:11+01:00',
		plannedWhen: '2019-01-01T10:10+01:00', // todo: what if null?
		platform: '3',
		plannedPlatform: '2A/B '
	})
	t.deepEqual(ids, [
		// stop ID + trip ID
		[v, 'arrival', 'some-stop', 'some-trip'].join(':'),
		[v, 'arrival', 'another:stop', 'some-trip'].join(':'),
		[v, 'arrival', 'some-stop', 'another:trip'].join(':'),
		[v, 'arrival', 'another:stop', 'another:trip'].join(':'),

		// stop ID + route ID + plannedWhen
		[v, 'arrival', 'some-stop', 'some-route', 1546333800].join(':'),
		[v, 'arrival', 'another:stop', 'some-route', 1546333800].join(':'),
		[v, 'arrival', 'some-stop', 'another:route', 1546333800].join(':'),
		[v, 'arrival', 'another:stop', 'another:route', 1546333800].join(':'),

		// stop ID + line ID + plannedWhen + plannedPlatform
		[v, 'arrival', 'some-stop', 'some-line', 1546333800, '2a/b'].join(':'),
		[v, 'arrival', 'another:stop', 'some-line', 1546333800, '2a/b'].join(':'),
		[v, 'arrival', 'some-stop', 'another:line', 1546333800, '2a/b'].join(':'),
		[v, 'arrival', 'another:stop', 'another:line', 1546333800, '2a/b'].join(':')
	])

	t.end()
})
