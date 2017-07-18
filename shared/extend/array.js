function is(a, b) {
    return a === b && (a !== 0 || 1 / a === 1 / b) // false for +0 vs -0
        || a !== a && b !== b || a.toString() == b.toString(); // true for NaN vs NaN
}

var arr1 = ["a",NaN,"b"];
var arr2 = ["a",NaN,"b"];

if (arr1.length == arr2.length
    && arr1.every(function(u, i) {
        // Use "is" instead of "==="
        return is(u, arr2[i]);
    })
) {
   console.log(true);
} else {
   console.log(false);
}

Object.assign(Array.prototype, {
    /**
     * @param {Array} otherArray 
     * @memberof Array
     * @returns 
     */
    compare (otherArray) {
        return (this.length == otherArray.length
            && this.every(function(u, i) {
                // Use "is" instead of "==="
                return is(u, otherArray[i]);
            }));
    }
});

module.exports = Array;