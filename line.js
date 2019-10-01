'use strict'

const lineIds = (dataSource, normalizeName) => (s) => {
	const byId = s.id ? [
		[dataSource, s.id]
	] : []
	const byProdAndName = s.product && s.name ? [
		[s.product, normalizeName(s.name)]
	] : []
	return [
		...byId,
		...byProdAndName
	].map(id => id.join(':'))
}

module.exports = lineIds
