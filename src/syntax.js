const tokenTypes = {
    OR_TOKEN: '|',
    AND_TOKEN: '&',
    NOT_TOKEN: '!',
    OPENNING_BRACKET_TOKEN: '(',
    CLOSING_BRACKET_TOKEN: ')'
};

const splitRegex = /[|&!()]/g;

const operationPriorities = {
    [tokenTypes.OR_TOKEN]: 1,
    [tokenTypes.AND_TOKEN]: 2,
    [tokenTypes.NOT_TOKEN]: 3,
    values: 4,
    brackets: 5
};

const leftSidedTokens = [
    tokenTypes.OR_TOKEN,
    tokenTypes.AND_TOKEN
];

const rightSidedTokens = [
    tokenTypes.OR_TOKEN,
    tokenTypes.AND_TOKEN,
    tokenTypes.NOT_TOKEN
];

/**
 * Operator definition.
 * @param {string} token
 * @param {*[]} dataStack
 * @param {*} scope
 * @returns {*} result
 */
const evaluateOperation = (token, dataStack, scope) => {
    let left, right;
    switch(token) {
        case tokenTypes.OR_TOKEN:
            left = dataStack.pop(); 
            right = dataStack.pop();
            return left || right; // Note: We cannot inline the expression because js will not always evaluate the right side
        case tokenTypes.AND_TOKEN:
            left = dataStack.pop(); 
            right = dataStack.pop();
            return left && right;
        case tokenTypes.NOT_TOKEN:
            return !dataStack.pop();
        default: // Value / variable
            return scope[token];
    }
};

module.exports = {tokenTypes, splitRegex, operationPriorities, leftSidedTokens, rightSidedTokens, evaluateOperation};