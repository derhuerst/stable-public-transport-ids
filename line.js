import {versionedId} from './lib/versioned-id.js'

const createGetStableLineIds = (namespace, normalizeName) => (s) => {
	return [
		s.wikidataId ? [s.wikidataId, 10] : null,
		s.osmId ? [s.osmId, 10] : null,
		s.id ? [namespace + ':' + s.id, 20] : null,
		// todo [breaking]: use operator IDs
		s.operator && s.operator.id && s.name
			? [s.operator.id + ':' + normalizeName(s.name, s), 30]
			: null,
		s.product && s.name
			? [s.product + ':' + normalizeName(s.name, s), 31]
			: null,
		s.mode && s.name
			? [s.mode + ':' + normalizeName(s.name, s), 32]
			: null,
		// todo: Onestop ID?
		// https://github.com/transitland/transitland-datastore/blob/ce4ad9468882dc22a4c6fbe8b84a69da6c4cef90/app/models/route.rb#L234-L244
	]
	.filter(id => id !== null)
	.map(([id, specificity]) => [versionedId(id), specificity])
}

export {
	createGetStableLineIds,
}
