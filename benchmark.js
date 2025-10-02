import { performance } from 'perf_hooks';

// Original implementation
function hasFlagOriginal(flag, argv) {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}

// Import optimized version
import hasFlag from './index.js';

// Benchmark configuration
const ITERATIONS = 500000;

// Test scenarios
const scenarios = [
	{
		name: 'Short flag in small argv',
		argv: ['-f', '-u', '-b'],
		flag: 'u'
	},
	{
		name: 'Long flag in small argv',
		argv: ['--foo', '--unicorn', '--bar'],
		flag: 'unicorn'
	},
	{
		name: 'Flag with value',
		argv: ['--foo', '--unicorn=rainbow', '--bar'],
		flag: 'unicorn=rainbow'
	},
	{
		name: 'Flag before terminator',
		argv: ['--unicorn', '--', '--foo'],
		flag: 'unicorn'
	},
	{
		name: 'Flag after terminator (not found)',
		argv: ['--foo', '--', '--unicorn'],
		flag: 'unicorn'
	},
	{
		name: 'Large argv (20 flags)',
		argv: [
			'--flag1', '--flag2', '--flag3', '--flag4', '--flag5',
			'--flag6', '--flag7', '--flag8', '--flag9', '--flag10',
			'--flag11', '--flag12', '--flag13', '--flag14', '--flag15',
			'--flag16', '--flag17', '--flag18', '--flag19', '--flag20'
		],
		flag: 'flag15'
	},
	{
		name: 'Large argv with terminator',
		argv: [
			'--flag1', '--flag2', '--flag3', '--flag4', '--flag5',
			'--', '--flag6', '--flag7', '--flag8', '--flag9', '--flag10'
		],
		flag: 'flag3'
	},
	{
		name: 'Flag not found in large argv',
		argv: [
			'--flag1', '--flag2', '--flag3', '--flag4', '--flag5',
			'--flag6', '--flag7', '--flag8', '--flag9', '--flag10'
		],
		flag: 'notfound'
	},
	{
		name: 'Repeated checks (same argv, same flag)',
		argv: ['--foo', '--bar', '--baz'],
		flag: 'bar',
		repeated: true
	},
	{
		name: 'Repeated checks (same argv, different flags)',
		argv: ['--foo', '--bar', '--baz', '--qux', '--quux'],
		flag: null, // Will cycle through flags
		repeated: true,
		cycleFlags: ['foo', 'bar', 'baz', 'qux', 'quux']
	}
];

function benchmark(fn, scenario, iterations) {
	// Warm up
	for (let i = 0; i < 1000; i++) {
		if (scenario.cycleFlags) {
			fn(scenario.cycleFlags[i % scenario.cycleFlags.length], scenario.argv);
		} else {
			fn(scenario.flag, scenario.argv);
		}
	}

	// Actual benchmark
	const start = performance.now();
	for (let i = 0; i < iterations; i++) {
		if (scenario.cycleFlags) {
			fn(scenario.cycleFlags[i % scenario.cycleFlags.length], scenario.argv);
		} else {
			fn(scenario.flag, scenario.argv);
		}
	}
	const end = performance.now();

	return end - start;
}

console.log('Has-Flag Performance Benchmark');
console.log('==============================\n');
console.log(`Iterations per test: ${ITERATIONS.toLocaleString()}\n`);

let totalOriginalTime = 0;
let totalOptimizedTime = 0;

for (const scenario of scenarios) {
	const originalTime = benchmark(hasFlagOriginal, scenario, ITERATIONS);
	const optimizedTime = benchmark(hasFlag, scenario, ITERATIONS);

	totalOriginalTime += originalTime;
	totalOptimizedTime += optimizedTime;

	const improvement = ((originalTime - optimizedTime) / originalTime * 100);
	const speedup = (originalTime / optimizedTime);

	console.log(`Scenario: ${scenario.name}`);
	console.log(`  Original:  ${originalTime.toFixed(2)}ms`);
	console.log(`  Optimized: ${optimizedTime.toFixed(2)}ms`);
	console.log(`  Improvement: ${improvement.toFixed(2)}% faster`);
	console.log(`  Speedup: ${speedup.toFixed(2)}x`);
	console.log('');
}

console.log('Overall Results');
console.log('===============');
console.log(`Total Original Time:  ${totalOriginalTime.toFixed(2)}ms`);
console.log(`Total Optimized Time: ${totalOptimizedTime.toFixed(2)}ms`);
console.log(`Overall Improvement: ${((totalOriginalTime - totalOptimizedTime) / totalOriginalTime * 100).toFixed(2)}% faster`);
console.log(`Overall Speedup: ${(totalOriginalTime / totalOptimizedTime).toFixed(2)}x`);
