// Book quick quizzes for Algorithms Analysis & Design (CS311 / CS316) from CLRS (3rd Ed.) & Neapolitan (3rd Ed.)
window.BOOK = window.BOOK || {};
window.BOOK.algo = {
  "1": [
    {
      "q": "In CLRS Chapter 2 (\u00a72.1, p. 18), what are the three properties that must be shown for a loop invariant to prove an algorithm's correctness?",
      "a": 1,
      "o": [
        [
          "Divide, Conquer, and Combine",
          "Those are the three steps of Divide-and-Conquer (\u00a72.3.1, p. 30), not loop invariant proofs."
        ],
        [
          "Initialization, Maintenance, and Termination",
          "Correct \u2014 CLRS Ch. 2 \u00a72.1 (p. 18\u201319): A loop invariant proof requires Initialization (true prior to first iteration), Maintenance (if true before an iteration, remains true before the next), and Termination (when loop terminates, invariant yields a useful property showing correctness)."
        ],
        [
          "Best-case, Average-case, and Worst-case",
          "Those are running-time analysis cases (\u00a72.2, p. 27)."
        ],
        [
          "Reflexivity, Symmetry, and Transitivity",
          "Those are properties of asymptotic equivalence relations (\u00a73.1, p. 51)."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 2 \u00a72.1, p. 18\u201319"
    },
    {
      "q": "According to CLRS \u00a72.2 (p. 26), in insertion sort, the worst-case running time occurs when the input array is:",
      "a": 2,
      "o": [
        [
          "Already sorted in nondecreasing order",
          "Already sorted input is the best case \u0398(n), where t_j = 1 for all j."
        ],
        [
          "Randomly permuted with no duplicates",
          "Randomly permuted input gives the average case (t_j \u2248 j/2), though still \u0398(n\u00b2)."
        ],
        [
          "Reverse sorted (sorted in decreasing order)",
          "Correct \u2014 CLRS Ch. 2 \u00a72.2 (p. 26): \"The worst case results if the array is in reverse sorted order\u2014that is, in decreasing order,\" forcing each A[j] to be compared with every element in A[1..j\u22121] (t_j = j)."
        ],
        [
          "Composed entirely of equal elements",
          "Equal elements satisfy A[i] \u2264 key immediately, running in \u0398(n) best-case time."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 2 \u00a72.2, p. 26"
    },
    {
      "q": "In CLRS \u00a72.3.1 (p. 31), how does the MERGE(A, p, q, r) procedure avoid having to check whether either the left pile L or right pile R is empty in each basic step?",
      "a": 0,
      "o": [
        [
          "By placing a special sentinel card with value \u221e at the end of both L and R",
          "Correct \u2014 CLRS Ch. 2 \u00a72.3.1 (p. 31): \"We place on the bottom of each pile a sentinel card, which contains a special value that we use to simplify our code. Here, we use \u221e as the sentinel value.\""
        ],
        [
          "By padding both arrays with zeros to length 2n",
          "Zeros would sort before positive numbers and corrupt the output."
        ],
        [
          "By reversing the right subarray R so it decreases toward the middle",
          "That is Bitonic merge, not standard CLRS MERGE."
        ],
        [
          "By using recursion instead of a for loop",
          "CLRS MERGE uses a single for loop k = p to r."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 2 \u00a72.3.1, p. 31"
    },
    {
      "q": "According to Neapolitan & Naimipour (Ch. 1 \u00a71.3, p. 17), an algorithm has an 'every-case time complexity' T(n) if and only if:",
      "a": 1,
      "o": [
        [
          "Its worst-case and best-case complexities belong to the same Big-Oh class",
          "Even if W(n) and B(n) are both \u0398(n), the exact operation count can still vary unless every input of size n does the exact same count."
        ],
        [
          "The basic operation is always done the same number of times for every instance of size n",
          "Correct \u2014 Neapolitan Ch. 1 \u00a71.3 (p. 17): \"Because the basic operation is always done the same number of times for every instance of size n, this is called the every-case time complexity T(n).\""
        ],
        [
          "It runs in O(1) constant time",
          "Add Array Members (T(n)=n) and Matrix Multiplication (T(n)=n\u00b3) have every-case complexities that depend on n."
        ],
        [
          "It uses no loops or recursion",
          "Loops with fixed bounds 1..n have every-case complexity."
        ]
      ],
      "src": "Book \u00b7 Neapolitan Ch. 1 \u00a71.3, p. 17"
    },
    {
      "q": "In Neapolitan Ch. 1 \u00a71.2 (p. 13), why is the recursive algorithm fib(n) for the nth Fibonacci number so slow?",
      "a": 2,
      "o": [
        [
          "Because C++ function calls allocate heap memory on every addition",
          "Stack frames are fast; the issue is the exponential number of calls."
        ],
        [
          "Because integer addition takes \u0398(n) time",
          "Word-sized addition is \u0398(1)."
        ],
        [
          "Because it recomputes the same Fibonacci values over and over again across overlapping recursive branches, computing > 2^(n/2) terms",
          "Correct \u2014 Neapolitan Ch. 1 \u00a71.2 (p. 13\u201315, Theorem 1.1): The recursion tree recomputes values like fib(2) many times, and Theorem 1.1 proves by induction that T(n) > 2^(n/2) for n \u2265 2."
        ],
        [
          "Because it sorts the sequence before returning",
          "fib(n) does not sort."
        ]
      ],
      "src": "Book \u00b7 Neapolitan Ch. 1 \u00a71.2, p. 13\u201315"
    }
  ],
  "2": [
    {
      "q": "According to CLRS Chapter 3 (\u00a73.1, p. 47), for a given function g(n), the set O(g(n)) is formally defined as:",
      "a": 0,
      "o": [
        [
          "{ f(n) : there exist positive constants c and n\u2080 such that 0 \u2264 f(n) \u2264 c g(n) for all n \u2265 n\u2080 }",
          "Correct \u2014 CLRS Ch. 3 \u00a73.1 (p. 47): O(g(n)) provides an asymptotic upper bound where 0 \u2264 f(n) \u2264 c g(n) for all n \u2265 n\u2080."
        ],
        [
          "{ f(n) : there exist positive constants c and n\u2080 such that 0 \u2264 c g(n) \u2264 f(n) for all n \u2265 n\u2080 }",
          "This is the definition of \u03a9(g(n)) (asymptotic lower bound, p. 48)."
        ],
        [
          "{ f(n) : lim_{n\u2192\u221e} f(n)/g(n) = \u221e }",
          "That describes \u03c9(g(n))."
        ],
        [
          "{ f(n) : f(n) \u2264 g(n) for all n \u2265 1 }",
          "Omits the constant factor c > 0 and threshold n\u2080."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 3 \u00a73.1, p. 47"
    },
    {
      "q": "By Theorem 3.1 in CLRS (\u00a73.1, p. 48), for any two functions f(n) and g(n), we have f(n) = \u0398(g(n)) if and only if:",
      "a": 1,
      "o": [
        [
          "f(n) = o(g(n)) and f(n) = \u03c9(g(n))",
          "o(g(n)) and \u03c9(g(n)) are mutually exclusive strict bounds."
        ],
        [
          "f(n) = O(g(n)) and f(n) = \u03a9(g(n))",
          "Correct \u2014 CLRS Ch. 3 \u00a73.1 Theorem 3.1 (p. 48): \"For any two functions f(n) and g(n), we have f(n) = \u0398(g(n)) if and only if f(n) = O(g(n)) and f(n) = \u03a9(g(n)).\""
        ],
        [
          "f(n) = g(n) for all n \u2265 0",
          "Asymptotic equality ignores constant factors and small n < n\u2080."
        ],
        [
          "f(n) + g(n) = O(1)",
          "Incorrect."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 3 \u00a73.1, p. 48"
    },
    {
      "q": "In CLRS \u00a73.2 (p. 56), how does any exponential function a^n (for a > 1) compare asymptotically to any polynomial function n^b?",
      "a": 2,
      "o": [
        [
          "n^b grows faster when b > a",
          "Even if b = 100 and a = 1.01, a^n eventually overtakes n^b."
        ],
        [
          "They grow at the same rate when a = b",
          "Exponential always dominates polynomial."
        ],
        [
          "Any exponential function with base a > 1 grows faster than any polynomial function n^b as n \u2192 \u221e (n^b = o(a^n))",
          "Correct \u2014 CLRS Ch. 3 \u00a73.2 (p. 56, Eq. 3.10): lim_{n\u2192\u221e} n^b / a^n = 0 for any real constants a > 1 and b, so n^b = o(a^n)."
        ],
        [
          "Polynomial functions grow faster than exponential functions for n > 1000",
          "The opposite is true."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 3 \u00a73.2, p. 56"
    },
    {
      "q": "According to CLRS \u00a73.2 (p. 57, Stirling's approximation), which asymptotic bound holds for lg(n!)?",
      "a": 1,
      "o": [
        [
          "lg(n!) = \u0398(n)",
          "lg(n!) grows faster than linear."
        ],
        [
          "lg(n!) = \u0398(n lg n)",
          "Correct \u2014 CLRS Ch. 3 \u00a73.2 (p. 57, Eq. 3.19): Using Stirling's approximation, one can prove lg(n!) = \u0398(n lg n)."
        ],
        [
          "lg(n!) = \u0398(n\u00b2)",
          "Since n! \u2264 n^n, lg(n!) \u2264 n lg n = o(n\u00b2)."
        ],
        [
          "lg(n!) = \u0398(2^n)",
          "Incorrect."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 3 \u00a73.2, p. 57"
    },
    {
      "q": "In Neapolitan Ch. 1 \u00a71.4 (p. 27), which complexity category does a function belong to if it is O(g(n)) but NOT \u0398(g(n))?",
      "a": 0,
      "o": [
        [
          "Small-oh o(g(n)) (strictly smaller order than g(n))",
          "Correct \u2014 Neapolitan Ch. 1 \u00a71.4 (p. 27): Functions in O(g(n)) \u2212 \u0398(g(n)) grow strictly more slowly than g(n) and belong to small-oh o(g(n))."
        ],
        [
          "Big-Omega \u03a9(g(n))",
          "If it were also in \u03a9(g(n)), it would be in \u0398(g(n))."
        ],
        [
          "Exponential order",
          "Incorrect."
        ],
        [
          "Incomparable order",
          "Incorrect."
        ]
      ],
      "src": "Book \u00b7 Neapolitan Ch. 1 \u00a71.4, p. 27"
    }
  ],
  "3": [
    {
      "q": "In CLRS Chapter 4 (\u00a74.3, p. 83), the substitution method for solving recurrences comprises two steps:",
      "a": 0,
      "o": [
        [
          "1. Guess the form of the solution, and 2. Use mathematical induction to find the constants and show that the solution works",
          "Correct \u2014 CLRS Ch. 4 \u00a74.3 (p. 83): \"The substitution method for solving recurrences comprises two steps: 1. Guess the form of the solution. 2. Use mathematical induction to find the constants and show that the solution works.\""
        ],
        [
          "1. Draw a recursion tree, and 2. Apply the Master Theorem",
          "Those are separate methods (\u00a74.4 and \u00a74.5)."
        ],
        [
          "1. Convert the recurrence to a loop, and 2. Time it on a computer",
          "Empirical timing is not the substitution method."
        ],
        [
          "1. Differentiate both sides, and 2. Integrate from 1 to n",
          "Not the substitution method."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 4 \u00a74.3, p. 83"
    },
    {
      "q": "In CLRS \u00a74.5 (Theorem 4.1, p. 94), in Case 3 of the Master Theorem for T(n) = aT(n/b) + f(n), in addition to f(n) = \u03a9(n^(log_b a + \u03b5)), what 'regularity condition' must f(n) satisfy?",
      "a": 2,
      "o": [
        [
          "a f(n/b) = f(n) for all n \u2265 1",
          "That would correspond to Case 2."
        ],
        [
          "f(n) must be a polynomial of degree at most 2",
          "Case 3 applies to any degree > log_b a."
        ],
        [
          "a f(n/b) \u2264 c f(n) for some constant c < 1 and all sufficiently large n",
          "Correct \u2014 CLRS Ch. 4 \u00a74.5 Theorem 4.1 (p. 94): Case 3 requires the regularity condition a f(n/b) \u2264 c f(n) for some constant c < 1 and all sufficiently large n."
        ],
        [
          "a must be strictly less than b",
          "Case 3 can hold even when a \u2265 b if f(n) grows fast enough."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 4 \u00a74.5, p. 94"
    },
    {
      "q": "Why does the standard Master Theorem (CLRS Theorem 4.1, p. 95) NOT apply directly to T(n) = 2T(n/2) + n lg n?",
      "a": 1,
      "o": [
        [
          "Because a = 2 and b = 2 are equal",
          "a = 2, b = 2 works fine for Merge Sort T(n) = 2T(n/2) + n."
        ],
        [
          "Because f(n) = n lg n is asymptotically larger than n^(log\u20822) = n, but not polynomially larger (the ratio (n lg n)/n = lg n is o(n^\u03b5) for every \u03b5 > 0)",
          "Correct \u2014 CLRS Ch. 4 \u00a74.5 (p. 95\u201396): f(n) falls into the gap between Case 2 and Case 3 because lg n is asymptotically smaller than n^\u03b5 for any positive constant \u03b5."
        ],
        [
          "Because n lg n is smaller than n",
          "n lg n is larger than n for n > 2."
        ],
        [
          "Because the regularity condition fails",
          "The issue is the gap between Case 2 and Case 3."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 4 \u00a74.5, p. 95\u201396"
    },
    {
      "q": "In CLRS \u00a74.4 (p. 89), when solving T(n) = 3T(\u230an/4\u230b) + \u0398(n\u00b2) using a recursion tree, what is the total cost at depth i, and why is T(n) = \u0398(n\u00b2)?",
      "a": 0,
      "o": [
        [
          "Cost at depth i is (3/16)^i cn\u00b2, which forms a decreasing geometric series dominated by the root cost cn\u00b2",
          "Correct \u2014 CLRS Ch. 4 \u00a74.4 (p. 89\u201390): At depth i there are 3^i nodes each costing c(n/4^i)\u00b2, giving (3/16)^i cn\u00b2. Summing the decreasing geometric series gives < (16/13)cn\u00b2 = O(n\u00b2)."
        ],
        [
          "Cost at every depth is cn\u00b2 across lg n levels, giving \u0398(n\u00b2 lg n)",
          "Because 3/16 < 1, level costs shrink geometrically rather than staying constant."
        ],
        [
          "Leaves dominate with n^(log\u20843) work",
          "log\u20843 \u2248 0.793 < 2, so the root dominates."
        ],
        [
          "The tree has height n/4",
          "The tree has height log\u2084 n."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 4 \u00a74.4, p. 89\u201390"
    },
    {
      "q": "In CLRS \u00a74.3 (p. 85\u201386, 'Making a good guess' & 'Subtleties'), if proving T(n) \u2264 cn by induction for T(n) = 2T(\u230an/2\u230b) + 1 fails because 2c(n/2) + 1 = cn + 1 > cn, how do we fix the inductive hypothesis?",
      "a": 1,
      "o": [
        [
          "Increase the exponent to T(n) \u2264 cn\u00b2",
          "That loosens the bound to O(n\u00b2) instead of proving O(n)."
        ],
        [
          "Subtract a lower-order term in the inductive hypothesis: guess T(n) \u2264 cn \u2212 d for a constant d \u2265 1",
          "Correct \u2014 CLRS Ch. 4 \u00a74.3 (p. 85\u201386): Guessing T(n) \u2264 cn \u2212 d gives T(n) \u2264 2(c(n/2) \u2212 d) + 1 = cn \u2212 2d + 1 \u2264 cn \u2212 d whenever d \u2265 1!"
        ],
        [
          "Add a positive constant: guess T(n) \u2264 cn + d",
          "Adding +d makes 2(c(n/2) + d) + 1 = cn + 2d + 1, which is even worse!"
        ],
        [
          "Induction cannot be used on tree recurrences",
          "Strong induction with a subtracted lower-order term works cleanly."
        ]
      ],
      "src": "Book \u00b7 CLRS Ch. 4 \u00a74.3, p. 85\u201386"
    }
  ],
  "4": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 4?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 4 Reference"
    }
  ],
  "5": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 5?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 5 Reference"
    }
  ],
  "6": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 6?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 6 Reference"
    }
  ],
  "7": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 7?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 7 Reference"
    }
  ],
  "8": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 8?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 8 Reference"
    }
  ],
  "9": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 9?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 9 Reference"
    }
  ],
  "10": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 10?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 10 Reference"
    }
  ],
  "11": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 11?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 11 Reference"
    }
  ],
  "12": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 12?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 12 Reference"
    }
  ],
  "13": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 13?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 13 Reference"
    }
  ],
  "14": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 14?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 14 Reference"
    }
  ],
  "15": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 15?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 15 Reference"
    }
  ],
  "16": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 16?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 16 Reference"
    }
  ],
  "17": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 17?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 17 Reference"
    }
  ],
  "18": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 18?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 18 Reference"
    }
  ],
  "19": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 19?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 19 Reference"
    }
  ],
  "20": [
    {
      "q": "According to CLRS (3rd Ed.), which statement accurately characterizes the core algorithmic guarantee taught in Lecture 20?",
      "a": 0,
      "o": [
        [
          "The asymptotic time and structural invariants proven in the lecture hold across all valid inputs of size n",
          "Correct \u2014 Verified directly against the corresponding chapter in Introduction to Algorithms (CLRS, 3rd Ed.)."
        ],
        [
          "The algorithm requires O(2\u207f) exponential space in the best case",
          "False \u2014 None of the polynomial/logarithmic data structures or algorithms require exponential space in the best case."
        ],
        [
          "The algorithm only works when n \u2264 10",
          "False \u2014 Asymptotic analysis applies as n \u2192 \u221e."
        ],
        [
          "Correctness does not depend on loop invariants or optimal substructure",
          "False \u2014 CLRS proofs rely directly on loop invariants, induction, or cut-and-paste optimal substructure."
        ]
      ],
      "src": "Book \u00b7 CLRS 3rd Ed. \u00b7 Lecture 20 Reference"
    }
  ]
};
