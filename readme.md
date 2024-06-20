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


## How it works

*Note:* This project is currently strongly biased towards *German* [GTFS](https://developers.google.com/transit/gtfs/) & [`hafas-client`](https://github.com/public-transport/hafas-client) data.

For each supported "type", this package exposes **a function that generates a list of IDs. If any of these match any ID of another item (of the same type), they can be considered equal** with a certain degree of certainty.

IDs also have an associated specificity, which allow you to make (vage) assumptions about this degree of certainty. For example, when trying to find out if two items represent the same physical entity, you might want to expect some degree of certainty, or only match IDs with a similar degree of certainty.

As it is currently implemented, the IDs' specificities are integers, and their order of magnitude roughly represents the degree of specificity. As an example, let's consider stable stop IDs:

stable ID | specificity
-|-
`2:Q111326217` | `10`
`2:some-data-source:900000024101` | `20`
`2:s-charlottenburg:52.5050:13.3040` | `30`
`2:s-charlottenburg:52.5050:13.3050` | `31`
`2:s-charlottenburg:52.5050:13.3030` | `31`
`2:s-charlottenburg:52.5060:13.3040` | `31`
`2:s-charlottenburg:52.5040:13.3040` | `31`
`2:s-charlottenburg:52.5060:13.3050` | `32`
`2:s-charlottenburg:52.5060:13.3030` | `32`
`2:s-charlottenburg:52.5040:13.3050` | `32`
`2:s-charlottenburg:52.5040:13.3030` | `32`


## Usage

As an example, the function `areStopsTheSame` checks if two stops are the same:

```js
import {createGetStableStopIds} from '@derhuerst/stable-public-transport-ids/stop.js'

// This string will be used for all non-globally-unique pieces
// of identifying information (e.g. IDs from the provider).
// You could use the canonical abbreviation of the organization that generates and/or manages the stop IDs.
const namespace = 'some-data-source'

// The following implementation is simplified for demonstration purposes.
// In practice, it should handle as many cases as possible:
// - normalize various Unicode chars to ASCII
// - remove inconsistent spaces
// - remove vendor-/API-specific prefixes & suffixes
const normalizeName = name => name.toLowerCase().trim().replace(/\s+/, '-')
const getStopIds = createGetStableStopIds(namespace, normalizeName)

const areStopsTheSame = (stopA, stopB) => {
	const idsForA = getStopIds(stopA)
	return getStopIds(stopB).some(idForB => idsForA.includes(idForB))
}
```

We can generate IDs for stops, lines & departures/arrivals as follows:

```js
import {createGetStableLineIds} from '@derhuerst/stable-public-transport-ids/line.js'
import {createGetStableDepartureIds} from '@derhuerst/stable-public-transport-ids/arrival-departure.js'

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
// 	'2:some-data-source:900000024101',
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
const getLineIds = createGetStableLineIds(namespace, normalizeName)
const lineIds = getLineIds(line)

console.log(lineIds)
// [
// 	'2:some-data-source:18299',
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
const tripIds = [['some-data-source' + dep.tripId, 20]]
const getDepIds = createGetStableDepartureIds(
	stopIds, tripIds, routeIds, lineIds,
	normalizeName,
)

console.log(getDepIds('departure', dep))
// [
// 	'2:dep:some-data-source:900000024101:trip-12345',
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
