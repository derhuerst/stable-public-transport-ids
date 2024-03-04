// todo: use import assertions once they're supported by Node.js & ESLint
// https://github.com/tc39/proposal-import-assertions
import {createRequire} from 'module';
const require = createRequire(import.meta.url);

const {dataVersion: VERSION} = require('../package.json')

const PREFIX = VERSION + ':'
const PREFIX_LENGTH = PREFIX.length

const idWithVersionPrefix = (id) => {
	if (id.slice(0, PREFIX.length) === PREFIX) return id
	return PREFIX + id
}

const idWithoutVersionPrefix = (id) => {
	if (id.slice(0, PREFIX.length) !== PREFIX) return id
	return id.slice(PREFIX.length)
}

export {
	PREFIX_LENGTH as versionPrefixLength,
	idWithVersionPrefix as versionedId,
	idWithoutVersionPrefix as idWithoutVersion,
}
