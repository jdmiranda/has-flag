import process from 'process'; // eslint-disable-line node/prefer-global/process

export default function hasFlag(flag, argv = process.argv) {
	// Optimize prefix computation using charCodeAt (45 is '-')
	// Avoid unnecessary string checks with charCodeAt
	const firstCharCode = flag.charCodeAt(0);
	const prefix = firstCharCode === 45
		? ''
		: (flag.length === 1 ? '-' : '--');

	// Construct full flag once
	const fullFlag = prefix + flag;

	// Use highly optimized native indexOf
	const position = argv.indexOf(fullFlag);

	// Fast path: if flag not found, exit immediately
	if (position === -1) {
		return false;
	}

	// Only search for terminator if flag was found
	// This avoids unnecessary indexOf call in most cases
	const terminatorPosition = argv.indexOf('--');

	// No terminator or flag before terminator
	return terminatorPosition === -1 || position < terminatorPosition;
}
