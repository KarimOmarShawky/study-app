/* Midterm revision for the Algorithms course (CS311), lectures 1-14.
   Content for the Midterm revision page; built to data/rev.js and fetched only when that page opens.
   Per lecture: what it is (one), why it exists (why), three things to remember (keep), the recipe to write in the
   exam (recipe), one fully worked example (example), the teaching detail (blocks), a drill with its answer, how the
   paper asks it (exam) and the trap (trap). Then the exam patterns and the 25-question mock. */
window.REV = window.REV || {};
window.REV.algo = {
  "lede": "Everything the midterm can ask, in the order it is asked. Each lecture starts from zero: what the idea is, how to do it with a pencil, a worked example, and the exact way the question appears in the paper.",
  "howto": [
    "Start with the night plan below, not with lecture 1 — the order matters more than the hours.",
    "For each block: read the lecture, cover the worked example and redo it on paper, then answer the drill before opening it.",
    "Leave the last hour for questions 1–12 of the mock. Sleep beats a fifth pass."
  ],
  "plan": {
    "intro": "One night left. This is the order to spend it in, and what to give up when the clock runs out.",
    "blocks": [
      {
        "when": "0:00 – 1:30",
        "t": "The three questions that are always there",
        "body": "Master method (L3), the hashing trace (L8) and Fibonacci of 16 (L4). Between them they are about half the paper, and all three are mechanical: learn the recipe, not the theory.",
        "lecs": [
          3,
          8,
          4
        ]
      },
      {
        "when": "1:30 – 2:30",
        "t": "The two proofs",
        "body": "The red-black height bound (L9) and Ω(n lg n) for comparison sorts (L6). Both are four sentences and both have appeared as 4–5 mark questions.",
        "lecs": [
          9,
          6
        ]
      },
      {
        "when": "2:30 – 3:15",
        "t": "Divide and conquer and selection",
        "body": "pᵏ, the median of two sorted arrays, RAND-SELECT and the 19/20 argument (L4, L7). Say each recipe out loud once.",
        "lecs": [
          4,
          7
        ]
      },
      {
        "when": "3:15 – 4:00",
        "t": "The tree lectures",
        "body": "Insertion cases, the order of the deletion cases, and OS-RANK (L10, L11, L12). You only need to be able to name the case and say what changes.",
        "lecs": [
          10,
          11,
          12
        ]
      },
      {
        "when": "4:00 – 4:30",
        "t": "Dynamic programming",
        "body": "Coin row and 0/1 knapsack (L14). Learn the two recurrences and the backtracking sentence; you will not have time to derive them in the exam.",
        "lecs": [
          14
        ]
      },
      {
        "when": "4:30 – 5:30",
        "t": "Sit questions 1–12 of the mock",
        "body": "48 marks, one hour, no notes. It is the same size and shape as the real paper. Then mark yourself and re-read only the lectures where you lost marks.",
        "lecs": []
      },
      {
        "when": "Morning of the exam",
        "t": "The essentials list only",
        "body": "Twenty lines, twenty minutes, nothing new. Read them in the queue, not the night before — sleep is worth more than a fifth pass over hashing.",
        "lecs": []
      }
    ],
    "giveUp": [
      "The history: punched cards, the 1890 census, VLSI pictures and the two-hundred-line code listings are not going to be asked.",
      "Memorising code: you need the shape of PARTITION, OS-RANK and RB-INSERT-FIXUP, not the semicolons. The exam gives you the code and asks you to complete or explain it.",
      "Everything after lecture 14: finals material, not midterm material."
    ]
  },
  "essentials": [
    {
      "t": "Insertion sort Θ(n²) worst, Θ(n) best; merge sort Θ(n lg n) always.",
      "lec": 1
    },
    {
      "t": "O = upper, Ω = lower, Θ = both; a proof needs c and n₀.",
      "lec": 2
    },
    {
      "t": "Master method: compare f(n) with n^(log_b a) → n^(log_b a), × lg n, or f(n).",
      "lec": 3
    },
    {
      "t": "Case 3 needs the regularity check a·f(n/b) ≤ c·f(n), c < 1.",
      "lec": 3
    },
    {
      "t": "A log factor is not polynomial: 2T(n/2) + n lg n has no master case.",
      "lec": 3
    },
    {
      "t": "Fibonacci: M² = [[2,1],[1,1]], M⁴ = [[5,3],[3,2]], M⁸ = [[34,21],[21,13]], M¹⁶ = [[1597,987],[987,610]] → F₁₆ = 987.",
      "lec": 4
    },
    {
      "t": "pᵏ by halving: T(k) = T(k/2) + 1 = Θ(lg k); compute the half once.",
      "lec": 4
    },
    {
      "t": "Strassen: 7 products instead of 8 → Θ(n^2.81).",
      "lec": 4
    },
    {
      "t": "Quicksort: partition Θ(n), worst Θ(n²) on sorted input, randomized expected Θ(n lg n).",
      "lec": 5
    },
    {
      "t": "Comparison sorts need Ω(n lg n) comparisons: n! leaves, 2^h ≥ n!.",
      "lec": 6
    },
    {
      "t": "Counting sort Θ(n + k), stable; radix sort = d stable passes from the least significant digit.",
      "lec": 6
    },
    {
      "t": "RAND-SELECT recurses on one side: expected Θ(n). Median of medians: T(n/5) + T(3n/4) + Θ(n) = Θ(n), 19/20 < 1.",
      "lec": 7
    },
    {
      "t": "Hashing: α = n/m, cost O(1 + α); linear → primary clustering, quadratic → secondary, double needs h₂ coprime with m.",
      "lec": 8
    },
    {
      "t": "Deletion in open addressing marks DELETED. Table doubling is O(1) amortized.",
      "lec": 8
    },
    {
      "t": "Red-black: no two reds in a row, equal black-height → h ≤ 2 lg(n + 1).",
      "lec": 9
    },
    {
      "t": "Insert red → look at the uncle: red = recolour; black triangle → rotate; black line → recolour and rotate.",
      "lec": 10
    },
    {
      "t": "Deletion: red removed → stop; black removed → token, cases (1) red x, (2) red sibling, (3) both nephews black, (4) nephew red.",
      "lec": 11
    },
    {
      "t": "Order-statistic tree: size[x] = size[left] + size[right] + 1; OS-SELECT goes down, OS-RANK goes up. O(lg n).",
      "lec": 12
    },
    {
      "t": "Skip list: right if the next key is ≤ k, else down; expected O(lg n) by backwards analysis, 2 steps per level.",
      "lec": 13
    },
    {
      "t": "DP: coin row F(n) = max{cₙ + F(n−2), F(n−1)}; knapsack V[i,j] = max{V[i−1,j], vᵢ + V[i−1, j−wᵢ]}.",
      "lec": 14
    }
  ],
  "lectures": [
    {
      "n": 1,
      "t": "Introduction — insertion sort, merge sort, and what \"analysis\" means",
      "mins": 5,
      "weight": "core",
      "one": "Before we can say an algorithm is fast or slow, we need a way to measure it that does not depend on the machine. This lecture sets that up, then analyses the two sorting algorithms that everything later compares itself to.",
      "why": "Sorting a list is the standard example of an algorithm, and the pair here sets the scale for the whole course: insertion sort is the slow, simple one (n²), merge sort is the fast, clever one (n lg n). Every later lecture is measured against these two numbers.",
      "keep": [
        "Insertion sort: Θ(n²) worst, Θ(n) best (already sorted). Merge sort: Θ(n lg n) in <b>every</b> case.",
        "We count basic operations as a function of n, then drop constants and small terms — machine speed never enters.",
        "Worst case is the one we quote by default: the maximum time over all inputs of size n."
      ],
      "recipe": [
        "Count the basic operation (a comparison or a shift) as a function of n.",
        "Drop constants and small terms: 3n² + 5n + 2 becomes n².",
        "Name the case. Worst case is the default; best case only describes an input that is already sorted."
      ],
      "example": {
        "t": "Insertion sort on 4, 2, 7, 1 — every step",
        "steps": [
          "Start with the left part [4] and take the second element, 2.",
          "4 &gt; 2, so 4 shifts right and 2 goes in front → <b>[2, 4]</b> (1 comparison, 1 shift).",
          "Take 7: the element to its left is 4 &lt; 7, so it stops immediately → <b>[2, 4, 7]</b> (1 comparison, 0 shifts).",
          "Take 1: 7 &gt; 1 shift, 4 &gt; 1 shift, 2 &gt; 1 shift → <b>[1, 2, 4, 7]</b> (3 comparisons, 3 shifts).",
          "Total for n = 4: 1 + 1 + 3 = 5 comparisons (the worst case, reverse sorted, would be 1 + 2 + 3 = 6)."
        ]
      },
      "blocks": [
        {
          "h": "What \"analysis of algorithms\" is",
          "p": "Given two correct programs that do the same job, which one should you ship? We do not time them on a laptop, because the answer would change with the CPU. Instead we ask: when the input size n grows, how does the number of steps grow? That growth curve is the algorithm's complexity, and it is a property of the algorithm, not the machine."
        },
        {
          "h": "Insertion sort, like sorting playing cards",
          "list": [
            "Keep a sorted hand on the left. Take the next card (the <i>key</i>), walk left while the card to its left is bigger, and drop the key into the hole.",
            "Best case — the array is already sorted: the while-loop never runs, so one comparison per element, <b>Θ(n)</b>.",
            "Worst case — the array is reverse sorted: element i walks all the way back, 1 + 2 + … + (n−1) = n(n−1)/2 shifts, <b>Θ(n²)</b>.",
            "Average case is also Θ(n²). It is excellent for tiny arrays, which is why real libraries switch to it below ~16 elements."
          ]
        },
        {
          "h": "Merge sort, split then merge",
          "p": "Cut the array in half, sort each half the same way, then merge the two sorted halves in one linear pass: look at the front of each half, take the smaller, advance. Merging n items costs Θ(n) comparisons."
        },
        {
          "key": "Recurrence: <code>T(n) = 2T(n/2) + Θ(n)</code> → <b>Θ(n lg n)</b>. Recursion tree: lg n levels, and each level costs cn in total, so cn · lg n. The split is always in half, so the cost is the same for a sorted, reverse-sorted or random input: merge sort is Θ(n lg n) in <b>every</b> case, best included."
        },
        {
          "h": "The vocabulary of cases",
          "list": [
            "<b>Every-case</b> complexity: the count depends only on n. Add-array is n−1 additions, exchange sort is n(n−1)/2 comparisons, matrix multiplication is n³ multiplications.",
            "<b>Sequential search</b> has no every-case time: best B(n) = 1 (first element), worst W(n) = n (absent or last), average A(n) = (n+1)/2 when the searched value is in the array.",
            "<b>Binary search</b> on a sorted array needs about lg n + 1 comparisons — the array must be sorted, and it gives up the ability to answer \"where is it\" for unsorted data."
          ]
        },
        {
          "h": "Fibonacci — the same problem, two very different costs",
          "p": "The recursive version recomputes everything: F(n) calls F(n−1) and F(n−2), and that tree has more than 2<sup>n/2</sup> nodes, so it is exponential. The iterative version keeps the last two values in variables and loops n−1 times: Θ(n) steps, Θ(1) extra space."
        },
        {
          "h": "Why this lecture matters for the exam",
          "p": "It supplies the two sentences every later answer repeats: \"we count operations, not seconds\", and \"merge sort is Θ(n lg n) in all cases\". Most recurrence arguments later in the course are built on the merge-sort tree drawn here."
        }
      ],
      "drill": {
        "q": "Six numbers in reverse order, sorted with insertion sort — how many comparisons?",
        "ans": "1 + 2 + 3 + 4 + 5 = 15 = n(n−1)/2, which is exactly why the worst case is Θ(n²)."
      },
      "exam": "A table to fill in: \"state the worst-case running time of binary search, insertion sort, merge sort, …\" — one line each, no proof. Or: \"why is merge sort Θ(n lg n) even in the best case?\" Answer with the recurrence and the tree.",
      "trap": "Do not write Θ(n²) for insertion sort without saying <i>worst case</i>. The best case is Θ(n), and that distinction is worth a mark."
    },
    {
      "n": 2,
      "t": "Mathematical background — proofs and asymptotic notation",
      "mins": 5,
      "weight": "core",
      "one": "The three symbols O, Ω and Θ, how to prove a bound from the definition, and the three proof styles the course uses: induction, counterexample, contradiction.",
      "why": "The whole paper is written in O, Ω and Θ. If \"f(n) = O(g(n))\" does not read as \"beyond some n, f stays below a fixed multiple of g\", nothing later in this revision will make sense.",
      "keep": [
        "O = upper bound, Ω = lower bound, Θ = both at once (tight). Each needs constants c and a starting point n₀.",
        "Sequential loops add and keep the biggest term; nested loops multiply.",
        "Induction = base case + assume for k + prove for k+1. It is the standard tool for recurrences and for properties of trees."
      ],
      "recipe": [
        "Write the inequality you want to prove, with the constant: f(n) ≤ c·g(n).",
        "Make the left side visibly smaller by replacing each small term with a bigger multiple of g.",
        "Read off c and the starting point n₀, and write both in the answer — they are the marks."
      ],
      "example": {
        "t": "Prove that 5n² + 3n + 2 = O(n²)",
        "steps": [
          "For n ≥ 1 we have 3n ≤ 3n² and 2 ≤ 2n².",
          "So 5n² + 3n + 2 ≤ 5n² + 3n² + 2n² = 10n².",
          "Take c = 10 and n₀ = 1: the inequality holds for every n ≥ 1, so f(n) = O(n²) ✔"
        ]
      },
      "blocks": [
        {
          "h": "The definitions, in plain words",
          "p": "f(n) = O(g(n)) means: beyond some input size n₀, f never exceeds a fixed multiple of g. Formally there are constants c &gt; 0 and n₀ ≥ 1 with f(n) ≤ c·g(n) for all n ≥ n₀. Ω is the same with ≥ and Θ requires both, so the two curves are trapped between two multiples of g."
        },
        {
          "h": "How to prove one (this is a 3-mark question)",
          "list": [
            "Write the inequality you want: 3n + 2 ≤ c·n.",
            "Choose c by making the left side obviously smaller: 3n + 2 ≤ 3n + 2n = 5n for n ≥ 1, so c = 5 and n₀ = 1.",
            "Say the constants out loud: \"take c = 5, n₀ = 1\". The examiner is checking exactly these two numbers."
          ]
        },
        {
          "h": "Counting rules that answer most complexity questions",
          "list": [
            "One loop doing constant work n times → Θ(n). Two nested loops → Θ(n²).",
            "Loops one after another: add the costs and keep the biggest, because O(n) + O(n²) = O(n²).",
            "A loop that calls a Θ(n²) routine m times → Θ(m·n²).",
            "A counter that doubles (i = i·2) runs lg n times; a counter divided by k runs log<sub>k</sub> n times. A loop <code>for (i=1; i&lt;n; i++) { j=n; while (j&gt;=1) j=j/3; }</code> is therefore Θ(n log₃ n) = Θ(n lg n)."
          ]
        },
        {
          "h": "Growth ladder (memorise the order)",
          "p": "<code>1 &lt; lg n &lt; √n &lt; n &lt; n lg n &lt; n² &lt; n³ &lt; 2ⁿ &lt; 3ⁿ &lt; n!</code>. A useful pair for ranking questions: 2<sup>2n</sup> = 4ⁿ sits between 3ⁿ and n!, and lg²n is far below n."
        },
        {
          "h": "The three proof styles",
          "list": [
            "<b>Induction</b>: prove the base case, assume the statement for k, prove it for k+1. Example: F<sub>k</sub> &lt; (5/3)<sup>k</sup> works because (5/3)<sup>k</sup> + (5/3)<sup>k−1</sup> = (5/3)<sup>k−1</sup>·(8/3) &lt; (5/3)<sup>k−1</sup>·(25/9).",
            "<b>Counterexample</b>: one case that fails kills a claim. \"Every O(n²) algorithm is slower than every O(n) algorithm\" dies on an input of size 10.",
            "<b>Contradiction</b>: assume the opposite and derive something false. It is how the Ω(n lg n) sorting bound is proved in Lecture 6."
          ]
        }
      ],
      "drill": {
        "q": "Which grows faster, n² log n or n<sup>2.5</sup>?",
        "ans": "n<sup>2.5</sup>. Any positive power of n beats every power of a log — which is why \"n<sup>2.1</sup> = O(n² log n)\" is false."
      },
      "exam": "Two shapes: rank the functions by growth (2 marks) and True/False with a one-line reason, e.g. \"n<sup>2.1</sup> = O(n² log n)\" — false, because a polynomial gap cannot be paid for by a log factor.",
      "trap": "Θ is not \"approximately\". Θ(g) means both O(g) and Ω(g). Writing Θ where only an upper bound was proved loses the mark."
    },
    {
      "n": 3,
      "t": "Solving recurrences — iteration, substitution, recursion tree, master method",
      "mins": 8,
      "weight": "core",
      "one": "A recurrence writes T(n) in terms of smaller T's. This lecture gives four ways to turn it into a Θ answer. The master method is the one the paper asks most, so it gets the most practice.",
      "why": "Every divide-and-conquer algorithm hands you a recurrence, and the paper wants a Θ answer. The master method is the three-line machine that does it, and it turned up in 2020, 2021, 2023, 2024 and 2025.",
      "keep": [
        "Master method compares f(n) with n<sup>log<sub>b</sub>a</sup>. Smaller → n<sup>log<sub>b</sub>a</sup>; equal → times lg n; bigger (polynomially!) → f(n).",
        "A log factor is not a polynomial factor, so 2T(n/2) + n lg n is <b>not</b> case 3.",
        "Quick answers: T(n−1) + n → Θ(n²); T(n/2) + c → Θ(lg n); 2T(n/2) + c → Θ(n)."
      ],
      "recipe": [
        "Write down a (number of recursive calls), b (the shrink factor) and f(n) (the work outside the calls).",
        "Compute the watershed n<sup>log<sub>b</sub>a</sup>.",
        "f(n) smaller → Θ(watershed); equal → Θ(watershed · lg n); bigger → check a·f(n/b) ≤ c·f(n) with c &lt; 1, then Θ(f(n)).",
        "If f(n) is bigger only by a log factor, write \"the master method does not apply\" and give the answer from the tree instead."
      ],
      "example": {
        "t": "T(n) = 9T(n/3) + n, in three lines",
        "steps": [
          "a = 9, b = 3, f(n) = n.",
          "Watershed: n<sup>log₃ 9</sup> = n².",
          "n is polynomially smaller than n², so case 1 → <b>T(n) = Θ(n²)</b>.",
          "Sanity check with the tree: level i has 9ⁱ nodes costing n/3ⁱ each, so a level costs n·3ⁱ — a geometric series dominated by the n² leaves ✔"
        ]
      },
      "blocks": [
        {
          "h": "Method 1 — iteration (unrolling)",
          "p": "Keep substituting the recurrence into itself until the pattern is obvious, then read off the closed form. <code>T(n) = 2T(n/2) + 4n = 4n + 2(2T(n/4) + 2n) = 4n + 4n + 4T(n/4) = … = 4n·k + 2<sup>k</sup>T(1)</code>. With n = 2<sup>k</sup>, k = lg n, so T(n) = 4n lg n + n = <b>Θ(n lg n)</b>."
        },
        {
          "h": "Method 2 — substitution (guess and prove)",
          "p": "Guess the order, then prove it by induction with explicit constants. For <code>T(n) = T(n−1) + n</code> guess O(n²): assume T(n−1) ≤ c(n−1)², then T(n) ≤ c(n−1)² + n = cn² − (2cn − c − n) ≤ cn² as soon as c ≥ 1. The last step — making the leftover term negative — is the marks."
        },
        {
          "h": "Method 3 — recursion tree",
          "p": "Draw one node per call, write the cost of each node next to it, then add level by level. For 2T(n/2) + cn there are lg n levels and every level costs cn → Θ(n lg n). For 4T(n/2) + cn each level costs 2<sup>i</sup>·cn, the geometric series is dominated by the deepest level, and the leaves give n² → Θ(n²)."
        },
        {
          "h": "Method 4 — the master method",
          "p": "For <code>T(n) = aT(n/b) + f(n)</code>, a ≥ 1, b &gt; 1, first compute the <i>watershed</i> n<sup>log<sub>b</sub>a</sup> — the number of leaves. Then compare f(n) with it."
        },
        {
          "key": "<b>Case 1</b> — f(n) = O(n<sup>log<sub>b</sub>a−ε</sup>) for some ε &gt; 0: the leaves dominate → <b>Θ(n<sup>log<sub>b</sub>a</sup>)</b>.<br><b>Case 2</b> — f(n) = Θ(n<sup>log<sub>b</sub>a</sup>): every level costs the same → <b>Θ(n<sup>log<sub>b</sub>a</sup> · lg n)</b>.<br><b>Case 3</b> — f(n) = Ω(n<sup>log<sub>b</sub>a+ε</sup>) <i>and</i> the regularity condition a·f(n/b) ≤ c·f(n) holds for some c &lt; 1: the root dominates → <b>Θ(f(n))</b>."
        },
        {
          "h": "The table to rehearse",
          "table": [
            [
              "Recurrence",
              "n<sup>log<sub>b</sub>a</sup>",
              "Answer"
            ],
            [
              "4T(n/2) + n",
              "n²",
              "case 1 → Θ(n²)"
            ],
            [
              "4T(n/2) + n²",
              "n²",
              "case 2 → Θ(n² lg n)"
            ],
            [
              "4T(n/2) + n³",
              "n²",
              "case 3 → Θ(n³)"
            ],
            [
              "2T(n/4) + √n",
              "√n",
              "case 2 → Θ(√n lg n)"
            ],
            [
              "T(n/2) + 1 (binary search)",
              "1",
              "case 2 → Θ(lg n)"
            ],
            [
              "2T(n/2) + n lg n",
              "n",
              "no case → Θ(n lg² n)"
            ]
          ]
        },
        {
          "h": "Case 3, checked properly",
          "p": "For T(n) = 2T(n/2) + n²: n<sup>log₂2</sup> = n, and n² is polynomially bigger, so we are in case 3 territory — but the condition must be verified: 2·(n/2)² = n²/2 ≤ ½·n², so c = ½ &lt; 1 ✔ and T(n) = Θ(n²). For T(n) = 8T(n/2) + n², n³ beats n², case 1, Θ(n³)."
        }
      ],
      "drill": {
        "q": "T(n) = 8T(n/2) + n² — which case, and what is the answer?",
        "ans": "Watershed n<sup>log₂ 8</sup> = n³, which beats n² → case 1 → Θ(n³)."
      },
      "exam": "\"Solve using the master method, or say it cannot be used\" with three or four recurrences (2020, 2021, 2023, 2024). Write the watershed n<sup>log<sub>b</sub>a</sup> under each one, then the case number, then the answer. Where the method fails, say which of the two conditions fails — that sentence is a mark.",
      "trap": "Case 2 needs f(n) to be exactly Θ of the watershed, not merely \"close\". 2T(n/2) + n/2 is still case 2; 2T(n/2) + n lg n is not case 3, it is outside the method."
    },
    {
      "n": 4,
      "t": "Divide and conquer — binary search, fast powering, Fibonacci, Strassen",
      "mins": 8,
      "weight": "core",
      "one": "Split the problem, solve the pieces, combine the answers. Doing the recursion cleverly turns a linear algorithm into a logarithmic one, and turns n³ matrix multiplication into n<sup>2.81</sup>.",
      "why": "Halving the work turns n steps into lg n steps. The paper does not ask you to prove it — it asks you to do it, as \"compute Fibonacci of 16 in four steps\" and \"compute pᵏ optimally\".",
      "keep": [
        "<b>Fibonacci(16) in four steps</b> is a repeated exam question: square M = [[1,1],[1,0]] four times.",
        "p<sup>k</sup> by halving costs T(k) = T(k/2) + 1 = Θ(lg k) — but only if you compute the half <b>once</b>.",
        "Strassen multiplies with 7 block products instead of 8: Θ(n<sup>lg 7</sup>) ≈ Θ(n<sup>2.81</sup>)."
      ],
      "recipe": [
        "Keep M = [[1,1],[1,0]]; Mⁿ = [[F<sub>n+1</sub>, F<sub>n</sub>],[F<sub>n</sub>, F<sub>n−1</sub>]].",
        "Square repeatedly — M², M⁴, M⁸ — until the exponent reaches n.",
        "Read the top-right entry: that is F<sub>n</sub>.",
        "For pᵏ: compute the half once, square it, multiply by p only if k is odd."
      ],
      "example": {
        "t": "Fibonacci of 16 in four squarings",
        "steps": [
          "M² = [[1,1],[1,0]]·[[1,1],[1,0]] = [[2,1],[1,1]]",
          "M⁴ = M²·M² = [[2,1],[1,1]]·[[2,1],[1,1]] = [[5,3],[3,2]]",
          "M⁸ = M⁴·M⁴ = [[5,3],[3,2]]² = [[34,21],[21,13]]",
          "M¹⁶ = M⁸·M⁸ = [[34,21],[21,13]]² = [[1597,987],[987,610]]",
          "Top-right entry: <b>F<sub>16</sub> = 987</b>. (The same table gives F<sub>15</sub> = 610 and F<sub>17</sub> = 1597.)"
        ]
      },
      "blocks": [
        {
          "h": "The template",
          "p": "<b>Divide</b> the input into parts, <b>conquer</b> each part recursively, <b>combine</b> the partial answers. The cost is always the recurrence T(n) = aT(n/b) + (cost of divide and combine), which Lecture 3 solves."
        },
        {
          "h": "Binary search",
          "p": "Look at the middle element of a sorted array. Equal → done. Smaller → search the left half, bigger → the right half. Only one half survives, so T(n) = T(n/2) + Θ(1) = Θ(lg n) by case 2. It is the smallest useful divide-and-conquer algorithm and the model for the median-of-two-arrays question in the mock."
        },
        {
          "h": "Powering aⁿ — the \"compute it once\" trick",
          "p": "a<sup>n</sup> = a<sup>n/2</sup>·a<sup>n/2</sup> when n is even, and a<sup>(n−1)/2</sup>·a<sup>(n−1)/2</sup>·a when n is odd. The naive rewrite calls the recursion twice and stays linear; storing the half in a variable <code>t</code> keeps one call: T(n) = T(n/2) + Θ(1) = <b>Θ(lg n)</b>. That single sentence is the whole question."
        },
        {
          "h": "Fibonacci by matrix squaring",
          "p": "Because [[1,1],[1,0]]<sup>n</sup> = [[F<sub>n+1</sub>, F<sub>n</sub>],[F<sub>n</sub>, F<sub>n−1</sub>]], computing F<sub>n</sub> is computing that power — and powering by squaring is Θ(lg n) matrix multiplications."
        },
        {
          "key": "<b>Fibonacci of 16 in four steps</b> (asked in 2024 and 2025).<br>Step 1: M² = [[2,1],[1,1]] · Step 2: M⁴ = M²·M² = [[5,3],[3,2]] · Step 3: M⁸ = [[34,21],[21,13]] · Step 4: M¹⁶ = [[1597,987],[987,610]].<br>Read the top-right entry: <b>F<sub>16</sub> = 987</b>. Four squarings for n = 16, i.e. lg 16 = 4."
        },
        {
          "h": "Matrix multiplication and Strassen",
          "list": [
            "Standard multiplication of two n×n matrices is n³ multiplications, Θ(n³).",
            "The naive block split needs 8 half-size products: T(n) = 8T(n/2) + Θ(n²) → case 1 → Θ(n³). No gain — the point of the exercise.",
            "Strassen found 7 products (P₁…P₇) with additions in between: T(n) = 7T(n/2) + Θ(n²) → Θ(n<sup>lg 7</sup>) ≈ Θ(n<sup>2.81</sup>). This is the \"is it possible to multiply matrices faster than n³?\" True/False item — the answer is yes.",
            "Strassen is rarely used in practice: the constants are large and it is numerically less stable, but it is a real O(n<sup>2.81</sup>) algorithm."
          ]
        },
        {
          "h": "VLSI layout (the lecture's last example)",
          "p": "Placing a circuit on a chip so that the area is small: the classic H-tree layout splits the square into four quadrants, places each quadrant recursively and connects them with a cross. Same shape of argument — divide, solve four times, spend linear time joining."
        }
      ],
      "drill": {
        "q": "Use the powers you already have to get F<sub>10</sub>.",
        "ans": "M¹⁰ = M⁸·M² = [[34,21],[21,13]]·[[2,1],[1,1]] = [[89,55],[55,34]], so F<sub>10</sub> = 55."
      },
      "exam": "\"Compute Fibonacci of 16 in four steps only and show details of your answer\" (5 marks, 2025) — the examiner wants four matrices, not a closed form. Or: \"how do you compute p<sup>k</sup> optimally? Give the recurrence and the complexity\" (4 marks).",
      "trap": "Writing M¹⁶ = M⁸·M⁸ and stopping there. You must show M², M⁴, M⁸ and the final product, and then state F₁₆ = 987."
    },
    {
      "n": 5,
      "t": "Quicksort and the PARTITION subroutine",
      "mins": 6,
      "weight": "often",
      "one": "Quicksort sorts in place by picking a pivot and pushing everything smaller to its left. It is the fastest general sort in practice and the one whose worst case the exam likes to trap you with.",
      "why": "Quicksort is the sort you would actually write, and the exam tests the two things that make it interesting: the partition trace and the input that destroys it.",
      "keep": [
        "PARTITION costs Θ(n) and leaves the pivot in its final position.",
        "Worst case Θ(n²) — sorted or reverse-sorted input, or a pivot that is always the minimum.",
        "Best and \"almost best\" (even a 1:9 split): Θ(n lg n). Randomized pivot: expected Θ(n lg n), no bad input."
      ],
      "recipe": [
        "Write the pivot (the first element) above the array, and keep i at the last position known to hold something ≤ the pivot.",
        "Scan j from left to right. When A[j] ≤ pivot, increment i and swap A[i] with A[j].",
        "After the scan, swap the pivot A[p] with A[i]. Everything left of i is ≤ the pivot, everything right of it is bigger.",
        "Recurse on both sides. Stop when a piece has one element."
      ],
      "example": {
        "t": "PARTITION on 5, 2, 4, 8, 0, 3, 1, 7",
        "steps": [
          "Pivot 5. 2 ≤ 5 → i = 1. 4 ≤ 5 → i = 2. 8 &gt; 5, skip.",
          "0 ≤ 5 → i = 3, swap 8 and 0 → [5, 2, 4, 0, 8, 3, 1, 7].",
          "3 ≤ 5 → i = 4, swap 8 and 3 → [5, 2, 4, 0, 3, 8, 1, 7].",
          "1 ≤ 5 → i = 5, swap 8 and 1 → [5, 2, 4, 0, 3, 1, 8, 7]. 7 &gt; 5, skip.",
          "Swap A[0] with A[5]: <b>[1, 2, 4, 0, 3, 5, 8, 7]</b> — the 5 is now in its final place, with [1, 2, 4, 0, 3] on its left and [8, 7] on its right."
        ]
      },
      "blocks": [
        {
          "h": "The idea",
          "p": "Choose an element as the pivot x. Rearrange the array so that everything ≤ x sits to its left and everything ≥ x to its right; x ends up in the position it will occupy in the final sorted array. Then sort the two sides the same way. Combining is free, which is why the algorithm is in place."
        },
        {
          "code": "PARTITION(A, p, q):\n  x = A[p]; i = p\n  for j = p+1 to q:\n     if A[j] <= x:\n        i = i + 1\n        swap A[i], A[j]\n  swap A[p], A[i]\n  return i          // final position of the pivot"
        },
        {
          "h": "A full trace (this is what \"show the steps\" wants)",
          "p": "A = [5, 2, 4, 8, 0, 3, 1, 7], pivot x = 5, i starts at 0.<br>2 ≤ 5 → i = 1. 4 ≤ 5 → i = 2. 8 &gt; 5 skip. 0 ≤ 5 → i = 3, swap 8 and 0: [5, 2, 4, 0, 8, 3, 1, 7]. 3 ≤ 5 → i = 4, swap 8 and 3: [5, 2, 4, 0, 3, 8, 1, 7]. 1 ≤ 5 → i = 5, swap 8 and 1: [5, 2, 4, 0, 3, 1, 8, 7]. 7 &gt; 5 skip.<br>Finally swap A[0] with A[5]: <b>[1, 2, 4, 0, 3, 5, 8, 7]</b>, pivot at index 5. Left side ≤ 5, right side &gt; 5, and the two sides are then sorted recursively."
        },
        {
          "h": "The three cases",
          "list": [
            "<b>Worst</b>: the pivot is always the smallest (sorted input) so one side is empty: T(n) = T(n−1) + Θ(n) = Θ(n²).",
            "<b>Best</b>: the pivot always splits in half: T(n) = 2T(n/2) + Θ(n) = Θ(n lg n).",
            "<b>Almost best</b>: a 1:9 split still gives T(n) = T(n/10) + T(9n/10) + Θ(n) = Θ(n lg n) — the depth stays O(lg n) with a bigger constant.",
            "Randomized quicksort picks the pivot uniformly at random, so no input is bad in advance. Expected time Θ(n lg n); the worst case still exists but no adversary can force it."
          ]
        },
        {
          "h": "Why use it at all",
          "p": "It sorts in place (merge sort needs Θ(n) extra memory), has tiny constants and excellent cache behaviour, so in practice it beats merge sort by more than a factor of two. Real libraries use quicksort with insertion sort for short runs and a heap sort fallback after too many bad partitions."
        }
      ],
      "drill": {
        "q": "Why is quicksort Θ(n²) on an already sorted array, and what is the fix?",
        "ans": "The pivot is the smallest element every time, so one side is always empty: T(n) = T(n−1) + Θ(n) = Θ(n²). Choosing the pivot at random makes the expected time Θ(n lg n) for every input."
      },
      "exam": "\"Using quicksort, sort (5, 2, 4, 8, 0, 3, 1, 7), showing the array after each partition\" — draw the array after every PARTITION call, mark the pivot, and stop when the pieces have one element.",
      "trap": "The pivot is fixed at A[p] here, so the \"randomized\" answer does not apply to a trace question. Trace exactly the code in the lecture."
    },
    {
      "n": 6,
      "t": "Sorting lower bounds, counting sort and radix sort",
      "mins": 6,
      "weight": "often",
      "one": "Any sort that only compares elements needs Ω(n lg n) comparisons — that is a proven wall. To go faster you must stop comparing keys and use their structure, which is what counting sort and radix sort do.",
      "why": "It answers \"can sorting be faster?\" — no, not by comparing keys; yes, if you count them instead. It also gives the two linear sorts that the True/False questions are built on.",
      "keep": [
        "The decision-tree argument: n! possible orders → at least lg(n!) = Ω(n lg n) comparisons.",
        "Counting sort is Θ(n + k) and <b>stable</b>; it is linear when k = O(n).",
        "Radix sort runs a stable counting sort per digit, from the least significant digit up: Θ(d(n + k))."
      ],
      "recipe": [
        "Counting sort: zero a count array over the key range, count each key, make the counts cumulative, then place the elements walking the input backwards (that backwards walk is what keeps it stable).",
        "Radix sort: one stable counting sort per digit, starting at the least significant digit.",
        "For the lower bound: count the leaves (n!), bound the height, take logs."
      ],
      "example": {
        "t": "Counting sort on A = 2, 5, 3, 0, 2, 3, 0, 3 (k = 5)",
        "steps": [
          "Counts C[0..5]: 2, 0, 2, 3, 0, 1 (two 0s, no 1, two 2s, three 3s, no 4, one 5).",
          "Cumulative: 2, 2, 4, 7, 7, 8 — so C[3] = 7 means the last 3 belongs in position 7.",
          "Walk A from the right and place: the final 3 → position 7, the 0 → position 1, …",
          "Result: <b>B = 0, 0, 2, 2, 3, 3, 3, 5</b>, in Θ(n + k) time, stable."
        ]
      },
      "blocks": [
        {
          "h": "The decision tree",
          "p": "A comparison sort can be drawn as a binary tree: each internal node is a question \"is A[i] ≤ A[j]?\", each leaf is one of the n! possible orderings of the input. A tree of height h has at most 2<sup>h</sup> leaves, so 2<sup>h</sup> ≥ n!, i.e. h ≥ lg(n!). Stirling gives lg(n!) = Θ(n lg n). Every root-to-leaf path is the sequence of comparisons on one input, so the worst case needs Ω(n lg n) comparisons."
        },
        {
          "key": "Consequence: <b>merge sort and heap sort are asymptotically optimal</b> among comparison sorts. Quicksort is optimal too in the average case, but its worst case is n². To beat Ω(n lg n) you need information the comparisons throw away — the size or the digits of the keys."
        },
        {
          "h": "Counting sort, step by step",
          "list": [
            "Keys are integers in 1..k (or 0..k). Make an array C of k+1 zeros.",
            "Count: for each element, C[A[j]]++.",
            "Make C cumulative: C[i] = C[i] + C[i−1], so C[i] is the number of elements ≤ i.",
            "Walk the input from the <b>right</b>, put each A[j] into B[C[A[j]]], then decrement C[A[j]]. Walking backwards is what makes the sort stable."
          ]
        },
        {
          "h": "Counting sort on A = [2, 5, 3, 0, 2, 3, 0, 3], k = 5",
          "p": "Counts: C = [2, 0, 2, 3, 0, 1]. Cumulative: C = [2, 2, 4, 7, 7, 8]. Placing from the right gives <b>B = [0, 0, 2, 2, 3, 3, 3, 5]</b>. Time Θ(n + k), extra space Θ(n + k); with k = O(n) the sort is linear — the only linear sorts in the course are the ones that are not comparison sorts."
        },
        {
          "h": "Radix sort",
          "p": "Sort by the least significant digit first, then the next digit, and so on, using a <b>stable</b> sort (counting sort) on each pass. Stability is the whole trick: after sorting on the last digit the order of equal digits is preserved, so the next pass can safely override it. For d digits with k possible values the cost is Θ(d(n + k)); for 32-bit integers d is a small constant, so the sort behaves as linear."
        },
        {
          "h": "Punched cards (the lecture's historical aside)",
          "p": "The 1890 census sorted cards mechanically by column, one column at a time, which is radix sort with a card sorter. The lecture uses it to show that the idea is older than computers and that stability is what makes multi-pass sorting work."
        }
      ],
      "drill": {
        "q": "Three-digit keys, k = 10: how many passes does radix sort make and what does it cost?",
        "ans": "Three passes, each a counting sort of cost Θ(n + 10), so Θ(3(n + 10)) = Θ(n) for a fixed number of digits."
      },
      "exam": "\"Sort A = 2, 5, 3, 0, 2, 3, 0, 3 using counting sort (k = 5). Show C after each loop.\" Write the counts, the cumulative array and the output array — three lines, full marks. A True/False item often follows: \"radix sort is Ω(n lg n)\" — false, it is not a comparison sort.",
      "trap": "Counting sort is not in place (it needs the output array) and cannot sort arbitrary keys — only small integers, or things you can map to small integers."
    },
    {
      "n": 7,
      "t": "Order statistics — RAND-SELECT and median of medians",
      "mins": 6,
      "weight": "often",
      "one": "Find the i-th smallest element of an array without sorting it. Randomized selection does it in expected linear time, and a careful choice of pivot does it in linear time even in the worst case.",
      "why": "Finding the median sounds like it needs a sort; it does not. That surprise is the question — plus the recurrence that proves the worst case is linear.",
      "keep": [
        "RAND-SELECT recurses on <b>one</b> side only, so it is Θ(n) expected, Θ(n²) worst.",
        "Median of medians: groups of 5 → median of medians as pivot → T(n) = T(n/5) + T(3n/4) + Θ(n) = Θ(n) because 1/5 + 3/4 = 19/20 &lt; 1.",
        "i = 1 is the minimum, i = n the maximum, i ≈ n/2 the median."
      ],
      "recipe": [
        "RAND-SELECT: partition, compute the pivot rank k, return if k = i, recurse on the left if i &lt; k, on the right looking for (i − k) otherwise. One side only.",
        "Median of medians: groups of five → medians → median of those medians → pivot → recurse.",
        "Quote T(n) = T(n/5) + T(3n/4) + Θ(n) and note 1/5 + 3/4 = 19/20 &lt; 1."
      ],
      "example": {
        "t": "RAND-SELECT for the 2nd smallest of 3, 9, 2, 8, 5, 1, 7",
        "steps": [
          "Partition around 3: 2 ≤ 3, then 9, 8, 5, 1, 7 → after the scan and the final swap the array is <b>[2, 1, 3, 9, 5, 8, 7]</b> and the pivot rank is 3.",
          "i = 2 &lt; k = 3, so look in the left part [2, 1] for the 2nd smallest — the whole right side is discarded without being sorted.",
          "Partition [2, 1] around 2: the 1 moves in front → [1, 2], pivot rank (inside this piece) 2, which is the rank we wanted.",
          "Answer: <b>2</b>. Two partitions instead of a full sort."
        ]
      },
      "blocks": [
        {
          "h": "The problem",
          "p": "Given n numbers and an index i, return the element that would be at position i if the array were sorted. Sorting first costs Θ(n lg n) and answers every i at once; selection answers one i and can be much cheaper."
        },
        {
          "h": "RAND-SELECT",
          "p": "Partition around a random pivot (the same PARTITION as quicksort). If the pivot lands at rank k: k = i → return it; i &lt; k → the answer is in the left part; i &gt; k → look for the (i − k)-th element of the right part. Only one side is explored, so the work is a geometric series: T(n) ≤ T(9n/10) + Θ(n) with high probability, and the expectation is <b>Θ(n)</b>. The unlucky worst case is T(n−1) + Θ(n) = Θ(n²)."
        },
        {
          "h": "Worst-case linear time — median of medians",
          "list": [
            "Split the n elements into ⌈n/5⌉ groups of 5 and find each group's median by brute force (a constant amount of work per group).",
            "Recursively find the median x of those medians; use x as the pivot.",
            "Partition around x. Because x is the median of the medians, at least 3n/10 − 6 elements are ≤ x and at least as many are ≥ x, so neither side is huge.",
            "Recurse into the side that contains rank i. The larger side has at most 3n/4 elements (for n ≥ 50)."
          ]
        },
        {
          "key": "<code>T(n) = T(n/5) + T(3n/4) + Θ(n)</code>. The fractions add to 19/20 &lt; 1, so the cost is a geometric series dominated by the top level: <b>T(n) = Θ(n)</b>. The constant is large (finding 5-medians by hand is slow), which is why libraries use randomized selection."
        },
        {
          "h": "Why groups of five",
          "p": "With groups of 3 the pivot only guarantees 2n/6 on each side and the recurrence becomes 1/3 + 2/3 = 1, which no longer collapses to linear time. With groups of 7 the guarantee improves but the constant work per group grows. Five is the smallest size that makes the fractions sum below one."
        }
      ],
      "drill": {
        "q": "In median of medians, why is the recursion at most 3n/4 — and why does that prove Θ(n)?",
        "ans": "Because the pivot is the median of medians, at least 3n/10 elements lie on each side of it, so the larger side has at most 3n/4 elements. Then T(n) = T(n/5) + T(3n/4) + Θ(n), and 1/5 + 3/4 = 19/20 &lt; 1 makes the series geometric, so T(n) = Θ(n)."
      },
      "exam": "\"Describe an O(n) worst-case algorithm to find the median of n numbers\" — the four steps and the recurrence with the 19/10 argument. Or a short numerical one: \"find the 4th smallest of …\" where you simulate RAND-SELECT and must show the partition and the rank arithmetic.",
      "trap": "RAND-SELECT is not O(n lg n) — do not sort. And it recurses on one side only; writing 2T(n/2) describes quicksort, not selection."
    },
    {
      "n": 8,
      "t": "Hashing — functions, chaining, open addressing, amortized tables",
      "mins": 8,
      "weight": "core",
      "one": "Store keys in a table of m slots so that search, insert and delete cost O(1) on average. Collisions are the whole story: how you resolve them decides the worst case.",
      "why": "Hashing is the most reliable marks in the paper: the same table, the same nine numbers, the same three methods. It is a drawing exercise, not a theory exercise.",
      "keep": [
        "Load factor α = n/m; the expected cost is O(1 + α).",
        "Linear probing → primary clustering; quadratic probing → secondary clustering and it may fail if the table is more than half full; double hashing → h₂(k) must be relatively prime to m.",
        "Deleting from an open-addressed table marks the slot <b>deleted</b>, never empty. Doubling a full table costs Θ(n) once, O(1) amortized per insert."
      ],
      "recipe": [
        "Compute h(k) = k mod m for each key before you start, and write the list of home slots in the margin.",
        "Linear: try h, h+1, h+2 … (wrap around).",
        "Quadratic: try h, h+1, h+4, h+9 … i.e. add i² and reduce mod m.",
        "Chaining: leave the slot and append to its list — nothing is ever displaced.",
        "Draw the finished table with the slot numbers, then answer any \"how many probes\" sub-question from your trace."
      ],
      "example": {
        "t": "h(k) = k mod 7, insert 10, 22, 31, 4, 15 with linear probing, then with chaining",
        "steps": [
          "Home slots: 10 → 3, 22 → 1, 31 → 3, 4 → 4, 15 → 1.",
          "10 → slot 3. 22 → slot 1.",
          "31 → slot 3 is taken, probe 4 → free → slot 4.",
          "4 → slot 4 is taken, probe 5 → slot 5. 15 → slot 1 taken, probe 2 → slot 2.",
          "Linear result: 1:22, 2:15, 3:10, 4:31, 5:4. Chaining result: slot 1 → [22, 15], slot 3 → [10, 31], slot 4 → [4]."
        ]
      },
      "blocks": [
        {
          "h": "Hash functions worth knowing",
          "list": [
            "<b>Division</b>: h(k) = k mod m. Choose m prime, otherwise patterns in the keys collide (keys ending in 0 mod 10 all land in slot 0).",
            "<b>Multiplication</b>: h(k) = ⌊m·(k·A mod 1)⌋ with 0 &lt; A &lt; 1 — m is not critical and the hash mixes the digits better.",
            "<b>Mid-square</b>: square the key and take the middle digits; the middle depends on every digit of the key.",
            "<b>Folding</b>: split the key into equal parts, add them (fold-boundary reverses every other part), then reduce mod m. 12345678 → 12 + 34 + 56 + 78 = 180 → mod 100 = 80."
          ]
        },
        {
          "h": "Separate chaining",
          "p": "Each slot holds a linked list of the keys that hash there. Insert at the head in O(1); search walks the chain, so the expected length is α and search costs Θ(1 + α); delete is O(1) once you have the node. The table never fills up. The worst case is Θ(n) when everything collides, unless each chain is kept as a balanced tree, which brings it to Θ(lg n)."
        },
        {
          "h": "Open addressing — everything inside the table",
          "p": "No lists: the probe sequence h(k, i) = (h′(k) + f(i)) mod m visits candidate slots until an empty one is found. Successful search costs about (1/α)·ln(1/(1−α)), and the table must stay below full."
        },
        {
          "h": "The three probe functions",
          "table": [
            [
              "Method",
              "f(i)",
              "Behaviour / problem"
            ],
            [
              "Linear probing",
              "i",
              "Primary clustering: a full run of slots grows at both ends and swallows the next keys"
            ],
            [
              "Quadratic probing",
              "c₁i + c₂i² (often i²)",
              "Secondary clustering; with m not prime, or a table more than half full, an insert can fail although slots are free"
            ],
            [
              "Double hashing",
              "i · h₂(k)",
              "Behaves like a random probe sequence; h₂(k) must be relatively prime to m, or the sequence only visits a subset of slots"
            ]
          ]
        },
        {
          "h": "Deletion, the trap question",
          "p": "If you clear a slot to \"empty\", a later search for a key that probed past it stops early and wrongly reports \"not found\". So mark the slot <b>deleted</b>: search treats deleted as occupied and keeps probing, while insert may reuse it. Too many deleted slots degrade performance, so rehash when they dominate."
        },
        {
          "key": "Doubling a full table: insert n items one at a time. Copying costs 1 + 2 + 4 + … + n &lt; 2n, so n inserts cost O(n) in total — <b>O(1) amortized</b> per insert, although a single insert can cost Θ(n). The three ways to argue it are the aggregate method (sum the series), the accounting method (charge $3 per insert: $1 to insert, $2 saved) and the potential method (Φ = 2n − capacity)."
        }
      ],
      "drill": {
        "q": "Now delete 22 from the linear-probing table. What exactly goes into slot 1?",
        "ans": "<b>DELETED</b>, never EMPTY: 15 and 31 probed past slot 1, so an EMPTY there would make their searches stop early and report \"not found\"."
      },
      "exam": "The classic (2021, 2022): \"hash table of size 10 (or 11), h(k) = k mod m, insert 0, 30, 1, 55, 16, 28, 13, 9, 26 using linear probing, then quadratic probing, then chaining.\" Draw the table after each insert and say which slot each key takes. Watch the difference between m = 10 and m = 11: with m = 10 the values 0, 30 and 55 all collide again and again.",
      "trap": "With quadratic probing write the actual probe indices you tried (h, h+1, h+4, h+9 …) — jumping straight to the final slot loses the method marks. And never answer \"slot is empty\" for a deleted slot."
    },
    {
      "n": 9,
      "t": "Red-black trees — properties, height bound, rotations, insertion",
      "mins": 6,
      "weight": "core",
      "one": "A binary search tree that keeps itself short by colouring nodes red or black. It guarantees O(lg n) search, insert and delete — something a plain BST cannot promise.",
      "why": "A plain binary search tree can turn into a linked list if you insert sorted keys. The colouring is what stops that — and the height bound is a five-mark proof that fits on four lines.",
      "keep": [
        "Four properties: colours, black root and NIL leaves, no red node with a red child, equal black-height on every path.",
        "Height theorem: h ≤ 2 lg(n + 1).",
        "Insert red, then look at the uncle: red uncle → recolor; black uncle with a triangle → rotate to a line; black uncle with a line → recolor and rotate. Root stays black."
      ],
      "recipe": [
        "Quote the four properties, then say: merge every red node into its black parent.",
        "That gives a 2-3-4 tree whose leaves are all at the same depth h′.",
        "No two reds in a row → at most half of a path is red → h′ ≥ h/2.",
        "n + 1 leaves and every node has ≥ 2 children → n + 1 ≥ 2<sup>h′</sup>; take lg and rearrange: h ≤ 2 lg(n + 1)."
      ],
      "example": {
        "t": "The proof, written the way it earns marks",
        "steps": [
          "<b>Merge:</b> every red node joins its black parent, giving nodes with 2, 3 or 4 children — a 2-3-4 tree. Because the black-height is the same on every path, all its leaves are at one depth h′.",
          "<b>Half the path:</b> a red node cannot have a red child, so on any root-to-leaf path at most every other node is red — therefore h′ ≥ h/2.",
          "<b>Count the leaves:</b> the 2-3-4 tree has exactly n + 1 leaves, and a tree of depth h′ where every internal node has at least two children has at least 2<sup>h′</sup> leaves, so n + 1 ≥ 2<sup>h′</sup>.",
          "<b>Finish:</b> take lg → lg(n + 1) ≥ h′ ≥ h/2 → <b>h ≤ 2 lg(n + 1)</b> ∎"
        ]
      },
      "blocks": [
        {
          "h": "Why a plain BST is not enough",
          "p": "A BST built from sorted keys degenerates into a linked list: search becomes Θ(n). The fix is to keep the height O(lg n) whatever the insertion order, either by rotations (AVL) or by colours (red-black). Red-black trees are the ones used in libraries (Java TreeMap, C++ std::map, the Linux kernel) because insertions need at most two rotations."
        },
        {
          "key": "<b>The four properties</b><br>1. Every node is red or black.<br>2. The root is black, and every leaf (the NIL sentinels) is black.<br>3. A red node has two black children — equivalently, no two red nodes on a path.<br>4. Every path from a node down to a leaf contains the same number of black nodes (the black-height of that node)."
        },
        {
          "h": "Why the height stays small — the exam proof",
          "list": [
            "Merge every red node into its black parent. Every black node becomes a 2-, 3- or 4-node, and all leaves of the resulting tree have the same depth h′, because the black-height is uniform.",
            "On any root-to-leaf path at most half of the nodes are red (property 3 forbids two reds in a row), so the black depth h′ satisfies h′ ≥ h/2.",
            "The merged tree has n + 1 leaves, and a tree of depth h′ in which every internal node has at least two children has at least 2<sup>h′</sup> leaves. So n + 1 ≥ 2<sup>h′</sup>.",
            "Taking logs: lg(n + 1) ≥ h′ ≥ h/2, therefore <b>h ≤ 2 lg(n + 1)</b> ✔"
          ]
        },
        {
          "h": "Search, minimum, successor",
          "p": "All of them ignore the colours and cost O(h) = O(lg n). Minimum: go left until NIL. Maximum: go right. Successor(x): if x has a right subtree the successor is its minimum; otherwise walk up until you arrive from a left child. Predecessor is the mirror image."
        },
        {
          "h": "Rotations — O(1), and they keep the in-order sequence",
          "p": "A left rotation at x makes its right child y the new root of that subtree: y keeps its right subtree, x keeps its left, and y's left child becomes x's right child. Nothing else changes, and the in-order view of the tree (the sorted order of the keys) is identical. Insertion uses at most two rotations, deletion at most three."
        },
        {
          "h": "Insertion in three cases",
          "list": [
            "Insert the key as a BST leaf and colour it <b>red</b> (so black-height is untouched; only property 3 can break).",
            "<b>Case 1</b> — the uncle is red: recolor parent and uncle black, grandparent red, then continue from the grandparent. Two reds in a row can move up, so this repeats at most O(lg n) times but needs no rotation.",
            "<b>Case 2</b> — the uncle is black and x is an inner child (triangle, e.g. right child of a left child): rotate the parent to turn the triangle into a line, then fall into case 3.",
            "<b>Case 3</b> — the uncle is black and x is an outer child (line, e.g. left child of a left child): color the parent black, the grandparent red, rotate the grandparent. Done."
          ]
        }
      ],
      "drill": {
        "q": "A red-black tree has black-height 2. What is the tallest it can be?",
        "ans": "h ≤ 2·bh because at most every other node on a path is red, so at most 4 levels. (In keys, h ≤ 2 lg(n+1) gives the same order of magnitude.)"
      },
      "exam": "\"Prove that a red-black tree with n keys has height h ≤ 2 lg(n+1)\" (5 marks, 2025) — the four steps above, with the 2-3-4 merge idea stated. Or \"insert 3 then 1 into this tree, showing every step\" where each step must name the case number.",
      "trap": "Writing only \"we rotate and recolor\" earns nothing. Name the case, say what the uncle's colour is, and state whether a rotation or only a recolour happens."
    },
    {
      "n": 10,
      "t": "Red-black trees in depth — the six insert cases and the code",
      "mins": 6,
      "weight": "often",
      "one": "Lecture 9 said \"look at the uncle\". This one works the same rule from both sides (parent is a left child or a right child) and shows why there are six cases but only two shapes.",
      "why": "Insertion only ever breaks one rule — a red parent. Everything else in this lecture is bookkeeping about which of the six cases you are in.",
      "keep": [
        "Cases 1–3 handle a parent that is a left child; cases 4–6 are their mirror image.",
        "Only case 1 changes the black-height balance — and it fixes it by recolouring, not rotating.",
        "Every insert ends with the root coloured black."
      ],
      "recipe": [
        "Insert as a BST leaf, colour it red.",
        "If the parent is black, stop. If it is red, look at the uncle.",
        "Uncle red → recolour parent and uncle black, grandparent red, continue from the grandparent (case 1).",
        "Uncle black and x is an inner child (triangle) → rotate the parent to make a line (case 2).",
        "Uncle black and x is an outer child (line) → parent black, grandparent red, rotate the grandparent (case 3). Finish by colouring the root black."
      ],
      "example": {
        "t": "10 black with red children 5 and 15 — insert 3, then 1",
        "steps": [
          "<b>Insert 3:</b> red, left child of 5. Parent 5 is red and uncle 15 is red → case (1): 5 and 15 black, 10 red — but 10 is the root, so it becomes black again. Tree: 10B, 5B with 3R, 15B.",
          "<b>Insert 1:</b> red, left child of 3. Parent 3 is red, uncle (5's right child) is NIL, so black, and x is an outer left-left child → case (3): 3 becomes black, 5 becomes red, rotate 5 right.",
          "Final tree: <b>10B; left 3B with children 1R and 5R; right 15B</b> — all four properties hold."
        ]
      },
      "blocks": [
        {
          "h": "The setup",
          "p": "After inserting a red node x, the only possible violation is \"x is red and so is its parent p\" (property 3). Since p is red, the grandparent g is black. The uncle u is the other child of g. Everything depends on the colour of u."
        },
        {
          "h": "The six cases at a glance",
          "table": [
            [
              "Case",
              "Shape",
              "Uncle",
              "Action"
            ],
            [
              "1",
              "any",
              "red",
              "p and u black, g red, move x to g and repeat"
            ],
            [
              "2",
              "p is a left child, x is a right child (triangle)",
              "black",
              "rotate p left (or right for the mirror) → becomes case 3"
            ],
            [
              "3",
              "p is a left child, x is a left child (line)",
              "black",
              "p black, g red, rotate g right"
            ],
            [
              "4",
              "p is a right child, x is a red uncle case",
              "red",
              "same as case 1"
            ],
            [
              "5",
              "p is a right child, x is a left child (triangle)",
              "black",
              "rotate p right → becomes case 6"
            ],
            [
              "6",
              "p is a right child, x is a right child (line)",
              "black",
              "p black, g red, rotate g left"
            ]
          ]
        },
        {
          "h": "Worked example (2025 style)",
          "p": "Tree: 10 black with children 5 and 15, both red. <b>Insert 3.</b> It becomes the left child of 5, coloured red: parent 5 is red, uncle 15 is red → case 1: 5 and 15 become black, 10 becomes red — but 10 is the root so it is forced back to black. Nothing else to do. Tree: 10B with 5B and 15B, and 3R under 5.<br><b>Insert 1.</b> Red, left child of 3. Parent 3 is red, uncle (right child of 5) is NIL, hence black. x = 1 is a left-left outer child → case 3: colour 3 black, 5 red, rotate 5 to the right. Result: 10B; left child 3B with children 1R and 5R; right child 15B."
        },
        {
          "code": "RB-INSERT-FIXUP(T, z):\n  while z.p.color == RED\n     if z.p == z.p.p.left           // parent is a left child\n        y = z.p.p.right              // the uncle\n        if y.color == RED            // case 1\n           z.p.color = BLACK; y.color = BLACK; z.p.p.color = RED; z = z.p.p\n        else\n           if z == z.p.right         // case 2 (triangle)\n              z = z.p; LEFT-ROTATE(T, z)\n           z.p.color = BLACK         // case 3 (line)\n           z.p.p.color = RED\n           RIGHT-ROTATE(T, z.p.p)\n     else  ... the mirror image (cases 4-6) ...\n  T.root.color = BLACK"
        },
        {
          "h": "Why it terminates, and the cost",
          "p": "Case 1 moves x up two levels, and it can happen at most O(lg n) times before the top; cases 2 and 3 end the loop. Rotations happen at most twice per insertion. Total: O(lg n) time, O(1) structural changes beyond the search."
        }
      ],
      "drill": {
        "q": "Parent red, uncle black, and the new node is the right child of a left child. Which case, and are you finished?",
        "ans": "Case (2), the triangle. Rotate the parent left, which turns it into case (3); you are not finished — case (2) never finishes the job by itself."
      },
      "exam": "Either \"trace the insertion of the given keys, naming the case at every step\" or \"complete RB-INSERT-FIXUP\" with blanks. The blanks are always the same few lines: the uncle, the case-1 recolouring, the case-3 rotation.",
      "trap": "Cases 2 and 5 do not finish the job — they only convert the triangle into a line. Writing \"done\" after case 2 is the most common lost mark."
    },
    {
      "n": 11,
      "t": "Red-black trees — deletion and the four fix-up cases",
      "mins": 6,
      "weight": "often",
      "one": "Deleting from a red-black tree is easier than it looks: remove as in a BST, and only if the removed node was black do you have to repair anything — using the colour of the sibling.",
      "why": "Deletion is where marks leak: people memorise four cases and then apply them in the wrong order. The order is the whole answer.",
      "keep": [
        "Two children → replace with the successor (or predecessor) and delete that node instead; it has at most one child.",
        "Removed node red → nothing to fix. Removed black → the child carries an extra black token.",
        "The four fix-up cases, in the order the slides check them: (1) x itself is red, (2) the sibling is red, (3) sibling black with both nephews black, (4i) and (4ii) the far nephew is black or red."
      ],
      "recipe": [
        "Delete as in a plain BST: two children → copy the successor in and delete the successor instead.",
        "Ask what colour the removed node was. Red → nothing to fix, stop (two lines, full marks).",
        "Black → the child x carries an extra black token. Then run the slides' cases in order: (1) x red, (2) sibling red, (3) both nephews black, (4i) far nephew black, (4ii) far nephew red.",
        "If the token reaches the root, drop it. At most three rotations."
      ],
      "example": {
        "t": "Delete a black leaf whose sibling is black and whose parent is red",
        "steps": [
          "Tree: 10B with left child 5R (children 3B and 7B) and right child 15B. Delete the black leaf 3.",
          "The replacement x is NIL, so it is black and carries the token. Parent 5 is red, sibling 7 is black, and both nephews of 7 are NIL (black) → <b>case (3)</b>.",
          "Case (3): colour 7 red and pass the token up to the parent 5.",
          "The parent 5 is red, so <b>case (1)</b> finishes it: colour 5 black and remove the token.",
          "Result: <b>10B; left 5B with one red child 7R; right 15B</b>, and every path has the same black-height ✔"
        ]
      },
      "blocks": [
        {
          "h": "BST deletion first",
          "p": "If the node z has no child, cut it. If it has one child, splice the child in. If it has two, copy its successor y into z (the key and the satellite data) and delete y instead — y has at most one child, so the hard case disappears."
        },
        {
          "h": "What colour was removed?",
          "p": "If the removed node was <b>red</b>, no black-height changed and no red-red pair appeared: the tree is still valid, stop. If it was <b>black</b>, one path lost a black node. Give the child x an extra black token (the \"double black\") and push it up until it can be absorbed."
        },
        {
          "h": "The fix-up cases, in the order the slides check them (x is a left child; the right side is the mirror)",
          "table": [
            [
              "Case",
              "Situation",
              "Action"
            ],
            [
              "(1)",
              "x itself is red",
              "colour x black and remove the token — done, nothing else runs"
            ],
            [
              "(2)",
              "the sibling y is red",
              "swap the colours of y and the parent, rotate the parent toward x. y is now black, the token stays on x, and the next step is case (3) or (4)"
            ],
            [
              "(3)",
              "y black and both nephews black",
              "colour y red and pass the token one level up to the parent; if that parent is red, case (1) ends it, otherwise repeat higher"
            ],
            [
              "(4)(i)",
              "y black, far nephew black, near nephew red",
              "rotate y away from x and swap their colours — turns into 4(ii)"
            ],
            [
              "(4)(ii)",
              "y black and the far nephew red",
              "y takes the parent colour, the parent and the far nephew become black, rotate the parent toward x — the token is absorbed, done"
            ]
          ]
        },
        {
          "h": "When it stops",
          "p": "The token travels up: case 3 pushes it to the parent, case 4(ii) removes it entirely, and if it ever reaches the root you simply drop it (the root absorbs the extra black). So deletion is O(lg n) with at most three rotations."
        },
        {
          "h": "Sorted arrays, linked lists, and why trees win",
          "table": [
            [
              "Structure",
              "Search",
              "Insert",
              "Delete"
            ],
            [
              "Sorted array",
              "O(lg n)",
              "O(n)",
              "O(n)"
            ],
            [
              "Linked list",
              "O(n)",
              "O(n)",
              "O(n)"
            ],
            [
              "Red-black tree",
              "O(lg n)",
              "O(lg n)",
              "O(lg n)"
            ]
          ]
        },
        {
          "p": "That table is the standard 2-3 mark opener: an array searches fast but shifts elements on every insert; a list inserts fast but cannot binary-search; only the balanced tree is logarithmic in all three operations."
        }
      ],
      "drill": {
        "q": "You delete a node and it turns out to have been red with two children (so you deleted its successor instead). Do you need the fix-up?",
        "ans": "Only if the node you actually removed was black. Check the colour of the successor, not of the key you were asked to delete."
      },
      "exam": "\"Delete node k from this red-black tree and show every fix-up step\" — always state the colour of the removed node first; if it was red the answer is two lines and you have saved ten minutes.",
      "trap": "The sibling conditions are about the nephews, not the sibling itself. Naming the wrong nephew (near vs far) flips case 4(i) and 4(ii)."
    },
    {
      "n": 12,
      "t": "Augmenting data structures — order-statistic and interval trees",
      "mins": 6,
      "weight": "core",
      "one": "Take a red-black tree and store one extra number per node. If the number can be maintained under insertion, deletion and rotation, you get a new operation in O(lg n) — that is the whole method.",
      "why": "This is the one lecture where the exam hands you code with blanks. Ten marks for filling four lines — the best return per minute in the whole paper.",
      "keep": [
        "Store <code>size[x] = size[left] + size[right] + 1</code>, never the rank (ranks cannot be maintained cheaply).",
        "OS-SELECT walks down using sizes; OS-RANK walks up adding left subtrees.",
        "Interval tree: key on the low endpoint, store m[x] = max high endpoint in the subtree."
      ],
      "recipe": [
        "Remember the invariant: size[x] = size[left] + size[right] + 1, and size[NIL] = 0.",
        "OS-SELECT walks <b>down</b>: compare i with size[left] + 1 and subtract when you go right.",
        "OS-RANK walks <b>up</b>: start with size[left[x]] + 1 and add size[left[parent]] + 1 every time you climb from a right child.",
        "Say out loud why ranks are not stored: one insertion would change most of them."
      ],
      "example": {
        "t": "The tree 10; 5 with 2 and 7; 15 with 12 and 20 (sizes 1, 3, 7)",
        "steps": [
          "OS-RANK(12): r = size[left[12]] + 1 = 0 + 1 = 1.",
          "12 is a left child of 15 → nothing added. Climb: 15 is a right child of 10, so r = r + size[left[10]] + 1 = 1 + 3 + 1 = 5.",
          "Reached the root → rank of 12 is <b>5</b> (2, 5, 7, 10, 12 ✔).",
          "OS-SELECT(6): at 10, k = size[5] + 1 = 4; 6 &gt; 4 so go right with i = 6 − 4 = 2. At 15, k = size[12] + 1 = 2 → i = k → <b>15</b> ✔"
        ]
      },
      "blocks": [
        {
          "h": "The four-step recipe",
          "list": [
            "Choose the underlying structure — here a red-black tree.",
            "Decide the extra information: the subtree size for order statistics, the maximum high endpoint for intervals.",
            "Prove the extra information can be maintained during INSERT and DELETE, including during rotations.",
            "Write the new operations that use it."
          ]
        },
        {
          "h": "Order-statistic tree",
          "p": "With size[] in every node, finding the i-th smallest is a walk from the root: compute the rank k of the current node as size[left] + 1, then compare k with i. Rotations only touch two nodes, and each recomputes its size in O(1), so insert and delete stay O(lg n)."
        },
        {
          "code": "OS-SELECT(x, i):                 // i-th smallest in the subtree of x\n  k = size[left[x]] + 1            // rank of x itself\n  if i == k: return x\n  if i <  k: return OS-SELECT(left[x], i)\n  else     : return OS-SELECT(right[x], i - k)\n\nOS-RANK(T, x):                     // rank of a known node\n  r = size[left[x]] + 1\n  y = x\n  while y != T.root:\n     if y == y.p.right:  r = r + size[left[y.p]] + 1\n     y = y.p\n  return r"
        },
        {
          "h": "Reading OS-RANK out loud",
          "p": "Start with everything smaller than x inside x's own subtree (its left subtree plus itself). Then walk up: every time you come from a right child you also pass the parent and the parent's whole left subtree, so add size[left[parent]] + 1. When you reach the root, r is the rank. Filling in the blanks of that code is a 6–10 mark question in 2025."
        },
        {
          "h": "Interval trees",
          "p": "Each interval is stored by its low endpoint. The extra field m[x] is the largest high endpoint anywhere in x's subtree. To find an interval overlapping a query i, start at the root: if it overlaps, return it; otherwise go left when the left subtree could contain an overlap (low[i] ≤ m[left[x]]), else go right. Following only one side is safe because if the search goes right, everything on the left ends before i starts."
        },
        {
          "key": "Two intervals i and j overlap ⟺ <code>low[i] ≤ high[j]</code> and <code>low[j] ≤ high[i]</code>. Both operations are O(lg n). The m values are maintained by <code>m[x] = max(high[x], m[left], m[right])</code>, which is O(1) per node during a rotation."
        }
      ],
      "drill": {
        "q": "What are the four blanks of OS-RANK in order?",
        "ans": "r = size[left[x]] + 1 · while y ≠ T.root · if y == y.p.right then r = r + size[left[y.p]] + 1 · y = y.p."
      },
      "exam": "\"Complete OS-RANK\" with numbered blanks (2025, 10 points) and \"why can we always go down one side in INTERVAL-SEARCH?\" (3–4 marks). The blanks are always: size[left[x]] + 1, T.root, r + size[left[y.p]] + 1, y.p.",
      "trap": "Storing the rank in each node is wrong — inserting one element changes the rank of most nodes. Store sizes, derive ranks."
    },
    {
      "n": 13,
      "t": "Skip lists",
      "mins": 5,
      "weight": "rare",
      "one": "A sorted linked list with express lanes on top. Search drops a level when the next key is too big, so it behaves like binary search — and no input can make it degenerate, because the lanes are random.",
      "why": "One lecture, one question: describe the search and prove it is expected O(lg n). It is the easiest page in the course to memorise because nothing is balanced explicitly.",
      "keep": [
        "Search: go right while the next key is ≤ k, otherwise drop one level. O(lg n) expected.",
        "Insertion promotes the node with probability ½ per level (flip a coin).",
        "The randomness is independent of the keys, so there are no adversarial inputs — only unlucky coin flips."
      ],
      "recipe": [
        "Describe the walk: right while the next key on this level is ≤ k, otherwise down one level.",
        "Describe insertion: insert at level 0, then flip a coin to promote, flipping again while heads.",
        "Prove it with backwards analysis: from the found node, half the time you came from above, half from the left.",
        "Solve C(j) = 1 + ½C(j−1) + ½C(j) → C(j) = 2j, so two steps per level and O(lg n) levels."
      ],
      "example": {
        "t": "Search for 25 in a perfect skip list",
        "steps": [
          "Level 2 holds 3, 19. Start at 3 → next is 19 ≤ 25, move right to 19 → next is the end, drop a level.",
          "Level 1 holds 3, 12, 19, 31. From 19 → next is 31 &gt; 25, drop a level.",
          "Level 0 holds 3, 7, 12, 19, 25, 31. From 19 → next is 25 = k → <b>found</b>.",
          "Six nodes touched out of six keys — on a large list the same walk touches about 2 per level, i.e. O(lg n)."
        ]
      },
      "blocks": [
        {
          "h": "The structure",
          "p": "Level 0 is the complete sorted linked list. Level 1 keeps about half of the nodes, level 2 a quarter, and so on — a perfect skip list. The top level is a single node, so there are O(lg n) levels. Each node stores an array of forward pointers, one per level it appears in."
        },
        {
          "h": "Search",
          "p": "Start at the top-left (the head node). Look at the next node on the current level: if its key ≤ k move right, otherwise drop down one level. When you cannot move right on level 0 you either found k or it is absent. You move right along a level and down through levels, so the number of steps is proportional to the number of levels plus the nodes visited per level, O(lg n)."
        },
        {
          "h": "Insert and delete",
          "p": "Search first, remembering the last node visited at every level. Insert the new node on level 0, then flip a coin: heads → also insert at level 1, flip again, and so on. Delete removes the node from every level where it appears. Both are O(lg n) expected."
        },
        {
          "key": "<b>Backwards analysis</b> (the exam favourite): stand at the found node and walk back to the start. At every step you came from above with probability ½ (the node was promoted) and from the left with probability ½. So the expected work per level satisfies C(j) = 1 + ½C(j−1) + ½C(j), which gives C(j) = 2j — about two steps per level, and O(lg n) levels → <b>expected O(lg n) search</b>."
        },
        {
          "h": "Why it is a serious data structure",
          "list": [
            "It needs no balancing code, no rotations, no colour fix-ups: the insert is a search plus a few pointer writes.",
            "The level structure is chosen by the coin flips, so the keys cannot conspire to create a bad shape. Expected space is O(n) (each node appears in 2 levels on average).",
            "It supports the same operations as a balanced tree, plus range queries and ordered iteration, and it is easy to make concurrent.",
            "Worst case (every coin failing) is still Θ(n) — but exponentially unlikely."
          ]
        }
      ],
      "drill": {
        "q": "A skip list has 1 000 000 keys. Roughly how many levels, and how many steps for a search?",
        "ans": "lg(10⁶) ≈ 20 levels, and about two steps per level, so roughly 40 steps — the same order as a balanced tree, with no balancing code."
      },
      "exam": "\"Describe the skip-list search algorithm and prove the expected search time is O(lg n)\" — the backwards-analysis recurrence above is the proof. A short True/False item likes to say \"a skip list is a balanced tree\" (false: it is a randomised list).",
      "trap": "The perfect skip list is not what is implemented — promotion is random. And the analysis is in expectation; the deterministic worst case is linear."
    },
    {
      "n": 14,
      "t": "Dynamic programming — coin-row, binomial coefficients, LCS, knapsack",
      "mins": 8,
      "weight": "core",
      "one": "When the same subproblem appears again and again, solve each one once, store the answer in a table, and build bigger answers from smaller ones. That is dynamic programming, and it turns exponential recursions into polynomial loops.",
      "why": "The only lecture where the algorithm is \"fill a table\". Once you can do coin row and knapsack on paper, every other DP question in the course is the same exercise with different words.",
      "keep": [
        "Coin-row: F(n) = max{cₙ + F(n−2), F(n−1)}.",
        "LCS: match → diagonal + 1; otherwise the better of up and left.",
        "0/1 knapsack: V[i,j] = max{V[i−1,j], vᵢ + V[i−1, j−wᵢ]} when j ≥ wᵢ."
      ],
      "recipe": [
        "Define the cell in one sentence (\"V[i,j] = best value using the first i items and capacity j\").",
        "Write the recurrence and the base row/column.",
        "Fill the table left to right, top to bottom — the examiner is marking the fill.",
        "Read the answer from the corner cell, then backtrack (compare with the cell above) if the question asks which items."
      ],
      "example": {
        "t": "Coin row 5, 1, 2, 10, 6, 2 and knapsack W = 5",
        "steps": [
          "Coin row: F(0) = 0, F(1) = 5. Then F(n) = max{cₙ + F(n−2), F(n−1)}: 5, 5, 7, 15, 15, 17.",
          "So the best total is <b>17</b> — take the 5, the 10 and the last 2 (never two neighbours).",
          "Knapsack W = 5, weights 2, 1, 3, 2, values 12, 10, 20, 15: fill V[i,j] = max(V[i−1,j], vᵢ + V[i−1, j−wᵢ]).",
          "V[4,5] = <b>37</b>. Backtrack: V[3,5] ≠ 37 so item 4 is taken (j becomes 3); then item 3 is skipped, items 2 and 1 are taken → weight 2 + 1 + 2 = 5, value 12 + 10 + 15 = 37 ✔"
        ]
      },
      "blocks": [
        {
          "h": "What makes a problem a DP problem",
          "list": [
            "<b>Optimal substructure</b>: the best answer contains the best answers to smaller instances.",
            "<b>Overlapping subproblems</b>: the naive recursion recomputes the same small instances (Fibonacci is the cartoon example).",
            "So: write the recurrence, fill a table bottom-up (or memoise top-down), then read the answer from a cell."
          ]
        },
        {
          "h": "Coin-row problem",
          "p": "A row of coins; pick a set with the maximum total, but never two neighbours. Look at the last coin: either you take it (and must skip its neighbour) or you do not. <code>F(n) = max{cₙ + F(n−2), F(n−1)}</code>, with F(0) = 0 and F(1) = c₁. Fill n cells, keep two back-pointers per cell to reconstruct the choice. Time and space Θ(n).<br>Example 5, 1, 2, 10, 6, 2 → F = 0, 5, 5, 7, 15, 15, 17 — the best is <b>17</b> (coins 5, 10, 2)."
        },
        {
          "h": "Binomial coefficients",
          "p": "Pascal's rule <code>C(n,k) = C(n−1,k−1) + C(n−1,k)</code> with C(n,0) = C(n,n) = 1. A (n+1)×(k+1) table filled row by row gives Θ(nk) time instead of the exponential recursive version — and you only need two rows of memory if you do not need the whole table."
        },
        {
          "h": "Longest common subsequence",
          "p": "A subsequence keeps the order of the letters but may skip some (\"president\" and \"providence\" give \"priden\"). Let len(i,j) be the LCS of the first i letters of a and the first j of b: <code>len(i,j) = len(i−1,j−1) + 1</code> when aᵢ = bⱼ, otherwise <code>max(len(i−1,j), len(i,j−1))</code>. The table is m×n, so Θ(mn) time and space; a back-pointer per cell recovers the actual string."
        },
        {
          "key": "<b>0/1 knapsack</b>: V[i,j] is the best value using the first i items with capacity j. If item i is too heavy (j &lt; wᵢ) then V[i,j] = V[i−1,j]; otherwise take the better of skipping it and taking it: <code>max(V[i−1,j], vᵢ + V[i−1, j−wᵢ])</code>. Base row and column are zero. Θ(nW) time.<br>Backtrack from V[n,W]: if V[i,j] = V[i−1,j] the item was not taken, otherwise it was and you move to j − wᵢ.<br>Lecture example (W = 5, weights 2, 1, 3, 2, values 12, 10, 20, 15): the answer is <b>37</b>, from items 1, 2 and 4."
        },
        {
          "h": "Robot coin collection",
          "p": "A grid of coins, move only right or down, maximise the collected sum: <code>F(i,j) = coin(i,j) + max(F(i−1,j), F(i,j−1))</code>, first row and column filled by running sums. Same skeleton: one cell per subproblem, each computed from its neighbours."
        },
        {
          "h": "The DP recipe to write in the exam",
          "list": [
            "Define the table and what one cell means (\"V[i,j] = best value with the first i items and capacity j\").",
            "Write the recurrence and the base cases.",
            "Fill the table with a small example — three or four rows are enough.",
            "Read the answer, then backtrack if the question asks which items.",
            "State the time and space complexity from the table dimensions."
          ]
        }
      ],
      "drill": {
        "q": "Binomial coefficients: which two cells do you add to get C(5,3)?",
        "ans": "C(4,2) + C(4,3) = 6 + 4 = 10 — the Pascal rule C(n,k) = C(n−1,k−1) + C(n−1,k), with C(n,0) = C(n,n) = 1."
      },
      "exam": "\"Solve the coin-row problem for the row 5, 1, 2, 10, 6, 2\", \"compute C(5,2) with a table\", \"find the LCS of these two strings and show the table\", \"solve the 0/1 knapsack with W = 5 and these items\" — always draw the table; the marks are for the fill order and the answer cell.",
      "trap": "Writing only the final number. DP questions are marked on the table and on the backtracking arrows."
    }
  ],
  "patterns": {
    "intro": "The same families of questions come back every year. This is the frequency table — study from the top down if time is short.",
    "rows": [
      [
        "Master method",
        "2020, 2021, 2023, 2024, 2025",
        "Solve 3–4 recurrences, or say the method cannot be used",
        "6–8"
      ],
      [
        "Iteration / recursion tree / substitution",
        "2023, 2024",
        "One recurrence solved by a named method, all steps shown",
        "8–9"
      ],
      [
        "Hash table trace",
        "2021, 2022, 2023",
        "Size 10 or 11, values 0, 30, 1, 55, 16, 28, 13, 9, 26: linear, quadratic, chaining",
        "10"
      ],
      [
        "Fibonacci of 16 in four steps",
        "2024, 2025",
        "Matrix squaring, M² → M¹⁶",
        "5"
      ],
      [
        "Median of two sorted arrays",
        "2024, 2025",
        "(a) naive Θ(m+n) (b) O(log n) idea",
        "6–10"
      ],
      [
        "Red-black tree",
        "2020, 2023, 2025",
        "Properties, height proof h ≤ 2 lg(n+1), insertion trace",
        "5–8"
      ],
      [
        "Order-statistic tree",
        "2025",
        "Complete OS-RANK / OS-SELECT, why sizes not ranks",
        "6–10"
      ],
      [
        "Divide-and-conquer code reading",
        "2025",
        "What does F1/F2 do, recurrence, complexity",
        "9–10"
      ],
      [
        "Loop complexity",
        "2020, 2024",
        "Counter divided by 2 or 3, nested loops",
        "4"
      ],
      [
        "Counting sort trace",
        "2020",
        "Show C after counting and after accumulating",
        "5"
      ],
      [
        "Quicksort partitions",
        "2018, undated",
        "Array after each partition",
        "5"
      ],
      [
        "Sorts worst-case table",
        "2016–2020",
        "Binary search, insertion, merge, quick, counting",
        "2–3"
      ],
      [
        "Growth ranking + True/False",
        "2022, 2023",
        "Rank n!, 2^2n, 2ⁿ, n³, lg²n; justify each T/F",
        "5"
      ],
      [
        "Powering pᵏ",
        "2021, 2022",
        "Recurrence T(k) = T(k/2)+1 and why computing the half twice is wrong",
        "4–6"
      ],
      [
        "BUILD-MAX-HEAP is O(n)",
        "2024",
        "Sum of heights argument (heaps are not in lectures 1–14, learn the idea only)",
        "5"
      ],
      [
        "Prim, Dijkstra, Huffman, inversions",
        "2023 alternative, 2024 retake",
        "Different instructor — low priority for Dr. Basheer’s paper",
        "—"
      ]
    ],
    "tips": [
      "The paper is <b>1 hour, 40 marks, all written</b>: no multiple choice, no code you have to compile. Answers are short — a recurrence, a table, a proof sketch.",
      "The three \"easy marks\" every year: the master method, the hash trace, and Fibonacci(16) in four steps. Learn those three first; they are worth about half the paper.",
      "When you do not know the answer, write the definition and the first line of the recurrence. Partial marks are given per step, not per final number.",
      "Draw. Tables for hashing and DP, trees for red-black, arrays for partitions. An answer with the table but a wrong last number still earns most of the marks.",
      "Time budget: 8 min for the master method, 10 min for hashing, 5 min for Fibonacci, 10 min for the proof, the rest for the DP/divide-and-conquer question and a check."
    ],
    "habits": [
      "He reuses the same numbers: 0, 30, 1, 55, 16, 28, 13, 9, 26 for hashing and 5, 2, 4, 8, 0, 3, 1, 7 for quicksort. Practising those exact examples is worth real marks.",
      "He asks for \"four steps only\" for Fibonacci — four matrices, no closed form.",
      "His proofs are the ones printed in the slides: height of a red-black tree, Ω(n lg n) for comparison sorts, BUILD-MAX-HEAP, the 19/20 recurrence for selection.",
      "He marks the method as much as the result: name the case, state the condition, then conclude."
    ]
  },
  "mock": {
    "title": "Mock midterm",
    "meta": "25 questions · 100 marks · about 2 hours. Or sit questions 1–12 (48 marks) in one hour, which is exactly the size of the real paper.",
    "note": "Same shape as Dr. Basheer’s papers: recurrences first, then hashing, then trees, then dynamic programming. Work on paper, then open the answer and mark yourself.",
    "questions": [
      {
        "n": 1,
        "marks": 5,
        "topic": "Master method",
        "q": "Solve with the master method, or say it cannot be used:<br>(a) T(n) = 4T(n/2) + n &nbsp; (b) T(n) = 4T(n/2) + n² &nbsp; (c) T(n) = 4T(n/2) + n³ &nbsp; (d) T(n) = 2T(n/2) + n lg n",
        "ans": "(a) n<sup>log₂4</sup> = n² &gt; n → <b>case 1</b> → Θ(n²).<br>(b) n² = f(n) → <b>case 2</b> → Θ(n² lg n).<br>(c) n³ is polynomially larger; check regularity 4·(n/2)³ = n³/2 ≤ ½·n³ ✔ → <b>case 3</b> → Θ(n³).<br>(d) n lg n is not polynomially larger than n, so <b>no case applies</b>; the true answer is Θ(n lg² n)."
      },
      {
        "n": 2,
        "marks": 4,
        "topic": "Iteration method",
        "q": "Solve T(n) = 2T(n/2) + 4n by the iteration (unrolling) method.",
        "ans": "T(n) = 4n + 2T(n/2) = 4n + 4n + 4T(n/4) = … = 4n·k + 2ᵏT(1) with n = 2ᵏ, so k = lg n.<br>T(n) = 4n lg n + n·Θ(1) = <b>Θ(n lg n)</b>."
      },
      {
        "n": 3,
        "marks": 4,
        "topic": "Recursion tree",
        "q": "Solve T(n) = 4T(n/2) + cn with a recursion tree. Show the cost of one level and how the series sums.",
        "ans": "Level i has 4ⁱ nodes, each costing c·n/2ⁱ, so a level costs 4ⁱ·cn/2ⁱ = 2ⁱ·cn. There are lg n + 1 levels.<br>Total = cn(1 + 2 + 4 + … + 2<sup>lg n</sup>) = cn(2<sup>lg n + 1</sup> − 1) = cn(2n − 1) = <b>Θ(n²)</b>.<br>Same answer from the master method: n<sup>log₂4</sup> = n² dominates cn (case 1)."
      },
      {
        "n": 4,
        "marks": 4,
        "topic": "Substitution",
        "q": "Prove by substitution that T(n) = T(n−1) + n is O(n²).",
        "ans": "Claim T(n) ≤ cn². Assume it holds for n−1: T(n) ≤ c(n−1)² + n = cn² − 2cn + c + n.<br>This is ≤ cn² whenever 2cn − c − n ≥ 0, i.e. c ≥ n/(2n−1), so any c ≥ 1 works.<br>Base: T(1) = Θ(1) ≤ c·1. Hence T(n) = O(n²); and T(n) ≥ 1 + 2 + … + n = n(n+1)/2 = Ω(n²), so <b>Θ(n²)</b>."
      },
      {
        "n": 5,
        "marks": 4,
        "topic": "Loop complexity",
        "q": "Give the complexity with a one-line reason:<br>(a) <code>for (i=1; i&lt;n; i++) for (j=1; j&lt;n; j=j*2) …</code><br>(b) <code>for (i=1; i&lt;n; i++) { j=n; while (j&gt;=1) j=j/3; }</code>",
        "ans": "(a) The inner counter doubles, so it runs ⌈lg n⌉ times; the outer runs n−1 times → <b>Θ(n lg n)</b>.<br>(b) The while loop divides j by 3, so it runs log₃n times for each i → Θ(n log₃ n) = <b>Θ(n lg n)</b>."
      },
      {
        "n": 6,
        "marks": 2,
        "topic": "Growth order",
        "q": "Rank in decreasing order of growth: lg²n, 2ⁿ, n³, n!, 2<sup>2n</sup>.",
        "ans": "n! &gt; 2<sup>2n</sup> (= 4ⁿ) &gt; 2ⁿ &gt; n³ &gt; lg²n."
      },
      {
        "n": 7,
        "marks": 4,
        "topic": "True / False",
        "q": "Say true or false with a one-line reason:<br>(1) If T(n) ≤ 10T(n/3) + n³, T(1) = 1, then T(n) = O(n³).<br>(2) n<sup>2.1</sup> = O(n² log n).<br>(3) The solution of T(n) = 4T(n/2) + O(n) is Θ(n³).<br>(4) There is an algorithm for multiplying two n×n matrices in time less than O(n³).",
        "ans": "(1) <b>True</b> — n<sup>log₃10</sup> ≈ n<sup>2.096</sup> &lt; n³ and 10(n/3)³ = (10/27)n³ ≤ c·n³ with c = 10/27 &lt; 1, so case 3 gives Θ(n³).<br>(2) <b>False</b> — the gap is polynomial (n<sup>0.1</sup>), and no log factor can pay for it.<br>(3) <b>False</b> — n<sup>log₂4</sup> = n² dominates n, case 1 gives Θ(n²).<br>(4) <b>True</b> — Strassen: Θ(n<sup>lg 7</sup>) ≈ Θ(n<sup>2.81</sup>)."
      },
      {
        "n": 8,
        "marks": 3,
        "topic": "Sorting table",
        "q": "State the worst-case running time of: binary search, insertion sort, merge sort, quicksort, counting sort.",
        "ans": "Binary search Θ(lg n); insertion sort Θ(n²); merge sort Θ(n lg n); quicksort Θ(n²); counting sort Θ(n + k).<br>Worth adding: merge sort is Θ(n lg n) in <i>every</i> case, quicksort is Θ(n lg n) on average, insertion sort is Θ(n) on sorted input."
      },
      {
        "n": 9,
        "marks": 3,
        "topic": "Quicksort trace",
        "q": "Using PARTITION with the first element as pivot, show the array after the first two partitions of (5, 2, 4, 8, 0, 3, 1, 7).",
        "ans": "Pivot 5: after the scan and the final swap → <b>1, 2, 4, 0, 3, 5, 8, 7</b> (pivot in slot 6).<br>Left part (1, 2, 4, 0, 3), pivot 1: only 0 moves → swap 2 with 0 → <b>0, 1, 4, 2, 3</b>.<br>Then (4, 2, 3) pivots on 4 → 3, 2, 4; then (3, 2) → 2, 3. Full result: 0, 1, 2, 3, 4, 5, 7, 8."
      },
      {
        "n": 10,
        "marks": 4,
        "topic": "Counting sort",
        "q": "Sort A = (2, 5, 3, 0, 2, 3, 0, 3) with counting sort, k = 5. Show C after counting, C after accumulating, and the output.",
        "ans": "Counts C[0..5] = 2, 0, 2, 3, 0, 1.<br>Cumulative C = 2, 2, 4, 7, 7, 8.<br>Placing from the right: <b>B = 0, 0, 2, 2, 3, 3, 3, 5</b>.<br>Θ(n + k) time, stable because we scan the input backwards."
      },
      {
        "n": 11,
        "marks": 4,
        "topic": "Sorting lower bound",
        "q": "Prove that any comparison sort needs Ω(n lg n) comparisons in the worst case.",
        "ans": "Model the algorithm as a decision tree: each internal node compares two elements, each leaf is one of the n! possible orderings of the input.<br>The tree has at least n! leaves, and a binary tree of height h has at most 2<sup>h</sup> leaves, so 2<sup>h</sup> ≥ n!.<br>Take logs: h ≥ lg(n!) = Ω(n lg n) by Stirling. Every input follows one root-to-leaf path, so the worst case needs Ω(n lg n) comparisons. ∎"
      },
      {
        "n": 12,
        "marks": 7,
        "topic": "Hashing",
        "q": "Hash table T of size 11, h(k) = k mod 11. Insert 0, 30, 1, 55, 16, 28, 13, 9, 26 in this order using (a) linear probing, (b) quadratic probing (f(i) = i²), (c) separate chaining. Show the final table each time.",
        "ans": "Base positions: 0→0, 30→8, 1→1, 55→0, 16→5, 28→6, 13→2, 9→9, 26→4.<br><b>(a) Linear:</b> 0 in 0; 1 in 1; 55 probes 0, 1, 2 → slot 2; 13 probes 2, 3 → slot 3; 26 → slot 4. Table: 0:0, 1:1, 2:55, 3:13, 4:26, 5:16, 6:28, 8:30, 9:9 (7 and 10 empty).<br><b>(b) Quadratic:</b> 55 probes 0, 1, then 0+4 = 4 → slot 4. 13 finds slot 2 free immediately → slot 2. 26 probes 4 (taken), 5 (taken), 4+4 = 8 (taken), 4+9 = 13 mod 11 = 2 (taken), 4+16 = 20 mod 11 = 9 (taken), 4+25 = 29 mod 11 = <b>7</b> → slot 7. Table: 0:0, 1:1, 2:13, 4:55, 5:16, 6:28, 7:26, 8:30, 9:9.<br><b>(c) Chaining:</b> 0: 0 → 55; 1: 1; 2: 13; 4: 26; 5: 16; 6: 28; 8: 30; 9: 9."
      },
      {
        "n": 13,
        "marks": 4,
        "topic": "Double hashing",
        "q": "Table size 10, h(k) = k mod 10, h₂(k) = 5 − (k mod 5), probe h(k, i) = (h(k) + i·h₂(k)) mod 10. Insert 15, 25, 35. Can all three be inserted?",
        "ans": "15 → slot 5. 25: h = 5 taken, h₂ = 5, i = 1 → (5+5) mod 10 = 0 → slot 0.<br>35: h = 5 taken, h₂ = 5, i = 1 → 0 taken, i = 2 → (5+10) mod 10 = 5 taken, i = 3 → 0 taken … the probe sequence only ever visits slots 5 and 0, so <b>35 cannot be inserted</b> although eight slots are free.<br>Lesson: h₂(k) must be relatively prime to the table size; 5 and 10 share the factor 5."
      },
      {
        "n": 14,
        "marks": 3,
        "topic": "Open addressing",
        "q": "Why must deletion from an open-addressed table mark the slot DELETED instead of EMPTY? What happens if you mark it EMPTY?",
        "ans": "Because a search stops at the first EMPTY slot it meets. A key that probed past the deleted slot would then be reported missing.<br>DELETED is treated as occupied by search (it keeps probing) and as free by insert (it may reuse the slot). If too many slots are DELETED, rehash, because the probe sequences get long."
      },
      {
        "n": 15,
        "marks": 5,
        "topic": "Divide and conquer",
        "q": "Compute Fibonacci of 16 in four steps only, and show the details.",
        "ans": "M = [[1,1],[1,0]], M<sup>n</sup> = [[F<sub>n+1</sub>, F<sub>n</sub>],[F<sub>n</sub>, F<sub>n−1</sub>]].<br>M² = [[2,1],[1,1]] · M⁴ = [[5,3],[3,2]] · M⁸ = [[34,21],[21,13]] · M¹⁶ = [[1597,987],[987,610]].<br><b>F<sub>16</sub> = 987</b>, in Θ(lg n) time."
      },
      {
        "n": 16,
        "marks": 3,
        "topic": "Fast powering",
        "q": "How do you compute pᵏ optimally? Give the recurrence, the complexity and the mistake to avoid.",
        "ans": "Compute <code>t = power(p, ⌊k/2⌋)</code> <b>once</b>; return t·t if k is even, t·t·p if odd. T(k) = T(k/2) + 1 = <b>Θ(lg k)</b>.<br>Calling the recursion twice (t1 and t2 separately) gives T(k) = 2T(k/2) + 1 = Θ(k) — the same as the naive loop, which is the mistake the question is testing."
      },
      {
        "n": 17,
        "marks": 5,
        "topic": "Median of two arrays",
        "q": "Two sorted arrays A and B of sizes m and n, all values distinct. (a) Give a naive Θ(m+n) algorithm for the median of all values. (b) If m = n, give the O(log n) idea.",
        "ans": "(a) Merge like merge sort and stop after ⌊(m+n)/2⌋ + 1 elements; the median is the last one or two kept. Θ(m+n) time, Θ(1) extra space.<br>(b) Compare the medians a of A and b of B. If a &lt; b the overall median is below a in A's upper half and B's lower half, so discard the lower half of A and the upper half of B; if a &gt; b do the mirror. Repeat with half-size arrays: T(n) = T(n/2) + O(1) = <b>O(log n)</b>."
      },
      {
        "n": 18,
        "marks": 4,
        "topic": "Selection",
        "q": "Describe the worst-case linear-time selection algorithm and show why it is linear.",
        "ans": "Group the n elements into ⌈n/5⌉ groups of 5, find each group's median, recursively select the median x of those medians, partition around x, then recurse into the side containing rank i.<br>At least 3n/10 − 6 elements are on each side of x, so the recursion sees at most 3n/4 elements: T(n) = T(n/5) + T(3n/4) + Θ(n).<br>1/5 + 3/4 = 19/20 &lt; 1, so the series is geometric and <b>T(n) = Θ(n)</b>. Randomized selection is used in practice: same Θ(n) expected, much smaller constant."
      },
      {
        "n": 19,
        "marks": 4,
        "topic": "Red-black trees",
        "q": "Prove that a red-black tree with n keys has height h ≤ 2 lg(n + 1).",
        "ans": "(1) Merge every red node into its black parent: a 2-3-4 tree whose leaves all sit at depth h′ (uniform black-height).<br>(2) No path has two reds in a row, so at most half of the nodes on a path are red → h′ ≥ h/2.<br>(3) The merged tree has n+1 leaves and every internal node has ≥ 2 children → n+1 ≥ 2<sup>h′</sup>.<br>(4) Take lg: lg(n+1) ≥ h′ ≥ h/2 → <b>h ≤ 2 lg(n + 1)</b>. ∎"
      },
      {
        "n": 20,
        "marks": 4,
        "topic": "RBT insertion",
        "q": "Start from: 10 black with red children 5 and 15. Insert 3, then 1 — showing every step and naming the case.",
        "ans": "<b>Insert 3</b>: red, left child of 5. Parent 5 red, uncle 15 red → <b>case 1</b>: 5 and 15 black, 10 red, then the root is forced black. Tree: 10B; 5B with 3R; 15B.<br><b>Insert 1</b>: red, left child of 3. Parent 3 red, uncle (right child of 5) NIL ⇒ black, x is an outer (left-left) child → <b>case 3</b>: 3 black, 5 red, right-rotate 5.<br>Final: 10B; left 3B with 1R and 5R; right 15B. All four properties hold."
      },
      {
        "n": 21,
        "marks": 3,
        "topic": "RBT deletion",
        "q": "After a deletion, when do you need the fix-up and when can you stop immediately? Which node’s colour do you look at, and what are you repairing?",
        "ans": "Look at the colour of the node actually <b>removed</b> (after replacing a two-child node by its successor).<br>Red removed → no black-height changed and no red-red pair can appear → stop.<br>Black removed → the child x carries an extra black token; repair with the slides cases in this order: (1) x is red → colour it black; (2) the sibling is red; (3) sibling black with both nephews black; (4)(i) near nephew red; (4)(ii) far nephew red. If the token reaches the root, drop it."
      },
      {
        "n": 22,
        "marks": 4,
        "topic": "Order-statistic tree",
        "q": "Fill the blanks of OS-RANK(T, x):<br>1 r = ______ &nbsp; 3 while y != ______ &nbsp; 4 if y == y.p.right &nbsp; 5 r = ______ &nbsp; 6 y = ______",
        "ans": "1: <code>size[left[x]] + 1</code> · 3: <code>T.root</code> · 5: <code>r + size[left[y.p]] + 1</code> · 6: <code>y.p</code>.<br>Idea: count the nodes smaller than x inside its own subtree, then every time you climb from a right child add the parent and the parent's left subtree. O(lg n), because sizes are maintained by INSERT, DELETE and the rotations."
      },
      {
        "n": 23,
        "marks": 4,
        "topic": "Skip lists",
        "q": "Describe skip-list search and prove that the expected search time is O(lg n).",
        "ans": "Start at the top-left. If the next key on this level is ≤ k, move right; otherwise drop one level. On level 0 you have either found k or it is absent.<br>Backwards analysis: from the found node, walk back — with probability ½ you came from above (the node was promoted) and with probability ½ from the left. C(j) = 1 + ½C(j−1) + ½C(j) gives C(j) = 2j, i.e. two steps per level.<br>There are O(lg n) levels with high probability, so the expected cost is <b>O(lg n)</b>. Insertion promotes with probability ½ per level; deletion removes the node from every level."
      },
      {
        "n": 24,
        "marks": 4,
        "topic": "Divide-and-conquer code",
        "q": "F2(A, l, mid, r) scans left from mid and right from mid+1 keeping the best sums and returns their total. F1(A, l, r) returns max(F1(left half), F1(right half), F2(A, l, mid, r)).<br>What do the two functions compute, what is the recurrence for F1, and what is its complexity?",
        "ans": "F2 = the best sum of a subarray that <b>crosses the midpoint</b>, in Θ(n).<br>F1 = the <b>maximum contiguous subarray sum</b> of A[l..r] (divide and conquer): the best subarray is entirely left, entirely right, or crosses.<br>Recurrence T(n) = 2T(n/2) + Θ(n), T(1) = Θ(1). Master method, case 2 (n<sup>log₂2</sup> = n = f(n)) → <b>Θ(n lg n)</b>. The naive triple loop would be Θ(n³)."
      },
      {
        "n": 25,
        "marks": 5,
        "topic": "Dynamic programming",
        "q": "(a) Solve the coin-row problem for the row 5, 1, 2, 10, 6, 2 (no two neighbours). (b) For 0/1 knapsack with W = 5, weights (2, 1, 3, 2) and values (12, 10, 20, 15), give the best value and the items taken.",
        "ans": "(a) F(n) = max{cₙ + F(n−2), F(n−1)}, F(0) = 0, F(1) = 5:<br>F = 0, 5, 5, 7, 15, 15, <b>17</b> — coins 5, 10 and the last 2.<br>(b) V[i,j] = max(V[i−1,j], vᵢ + V[i−1, j−wᵢ]) for j ≥ wᵢ, base row/column 0. Filling the 4×5 table gives V[4,5] = <b>37</b>; backtracking (where V[i,j] ≠ V[i−1,j]) gives items 1, 2 and 4, with weight 2 + 1 + 2 = 5 and value 12 + 10 + 15 = 37."
      }
    ]
  }
};
