const {parseExpression, executeExpression} = require('./index');

/**
 * Generate all the combinaisons of boolean values.
 * And return them in an array of objects with properties var0, var1 ...
 * @param {number} varCount 
 * @returns {*[]}
 */
const generateScopes = (varCount) => {
    const variables = [];
    for(let i = 0; i < varCount; i++) {
        variables.push(`var${i}`);
    }
    const scopes = [];
    for(let i = 0; i < Math.pow(2, varCount); i++) {
        const execution = {};
        for(let j = 0; j < varCount; j++) {
            execution[variables[j]] = i & (1 << j) > 0;
        }
        scopes.push(execution);
    }
    return scopes;
};

test('Empty expression', () => {
    expect(parseExpression('')).toBe(undefined);
});

test('Invalid ASTNode argument', () => {
    expect(() => executeExpression()).toThrow();
});

test('Identity expression', () => {
    const ast = parseExpression('var0');
    for(let scope of generateScopes(1)) {
        expect(executeExpression(ast, scope)).toBe(scope.var0);
    }
});

test('OR operator', () => {
    const ast = parseExpression('var0|var1');
    for(let scope of generateScopes(2)) {
        expect(executeExpression(ast, scope)).toBe(scope.var0 || scope.var1);
    }
});

test('AND operator', () => {
    const ast = parseExpression('var0&var1');
    for(let scope of generateScopes(2)) {
        expect(executeExpression(ast, scope)).toBe(scope.var0 && scope.var1);
    }
});

test('NOT operator', () => {
    const ast = parseExpression('!var0');
    for(let scope of generateScopes(1)) {
        expect(executeExpression(ast, scope)).toBe(!scope.var0);
    }
});

test('Priority 1', () => {
    const ast = parseExpression('var0|var1&!var2');
    for(let scope of generateScopes(3)) {
        expect(executeExpression(ast, scope)).toBe(scope.var0 || scope.var1 && !scope.var2);
    }
});

test('Priority 2', () => {
    const ast = parseExpression('!var0&var1|var2');
    for(let scope of generateScopes(3)) {
        expect(executeExpression(ast, scope)).toBe(!scope.var0 && scope.var1 || scope.var2);
    }
});

test('Parentheses', () => {
    const ast = parseExpression('!(var0|var1)&var2');
    for(let scope of generateScopes(3)) {
        expect(executeExpression(ast, scope)).toBe(!(scope.var0 || scope.var1) && scope.var2);
    }
});

test('Invalid parentheses', () => {
    expect(() => parseExpression('(var0|var1)&var2)')).toThrow();
    expect(() => parseExpression('((var0|var1)&var2')).toThrow();
});