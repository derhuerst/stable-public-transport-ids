# stable-public-transport-ids

**Get stable IDs for public transport stations, etc.** Currently very biased towards German [GTFS](https://developers.google.com/transit/gtfs/) & [`hafas-client`](https://github.com/public-transport/hafas-client) data.

[![npm version](https://img.shields.io/npm/v/@derhuerst/stable-public-transport-ids.svg)](https://www.npmjs.com/package/@derhuerst/stable-public-transport-ids)
[![build status](https://api.travis-ci.org/derhuerst/stable-public-transport-ids.svg?branch=master)](https://travis-ci.org/derhuerst/stable-public-transport-ids)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/stable-public-transport-ids.svg)
[![chat with me on Gitter](https://img.shields.io/badge/chat%20with%20me-on%20gitter-512e92.svg)](https://gitter.im/derhuerst)
[![support me on Patreon](https://img.shields.io/badge/support%20me-on%20patreon-fa7664.svg)](https://patreon.com/derhuerst)


## Installation

```shell
npm install @derhuerst/stable-public-transport-ids
```


## Usage

```js
const getStopIds = require('@derhuerst/stable-public-transport-ids/stop')
const getLineIds = require('@derhuerst/stable-public-transport-ids/line')
const getArrDepIds = require('@derhuerst/stable-public-transport-ids/arrival-departure')

const dataSource = 'some-data-source'
const normalizeName = name => name.toLowerCase().trim()

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
```

```js
[
	'1:some data source:900000024101',
	'1:s charlottenburg:52.50:13.30'
	// …
]
[
	'1:some data source:18299',
	'1:suburban:s9'
]
[
	'1:departure:1:some data source:900000024101:trip-12345',
	'1:departure:1:s charlottenburg:52.50:13.30:trip-12345'
	// …
]
```


## Contributing

If you have a question or need support using `stable-public-transport-ids`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/stable-public-transport-ids/issues).
