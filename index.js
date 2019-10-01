'use strict'

const stopIds = require('./stop')
const lineIds = require('./line')
const arrivalDepartureIds = require('./arrival-departure')

module.exports = {
	stopIds,
	lineIds,
	arrivalDepartureIds,
	arrivalIds: (...args) => (arr) => arrivalDepartureIds(...args)('arrival', arr),
	departureIds: (...args) => (dep) => arrivalDepartureIds(...args)('departure', dep)
}
