'use strict'

const test = require('tape')
const {dataVersion: v} = require('./package.json')

const operatorIds = require('./operator')
const stopIds = require('./stop')
const lineIds = require('./line')
const arrivalDepartureIds = require('./arrival-departure')

const normalize = (name, thing) => {
	return [
		name.toLowerCase().trim(),
		thing.id ? thing.id[0].toUpperCase() : '-'
	].join('')
}

const beginsWith = str => str2 => str2.slice(0, str.length) === str

test('operator OneStop ID', (t) => {
	const ids = operatorIds('sauce', normalize)({
		type: 'operator',
		id: 'foo',
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
	})

	const onestopId = ids.find(beginsWith(`${v}:custom:o:`))
	t.equal(onestopId, `${v}:custom:o:dn:foo~transitF`)

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
		[v, 'sauce', '123'].join(':'), // data src, stop ID
		[v, 'sauce', 'station:12'].join(':'), // data src, station ID
		// normalized station name, normalized coords
		[v, 'bar1', 12.345.toFixed(4), 23.456.toFixed(4)].join(':'),
		// normalized station name, normalized & shifted coords
		[v, 'bar1', 12.345.toFixed(4), (23.456 + .001).toFixed(4)].join(':'),
		[v, 'bar1', 12.345.toFixed(4), (23.456 + .002).toFixed(4)].join(':'),
		[v, 'bar1', (12.345 + .001).toFixed(4), 23.456.toFixed(4)].join(':'),
		[v, 'bar1', (12.345 + .002).toFixed(4), 23.456.toFixed(4)].join(':')
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
		[v, 'sauce', '1a'].join(':'), // data src, line ID
		[v, 'foo-bar baz', 'some line1'].join(':'), // operator ID, normalized name
		[v, 'suburban', 'some line1'].join(':'), // product, normalized name
		[v, 'train', 'some line1'].join(':'), // mode, normalized name
	])

	t.end()
})

test('arrival/departure IDs', (t) => {
	const stopIds = ['some-stop', 'another:stop']
	const routeIds = ['some-route', 'another:route']
	const tripIds = ['some-trip', 'another:trip']
	const lineIds = ['some-line', 'another:line']
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
		[v, 'arrival', 'some-stop', 'some-line', 1546333800, '2a/b2'].join(':'),
		[v, 'arrival', 'another:stop', 'some-line', 1546333800, '2a/b2'].join(':'),
		[v, 'arrival', 'some-stop', 'another:line', 1546333800, '2a/b2'].join(':'),
		[v, 'arrival', 'another:stop', 'another:line', 1546333800, '2a/b2'].join(':')
	])

	t.end()
})
