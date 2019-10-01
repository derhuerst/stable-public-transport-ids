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
	].map(id => id.join(':'))
}

module.exports = lineIds
