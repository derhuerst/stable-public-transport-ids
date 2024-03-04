// todo: use import assertions once they're supported by Node.js & ESLint
// https://github.com/tc39/proposal-import-assertions
import {createRequire} from 'module';
const require = createRequire(import.meta.url);

const {dataVersion} = require('./package.json')
import {createGetStableOperatorIds} from './operator.js'
import {createGetStableStopIds} from './stop.js'
import {createGetStableLineIds} from './line.js'
import {createGetStableArrivalIds, createGetStableDepartureIds} from './arrival-departure.js'

export {
	dataVersion,
	createGetStableOperatorIds,
	createGetStableStopIds,
	createGetStableLineIds,
	createGetStableArrivalIds,
	createGetStableDepartureIds,
}
