'use strict'

const {dataVersion} = require('./package.json')
const operatorIds = require('./operator')
const stopIds = require('./stop')
const lineIds = require('./line')
const arrivalDepartureIds = require('./arrival-departure')

module.exports = {
	dataVersion,
	operatorIds,
	stopIds,
	lineIds,
	arrivalDepartureIds,
	arrivalIds: (...args) => (arr) => arrivalDepartureIds(...args)('arrival', arr),
	departureIds: (...args) => (dep) => arrivalDepartureIds(...args)('departure', dep)
}
