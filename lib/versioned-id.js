'use strict'

const {strictEqual} = require('assert')
const {dataVersion: VERSION} = require('../package.json')

const PREFIX = VERSION + ':'

const idWithVersionPrefix = (id) => {
	if (id.slice(0, PREFIX.length) === PREFIX) return id
	return PREFIX + id
}

const idWithoutVersionPrefix = (id) => {
	if (id.slice(0, PREFIX.length) !== PREFIX) return id
	return id.slice(PREFIX.length)
}

module.exports = {
	versionedId: idWithVersionPrefix,
	idWithoutVersion: idWithoutVersionPrefix,
}
