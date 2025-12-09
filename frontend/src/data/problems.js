// src/data/problems.js
export const PROBLEMS = {
  "two-sum": {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Array • Hash Table",
    description: {
      text: "Given an array of integers nums and an integer target, return indices of the two numbers in the array such that they add up to target.",
      notes: [
        "You may assume that each input would have exactly one solution, and you may not use the same element twice.",
        "You can return the answer in any order.",
      ],
    },
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "Only one valid answer exists",
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your solution here
  
}

console.log(twoSum([2, 7, 11, 15], 9)); // [0, 1]
console.log(twoSum([3, 2, 4], 6)); // [1, 2]
// `,
      python: `def twoSum(nums, target):
    # Write your solution here
    pass

print(twoSum([2, 7, 11, 15], 9))  # [0, 1]
print(twoSum([3, 2, 4], 6))        # [1, 2]`,
      java: `import java.util.*;

class Solution {
    public static int[] twoSum(int[] nums, int target) {
        return new int[0];
    }
    
    public static void main(String[] args) {
        System.out.println(Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));
        System.out.println(Arrays.toString(twoSum(new int[]{3, 2, 4}, 6)));
    }
}`
    },
    expectedOutput: {
      javascript: "[0,1]\n[1,2]",
      python: "[0, 1]\n[1, 2]",
      java: "[0, 1]\n[1, 2]",
    },
  },

  "reverse-string": {
    id: "reverse-string",
    title: "Reverse String",
    difficulty: "Easy",
    category: "String • Two Pointers",
    description: {
      text: "Write a function that reverses a string. The input string is given as an array of characters s.",
      notes: ["You must do this by modifying the input array in-place with O(1) extra memory."],
    },
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
      },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁵"],
    starterCode: {
      javascript: `function reverseString(s) {
  // Write your solution here
}

let test1 = ["h","e","l","l","o"];
reverseString(test1);
console.log(test1); // ["o","l","l","e","h"]`,
      python: `def reverseString(s):
    pass

test1 = ["h","e","l","l","o"]
reverseString(test1)
print(test1)`,
      java: `import java.util.*;

class Solution {
    public static void reverseString(char[] s) {
    }
    
    public static void main(String[] args) {
        char[] test1 = {'h','e','l','l','o'};
        reverseString(test1);
        System.out.println(Arrays.toString(test1));
    }
}`
    },
    expectedOutput: {
      javascript: '["o","l","l","e","h"]',
      python: "['o', 'l', 'l', 'e', 'h']",
      java: "[o, l, l, e, h]",
    },
  },

  "valid-palindrome": {
    id: "valid-palindrome",
    title: "Valid Palindrome",
    difficulty: "Easy",
    category: "String • Two Pointers",
    description: {
      text: "A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward.",
      notes: ["Given a string s, return true if it is a palindrome, or false otherwise."],
    },
    examples: [
      {
        input: 's = "A man, a plan, a canal: Panama"',
        output: "true",
        explanation: '"amanaplanacanalpanama" is a palindrome.',
      },
    ],
    constraints: ["1 ≤ s.length ≤ 2 * 10⁵"],
    starterCode: {
      javascript: `function isPalindrome(s) {
  // Write your solution here
}

console.log(isPalindrome("A man, a plan, a canal: Panama")); // true`,
      python: `def isPalindrome(s):
    pass

print(isPalindrome("A man, a plan, a canal: Panama"))`,
      java: `class Solution {
    public static boolean isPalindrome(String s) {
        return false;
    }
    
    public static void main(String[] args) {
        System.out.println(isPalindrome("A man, a plan, a canal: Panama"));
    }
}`
    },
    expectedOutput: {
      javascript: "true",
      python: "True",
      java: "true",
    },
  },

  "maximum-subarray": {
    id: "maximum-subarray",
    title: "Maximum Subarray",
    difficulty: "Medium",
    category: "Array • Dynamic Programming",
    description: {
      text: "Given an integer array nums, find the subarray with the largest sum, and return its sum.",
      notes: [],
    },
    examples: [
      {
        input: "nums = [-2,1,-3,4,-1,2,1,-5,4]",
        output: "6",
        explanation: "The subarray [4,-1,2,1] has the largest sum 6.",
      },
    ],
    constraints: ["1 ≤ nums.length ≤ 10⁵", "-10⁴ ≤ nums[i] ≤ 10⁴"],
    starterCode: {
      javascript: `function maxSubArray(nums) {
  // Write your solution here
}

console.log(maxSubArray([-2,1,-3,4,-1,2,1,-5,4])); // 6`,
      python: `def maxSubArray(nums):
    pass

print(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]))`,
      java: `class Solution {
    public static int maxSubArray(int[] nums) {
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(maxSubArray(new int[]{-2,1,-3,4,-1,2,1,-5,4}));
    }
}`
    },
    expectedOutput: {
      javascript: "6",
      python: "6",
      java: "6",
    },
  },

  "container-with-most-water": {
    id: "container-with-most-water",
    title: "Container With Most Water",
    difficulty: "Medium",
    category: "Array • Two Pointers",
    description: {
      text: "You are given an integer array height of length n. Find two lines that together with the x-axis form a container, such that the container contains the most water.",
      notes: ["Return the maximum amount of water a container can store."],
    },
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
      },
    ],
    constraints: ["2 ≤ n ≤ 10⁵"],
    starterCode: {
      javascript: `function maxArea(height) {
  // Write your solution here
}

console.log(maxArea([1,8,6,2,5,4,8,3,7])); // 49`,
      python: `def maxArea(height):
    pass

print(maxArea([1,8,6,2,5,4,8,3,7]))`,
      java: `class Solution {
    public static int maxArea(int[] height) {
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(maxArea(new int[]{1,8,6,2,5,4,8,3,7}));
    }
}`
    },
    expectedOutput: {
      javascript: "49",
      python: "49",
      java: "49",
    },
  },

  "longest-substring": {
    id: "longest-substring",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "String • Hash Table • Sliding Window",
    description: {
      text: "Given a string s, find the length of the longest substring without repeating characters.",
      notes: [],
    },
    examples: [
      {
        input: 's = "abcabcbb"',
        output: "3",
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: "1",
        explanation: 'The answer is "b", with the length of 1.',
      },
    ],
    constraints: ["0 ≤ s.length ≤ 5 * 10⁴"],
    starterCode: {
      javascript: `function lengthOfLongestSubstring(s) {
  // Write your solution here
}

console.log(lengthOfLongestSubstring("abcabcbb")); // 3
console.log(lengthOfLongestSubstring("bbbbb")); // 1`,
      python: `def lengthOfLongestSubstring(s):
    pass

print(lengthOfLongestSubstring("abcabcbb"))
print(lengthOfLongestSubstring("bbbbb"))`,
      java: `class Solution {
    public static int lengthOfLongestSubstring(String s) {
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb"));
        System.out.println(lengthOfLongestSubstring("bbbbb"));
    }
}`
    },
    expectedOutput: {
      javascript: "3\n1",
      python: "3\n1",
      java: "3\n1",
    },
  },

  "three-sum": {
    id: "three-sum",
    title: "3Sum",
    difficulty: "Medium",
    category: "Array • Two Pointers • Sorting",
    description: {
      text: "Given an integer array nums, return all the triplets [nums[i], nums[j], nums[k]] such that i != j, i != k, and j != k, and nums[i] + nums[j] + nums[k] == 0.",
      notes: ["Notice that the solution set must not contain duplicate triplets."],
    },
    examples: [
      {
        input: "nums = [-1,0,1,2,-1,-4]",
        output: "[[-1,-1,2],[-1,0,1]]",
      },
    ],
    constraints: ["3 ≤ nums.length ≤ 3000"],
    starterCode: {
      javascript: `function threeSum(nums) {
  // Write your solution here
}

console.log(JSON.stringify(threeSum([-1,0,1,2,-1,-4])));`,
      python: `def threeSum(nums):
    pass

print(threeSum([-1,0,1,2,-1,-4]))`,
      java: `import java.util.*;

class Solution {
    public static List<List<Integer>> threeSum(int[] nums) {
        return new ArrayList<>();
    }
    
    public static void main(String[] args) {
        System.out.println(threeSum(new int[]{-1,0,1,2,-1,-4}));
    }
}`
    },
    expectedOutput: {
      javascript: '[[-1,-1,2],[-1,0,1]]',
      python: "[[-1, -1, 2], [-1, 0, 1]]",
      java: "[[-1, -1, 2], [-1, 0, 1]]",
    },
  },

  "group-anagrams": {
    id: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    category: "String • Hash Table • Sorting",
    description: {
      text: "Given an array of strings strs, group the anagrams together. You can return the answer in any order.",
      notes: ["An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase."],
    },
    examples: [
      {
        input: 'strs = ["eat","tea","tan","ate","nat","bat"]',
        output: '[["bat"],["nat","tan"],["ate","eat","tea"]]',
      },
    ],
    constraints: ["1 ≤ strs.length ≤ 10⁴"],
    starterCode: {
      javascript: `function groupAnagrams(strs) {
  // Write your solution here
}

console.log(JSON.stringify(groupAnagrams(["eat","tea","tan","ate","nat","bat"])));`,
      python: `def groupAnagrams(strs):
    pass

print(groupAnagrams(["eat","tea","tan","ate","nat","bat"]))`,
      java: `import java.util.*;

class Solution {
    public static List<List<String>> groupAnagrams(String[] strs) {
        return new ArrayList<>();
    }
    
    public static void main(String[] args) {
        System.out.println(groupAnagrams(new String[]{"eat","tea","tan","ate","nat","bat"}));
    }
}`
    },
    expectedOutput: {
      javascript: '[["eat","tea","ate"],["tan","nat"],["bat"]]',
      python: "[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]",
      java: "[[eat, tea, ate], [tan, nat], [bat]]",
    },
  },

  "trapping-rain-water": {
    id: "trapping-rain-water",
    title: "Trapping Rain Water",
    difficulty: "Hard",
    category: "Array • Two Pointers • Stack",
    description: {
      text: "Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.",
      notes: [],
    },
    examples: [
      {
        input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        output: "6",
        explanation: "The elevation map traps 6 units of rain water.",
      },
    ],
    constraints: ["n == height.length", "1 ≤ n ≤ 2 * 10⁴"],
    starterCode: {
      javascript: `function trap(height) {
  // Write your solution here
}

console.log(trap([0,1,0,2,1,0,1,3,2,1,2,1])); // 6`,
      python: `def trap(height):
    pass

print(trap([0,1,0,2,1,0,1,3,2,1,2,1]))`,
      java: `class Solution {
    public static int trap(int[] height) {
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(trap(new int[]{0,1,0,2,1,0,1,3,2,1,2,1}));
    }
}`
    },
    expectedOutput: {
      javascript: "6",
      python: "6",
      java: "6",
    },
  },

  "median-two-sorted-arrays": {
    id: "median-two-sorted-arrays",
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    category: "Array • Binary Search • Divide and Conquer",
    description: {
      text: "Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.",
      notes: ["The overall run time complexity should be O(log (m+n))."],
    },
    examples: [
      {
        input: "nums1 = [1,3], nums2 = [2]",
        output: "2.00000",
        explanation: "merged array = [1,2,3] and median is 2.",
      },
    ],
    constraints: ["nums1.length == m", "nums2.length == n"],
    starterCode: {
      javascript: `function findMedianSortedArrays(nums1, nums2) {
  // Write your solution here
}

console.log(findMedianSortedArrays([1,3], [2])); // 2`,
      python: `def findMedianSortedArrays(nums1, nums2):
    pass

print(findMedianSortedArrays([1,3], [2]))`,
      java: `class Solution {
    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {
        return 0.0;
    }
    
    public static void main(String[] args) {
        System.out.println(findMedianSortedArrays(new int[]{1,3}, new int[]{2}));
    }
}`
    },
    expectedOutput: {
      javascript: "2",
      python: "2.0",
      java: "2.0",
    },
  },

  "longest-valid-parentheses": {
    id: "longest-valid-parentheses",
    title: "Longest Valid Parentheses",
    difficulty: "Hard",
    category: "String • Stack • Dynamic Programming",
    description: {
      text: "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
      notes: [],
    },
    examples: [
      {
        input: 's = "(()"',
        output: "2",
        explanation: 'The longest valid parentheses substring is "()".',
      },
      {
        input: 's = ")()())"',
        output: "4",
        explanation: 'The longest valid parentheses substring is "()()".',
      },
    ],
    constraints: ["0 ≤ s.length ≤ 3 * 10⁴"],
    starterCode: {
      javascript: `function longestValidParentheses(s) {
  // Write your solution here
}

console.log(longestValidParentheses("(()")); // 2
console.log(longestValidParentheses(")()())")); // 4`,
      python: `def longestValidParentheses(s):
    pass

print(longestValidParentheses("(()"))
print(longestValidParentheses(")()())"))`,
      java: `class Solution {
    public static int longestValidParentheses(String s) {
        return 0;
    }
    
    public static void main(String[] args) {
        System.out.println(longestValidParentheses("(()"));
        System.out.println(longestValidParentheses(")()())"));
    }
}`
    },
    expectedOutput: {
      javascript: "2\n4",
      python: "2\n4",
      java: "2\n4",
    },
  },

  "regular-expression-matching": {
    id: "regular-expression-matching",
    title: "Regular Expression Matching",
    difficulty: "Hard",
    category: "String • Dynamic Programming • Recursion",
    description: {
      text: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.",
      notes: [
        "'.' Matches any single character.",
        "'*' Matches zero or more of the preceding element.",
      ],
    },
    examples: [
      {
        input: 's = "aa", p = "a"',
        output: "false",
      },
      {
        input: 's = "aa", p = "a*"',
        output: "true",
      },
    ],
    constraints: ["1 ≤ s.length ≤ 20"],
    starterCode: {
      javascript: `function isMatch(s, p) {
  // Write your solution here
}

console.log(isMatch("aa", "a")); // false
console.log(isMatch("aa", "a*")); // true`,
      python: `def isMatch(s, p):
    pass

print(isMatch("aa", "a"))
print(isMatch("aa", "a*"))`,
      java: `class Solution {
    public static boolean isMatch(String s, String p) {
        return false;
    }
    
    public static void main(String[] args) {
        System.out.println(isMatch("aa", "a"));
        System.out.println(isMatch("aa", "a*"));
    }
}`
    },
    expectedOutput: {
      javascript: "false\ntrue",
      python: "False\nTrue",
      java: "false\ntrue",
    },
  },

  // NEW 8 PROBLEMS ADDED BELOW (Interview Favorites)

  "merge-intervals": {
    id: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    category: "Array • Sorting",
    description: {
      text: "Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.",
      notes: ["Return an array of the non-overlapping intervals that cover all the intervals in the input."],
    },
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
      },
    ],
    constraints: ["1 ≤ intervals.length ≤ 10⁴"],
    starterCode: {
      javascript: `function merge(intervals) {
  // Write your solution here
}

console.log(JSON.stringify(merge([[1,3],[2,6],[8,10],[15,18]])));`,
      python: `def merge(intervals):
    pass

print(merge([[1,3],[2,6],[8,10],[15,18]]))`,
      java: `import java.util.*;

class Solution {
    public static int[][] merge(int[][] intervals) {
        return new int[0][];
    }
}`
    },
    expectedOutput: {
      javascript: "[[1,6],[8,10],[15,18]]",
      python: "[[1, 6], [8, 10], [15, 18]]",
      java: "[[1, 6], [8, 10], [15, 18]]",
    },
  },

  "valid-parentheses": {
    id: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "String • Stack",
    description: {
      text: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
      notes: ["An input string is valid if open brackets are closed in correct order."],
    },
    examples: [
      {
        input: 's = "()[]{}"',
        output: "true",
      },
      {
        input: 's = "(]"',
        output: "false",
      },
    ],
    constraints: ["1 ≤ s.length ≤ 10⁴"],
    starterCode: {
      javascript: `function isValid(s) {
  // Write your solution here
}

console.log(isValid("()[]{}")); // true
console.log(isValid("(]"));     // false`,
      python: `def isValid(s):
    pass

print(isValid("()[]{}"))
print(isValid("(]"))`,
      java: `class Solution {
    public static boolean isValid(String s) {
        return false;
    }
}`
    },
    expectedOutput: {
      javascript: "true\nfalse",
      python: "True\nFalse",
      java: "true\nfalse",
    },
  },

  "best-time-to-buy-and-sell-stock": {
    id: "best-time-to-buy-and-sell-stock",
    title: "Best Time to Buy and Sell Stock",
    difficulty: "Easy",
    category: "Array • Dynamic Programming",
    description: {
      text: "You are given an array prices where prices[i] is the price of a given stock on the ith day. Find the maximum profit.",
      notes: ["You can only complete at most one transaction."],
    },
    examples: [
      {
        input: "prices = [7,1,5,3,6,4]",
        output: "5",
      },
    ],
    constraints: ["1 ≤ prices.length ≤ 10⁵"],
    starterCode: {
      javascript: `function maxProfit(prices) {
  // Write your solution here
}

console.log(maxProfit([7,1,5,3,6,4])); // 5`,
      python: `def maxProfit(prices):
    pass

print(maxProfit([7,1,5,3,6,4]))`,
      java: `class Solution {
    public static int maxProfit(int[] prices) {
        return 0;
    }
}`
    },
    expectedOutput: {
      javascript: "5",
      python: "5",
      java: "5",
    },
  },

  "invert-binary-tree": {
    id: "invert-binary-tree",
    title: "Invert Binary Tree",
    difficulty: "Easy",
    category: "Tree • DFS",
    description: {
      text: "Given the root of a binary tree, invert the tree, and return its root.",
      notes: [],
    },
    examples: [
      {
        input: "root = [4,2,7,1,3,6,9]",
        output: "[4,7,2,9,6,3,1]",
      },
    ],
    constraints: ["The number of nodes in the tree is in the range [0, 100]."],
    starterCode: {
      javascript: `function invertTree(root) {
  // Write your solution here
}

const tree = { val: 4, left: { val: 2, left: { val: 1 }, right: { val: 3 } }, right: { val: 7, left: { val: 6 }, right: { val: 9 } } };
console.log(invertTree(tree));`,
      python: `def invertTree(root):
    pass`,
      java: `class Solution {
    public TreeNode invertTree(TreeNode root) {
        return null;
    }
}`
    },
    expectedOutput: {
      javascript: "{val:4,left:{val:7,left:{val:9},right:{val:6}},right:{val:2,left:{val:3},right:{val:1}}}",
      python: "inverted tree",
      java: "inverted tree",
    },
  },

  "number-of-islands": {
    id: "number-of-islands",
    title: "Number of Islands",
    difficulty: "Medium",
    category: "Array • DFS • BFS",
    description: {
      text: "Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return the number of islands.",
      notes: ["An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically."],
    },
    examples: [
      {
        input: "grid = [['1','1','0'],['1','0','0'],['0','0','1']]",
        output: "2",
      },
    ],
    constraints: ["m == grid.length", "n == grid[i].length"],
    starterCode: {
      javascript: `function numIslands(grid) {
  // Write your solution here
}

const grid = [["1","1","0"],["1","0","0"],["0","0","1"]];
console.log(numIslands(grid)); // 2`,
      python: `def numIslands(grid):
    pass

grid = [["1","1","0"],["1","0","0"],["0","0","1"]]
print(numIslands(grid))`,
      java: `class Solution {
    public int numIslands(char[][] grid) {
        return 0;
    }
}`
    },
    expectedOutput: {
      javascript: "2",
      python: "2",
      java: "2",
    },
  },

  "climbing-stairs": {
    id: "climbing-stairs",
    title: "Climbing Stairs",
    difficulty: "Easy",
    category: "Dynamic Programming",
    description: {
      text: "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?",
      notes: [],
    },
    examples: [
      {
        input: "n = 3",
        output: "3",
      },
    ],
    constraints: ["1 ≤ n ≤ 45"],
    starterCode: {
      javascript: `function climbStairs(n) {
  // Write your solution here
}

console.log(climbStairs(3)); // 3`,
      python: `def climbStairs(n):
    pass

print(climbStairs(3))`,
      java: `class Solution {
    public static int climbStairs(int n) {
        return 0;
    }
}`
    },
    expectedOutput: {
      javascript: "3",
      python: "3",
      java: "3",
    },
  },

  "coin-change": {
    id: "coin-change",
    title: "Coin Change",
    difficulty: "Medium",
    category: "Dynamic Programming",
    description: {
      text: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins needed to make up that amount.",
      notes: ["If that amount of money cannot be made up by any combination of the coins, return -1."],
    },
    examples: [
      {
        input: "coins = [1,2,5], amount = 11",
        output: "3",
        explanation: "11 = 5 + 5 + 1",
      },
    ],
    constraints: ["1 ≤ coins.length ≤ 12", "1 ≤ coins[i] ≤ 2³¹ - 1"],
    starterCode: {
      javascript: `function coinChange(coins, amount) {
  // Write your solution here
}

console.log(coinChange([1,2,5], 11)); // 3`,
      python: `def coinChange(coins, amount):
    pass

print(coinChange([1,2,5], 11))`,
      java: `class Solution {
    public static int coinChange(int[] coins, int amount) {
        return -1;
    }
}`
    },
    expectedOutput: {
      javascript: "3",
      python: "3",
      java: "3",
    },
  },

  "word-break": {
    id: "word-break",
    title: "Word Break",
    difficulty: "Medium",
    category: "String • Dynamic Programming • Trie",
    description: {
      text: "Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.",
      notes: [],
    },
    examples: [
      {
        input: 's = "leetcode", wordDict = ["leet","code"]',
        output: "true",
      },
    ],
    constraints: ["1 ≤ s.length ≤ 300"],
    starterCode: {
      javascript: `function wordBreak(s, wordDict) {
  // Write your solution here
}

console.log(wordBreak("leetcode", ["leet","code"])); // true`,
      python: `def wordBreak(s, wordDict):
    pass

print(wordBreak("leetcode", ["leet","code"]))`,
      java: `class Solution {
    public static boolean wordBreak(String s, List<String> wordDict) {
        return false;
    }
}`
    },
    expectedOutput: {
      javascript: "true",
      python: "True",
      java: "true",
    },
  }
};

export const LANGUAGE_CONFIG = {
  javascript: {
    name: "JavaScript",
    icon: "/javascript.png",
    monacoLang: "javascript",
  },
  python: {
    name: "Python",
    icon: "/python.png",
    monacoLang: "python",
  },
  java: {
    name: "Java",
    icon: "/java.png",
    monacoLang: "java",
  },
};