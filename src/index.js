const { tokenizeExpression, calculatePriorities, constructAST } = require('./core');
const {evaluateOperation} = require('./syntax');

/**
 * An Abstract Syntax Tree node.
 * @typedef {{token:string, args:ASTNode[]}} ASTNode
 */

/**
 * Parse an expression and create a AST which can be evaluated with executeExpression.
 * @param {string} expression 
 * @returns {ASTNode}
 */
 const parseExpression = (expression) => {
    if(typeof expression !== 'string' || expression.trim().length === 0) {
        return undefined;
    }
    const tokens = tokenizeExpression(expression);
    const prioritizedTokens = calculatePriorities(tokens);
    const AST = constructAST(prioritizedTokens);
    return AST;
};

/**
 * Execute a parsed expression.
 * @param {ASTNode} ast 
 * @param {*} scope 
 * @returns {*[]}
 */
const executeExpression = (ast, scope={}) => {
    if(!ast) {
        throw new Error("Missing ASTNode argument");
    }
    const operationStack = [ast];
    const dataStack = [];
    while(operationStack.length > 0) {
        const {token, args} = operationStack.pop();
        // Execute argument calculation before the current operation
        if(args.length > 0) {
            operationStack.push({token, args:[]}, ...args);
            continue;
        }
        dataStack.push(evaluateOperation(token, dataStack, scope));
    }
    return dataStack[0];
};

module.exports = { parseExpression, executeExpression };