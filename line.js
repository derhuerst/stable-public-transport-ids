'use strict'

const {dataVersion: v} = require('./package.json')

const lineIds = (dataSource, normalizeName) => (s) => {
	const byId = s.id ? [
		[v, dataSource, s.id]
	] : []
	const byProdAndName = s.product && s.name ? [
		[v, s.product, normalizeName(s.name)]
	] : []
	return [
		...byId,
		...byProdAndName
		// todo: OSM ID?
		// todo: Wikidata ID?
		// todo: Onestop ID?
		// https://github.com/transitland/transitland-datastore/blob/ce4ad9468882dc22a4c6fbe8b84a69da6c4cef90/app/models/route.rb#L234-L244
	].map(id => id.join(':'))
}

module.exports = lineIds
