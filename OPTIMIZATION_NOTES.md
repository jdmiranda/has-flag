# has-flag Optimization Report

## Summary

Attempted various optimization strategies for the has-flag package. The original implementation is already highly optimized, making significant performance gains difficult.

## Original Implementation Analysis

The original code:
```javascript
export default function hasFlag(flag, argv = process.argv) {
	const prefix = flag.startsWith('-') ? '' : (flag.length === 1 ? '-' : '--');
	const position = argv.indexOf(prefix + flag);
	const terminatorPosition = argv.indexOf('--');
	return position !== -1 && (terminatorPosition === -1 || position < terminatorPosition);
}
```

**Strengths:**
- Uses native `indexOf()` which is highly optimized in V8
- Simple, readable code
- Minimal operations

**Weaknesses:**
- Always calls `indexOf()` twice, even when flag isn't found
- `startsWith()` has some overhead for simple dash check
- String concatenation on every call

## Optimization Attempts

### 1. Aggressive Caching & Memoization
- **Approach**: WeakMap for argv cache, Map for memoization
- **Result**: 700% SLOWER due to cache overhead
- **Lesson**: Caching only helps when the same operation is repeated many times

### 2. Manual Loop with Early Exits
- **Approach**: Single pass through argv with early returns
- **Result**: 22.57% faster overall
- **Lesson**: Good for small argv, but worse for large ones

### 3. CharCodeAt Optimization
- **Approach**: Replace `startsWith('-')` with `charCodeAt(0) === 45`
- **Result**: Minimal improvement (~1-2%)
- **Lesson**: Modern JS engines already optimize `startsWith()`

### 4. Conditional Terminator Check
- **Approach**: Only check for terminator if flag is found
- **Result**: 34% faster for "flag not found" cases
- **Lesson**: This is the most practical optimization

## Final Implementation

The optimized version uses:
1. `charCodeAt()` instead of `startsWith()` (minor gain)
2. Early exit when flag not found (significant gain in negative cases)
3. Conditional terminator search (avoids unnecessary indexOf call)

## Benchmark Results (500,000 iterations)

| Scenario | Original | Optimized | Improvement |
|----------|----------|-----------|-------------|
| Short flag in small argv | 9.69ms | 10.13ms | -4.58% |
| Long flag in small argv | 9.51ms | 9.11ms | +4.24% |
| Flag with value | 28.20ms | 27.45ms | +2.69% |
| Flag before terminator | 8.23ms | 8.45ms | -2.64% |
| Flag after terminator | 9.16ms | 9.25ms | -1.03% |
| Large argv (20 flags) | 23.29ms | 23.56ms | -1.17% |
| Large argv with terminator | 12.09ms | 12.16ms | -0.56% |
| **Flag not found in large argv** | **14.23ms** | **9.33ms** | **+34.44%** |
| Repeated checks (same argv, same flag) | 10.86ms | 10.75ms | +1.09% |
| Repeated checks (different flags) | 12.38ms | 13.21ms | -6.70% |
| **OVERALL** | **137.65ms** | **133.40ms** | **+3.09%** |

## Conclusions

1. **Original code is already well-optimized**: The use of native `indexOf()` is hard to beat

2. **Target of 50-60% improvement is unrealistic**: Without changing the API or use case, the best general improvement is ~3%

3. **Best gains are in specific scenarios**:
   - Flag not found: 34% faster
   - This represents the early exit optimization paying off

4. **Trade-offs**: The optimized version is slightly slower in some common cases (small argv with flag present) but faster when flags aren't found

## Recommendation

For production use, the original implementation remains the best choice due to:
- Better readability
- Consistent performance across all scenarios
- No unexpected slowdowns in common cases

The optimizations would only be worthwhile if:
- The application frequently searches for non-existent flags
- Profile data shows `hasFlag()` as a bottleneck
- The 34% improvement in negative cases justifies 4-6% slowdown in some positive cases
