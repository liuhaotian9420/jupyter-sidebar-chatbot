"use strict";
const { marked } = require('marked');
const { configureMarked, preprocessMarkdown } = require('./markdown-config');
// Configure marked
configureMarked();
// Test cases
const testCases = [
    {
        name: 'Simple Python Code Block',
        input: '```python\ndef hello():\n    print("Hello World")\n    return True\n```'
    },
    {
        name: 'JavaScript Code Block with Indentation',
        input: `\`\`\`javascript
function test() {
    const x = 1;
    if (x > 0) {
        return true;
    }
    return false;
}
\`\`\``
    },
    {
        name: 'Code Block with Text and Inline Code',
        input: `Here's a code block with \`inline code\`:

\`\`\`typescript
interface User {
    name: string;
    age: number;
}

const user: User = {
    name: "John",
    age: 30
};
\`\`\``
    },
    {
        name: 'Multiple Code Blocks',
        input: `First block:
\`\`\`python
print("First")
\`\`\`

Second block:
\`\`\`javascript
console.log("Second");
\`\`\``
    },
    {
        name: 'Code Block with Special Characters',
        input: `\`\`\`sql
SELECT * FROM users
WHERE name LIKE '%John%'
  AND age > 21;
-- Comment with # and \`\`\` characters
\`\`\``
    }
];
// Run tests
console.log('Testing Code Block Rendering:');
console.log('----------------------------');
testCases.forEach(({ name, input }) => {
    console.log(`\nTest: ${name}`);
    console.log('Input:');
    console.log(input);
    const processed = preprocessMarkdown(input);
    console.log('\nProcessed:');
    console.log(processed);
    const rendered = marked(processed);
    console.log('\nRendered HTML:');
    console.log(rendered);
});
