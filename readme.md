# stable-public-transport-ids

**Get stable IDs for public transport data.**

[![npm version](https://img.shields.io/npm/v/@derhuerst/stable-public-transport-ids.svg)](https://www.npmjs.com/package/@derhuerst/stable-public-transport-ids)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/stable-public-transport-ids.svg)
[![support me via GitHub Sponsors](https://img.shields.io/badge/support%20me-donate-fa7664.svg)](https://github.com/sponsors/derhuerst)
[![chat with me on Twitter](https://img.shields.io/badge/chat%20with%20me-on%20Twitter-1da1f2.svg)](https://twitter.com/derhuerst)

[*Why linked open transit data?*](https://github.com/public-transport/why-linked-open-transit-data) explains the background of this project:

> Because public transportation *data* reflects strongly interconnected public transportation *systems*, it has many links. **When data by an author/source "A" refers to data from *another* author/source "B", it needs a reliable and precise way to identify items in "B" data.** In federated systems, especially in [linked data](https://en.wikipedia.org/wiki/Linked_data) systems, the need for stable & globally unique IDs is even more significant than in traditional, centralized systems.

**This project explores how to derive such IDs *from the data itself* in a deterministic way**. There is an inherent trade-off: In order to prevent collisions, the input data (which the ID will be computed from) must be quite detailed; On the other hand, for these IDs to be easily computable (e.g. offline), only little data should have to be transferred & stored.

It is an ongoing process of

- generalising them enough to support all relevant kinds of public transportation infrastructure,
- designing them to identify local infrastructure precisely (enough),
- finding and "covering" enough edge cases for the standard to be practical in real-world szenarios,
- formally describing, testing and implementing the standard in multiple evironments & programming languages.

**In addition, we use indeterministic but well-known (and thus rather stable) identifiers**, such as [Wikidata](https://wikidata.org/) IDs, to work as a "stepping-stone" until the deterministic IDs have widespread adoption.

**This project computes *multiple* IDs per item, with a varying degree of precision (and thus uniqueness), stability and reusability.** Refer to the [*Usage* section](#usage) for more.

## Installation

```shell
npm install @derhuerst/stable-public-transport-ids
```


## Usage

*Note:* This project is currently strongly biased towards *German* [GTFS](https://developers.google.com/transit/gtfs/) & [`hafas-client`](https://github.com/public-transport/hafas-client) data.

For each supported "type", this package exposes a function that generates a list of IDs. If any of these match any ID of another item (of the same type), they can be considered the same.

As an example, the function `areStopsTheSame` checks if two stops are the same:

```js
// This string will be used for all non-globally-unique pieces
// of identifying information (e.g. IDs from the provider).
// You could use the canonical abbreviation of the transit operator.
const dataSource = 'some-data-source'

// The following implementation is simplified for demonstration purposes.
// In practice, it should handle as many cases as possible:
// - normalize various Unicode chars to ASCII
// - remove inconsistent spaces
// - remove vendor-/API-specific prefixes & suffixes
const normalizeName = name => name.toLowerCase().trim().replace(/\s+/, '-')

const createGetStopIds = require('@derhuerst/stable-public-transport-ids/stop')
const getStopIds = createGetStopIds(dataSource, normalizeName)

const areStopsTheSame = (stopA, stopB) => {
	const idsForA = getStopIds(stopA)
	return getStopIds(stopB).some(idForB => idsForA.includes(idForB))
}
```

We can generate IDs for stops, lines & departures/arrivals as follows:

```js
const createGetLineIds = require('@derhuerst/stable-public-transport-ids/line')
const createGetArrDepIds = require('@derhuerst/stable-public-transport-ids/arrival-departure')

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
const stopIds = getStopIds(stop)
console.log(stopIds)
// [
// 	'2:some data source:900000024101',
// 	'2:s charlottenburg:52.50:13.30'
// 	…
// ]

const line = {
	type: 'line',
	id: '18299',
	product: 'suburban',
	public: true,
	name: 'S9'
}
const getLineIds = createGetLineIds(dataSource, normalizeName)
const lineIds = getLineIds(line)

console.log(lineIds)
// [
// 	'2:some data source:18299',
// 	'2:suburban:s9'
// ]

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
const getArrDepIds = createGetArrDepIds(stopIds, tripIds, routeIds, lineIds, normalizeName)

console.log(getArrDepIds('departure', dep))
// [
// 	'2:dep:some data source:900000024101:trip-12345',
// 	'2:dep:s charlottenburg:52.50:13.30:trip-12345'
// 	…
// ]
```


## Related

- [*Why linked open transit data?*](https://github.com/public-transport/why-linked-open-transit-data)
- [Linked Connections](https://linkedconnections.org)
- [TransitLand Onestop ID scheme](https://transit.land/documentation/onestop-id-scheme/)
- [*Identification of Fixed Objects in Public Transport (IFOPT)* ](https://en.wikipedia.org/wiki/Identification_of_Fixed_Objects_in_Public_Transport) [CEN](https://en.wikipedia.org/wiki/European_Committee_for_Standardization) spec


## Contributing

If you have a question or need support using `stable-public-transport-ids`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/stable-public-transport-ids/issues).
