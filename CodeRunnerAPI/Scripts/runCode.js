const fs = require('fs');

const [, , userCodePath, testCasesPath] = process.argv;

const userCode = fs.readFileSync(userCodePath, 'utf-8');
const testCases = JSON.parse(fs.readFileSync(testCasesPath, 'utf-8'));

const solutionFunction = new Function('...args', `${userCode}; return solution(...args);`);

const results = testCases.map(({ input, expectedOutput }) => {
    if (!input || !Array.isArray(input)) {
        throw new Error(`Invalid input: ${JSON.stringify(input)}`);
    }

    const actualOutput = solutionFunction(...input);
    const isPass = JSON.stringify(actualOutput) === JSON.stringify(expectedOutput);

    return {
        input,
        expectedOutput,
        actualOutput,
        result: isPass ? 'Pass' : 'Fail',
    };
});

console.log(JSON.stringify(results, null, 2));
