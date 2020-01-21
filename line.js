'use strict'

const {dataVersion: v} = require('./package.json')

const lineIds = (dataSource, normalizeName) => (s) => {
	return [
		s.wikidataId || null,
		s.osmId || null,
		s.id ? [dataSource, s.id] : null,
		s.product && s.name
			? [s.product, normalizeName(s.name)]
			: null
		// todo: Onestop ID?
		// https://github.com/transitland/transitland-datastore/blob/ce4ad9468882dc22a4c6fbe8b84a69da6c4cef90/app/models/route.rb#L234-L244
	]
	.filter(id => id !== null)
	.map(id => v + ':' + id.join(':'))
}

module.exports = lineIds
