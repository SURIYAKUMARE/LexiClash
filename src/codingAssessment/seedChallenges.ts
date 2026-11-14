import { CodingChallenge } from './types';

export const SEED_CODING_CHALLENGES: CodingChallenge[] = [
  // 1. JavaScript Challenge - Array & Frequency
  {
    id: 'js-freq-map',
    title: 'Item Frequency & Threshold Filter',
    language: 'javascript',
    difficulty: 'intermediate',
    category: 'Data Structures & Algorithms',
    skillAffected: 'JavaScript',
    targetLevel: 3,
    description: 'Implement a function `filterByFrequency(items, minFrequency)` that accepts an array of strings or numbers and returns an array of unique items that appear at least `minFrequency` times, sorted in ascending order.',
    instructions: [
      'Build a frequency map of each item in the input array.',
      'Filter out items that appear fewer than `minFrequency` times.',
      'Return unique keys sorted in natural ascending order.',
      'Handle empty arrays gracefully by returning an empty array.'
    ],
    starterCode: `function filterByFrequency(items, minFrequency) {
  // Your code here
  const freq = {};
  
  return [];
}`,
    solutionTemplate: `function filterByFrequency(items, minFrequency) {
  const counts = new Map();
  for (const item of items) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }
  const result = [];
  for (const [key, count] of counts.entries()) {
    if (count >= minFrequency) {
      result.push(key);
    }
  }
  return result.sort((a, b) => (typeof a === 'number' ? a - b : String(a).localeCompare(String(b))));
}`,
    testCases: [
      {
        id: 'tc-js-1',
        description: 'Find items with frequency >= 2 in number array',
        input: [[1, 2, 2, 3, 3, 3, 4], 2],
        expectedOutput: [2, 3],
        isHidden: false
      },
      {
        id: 'tc-js-2',
        description: 'Find words with frequency >= 3',
        input: [['apple', 'banana', 'apple', 'orange', 'apple', 'banana'], 3],
        expectedOutput: ['apple'],
        isHidden: false
      },
      {
        id: 'tc-js-3',
        description: 'Return empty array when no element meets frequency threshold',
        input: [[10, 20, 30], 2],
        expectedOutput: [],
        isHidden: true
      },
      {
        id: 'tc-js-4',
        description: 'Handle empty array input',
        input: [[], 1],
        expectedOutput: [],
        isHidden: true
      }
    ]
  },

  // 2. JavaScript Challenge - Deep Object Flattener
  {
    id: 'js-flatten-obj',
    title: 'Deep Object Flattener (Dot Notation)',
    language: 'javascript',
    difficulty: 'advanced',
    category: 'Object Manipulation & Recursion',
    skillAffected: 'JavaScript',
    targetLevel: 4,
    description: 'Write `flattenObject(obj)` that transforms a deeply nested JavaScript object into a flat object where keys represent the path delimited by periods (`.`).',
    instructions: [
      'Recursively traverse nested objects.',
      'Concatenate keys with "." (e.g. `user.address.city`).',
      'Preserve primitive values (numbers, strings, booleans, null).',
      'Ignore non-object primitives at root.'
    ],
    starterCode: `function flattenObject(obj, prefix = '') {
  // Your code here
  return {};
}`,
    solutionTemplate: `function flattenObject(obj, prefix = '') {
  let result = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const newKey = prefix ? prefix + '.' + key : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(result, flattenObject(val, newKey));
    } else {
      result[newKey] = val;
    }
  }
  return result;
}`,
    testCases: [
      {
        id: 'tc-flat-1',
        description: 'Flatten two-level user object',
        input: [{ user: { name: 'Alex', age: 24 } }],
        expectedOutput: { 'user.name': 'Alex', 'user.age': 24 },
        isHidden: false
      },
      {
        id: 'tc-flat-2',
        description: 'Flatten deeply nested configuration settings',
        input: [{ server: { db: { host: 'localhost', port: 5432 } } }],
        expectedOutput: { 'server.db.host': 'localhost', 'server.db.port': 5432 },
        isHidden: false
      },
      {
        id: 'tc-flat-3',
        description: 'Flatten object containing null values',
        input: [{ a: { b: null, c: 1 } }],
        expectedOutput: { 'a.b': null, 'a.c': 1 },
        isHidden: true
      }
    ]
  },

  // 3. Python Challenge - Two Sum
  {
    id: 'py-two-sum',
    title: 'Two Sum Target Indices (O(n) Hash Table)',
    language: 'python',
    difficulty: 'intermediate',
    category: 'Algorithms & Data Structures',
    skillAffected: 'Python',
    targetLevel: 3,
    description: 'Implement `two_sum(nums, target)` that returns the 0-based indices of the two numbers in `nums` such that they add up to `target`.',
    instructions: [
      'Each input has exactly one solution.',
      'You may not use the same element twice.',
      'Return the indices sorted in ascending order.',
      'Aim for linear O(n) runtime complexity.'
    ],
    starterCode: `def two_sum(nums, target):
    # Your implementation here
    lookup = {}
    return []
`,
    solutionTemplate: `def two_sum(nums, target):
    seen = {}
    for idx, num in enumerate(nums):
        diff = target - num
        if diff in seen:
            return [seen[diff], idx]
        seen[num] = idx
    return []
`,
    testCases: [
      {
        id: 'tc-py-1',
        description: 'Basic two sum test case',
        input: [[2, 7, 11, 15], 9],
        expectedOutput: [0, 1],
        isHidden: false
      },
      {
        id: 'tc-py-2',
        description: 'Target formed by non-consecutive elements',
        input: [[3, 2, 4], 6],
        expectedOutput: [1, 2],
        isHidden: false
      },
      {
        id: 'tc-py-3',
        description: 'Elements with duplicate values',
        input: [[3, 3], 6],
        expectedOutput: [0, 1],
        isHidden: true
      },
      {
        id: 'tc-py-4',
        description: 'Array with negative numbers',
        input: [[-1, -2, -3, -4, -5], -8],
        expectedOutput: [2, 4],
        isHidden: true
      }
    ]
  },

  // 4. Python Challenge - Valid Parentheses
  {
    id: 'py-valid-parentheses',
    title: 'Balanced Bracket Sequence Validator',
    language: 'python',
    difficulty: 'beginner',
    category: 'String Parsing & Stacks',
    skillAffected: 'Python',
    targetLevel: 2,
    description: 'Given a string `s` containing just the characters `(`, `)`, `{`, `}`, `[` and `]`, determine if the input string is valid.',
    instructions: [
      'Open brackets must be closed by the same type of brackets.',
      'Open brackets must be closed in the correct order.',
      'Every close bracket has a corresponding open bracket of the same type.',
      'Return True if valid, False otherwise.'
    ],
    starterCode: `def is_valid_parentheses(s):
    # Your code here
    stack = []
    return True
`,
    solutionTemplate: `def is_valid_parentheses(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack
`,
    testCases: [
      {
        id: 'tc-py-v1',
        description: 'Simple matching brackets',
        input: ['()[]{}'],
        expectedOutput: true,
        isHidden: false
      },
      {
        id: 'tc-py-v2',
        description: 'Mismatched brackets',
        input: ['(]'],
        expectedOutput: false,
        isHidden: false
      },
      {
        id: 'tc-py-v3',
        description: 'Nested valid brackets',
        input: ['{[]()}'],
        expectedOutput: true,
        isHidden: true
      },
      {
        id: 'tc-py-v4',
        description: 'Unclosed opening bracket',
        input: ['('],
        expectedOutput: false,
        isHidden: true
      }
    ]
  },

  // 5. SQL Challenge - Department High Earners
  {
    id: 'sql-dept-high-earners',
    title: 'Department Salary Ranking & Averaging',
    language: 'sql',
    difficulty: 'intermediate',
    category: 'Relational Queries & Aggregations',
    skillAffected: 'SQL / Databases',
    targetLevel: 3,
    description: 'Write a SQL query that retrieves all employees who earn more than $75,000 in the "Engineering" department, ordered by salary descending.',
    instructions: [
      'Schema: `employees` (id, name, department, salary, hire_year)',
      'Filter where department is "Engineering" and salary > 75000.',
      'Select columns: `id`, `name`, `salary`.',
      'Order by `salary` DESC.'
    ],
    starterCode: `-- Schema: employees(id, name, department, salary, hire_year)
SELECT id, name, salary
FROM employees
WHERE department = 'Engineering'
ORDER BY salary DESC;`,
    solutionTemplate: `SELECT id, name, salary
FROM employees
WHERE department = 'Engineering' AND salary > 75000
ORDER BY salary DESC;`,
    testCases: [
      {
        id: 'tc-sql-1',
        description: 'Query Engineering employees with salary > 75000',
        input: {
          table: 'employees',
          data: [
            { id: 101, name: 'Alice Smith', department: 'Engineering', salary: 92000, hire_year: 2021 },
            { id: 102, name: 'Bob Jones', department: 'Engineering', salary: 74000, hire_year: 2023 },
            { id: 103, name: 'Charlie Lee', department: 'Design', salary: 88000, hire_year: 2020 },
            { id: 104, name: 'Diana Prince', department: 'Engineering', salary: 115000, hire_year: 2019 },
            { id: 105, name: 'Evan Wright', department: 'Sales', salary: 78000, hire_year: 2022 }
          ]
        },
        expectedOutput: [
          { id: 104, name: 'Diana Prince', salary: 115000 },
          { id: 101, name: 'Alice Smith', salary: 92000 }
        ],
        isHidden: false
      },
      {
        id: 'tc-sql-2',
        description: 'Verify empty set when no engineer exceeds 75000',
        input: {
          table: 'employees',
          data: [
            { id: 201, name: 'Dev Junior', department: 'Engineering', salary: 65000, hire_year: 2024 },
            { id: 202, name: 'Support Rep', department: 'Support', salary: 82000, hire_year: 2022 }
          ]
        },
        expectedOutput: [],
        isHidden: true
      }
    ]
  },

  // 6. SQL Challenge - High Value Repeat Customers
  {
    id: 'sql-repeat-customers',
    title: 'Customer Order Aggregation & Repeat Buyers',
    language: 'sql',
    difficulty: 'advanced',
    category: 'JOINs & Group By Aggregations',
    skillAffected: 'SQL / Databases',
    targetLevel: 4,
    description: 'Write a SQL query that joins `customers` and `orders` to find customer names who have placed at least 2 completed orders, with their total spend.',
    instructions: [
      'Schema: `customers(id, name, city)` and `orders(id, customer_id, amount, status)`',
      'Filter only orders where `status = "COMPLETED"`.',
      'Group by `customers.id, customers.name`.',
      'Filter groups with `COUNT(orders.id) >= 2`.',
      'Select `customers.name` and `SUM(orders.amount) AS total_spent`.',
      'Order by `total_spent` DESC.'
    ],
    starterCode: `SELECT c.name, SUM(o.amount) as total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'COMPLETED'
GROUP BY c.id, c.name
HAVING COUNT(o.id) >= 2
ORDER BY total_spent DESC;`,
    solutionTemplate: `SELECT c.name, SUM(o.amount) as total_spent
FROM customers c
JOIN orders o ON c.id = o.customer_id
WHERE o.status = 'COMPLETED'
GROUP BY c.id, c.name
HAVING COUNT(o.id) >= 2
ORDER BY total_spent DESC;`,
    testCases: [
      {
        id: 'tc-sql-rpt-1',
        description: 'Aggregate completed orders for repeat buyers',
        input: {
          customers: [
            { id: 1, name: 'Acme Corp', city: 'Seattle' },
            { id: 2, name: 'Beta Ltd', city: 'Austin' },
            { id: 3, name: 'Gamma Inc', city: 'Boston' }
          ],
          orders: [
            { id: 101, customer_id: 1, amount: 500, status: 'COMPLETED' },
            { id: 102, customer_id: 1, amount: 750, status: 'COMPLETED' },
            { id: 103, customer_id: 2, amount: 1200, status: 'PENDING' },
            { id: 104, customer_id: 2, amount: 300, status: 'COMPLETED' },
            { id: 105, customer_id: 3, amount: 400, status: 'COMPLETED' },
            { id: 106, customer_id: 3, amount: 600, status: 'COMPLETED' },
            { id: 107, customer_id: 3, amount: 250, status: 'COMPLETED' }
          ]
        },
        expectedOutput: [
          { name: 'Gamma Inc', total_spent: 1250 },
          { name: 'Acme Corp', total_spent: 1250 }
        ],
        isHidden: false
      }
    ]
  }
];
