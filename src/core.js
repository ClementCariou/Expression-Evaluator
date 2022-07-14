const {tokenTypes, splitRegex, operationPriorities, leftSidedTokens, rightSidedTokens} = require('./syntax');

/**
 * Identify the tokens of the expression.
 * @param {string} expression 
 * @returns {string[]}
 */
 const tokenizeExpression = (expression) => {
    const splittedExpression = expression.split(splitRegex);
    const tokens = [];
    let length = 0;
    for(let token of splittedExpression) {
        length += token.length;
        if(token.length > 0)
            tokens.push(token);
        if(length < expression.length)
            tokens.push(expression[length]);
        length++;
    }
    return tokens.map(token => token.trim());
};

/**
 * Calculate the priorities of the tokens and resolve the parentheses.
 * @param {string[]} tokens 
 * @returns {{token:string, priority:number, index:number}[]}
 */
const calculatePriorities = (tokens) => {
    // Calculate the priorities based on depth and operation types
    let depth = 0;
    tokens = tokens.map((token) => {
        if (token === tokenTypes.OPENNING_BRACKET_TOKEN) {
            depth++;
            return {token, priority: 0};
        } else if (token === tokenTypes.CLOSING_BRACKET_TOKEN) {
            depth--;
            if(depth < 0) throw new Error("Bad bracket structure");
            return {token, priority: 0};
        } else if (Object.values(tokenTypes).includes(token)) {
            return {token, priority: depth*operationPriorities.brackets + operationPriorities[token]};
        } else {
            return {token, priority: depth*operationPriorities.brackets + operationPriorities.values};
        }
    });
    // Remove all parentheses
    tokens = tokens.filter(token => token.priority !== 0)
    // Store the index for constructAST
    tokens = tokens.map((token, index) => ({...token, index}));

    if(depth !== 0) {
        throw new Error("Bad bracket structure");
    }
    return tokens;
};

/** 
 * Construct the AST respecting the priorities of operations.
 * @param {{token:string, priority:number, index:number}[]} tokens 
 * @returns {ASTNode}
 */
const constructAST = (tokens) => {
    const sortedTokens = [...tokens].sort((a, b) => b.priority - a.priority);
    let lastTokenIndex = -1;
    for(let token of sortedTokens) {
        let args = [];
        if (leftSidedTokens.includes(token.token))
            args.push(tokens[token.index - 1]);
        if (rightSidedTokens.includes(token.token))
            args.push(tokens[token.index + 1]);
        // Merge the trees on the left and right side of the operator
        args = args.map(arg => {
            while(arg.parent !== undefined)
                arg = tokens[arg.parent];
            arg.parent = token.index;
            return arg;
        });
        tokens[token.index] = {...token, args};
        lastTokenIndex = token.index;
    }
    return tokens[lastTokenIndex];
};

module.exports = { tokenizeExpression, calculatePriorities, constructAST };