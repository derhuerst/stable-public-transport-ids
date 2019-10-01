'use strict'

const test = require('tape')

const stopIds = require('./stop')
const lineIds = require('./line')

const normalize = n => n.toLowerCase().trim()

test('stop IDs', (t) => {
	const ids = stopIds('sauce', normalize)({
		id: '123',
		name: 'Foo',
		station: {id: '12', name: 'Bar'},
		location: {latitude: 12.345, longitude: 23.456}
	})
	t.deepEqual(ids, [
		['sauce', '123'].join(':'), // data src, stop ID
		['sauce', 'station:12'].join(':'), // data src, station ID, name
		['bar', 12.35, 23.46].join(':'), // normalized name, normalized coords
		// normalized name, normalized & shifted coords
		['bar', 12.35 + .33, 23.46 + .33].join(':'),
		['bar', 12.35 + .66, 23.46 + .66].join(':')
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
		['sauce', '1a'].join(':'), // data src, line ID
		['suburban', 'some line'].join(':') // product, normalized name
	])

	t.end()
})
