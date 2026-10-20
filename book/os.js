// Book quick quizzes: five questions per lecture, written from Operating System Concepts (9th ed.,
// Silberschatz, Galvin & Gagne). Each question carries the section and page it comes from in `src`, and every
// option's explanation quotes or closely paraphrases the book, so nothing here is invented.
// build.mjs copies these onto each lecture as `bookQuiz`, and the video player's Quick quiz uses them.
// (The chapter/page references were checked against the PDF text before writing this file.)
window.BOOK = window.BOOK || {};
window.BOOK.os = {
 "1": [
  {
   "q": "From the system's point of view, the operating system is best described as which of the following?",
   "a": 1,
   "o": [
    [
     "A program that only compiles and runs user applications",
     "Application programs are not the operating system. §1.1.2 (p. 5) separates the OS (which allocates and controls resources) from the application programs that use those resources."
    ],
    [
     "A resource allocator that manages all resources and a control program that supervises execution of user programs",
     "Correct — §1.1.2 (p. 5): \"the operating system is viewed as a resource allocator\" that manages CPU time, memory space, file-storage space and I/O devices, and \"the operating system is a control program\" that controls the execution of user programs to prevent errors and improper use of the computer."
    ],
    [
     "A hardware chip on the motherboard that decodes privileged instructions",
     "Mode bits and privilege checks are supported by hardware, but the operating system itself is software (§1.5.1, p. 21)."
    ],
    [
     "The set of all application programs installed on the machine",
     "The book defines the OS separately from application programs and from the users (§1.1.3, p. 6)."
    ]
   ],
   "src": "Book · Ch. 1 §1.1.2, p. 5"
  },
  {
   "q": "According to the book, software may trigger an interrupt by executing a special operation called a:",
   "a": 2,
   "o": [
    [
     "DMA transfer",
     "DMA (Direct Memory Access) is a hardware mechanism for I/O, not the operation through which software raises an interrupt (§1.2.3, p. 12)."
    ],
    [
     "context switch",
     "A context switch is the act of saving and restoring process state by the OS (§3.2.3, p. 114); it does not raise an interrupt."
    ],
    [
     "system call (also called a trap or an exception)",
     "Correct — §1.2.1 (p. 7): \"Software may trigger an interrupt by executing a special operation called a system call (also called a trap or an exception).\""
    ],
    [
     "bootstrap program",
     "The bootstrap program (firmware) loads the kernel at boot time; it is not how a running program signals the OS (§2.10, p. 92)."
    ]
   ],
   "src": "Book · Ch. 1 §1.2.1, p. 7–8"
  },
  {
   "q": "In the storage-device hierarchy of Figure 1.4, which levels are volatile?",
   "a": 2,
   "o": [
    [
     "Every level, because all storage loses its contents when power is removed",
     "Only the levels above the solid-state disk are volatile; the solid-state disk and everything below it are nonvolatile (§1.2.2, p. 11)."
    ],
    [
     "Only the magnetic disk and tape",
     "Magnetic disk, optical disk and tape are nonvolatile storage; they keep data without power (§1.2.2, p. 11)."
    ],
    [
     "The levels above the solid-state disk (registers, cache and main memory)",
     "Correct — §1.2.2 (p. 11): \"the storage systems above the solid-state disk are volatile, whereas those including the solid-state disk and below are nonvolatile\"."
    ],
    [
     "None: main memory keeps its contents after the power is turned off",
     "Main memory is volatile: it loses its contents when power is turned off, which is why secondary storage exists (§1.2.2, p. 10)."
    ]
   ],
   "src": "Book · Ch. 1 §1.2.2, p. 10–11"
  },
  {
   "q": "What does Direct Memory Access (DMA) let the device controller do?",
   "a": 1,
   "o": [
    [
     "Interrupt the CPU once per byte so the CPU copies each byte into memory",
     "That is the non-DMA path, which causes one interrupt per byte. DMA exists precisely to avoid this overhead (§1.2.3, p. 12)."
    ],
    [
     "Transfer a whole block of data directly to or from main memory without CPU intervention, raising one interrupt per block",
     "Correct — §1.2.3 (p. 12): \"the device controller transfers an entire block of data directly to or from its own buffer storage to memory, with no intervention by the CPU. Only one interrupt is generated per block\"."
    ],
    [
     "Run privileged instructions on behalf of a user process",
     "Privileged instructions execute in kernel mode under the OS's control; DMA is about moving data, not about privilege (§1.5.1, p. 21)."
    ],
    [
     "Translate virtual addresses into physical addresses",
     "Address translation is done by the MMU with the page/segment tables, not by DMA (§8.1.3, p. 355)."
    ]
   ],
   "src": "Book · Ch. 1 §1.2.3, p. 12"
  },
  {
   "q": "What distinguishes a clustered system from other multiprocessor systems, as defined in the book?",
   "a": 1,
   "o": [
    [
     "All CPUs share a single motherboard and one clock",
     "That describes multiprocessors, not clustered systems. §1.3.3 (p. 17) explicitly contrasts the two."
    ],
    [
     "It is composed of two or more individual systems (nodes) joined together, and is considered loosely coupled",
     "Correct — §1.3.3 (p. 17): clustered computers \"are composed of two or more individual systems—or nodes—joined together\" and \"such systems are considered loosely coupled\"."
    ],
    [
     "The CPUs are on the same chip (a multicore design)",
     "A multicore system puts several computing cores on a single chip (§1.3.2, p. 14–15); clustering joins whole systems instead."
    ],
    [
     "It requires a real-time operating system to work",
     "Clustering is about high availability and performance and does not require a real-time OS (§1.3.3, p. 17)."
    ]
   ],
   "src": "Book · Ch. 1 §1.3.3, p. 17"
  }
 ],
 "2": [
  {
   "q": "How does multiprogramming increase CPU utilization, according to the book?",
   "a": 1,
   "o": [
    [
     "By giving every process a fixed time slice in strict round-robin order",
     "Time slicing is a property of time-sharing systems; multiprogramming itself is about keeping the CPU busy (§1.4, p. 19–20)."
    ],
    [
     "By organizing jobs so that the CPU always has one to execute, switching to another job when the current one has to wait",
     "Correct — §1.4 (p. 19): \"multiprogramming increases CPU utilization by organizing jobs (code and data) so that the CPU always has one to execute\"; a job has to wait (for example for I/O), the OS switches to another job."
    ],
    [
     "By keeping every job entirely in main memory at the same time",
     "The reverse is true: multiprogramming selects and runs several jobs, and the OS keeps several jobs in memory only as far as it can (§1.4, p. 19)."
    ],
    [
     "By compiling the jobs ahead of time so they need no I/O",
     "I/O cannot be removed; multiprogramming hides I/O waits by running another job meanwhile (§1.4, p. 19)."
    ]
   ],
   "src": "Book · Ch. 1 §1.4, p. 19"
  },
  {
   "q": "The book says that in a time-sharing system the response time should be:",
   "a": 0,
   "o": [
    [
     "Short — typically less than one second",
     "Correct — §1.4 (p. 20): \"the response time should be short—typically less than one second\"."
    ],
    [
     "Long — several minutes, because jobs are batched",
     "Batching is the older, non-interactive mode; time sharing requires immediate results (§1.4, p. 20)."
    ],
    [
     "Equal to the average CPU burst time of the processes",
     "The book ties response time to interactivity, not to burst times, in §1.4 (p. 20)."
    ],
    [
     "Irrelevant, as long as CPU utilization is high",
     "A time-sharing system exists for user interaction, so responsiveness matters, not only utilisation (§1.4, p. 20)."
    ]
   ],
   "src": "Book · Ch. 1 §1.4, p. 20"
  },
  {
   "q": "In the dual-mode scheme, what does the mode bit indicate?",
   "a": 1,
   "o": [
    [
     "Whether the CPU is 32-bit or 64-bit",
     "The mode bit is a single hardware bit for the current execution mode, not a property of the CPU word size (§1.5.1, p. 22)."
    ],
    [
     "The current mode: kernel (0) or user (1)",
     "Correct — §1.5.1 (p. 22): \"a bit, called the mode bit, is added to the hardware of the computer to indicate the current mode: kernel (0) or user (1)\"."
    ],
    [
     "Which process is currently running",
     "The running process is identified by the OS (PCB, scheduler), not by the mode bit (§3.1.3, p. 107)."
    ],
    [
     "Whether interrupts are enabled or disabled",
     "Interrupt enable/disable is a separate CPU state used to protect critical sections (§5.4, p. 209), not the mode bit."
    ]
   ],
   "src": "Book · Ch. 1 §1.5.1, p. 22"
  },
  {
   "q": "Why does the operating system use a timer, according to §1.5.2?",
   "a": 2,
   "o": [
    [
     "To measure how long each process has been running for accounting only",
     "Accounting is a service in §2.1, but the timer exists to keep control of the CPU, not merely to record usage."
    ],
    [
     "To keep the real-time clock (date and time) accurate",
     "The book's purpose for the timer is regaining control of the CPU, not keeping wall-clock time (§1.5.2, p. 24)."
    ],
    [
     "To interrupt after a specified period, so a user program cannot get stuck in an infinite loop or fail to return control to the OS",
     "Correct — §1.5.2 (p. 24): \"we cannot allow a user program to get stuck in an infinite loop or to fail to call system services and never return control to the operating system. To accomplish this goal, we can use a timer\"."
    ],
    [
     "To decide which ready process should run next",
     "That is the job of the short-term scheduler and the dispatcher (§3.2.2, p. 112; §6.1.4, p. 265)."
    ]
   ],
   "src": "Book · Ch. 1 §1.5.2, p. 24"
  },
  {
   "q": "How does §1.9 define protection?",
   "a": 1,
   "o": [
    [
     "Any hardware feature that encrypts files on disk",
     "Encryption is a security mechanism used much later; §1.9 defines protection in terms of controlling access to resources (p. 30)."
    ],
    [
     "Any mechanism for controlling the access of processes or users to the resources defined by a computer system",
     "Correct — §1.9 (p. 30): \"protection, then, is any mechanism for controlling the access of processes or users to the resources defined by a computer system\". The book adds that protection and security require the system to distinguish among all its users, and treats security itself in Chapter 15 (p. 31)."
    ],
    [
     "The mode bit that separates user mode from kernel mode",
     "The mode bit is one mechanism that supports protection, not the definition of protection (§1.5.1, p. 22)."
    ],
    [
     "The part of the timer that limits how long a program runs",
     "The timer is another supporting mechanism; §1.9 defines protection more broadly (p. 30)."
    ]
   ],
   "src": "Book · Ch. 1 §1.9, p. 30"
  }
 ],
 "3": [
  {
   "q": "Which of these is an operating-system service that exists for the efficiency of the system itself rather than for the user?",
   "a": 3,
   "o": [
    [
     "Program execution",
     "Program execution is listed among the services helpful to the user (§2.1, p. 55)."
    ],
    [
     "I/O operations",
     "I/O operations are a user-facing service: programs cannot execute I/O directly (§2.1, p. 55)."
    ],
    [
     "File-system manipulation",
     "Reading, writing, creating and deleting files is listed under the services helpful to the user (§2.1, p. 55)."
    ],
    [
     "Accounting — keeping track of which users use how much and what kinds of resources",
     "Correct — §2.1 (p. 56): accounting is listed with resource allocation and protection/security under \"services ... to ensure the efficient operation of the system itself\"."
    ]
   ],
   "src": "Book · Ch. 2 §2.1, p. 55–56"
  },
  {
   "q": "On UNIX, the command interpreter (shell) is best described as:",
   "a": 0,
   "o": [
    [
     "A user process that is not part of the kernel",
     "Correct — §2.2.1 (p. 58): \"on systems with multiple command interpreters to choose from, the interpreters are known as shells\", and the shell is a user process through which the user issues commands."
    ],
    [
     "Part of the kernel, compiled into the system image",
     "The book distinguishes the shell from the kernel; the shell runs as an ordinary user process (§2.2.1, p. 58)."
    ],
    [
     "A device driver for the terminal",
     "The terminal is a device handled by the I/O subsystem and drivers, not by the shell (§1.8.4, p. 29)."
    ],
    [
     "A system call implemented in assembly language",
     "A system call is the interface to kernel services; the shell uses system calls like fork() and exec() instead of being one (§2.3, p. 62)."
    ]
   ],
   "src": "Book · Ch. 2 §2.2.1, p. 58"
  },
  {
   "q": "What is a system call?",
   "a": 1,
   "o": [
    [
     "A library of mathematical functions shipped with the C compiler",
     "That is a library, not the interface to the kernel; §2.3 (p. 62) describes system calls as the interface to OS services."
    ],
    [
     "The interface to the services made available by an operating system",
     "Correct — §2.3 (p. 62): \"system calls provide an interface to the services made available by an operating system\"; they are generally available as routines written in C and C++, though low-level tasks may need assembly language."
    ],
    [
     "A hardware interrupt generated by a device controller",
     "A device interrupt tells the CPU an I/O operation finished; it is not a program's request for a service (§1.2.3, p. 12)."
    ],
    [
     "A command typed by the user in the shell",
     "A shell command is interpreted by a user-level program, which then makes system calls (§2.2.1, p. 58)."
    ]
   ],
   "src": "Book · Ch. 2 §2.3, p. 62"
  },
  {
   "q": "Which of these is NOT one of the three general methods the book gives for passing parameters to the operating system in a system call?",
   "a": 3,
   "o": [
    [
     "Passing the parameters in registers",
     "This is the first method listed in §2.3 (p. 64)."
    ],
    [
     "Passing parameters in a block, or table, in memory, and passing the address of the block in a register",
     "This is the second method, used by Linux and Solaris (§2.3, p. 64)."
    ],
    [
     "Pushing the parameters onto the stack by the program and popping them off by the operating system",
     "This is the third method listed (§2.3, p. 64)."
    ],
    [
     "Writing the parameters into a special file in the file system",
     "No such method is described; the three are registers, a block/table in memory, and the stack (§2.3, p. 64)."
    ]
   ],
   "src": "Book · Ch. 2 §2.3, p. 64"
  },
  {
   "q": "What are system programs (system utilities)?",
   "a": 2,
   "o": [
    [
     "Programs that are part of the kernel and run in kernel mode",
     "System programs are user-level programs that provide an environment for program development and execution; the kernel is separate (§2.5, p. 74)."
    ],
    [
     "Application programs such as games and text editors",
     "The book separates system programs from application programs in §2.5 (p. 74–75)."
    ],
    [
     "Convenience programs that provide a convenient environment for program development and execution, such as file management, status information and programming-language support",
     "Correct — §2.5 (p. 74): system programs \"provide a convenient environment for program development and execution\", grouped into file management, status information, programming-language support, program loading and execution, communications, and background services."
    ],
    [
     "The bootstrap program stored in ROM",
     "The bootstrap program loads the kernel at boot; it is not the group described in §2.5 (§2.10, p. 92)."
    ]
   ],
   "src": "Book · Ch. 2 §2.5, p. 74"
  }
 ],
 "4": [
  {
   "q": "Why is separating mechanism from policy a desirable design principle?",
   "a": 1,
   "o": [
    [
     "It makes the kernel larger but faster",
     "The point of the separation is flexibility, not speed or size (§2.6.2, p. 76)."
    ],
    [
     "It allows maximum flexibility, because policy decisions can be changed later without changing the mechanism",
     "Correct — §2.6.2 (p. 76): \"the separation of policy from mechanism is a very important principle; it allows maximum flexibility if policy decisions are to be changed later\"."
    ],
    [
     "It removes the need for system calls",
     "System calls remain the interface to kernel services regardless of how policy is separated (§2.3, p. 62)."
    ],
    [
     "It guarantees the operating system is portable to every CPU",
     "Portability is a separate goal; §2.6.2 is about separating what is done from how it is done."
    ]
   ],
   "src": "Book · Ch. 2 §2.6.2, p. 76"
  },
  {
   "q": "What is the main difficulty of the layered approach to OS structure?",
   "a": 2,
   "o": [
    [
     "It cannot be debugged at all",
     "The opposite: its main advantage is simplicity of construction and debugging (§2.7.2, p. 79)."
    ],
    [
     "It cannot use hardware protection",
     "Layers are built on top of hardware; protection is not what the book lists as the difficulty (§2.7.2, p. 79–80)."
    ],
    [
     "Defining the various layers properly, and the overhead of passing through layers makes it less efficient than other types",
     "Correct — §2.7.2 (p. 81): the layered approach's difficulty \"involves the definition of the various layers\", and it \"tends to be less efficient than other types\" because each layer adds overhead."
    ],
    [
     "It requires every layer to be a separate user process",
     "Layers are not required to be separate processes; a microkernel is what moves services to user space (§2.7.3, p. 81)."
    ]
   ],
   "src": "Book · Ch. 2 §2.7.2, p. 79–81"
  },
  {
   "q": "A microkernel design moves as much functionality as possible out of the kernel. What does the book give as the cost of that design?",
   "a": 0,
   "o": [
    [
     "Performance overhead from the message passing between user modules and the kernel",
     "Correct — §2.7.3 (p. 81–82): the microkernel provides minimal process and memory management and communication via message passing; the cost is \"the overhead of message passing\" and function call overhead, which hurts performance."
    ],
    [
     "Loss of portability",
     "Portability is listed as a benefit of microkernels, not a cost (§2.7.3, p. 82)."
    ],
    [
     "Reduced security and reliability",
     "The book argues the opposite: more of the OS runs in user mode, which improves reliability and security (§2.7.3, p. 82)."
    ],
    [
     "The kernel can no longer handle interrupts",
     "The microkernel still handles basic mechanisms such as interrupt handling; that is not the stated cost (§2.7.3, p. 81)."
    ]
   ],
   "src": "Book · Ch. 2 §2.7.3, p. 81–82"
  },
  {
   "q": "Which statement about loadable kernel modules is correct?",
   "a": 1,
   "o": [
    [
     "Modules must be compiled into the kernel image before boot",
     "Loadable kernel modules are loaded at boot or at run time, without recompiling the kernel (§2.7.4, p. 82)."
    ],
    [
     "Each core component can be dynamically linked in, and modules can call other modules directly without message passing",
     "Correct — §2.7.4 (p. 82): \"the kernel provides core services, and other services can be implemented dynamically\" as modules; \"modules can call other modules directly, without message passing\", which makes them faster than microkernel user-space services."
    ],
    [
     "Modules run as separate user processes",
     "Modules run in kernel space and are linked into the kernel, unlike microkernel user-level servers (§2.7.4, p. 82)."
    ],
    [
     "Modules remove the need for device drivers",
     "Device drivers are in fact commonly implemented as loadable modules (§2.7.4, p. 82)."
    ]
   ],
   "src": "Book · Ch. 2 §2.7.4, p. 82"
  },
  {
   "q": "What does the bootstrap program do during system boot?",
   "a": 2,
   "o": [
    [
     "It compiles the kernel for the machine's hardware (system generation)",
     "SYSGEN builds a kernel for a specific configuration; the bootstrap does not compile anything (§2.9, p. 91)."
    ],
    [
     "It starts user applications automatically",
     "User processes are started after the kernel is running, by init/systemd, not by the bootstrap program (§2.10, p. 92)."
    ],
    [
     "It initialises all aspects of the system, from CPU registers to device controllers and memory contents, and locates and loads the kernel",
     "Correct — §2.10 (p. 92): the bootstrap program \"is stored in ROM ... initializes all aspects of the system ... and then loads the operating system\"."
    ],
    [
     "It performs address translation after the kernel is loaded",
     "Address translation is done by the MMU during program execution (§8.1.3, p. 355)."
    ]
   ],
   "src": "Book · Ch. 2 §2.10, p. 92"
  }
 ],
 "5": [
  {
   "q": "According to the book, what is stored on the stack of a process?",
   "a": 0,
   "o": [
    [
     "Temporary data such as function parameters, return addresses and local variables",
     "Correct — §3.1.1 (p. 106): \"the temporary data—function parameters, return addresses, and local variables—is stored in the stack\"."
    ],
    [
     "Memory allocated dynamically during run time",
     "Dynamically allocated memory comes from the heap, which grows upward in memory (§3.1.1, p. 106)."
    ],
    [
     "The process's global variables",
     "Global (initialised and uninitialised) data lives in the data section, not the stack (§3.1.1, p. 106)."
    ],
    [
     "The program's machine code",
     "The program code (text) is loaded from the executable file into the text section (§3.1.1, p. 106)."
    ]
   ],
   "src": "Book · Ch. 3 §3.1.1, p. 106"
  },
  {
   "q": "Which set of process states does the book use for the process state diagram?",
   "a": 1,
   "o": [
    [
     "New, ready, blocked, suspended, stopped",
     "Suspended states belong to swapping discussions; the basic five states are new, ready, running, waiting and terminated (§3.1.2, p. 107)."
    ],
    [
     "New, ready, running, waiting, terminated",
     "Correct — §3.1.2 (p. 107): a process may be \"new, ready, running, waiting, or terminated\" while it executes."
    ],
    [
     "New, running, zombie, orphan, terminated",
     "Zombie and orphan are termination situations, not states of the five-state model (§3.3.2, p. 122)."
    ],
    [
     "Ready, running, preempted, blocked",
     "There is no \"preempted\" state; preemption moves a process from running to ready (§3.1.2, p. 107)."
    ]
   ],
   "src": "Book · Ch. 3 §3.1.2, p. 107"
  },
  {
   "q": "Which of the following is NOT information stored in the process control block (PCB)?",
   "a": 3,
   "o": [
    [
     "Process state and program counter",
     "These are the first items listed for the PCB (§3.1.3, p. 107)."
    ],
    [
     "CPU registers and CPU-scheduling information",
     "Both are listed as PCB contents (§3.1.3, p. 107–108)."
    ],
    [
     "Memory-management and accounting information",
     "Both are listed as PCB contents (§3.1.3, p. 108)."
    ],
    [
     "The machine code of the process, copied into the PCB",
     "The PCB stores bookkeeping information; the program's code and data stay in its address space (§3.1.3, p. 107–108)."
    ]
   ],
   "src": "Book · Ch. 3 §3.1.3, p. 107–108"
  },
  {
   "q": "What is the difference between the long-term and the short-term scheduler?",
   "a": 2,
   "o": [
    [
     "The long-term scheduler runs in user mode and the short-term one in kernel mode",
     "Both are part of the OS and run in kernel mode; the difference is what they select (§3.2.2, p. 112)."
    ],
    [
     "The long-term scheduler picks which ready process gets the CPU; the short-term scheduler decides which processes to admit",
     "This swaps the two roles: admission is the long-term scheduler's job (§3.2.2, p. 112–113)."
    ],
    [
     "The long-term scheduler selects processes from the job pool and loads them into memory; the short-term scheduler selects among the ready processes which one executes next",
     "Correct — §3.2.2 (p. 112–113): the long-term (job) scheduler \"selects processes from this pool and loads them into memory for execution\", the short-term (CPU) scheduler \"selects from among the processes that are ready to execute\"."
    ],
    [
     "The long-term scheduler also performs the context switch",
     "The dispatcher performs the context switch, not the long-term scheduler (§3.2.3, p. 114; §6.1.4, p. 265)."
    ]
   ],
   "src": "Book · Ch. 3 §3.2.2, p. 112–113"
  },
  {
   "q": "With the UNIX fork() system call, what does the new (child) process consist of?",
   "a": 1,
   "o": [
    [
     "A completely empty process with no address space",
     "Before exec(), the child is a copy of the parent's address space (§3.3.1, p. 116)."
    ],
    [
     "A copy of the address space of the original process",
     "Correct — §3.3.1 (p. 116): \"the new process consists of a copy of the address space of the original process\", and both processes continue execution after the fork at the instruction following the call."
    ],
    [
     "The parent's address space shared for writing without copying anything",
     "Sharing is only copy-on-write at the page level, after the copy is set up (§9.3, p. 408)."
    ],
    [
     "Only the parent's PCB, with new code loaded from disk",
     "The child gets a copy of the parent's code and data; loading a new program is exec()'s job (§3.3.1, p. 116)."
    ]
   ],
   "src": "Book · Ch. 3 §3.3.1, p. 116"
  }
 ],
 "6": [
  {
   "q": "When is a process called cooperating?",
   "a": 1,
   "o": [
    [
     "When it runs on the same CPU as another process",
     "Sharing a CPU says nothing about cooperation; the definition is about affecting other processes (§3.4, p. 122)."
    ],
    [
     "When it can affect or be affected by the other processes executing in the system",
     "Correct — §3.4 (p. 122): \"a process is cooperating if it can affect or be affected by the other processes executing in the system\"; otherwise it is independent."
    ],
    [
     "When it shares the same page table with another process",
     "Page-table sharing is a mechanism some cooperating processes use, not the definition (§3.4.1, p. 124)."
    ],
    [
     "When it is created with fork()",
     "fork() creates a child process; the parent and child are not automatically cooperating (§3.3.1, p. 116)."
    ]
   ],
   "src": "Book · Ch. 3 §3.4, p. 122"
  },
  {
   "q": "What is required before two processes can use shared memory for IPC?",
   "a": 0,
   "o": [
    [
     "They must agree to remove the restriction that normally prevents one process from accessing another's memory",
     "Correct — §3.4.1 (p. 124): \"shared memory requires that two or more processes agree to remove this restriction\", since normally the OS prevents one process from accessing another's memory."
    ],
    [
     "The kernel must copy every message between them",
     "Message passing copies data through the kernel; shared memory deliberately bypasses that (§3.4.2, p. 126)."
    ],
    [
     "They must run on different machines",
     "Shared memory is between processes on the same machine; sockets and RPC are used across machines (§3.6, p. 136)."
    ],
    [
     "They must have the same parent process",
     "Relatedness is not required; what matters is agreeing on a shared region (§3.4.1, p. 124)."
    ]
   ],
   "src": "Book · Ch. 3 §3.4.1, p. 124"
  },
  {
   "q": "With indirect message passing, messages are sent to and received from:",
   "a": 2,
   "o": [
    [
     "A specific process identifier",
     "Naming a specific process is direct communication (§3.4.2, p. 128)."
    ],
    [
     "The kernel's own buffer, addressed by system-call number",
     "The kernel queues messages, but the naming is through mailboxes/ports (§3.4.2, p. 128)."
    ],
    [
     "Mailboxes (also called ports), which can be shared by several processes",
     "Correct — §3.4.2 (p. 128): with indirect communication, \"messages are sent to and received from mailboxes, or ports\"; a link may be associated with more than two processes."
    ],
    [
     "A file on disk opened by both processes",
     "Files can be used as a medium, but that is not how the book defines indirect message passing (§3.4.2, p. 128)."
    ]
   ],
   "src": "Book · Ch. 3 §3.4.2, p. 128"
  },
  {
   "q": "In message passing with a zero-capacity queue, what must the sender do?",
   "a": 1,
   "o": [
    [
     "Send without ever blocking",
     "Unbounded capacity is the case in which the sender never blocks (§3.4.2, p. 130)."
    ],
    [
     "Block (wait) until the receiver receives the message, because there is no buffer",
     "Correct — §3.4.2 (p. 130): with zero capacity \"the queue has maximum length 0\" and \"the sender must block until the recipient receives the message\" (rendezvous)."
    ],
    [
     "Overwrite the oldest message in the queue",
     "Overwriting is not described; with bounded capacity the sender blocks when the queue is full (§3.4.2, p. 130)."
    ],
    [
     "Send the message directly into the receiver's address space",
     "Messages are buffered in the kernel's queue; users do not write into another process's address space (§3.4.2, p. 126–130)."
    ]
   ],
   "src": "Book · Ch. 3 §3.4.2, p. 130"
  },
  {
   "q": "How does the book describe a socket?",
   "a": 0,
   "o": [
    [
     "An endpoint for communication, identified by an IP address concatenated with a port number",
     "Correct — §3.6.1 (p. 136): \"a socket is defined as an endpoint for communication\", identified by an IP address concatenated with a port number."
    ],
    [
     "A region of memory shared between two processes",
     "That is shared memory (§3.4.1, p. 124)."
    ],
    [
     "A kernel data structure holding the process state",
     "That is the PCB (§3.1.3, p. 107)."
    ],
    [
     "A message queue identified by a mailbox id",
     "That is indirect message passing, not a socket (§3.4.2, p. 128)."
    ]
   ],
   "src": "Book · Ch. 3 §3.6.1, p. 136"
  }
 ],
 "7": [
  {
   "q": "What is a race condition, according to §5.1?",
   "a": 2,
   "o": [
    [
     "Two processes that both finish at exactly the same time",
     "Timing of completion is not the issue; the issue is concurrent access to shared data (§5.1, p. 203–204)."
    ],
    [
     "A process that never leaves its critical section",
     "That would be a failure of mutual exclusion / progress, not the definition of a race condition (§5.2, p. 206)."
    ],
    [
     "Several processes access and manipulate the same data concurrently and the outcome depends on the particular order in which the access takes place",
     "Correct — §5.1 (p. 204): \"a situation like this, where several processes access and manipulate the same data concurrently and the outcome of the execution depends on the particular order in which the access takes place, is called a race condition\"."
    ],
    [
     "Two processes competing for the CPU at the same time",
     "CPU competition is handled by the scheduler (§6.1.2, p. 263); a race condition is about shared data, not the CPU."
    ]
   ],
   "src": "Book · Ch. 5 §5.1, p. 203–204"
  },
  {
   "q": "Which three requirements must any solution to the critical-section problem satisfy?",
   "a": 1,
   "o": [
    [
     "Mutual exclusion, preemption and fairness",
     "Preemption is a scheduling property, not one of the requirements named in §5.2 (p. 206–207)."
    ],
    [
     "Mutual exclusion, progress and bounded waiting",
     "Correct — §5.2 (p. 206–207): the book speaks of \"the requirements of mutual exclusion, progress, and bounded waiting\" that any protocol for critical sections must address."
    ],
    [
     "Atomicity, deadlock freedom and starvation freedom",
     "Deadlock and starvation are problems that can arise, but the three requirements are those named in §5.2 (p. 206–207)."
    ],
    [
     "Bounded waiting, priority inheritance and busy-wait avoidance",
     "Priority inheritance and busy-wait avoidance are implementation techniques (§5.6.4, p. 217), not the three requirements."
    ]
   ],
   "src": "Book · Ch. 5 §5.2, p. 206–207"
  },
  {
   "q": "Peterson's solution, as presented in §5.3, is restricted to:",
   "a": 0,
   "o": [
    [
     "Two processes that alternate execution between their critical sections and remainder sections",
     "Correct — §5.3 (p. 207): \"Peterson's solution is restricted to two processes that alternate execution between their critical sections and remainder sections\", sharing int turn and boolean flag[2]."
    ],
    [
     "Any number of processes sharing one lock variable",
     "The solution uses flag[2] and turn for exactly two processes; a bakery/n-process algorithm would be needed for more (§5.3, p. 207–208)."
    ],
    [
     "Processes running on different machines only",
     "It assumes shared variables in memory, so it is not a distributed algorithm (§5.3, p. 207)."
    ],
    [
     "Kernel threads only",
     "The solution is a software solution for processes/threads sharing variables; it is not limited to kernel threads (§5.3, p. 207)."
    ]
   ],
   "src": "Book · Ch. 5 §5.3, p. 207"
  },
  {
   "q": "What does the book say about the trade-off of using a spinlock (busy waiting)?",
   "a": 2,
   "o": [
    [
     "Busy waiting is always better because it avoids all overhead",
     "The book says the opposite for long critical sections: busy waiting wastes CPU cycles (§5.5, p. 213)."
    ],
    [
     "Spinlocks require no hardware support at all",
     "Mutex locks and the atomic instructions behind them require hardware support (§5.4, p. 209; §5.5, p. 213)."
    ],
    [
     "Busy waiting wastes CPU cycles, but spinlocks avoid the cost of a context switch, so they are useful when locks are held for short times, often on multiprocessors",
     "Correct — §5.5 (p. 213): \"busy waiting wastes CPU cycles ... Spinlocks do have an advantage, however, in that no context switch is required ... when locks are expected to be held for short times, spinlocks are useful. They are often employed on multiprocessor systems\"."
    ],
    [
     "Spinlocks can only be used inside the kernel scheduler",
     "They are a general locking mechanism, commonly used in the kernel but not restricted to the scheduler (§5.5, p. 213; §5.6, p. 213)."
    ]
   ],
   "src": "Book · Ch. 5 §5.5, p. 213"
  },
  {
   "q": "What does the atomic test and set() instruction used in §5.4 do?",
   "a": 1,
   "o": [
    [
     "Reads the lock and leaves it unchanged",
     "test and set() modifies the word; it defines the new value as true while returning the old one (§5.4, p. 209–210)."
    ],
    [
     "Returns the old value of the lock and sets the lock to true, as one uninterruptible unit",
     "Correct — §5.4 (p. 209–210): these special instructions \"allow us either to test and modify the content of a word or to swap the contents of two words atomically\", and the first process to execute test and set() finds key == false while all others must wait."
    ],
    [
     "Swaps the contents of two processes' page tables",
     "Swapping page tables is a memory-management operation; the atomic swap here is of two words (§5.4, p. 209)."
    ],
    [
     "Blocks the calling process until the lock is free",
     "The instruction does not block; the caller loops in the while statement until the returned value shows the lock is free (§5.4, p. 209–210)."
    ]
   ],
   "src": "Book · Ch. 5 §5.4, p. 209–210"
  }
 ],
 "8": [
  {
   "q": "What is a binary semaphore, as opposed to a counting semaphore?",
   "a": 1,
   "o": [
    [
     "A semaphore whose value can be any integer",
     "That is a counting semaphore, whose value ranges over an unrestricted domain (§5.6, p. 214)."
    ],
    [
     "A semaphore whose value can only be 0 or 1",
     "Correct — §5.6 (p. 214): a binary semaphore \"can range only between 0 and 1\"; a counting semaphore can range over an unrestricted domain."
    ],
    [
     "A semaphore that cannot be used for mutual exclusion",
     "Binary semaphores are precisely what is used to provide mutual exclusion, like a mutex lock (§5.6, p. 214)."
    ],
    [
     "A semaphore implemented without a waiting queue",
     "Both kinds are implemented the same way; the queue is part of the implementation, not the type (§5.6.2, p. 215–216)."
    ]
   ],
   "src": "Book · Ch. 5 §5.6, p. 214"
  },
  {
   "q": "How is a semaphore implemented so that it does not busy-wait?",
   "a": 2,
   "o": [
    [
     "By disabling interrupts for the whole waiting period",
     "Disabling interrupts on multiprocessors is expensive and is not the mechanism described (§5.4, p. 209; §5.6.2, p. 215–216)."
    ],
    [
     "By giving each process a private copy of the semaphore",
     "A semaphore must be shared; private copies would not synchronise anything (§5.6, p. 214)."
    ],
    [
     "By adding a waiting list to the semaphore and using block() and wakeup() operations",
     "Correct — §5.6.2 (p. 215–216): the definition is changed to add a queue; block() suspends the process that invokes it and wakeup(P) resumes a blocked process P, provided by the OS as basic system calls."
    ],
    [
     "By making wait() return immediately even when the value is zero",
     "Returning immediately would break mutual exclusion; the caller must be blocked instead (§5.6.2, p. 215)."
    ]
   ],
   "src": "Book · Ch. 5 §5.6.2, p. 215–216"
  },
  {
   "q": "When is a set of processes in a deadlocked state?",
   "a": 0,
   "o": [
    [
     "When every process in the set is waiting for an event that can be caused only by another process in the set",
     "Correct — §5.6.3 (p. 217): \"we say that a set of processes is in a deadlocked state when every process in the set is waiting for an event that can be caused only by another process in the set\"."
    ],
    [
     "When a process waits longer than the timer allows",
     "A timer interrupt returns control to the OS; it does not define deadlock (§1.5.2, p. 24)."
    ],
    [
     "When the CPU is idle because no process is ready",
     "An idle CPU means the ready queue is empty, not that processes are deadlocked (§3.2.1, p. 111)."
    ],
    [
     "When two processes read the same file at the same time",
     "Concurrent readers do not cause deadlock; writers require exclusive access (§5.7.2, p. 220)."
    ]
   ],
   "src": "Book · Ch. 5 §5.6.3, p. 217"
  },
  {
   "q": "What is priority inversion, and what is the usual remedy described in the book?",
   "a": 2,
   "o": [
    [
     "A low-priority process is starved because higher-priority processes keep arriving; the remedy is aging",
     "That describes starvation in priority scheduling, whose remedy is aging (§6.3.3, p. 270)."
    ],
    [
     "The scheduler inverts the priority order of two processes; the remedy is to renumber them",
     "Priority inversion is not a scheduler renumbering; it happens through a shared resource (§5.6.4, p. 217)."
    ],
    [
     "A higher-priority process waits for a resource held by a lower-priority process that has been preempted; the remedy is priority inheritance",
     "Correct — §5.6.4 (p. 217): the higher-priority task is \"waiting for a resource that is being held by a lower-priority task\"; the remedy, used on the Mars Pathfinder, is priority inheritance, where the low-priority process inherits the higher priority until it releases the resource."
    ],
    [
     "Two processes each wait for a semaphore the other holds; the remedy is to use a mutex lock",
     "That is deadlock, not priority inversion (§5.6.3, p. 217)."
    ]
   ],
   "src": "Book · Ch. 5 §5.6.4, p. 217"
  },
  {
   "q": "In the dining-philosophers problem, why must the simple solution in which each philosopher picks up the left chopstick first be rejected?",
   "a": 1,
   "o": [
    [
     "Because two neighbours can eat at the same time",
     "The solution does guarantee that no two neighbours eat simultaneously; the problem is different (§5.7.3, p. 222–223)."
    ],
    [
     "Because it can deadlock: if all five become hungry together and each grabs her left chopstick, every philosopher waits forever for the right one",
     "Correct — §5.7.3 (p. 223): \"if all five philosophers become hungry at the same time and each grabs her left chopstick ... When each philosopher tries to grab her right chopstick, she will be delayed forever\"; remedies include allowing at most four at the table, or an asymmetric solution."
    ],
    [
     "Because a philosopher may starve while others keep eating",
     "Starvation is a possible concern, but the reason the book gives for rejecting this solution is deadlock (§5.7.3, p. 223)."
    ],
    [
     "Because chopsticks cannot be represented by semaphores",
     "The solution represents each chopstick as a semaphore initialised to 1 (§5.7.3, p. 222–223)."
    ]
   ],
   "src": "Book · Ch. 5 §5.7.3, p. 222–223"
  }
 ],
 "9": [
  {
   "q": "The CPU–I/O burst cycle means that process execution consists of:",
   "a": 0,
   "o": [
    [
     "A cycle of CPU execution and I/O wait",
     "Correct — §6.1.1 (p. 262): \"process execution consists of a cycle of CPU execution and I/O wait\", and processes alternate between these two states."
    ],
    [
     "A cycle of page faults and context switches",
     "Page faults belong to memory management (§9.2, p. 401) and are not the burst cycle."
    ],
    [
     "A fixed number of instructions followed by termination",
     "Processes alternate many times; bursts vary greatly from process to process (§6.1.1, p. 262)."
    ],
    [
     "A cycle of blocking and waking on a semaphore",
     "Semaphore waits are one cause of I/O-type waiting, not the definition of the burst cycle (§6.1.1, p. 262)."
    ]
   ],
   "src": "Book · Ch. 6 §6.1.1, p. 262"
  },
  {
   "q": "Under which circumstances does a nonpreemptive scheduling decision occur?",
   "a": 2,
   "o": [
    [
     "Only when a process moves from ready to running",
     "A ready-to-running move is the act of dispatching after a decision, not the decision point (§6.1.4, p. 265)."
    ],
    [
     "When a running process is interrupted and moved to the ready queue",
     "That is a preemptive decision, and the book says Windows and Linux are preemptive (§6.1.3, p. 263–264)."
    ],
    [
     "When a process terminates, and when it switches from running to waiting",
     "Correct — §6.1.3 (p. 263–264): scheduling takes place in four circumstances; under nonpreemptive scheduling, \"when a process switches from the running state to the waiting state\" and \"when a process terminates\"."
    ],
    [
     "When a new process is created by fork()",
     "Creation adds a process to the queues; it is not one of the four decision points (§6.1.3, p. 263)."
    ]
   ],
   "src": "Book · Ch. 6 §6.1.3, p. 263–264"
  },
  {
   "q": "What is the dispatcher, and what is dispatch latency?",
   "a": 1,
   "o": [
    [
     "The module that decides which process runs next; dispatch latency is its scheduling time",
     "Choosing the next process is the short-term scheduler's job; the dispatcher hands the CPU over (§6.1.4, p. 265)."
    ],
    [
     "The module that gives control of the CPU to the process selected by the short-term scheduler; dispatch latency is the time it takes to stop one process and start another",
     "Correct — §6.1.4 (p. 265): \"the dispatcher is the module that gives control of the CPU to the process selected by the short-term scheduler\"; dispatch latency is \"the time it takes for the dispatcher to stop one process and start another running\"."
    ],
    [
     "The part of the kernel that handles page faults",
     "Page-fault handling belongs to virtual memory (§9.2.1, p. 402)."
    ],
    [
     "The hardware timer that interrupts a running process",
     "The timer triggers scheduling decisions but is not the dispatcher (§1.5.2, p. 24; §6.1.4, p. 265)."
    ]
   ],
   "src": "Book · Ch. 6 §6.1.4, p. 265"
  },
  {
   "q": "What is the convoy effect in FCFS scheduling?",
   "a": 0,
   "o": [
    [
     "Short processes wait behind one long CPU-bound process, so average waiting time becomes large",
     "Correct — §6.3.1 (p. 266–267): FCFS is nonpreemptive, so \"the average waiting time under the FCFS policy is often quite long\"; the effect of one long process causing many short ones to wait is the convoy effect."
    ],
    [
     "All processes arrive at the same time and are served in random order",
     "FCFS serves in arrival order; random order is not part of FCFS (§6.3.1, p. 266)."
    ],
    [
     "A process is repeatedly preempted by higher-priority processes",
     "Preemption does not happen in FCFS, which is nonpreemptive (§6.3.1, p. 266)."
    ],
    [
     "The time quantum expires before any process finishes",
     "Time quanta belong to round-robin scheduling (§6.3.4, p. 271)."
    ]
   ],
   "src": "Book · Ch. 6 §6.3.1, p. 266–267"
  },
  {
   "q": "Why is SJF said to be optimal, and what is its practical difficulty?",
   "a": 2,
   "o": [
    [
     "It minimises CPU utilisation overhead, but it needs a time quantum",
     "SJF does not use a time quantum; round-robin does (§6.3.4, p. 271)."
    ],
    [
     "It minimises response time, but it causes starvation of short jobs",
     "Priority scheduling is the one the book ties to starvation, whose remedy is aging (§6.3.3, p. 270)."
    ],
    [
     "It gives the minimum average waiting time for a given set of processes, but it is difficult to know the length of the next CPU burst",
     "Correct — §6.3.2 (p. 267–268): SJF is optimal because it gives the minimum average waiting time, but \"the difficulty is in knowing the length of the next CPU burst\", so it is approximated by exponential averaging."
    ],
    [
     "It minimises context switches, but it requires a real-time kernel",
     "SJF is not about context-switch counts, and it is not a real-time algorithm (§6.3.2, p. 267)."
    ]
   ],
   "src": "Book · Ch. 6 §6.3.2, p. 267–268"
  }
 ],
 "10": [
  {
   "q": "In round-robin scheduling with a small time quantum, what is the main cost?",
   "a": 1,
   "o": [
    [
     "Starvation of long processes",
     "RR is designed to be fair; long processes are served repeatedly, not starved (§6.3.4, p. 271–272)."
    ],
    [
     "Many context switches, because the quantum expires very often",
     "Correct — §6.3.4 (p. 271–272): if the time quantum is too small, \"the overhead of context switching will dominate\"; if it is too large, RR degenerates into FCFS."
    ],
    [
     "The inability to use a ready queue",
     "RR uses the ready queue as a circular queue (§6.3.4, p. 271)."
    ],
    [
     "The need to know each process's next CPU burst",
     "Knowing the next burst is SJF's problem (§6.3.2, p. 267)."
    ]
   ],
   "src": "Book · Ch. 6 §6.3.4, p. 271–272"
  },
  {
   "q": "In a multilevel queue (not feedback) scheduler, how is a process handled?",
   "a": 0,
   "o": [
    [
     "It is permanently assigned to one queue, and queues have fixed priorities",
     "Correct — §6.3.5 (p. 273): in the multilevel queue algorithm, each queue has its own scheduling algorithm and a process is permanently assigned to one queue, so there is \"no movement of processes between queues\"."
    ],
    [
     "It moves between queues as its behaviour changes",
     "That is the multilevel feedback queue (§6.3.6, p. 275)."
    ],
    [
     "It is always placed in the highest-priority queue",
     "Foreground and background processes belong to different queues with different response requirements (§6.3.5, p. 273)."
    ],
    [
     "It shares one queue with all other processes, using round-robin",
     "One shared queue is single-level round-robin, not a multilevel queue (§6.3.4, p. 271)."
    ]
   ],
   "src": "Book · Ch. 6 §6.3.5, p. 273"
  },
  {
   "q": "What defines a multilevel feedback queue scheduler?",
   "a": 2,
   "o": [
    [
     "Only the number of queues it uses",
     "The number of queues is one of several parameters; the book lists the algorithm for each queue, the upgrade/demote method and the entry decision (§6.3.6, p. 275)."
    ],
    [
     "A single ready queue whose order changes with priority",
     "A single queue is not multilevel; feedback requires several queues and movement between them (§6.3.6, p. 275)."
    ],
    [
     "It allows a process to move between queues, and is defined by the number of queues, the scheduling algorithm for each queue, the method used to determine when to upgrade or demote a process, and the method used to determine which queue a process enters",
     "Correct — §6.3.6 (p. 275): the multilevel feedback queue \"allows a process to move between queues\", and it is defined by exactly those parameters."
    ],
    [
     "It only works on multiprocessors",
     "MLFQ is a uniprocessor scheduling algorithm; multiprocessor issues are covered separately in §6.5 (§6.5, p. 278)."
    ]
   ],
   "src": "Book · Ch. 6 §6.3.6, p. 275"
  },
  {
   "q": "What is processor affinity?",
   "a": 1,
   "o": [
    [
     "The tendency of a process to need more memory over time",
     "That relates to memory behaviour and thrashing, not to where a process runs (§9.6, p. 425)."
    ],
    [
     "Keeping a process on the same processor because of the cost of invalidating and repopulating caches when migrating",
     "Correct — §6.5.2 (p. 280): soft affinity tries to keep a process on the same processor, and hard affinity allows a process to be restricted to a set of processors, because migrating invalidates cache contents."
    ],
    [
     "Allowing two processors to share one process's address space",
     "That is about threads sharing memory, not affinity (§4.1, p. 157)."
    ],
    [
     "Binding a process to a specific page frame",
     "Frames are memory allocation, not processor affinity (§9.5, p. 421)."
    ]
   ],
   "src": "Book · Ch. 6 §6.5.2, p. 280"
  },
  {
   "q": "In queueing models for scheduling evaluation, what does Little's formula say?",
   "a": 0,
   "o": [
    [
     "n = λ × W, where n is the average queue length, λ the average arrival rate and W the average waiting time",
     "Correct — §6.8.2 (p. 302): with n the average queue length, W the average waiting time and λ the average arrival rate, \"n = λ × W\"; the book calls this Little's formula and notes it is valid for any scheduling algorithm and arrival distribution."
    ],
    [
     "n = W / λ, where W is the average wait and λ the arrival rate",
     "The book gives n = λ × W, not W / λ (p. 302)."
    ],
    [
     "n = λ + W, where n is CPU utilisation",
     "The formula is a product, and it relates queue length to arrival rate and waiting time (p. 302)."
    ],
    [
     "W = n × λ², where W is throughput",
     "Neither the form nor the meaning matches the book's statement (p. 302)."
    ]
   ],
   "src": "Book · Ch. 6 §6.8.2, p. 301–302"
  }
 ],
 "11": [
  {
   "q": "What do the base and limit registers hold, according to §8.1.1?",
   "a": 1,
   "o": [
    [
     "The base register holds the size of the process; the limit register holds its address",
     "It is the other way round: base holds the smallest legal physical address and limit holds the size of the range (§8.1.1, p. 352)."
    ],
    [
     "The base register holds the smallest legal physical memory address; the limit register specifies the size of the range",
     "Correct — §8.1.1 (p. 352): the base register \"holds the smallest legal physical memory address\" and \"the limit register specifies the size of the range\"."
    ],
    [
     "Both registers hold page numbers used by the MMU",
     "Page numbers are used by paging, not by the base/limit pair, which bounds a contiguous range (§8.1.1, p. 352; §8.5, p. 366)."
    ],
    [
     "The base register points to the page table and the limit register to the TLB",
     "That is not what §8.1.1 describes; a page-table base register belongs to the paging hardware (§8.5.2, p. 372)."
    ]
   ],
   "src": "Book · Ch. 8 §8.1.1, p. 352"
  },
  {
   "q": "Which statement about paging is correct?",
   "a": 0,
   "o": [
    [
     "Paging avoids external fragmentation and the need for compaction, but a partly used frame is wasted as internal fragmentation",
     "Correct — §8.5 (p. 366–367): \"paging avoids external fragmentation and the need for compaction, whereas segmentation does not\"; because frames are fixed size, the last frame may be partly unused, which the book describes as the internal fragmentation of paging (§8.5.3, p. 376)."
    ],
    [
     "Paging removes external fragmentation and also eliminates internal fragmentation",
     "Internal fragmentation remains: the frame allocated may be larger than the space required, and §8.5.3 (p. 376) explicitly calls this the internal fragmentation of paging."
    ],
    [
     "Paging requires all pages of a process to be contiguous in memory",
     "The point of paging is that a process's pages need not be contiguous; any free frame can be used (§8.5, p. 366–367)."
    ],
    [
     "Paging requires the programmer to see the frame numbers",
     "Paging is transparent to the programmer; the MMU translates addresses using the page table (§8.5.1, p. 367–368)."
    ]
   ],
   "src": "Book · Ch. 8 §8.5, p. 366–367"
  },
  {
   "q": "What is the difference between a logical address and a physical address?",
   "a": 0,
   "o": [
    [
     "A logical address is generated by the CPU; a physical address is the one seen by the memory unit",
     "Correct — §8.1.3 (p. 355): the addresses generated by the CPU are logical (virtual) addresses, while the address seen by the memory unit is the physical address; the MMU maps one to the other."
    ],
    [
     "They are always identical in every system",
     "They are identical only when binding is done at compile or load time; with execution-time binding they differ (§8.1.3, p. 355)."
    ],
    [
     "A logical address is on disk; a physical address is in a register",
     "Both are memory addresses; the difference is who generates/sees them (§8.1.3, p. 355)."
    ],
    [
     "A physical address is the process's virtual address space",
     "The physical address space is the set of physical addresses, not a process's virtual space (§8.1.3, p. 355)."
    ]
   ],
   "src": "Book · Ch. 8 §8.1.3, p. 355"
  },
  {
   "q": "Why do mobile operating systems generally not support swapping?",
   "a": 1,
   "o": [
    [
     "Because mobile devices have no main memory",
     "They do have main memory, but no disk-based backing store suited to swapping (§8.2.2, p. 360)."
    ],
    [
     "Because flash memory used as secondary storage has limited space and limited write endurance",
     "Correct — §8.2.2 (p. 360): mobile systems typically do not support swapping, because flash memory has limited space and wear from many writes; instead they may terminate processes to free memory."
    ],
    [
     "Because mobile processes never exceed the available memory",
     "Mobile processes can demand more memory than is available; the OS frees memory by other means (§8.2.2, p. 360)."
    ],
    [
     "Because swapping requires a page table",
     "Paging needs a page table, and mobile systems do use paging (§8.5, p. 366); the obstacle to swapping is the storage medium."
    ]
   ],
   "src": "Book · Ch. 8 §8.2.2, p. 360"
  },
  {
   "q": "What is external fragmentation?",
   "a": 2,
   "o": [
    [
     "Wasted space inside the last page of an allocated region",
     "That is internal fragmentation, which happens when memory is allocated in fixed-size units larger than requested (§8.3.3, p. 364)."
    ],
    [
     "A page table with unused entries",
     "Unused page-table entries waste memory, but the book calls the phenomenon external fragmentation only for variable-size allocations (§8.3.3, p. 364)."
    ],
    [
     "Free memory that is split into many small non-contiguous holes, so a request cannot be satisfied although the total free space is large enough",
     "Correct — §8.3.3 (p. 364): external fragmentation exists when there is enough total memory space to satisfy a request but the available space is not contiguous; compaction or non-contiguous allocation (paging/segmentation) is the solution."
    ],
    [
     "A hole that is bigger than the request and is split in two",
     "Splitting a hole is normal allocation behaviour, not fragmentation (§8.3.2, p. 363)."
    ]
   ],
   "src": "Book · Ch. 8 §8.3.3, p. 364"
  }
 ],
 "12": [
  {
   "q": "In segmentation, what does a logical address consist of?",
   "a": 1,
   "o": [
    [
     "A page number and a displacement",
     "A page number plus an offset is a paging address (§8.5.1, p. 367)."
    ],
    [
     "A segment number and an offset within that segment",
     "Correct — §8.4.1 (p. 364–365): \"a logical address space is a collection of segments\", and a logical address consists of a two-part tuple: <segment-number, offset>."
    ],
    [
     "A frame number and a valid bit",
     "Frame numbers belong to paging, and the valid bit is a page-table protection bit (§8.5.3, p. 375–376)."
    ],
    [
     "A base register value and a limit register value",
     "Those registers describe one contiguous allocation, not a segmentation address (§8.1.1, p. 352)."
    ]
   ],
   "src": "Book · Ch. 8 §8.4.1, p. 364–365"
  },
  {
   "q": "Which statement about paging is correct?",
   "a": 0,
   "o": [
    [
     "Paging avoids external fragmentation and the need for compaction, but it can cause internal fragmentation",
     "Correct — §8.5.1 (p. 367–368): paging \"avoids external fragmentation\" and the need for compaction, since any free frame can be allocated; however, because frames are fixed size, the last frame may be partly unused, which is internal fragmentation."
    ],
    [
     "Paging removes external fragmentation and also eliminates internal fragmentation",
     "Internal fragmentation remains: the frames allocated may be larger than the space required, so the last frame can be partially unused (§8.5.1, p. 367)."
    ],
    [
     "Paging requires all pages of a process to be contiguous in memory",
     "The point of paging is that a process's pages need not be contiguous; frames are scattered in physical memory (§8.5.1, p. 367)."
    ],
    [
     "Paging requires the programmer to see the frame numbers",
     "Paging is transparent to the programmer; the MMU translates addresses (§8.5.1, p. 367; §8.5.2, p. 372)."
    ]
   ],
   "src": "Book · Ch. 8 §8.5.1, p. 367–368"
  },
  {
   "q": "In the effective-access-time formula with a TLB, which quantity does α represent?",
   "a": 2,
   "o": [
    [
     "The memory access time",
     "Memory access time is denoted t in the same formula (§8.5.2, p. 374–375)."
    ],
    [
     "The number of TLB entries",
     "TLB size is a hardware parameter, not a term in the EAT formula (§8.5.2, p. 373)."
    ],
    [
     "The hit ratio — the fraction of accesses whose page number is found in the TLB",
     "Correct — §8.5.2 (p. 374–375): EAT = (t + ε)α + (2t + ε)(1 − α), where α is the hit ratio: the fraction of times the page number is found in the TLB."
    ],
    [
     "The page-fault rate",
     "Page-fault rate belongs to demand paging's EAT formula (§9.2.2, p. 405–406), not to the TLB formula."
    ]
   ],
   "src": "Book · Ch. 8 §8.5.2, p. 374–375"
  },
  {
   "q": "What is the valid–invalid bit in a page-table entry used for?",
   "a": 1,
   "o": [
    [
     "To mark a page as read-only",
     "Read-only protection is a separate protection bit; the valid–invalid bit indicates whether the page is in the process's logical address range (§8.5.3, p. 375–376)."
    ],
    [
     "To mark whether the page is in the process's logical address space and therefore legal to access",
     "Correct — §8.5.3 (p. 375–376): each entry has a valid–invalid bit; valid means the page is legal and in the process's logical address space, invalid means it is not (a trap results if it is referenced)."
    ],
    [
     "To record whether the page has been modified",
     "The modified (dirty) bit is used for page replacement (§9.4.1, p. 411)."
    ],
    [
     "To store the page's physical frame number",
     "The frame number is the main content of the entry; the valid–invalid bit is an additional bit (§8.5.3, p. 376)."
    ]
   ],
   "src": "Book · Ch. 8 §8.5.3, p. 375–376"
  },
  {
   "q": "Compared with a standard hierarchical page table, what does an inverted page table do?",
   "a": 0,
   "o": [
    [
     "It has one entry per physical frame, which decreases the memory needed to store page tables but increases the time to search them",
     "Correct — §8.6.3 (p. 381): an inverted page table has one entry for each real page (frame) of memory, so it \"decreases the amount of memory needed\" for page tables but \"increases the amount of time needed to search\" — hence a hash table is often used."
    ],
    [
     "It removes the need for a TLB",
     "A TLB is still used for the same reason: to avoid extra memory accesses (§8.5.2, p. 372–373)."
    ],
    [
     "It supports sharing pages more easily than the standard table",
     "The book notes the opposite: an inverted table makes it harder to implement shared memory, since sharing must be mapped through the virtual address of each process (§8.6.3, p. 382)."
    ],
    [
     "It removes internal fragmentation of the page table itself",
     "Internal fragmentation of page tables is not the issue; the inverted table reduces the number of entries that must be stored (§8.6.3, p. 381)."
    ]
   ],
   "src": "Book · Ch. 8 §8.6.3, p. 381"
  }
 ],
 "13": [
  {
   "q": "What is the central benefit of virtual memory?",
   "a": 1,
   "o": [
    [
     "It makes main memory faster than cache",
     "Virtual memory does not change the speed of memory; it changes which parts of a process need to be in memory (§9.1, p. 398)."
    ],
    [
     "It allows the execution of processes that are not completely in memory, separating logical memory from physical memory",
     "Correct — §9.1 (p. 398): \"virtual memory ... allows the execution of processes that are not completely in memory\"; it \"separates logical memory as viewed by the user from physical memory\"."
    ],
    [
     "It removes the need for a page table",
     "Demand paging relies on the page table and the valid–invalid bit (§9.2.1, p. 402–403)."
    ],
    [
     "It makes the CPU run faster by increasing the clock rate",
     "Virtual memory is an OS technique; it has nothing to do with clock rate (§9.1, p. 398)."
    ]
   ],
   "src": "Book · Ch. 9 §9.1, p. 397–398"
  },
  {
   "q": "What is pure demand paging?",
   "a": 2,
   "o": [
    [
     "Bringing the whole process into memory before it starts",
     "That is the opposite of demand paging; the book calls bringing pages in only when needed lazy loading (§9.2.1, p. 402)."
    ],
    [
     "Bringing in pages two at a time to reduce faults",
     "Paging in more than one page is prepaging, discussed in §9.9.1 (§9.9.1, p. 439)."
    ],
    [
     "Starting a process with no pages in memory and bringing each page in only when it is needed",
     "Correct — §9.2.1 (p. 402): with pure demand paging, execution starts with no pages in memory, and each page is brought in when it is first referenced."
    ],
    [
     "Keeping every page of every process in memory permanently",
     "That would defeat the purpose of demand paging (§9.2.1, p. 402)."
    ]
   ],
   "src": "Book · Ch. 9 §9.2.1, p. 402–404"
  },
  {
   "q": "In the effective access time of demand paging, what does the formula EAT = (1 − p) × ma + p × page-fault time mean?",
   "a": 0,
   "o": [
    [
     "The effective access time is directly proportional to the page-fault rate p, so even a small fault rate raises it sharply",
     "Correct — §9.2.2 (p. 405–406): \"the effective access time is directly proportional to the page-fault rate\"; with a memory access of 200ns and a 8ms fault service time, a rate of 1 fault in 1,000 gives 8.2 microseconds."
    ],
    [
     "The effective access time depends only on the memory access time ma",
     "The formula's second term p × page-fault time dominates as p grows, so EAT does depend on the fault rate (§9.2.2, p. 405)."
    ],
    [
     "The page-fault rate is the fraction of pages found in the TLB",
     "The TLB hit ratio is a different quantity (α) used for paging's EAT in §8.5.2 (§8.5.2, p. 374–375)."
    ],
    [
     "EAT measures the time to service one page fault only",
     "It combines the no-fault case weighted by (1 − p) with the fault case weighted by p (§9.2.2, p. 405)."
    ]
   ],
   "src": "Book · Ch. 9 §9.2.2, p. 405–406"
  },
  {
   "q": "What does copy-on-write do when a child process is created?",
   "a": 1,
   "o": [
    [
     "Copies every page of the parent immediately",
     "The whole point of COW is to avoid copying everything up front (§9.3, p. 408)."
    ],
    [
     "Lets parent and child share the same pages, and copies a page only when either process tries to write to it",
     "Correct — §9.3 (p. 408): \"copy-on-write ... allows both parent and child processes to initially share the same pages in memory\"; a copy is made only when a process modifies a shared page."
    ],
    [
     "Marks all shared pages read-only forever",
     "Pages are temporarily read-only, but the first write triggers a private copy, after which it is writable (§9.3, p. 408)."
    ],
    [
     "Swaps the shared pages to disk",
     "COW is about sharing pages in memory, not about swapping (§9.3, p. 408)."
    ]
   ],
   "src": "Book · Ch. 9 §9.3, p. 408"
  },
  {
   "q": "Which statement about the FIFO page-replacement algorithm is correct?",
   "a": 2,
   "o": [
    [
     "It is the algorithm with the lowest possible page-fault rate",
     "That distinction belongs to the optimal algorithm (§9.4.3, p. 414)."
    ],
    [
     "It never suffers from Belady's anomaly",
     "Belady's anomaly is demonstrated precisely with FIFO: more frames can cause more page faults (§9.4.2, p. 413–414)."
    ],
    [
     "It replaces the oldest page, and it can suffer Belady's anomaly — more frames can mean more page faults",
     "Correct — §9.4.2 (p. 413–414): FIFO associates each page with the time it was brought in and replaces the oldest; the reference string 1,2,3,4,1,2,5,1,2,3,4,5 shows the page-fault rate increasing from 9 to 10 when going from 3 frames to 4 (Belady's anomaly)."
    ],
    [
     "It requires a reference bit for every page",
     "The reference bit is used by LRU approximations such as second-chance (§9.4.5, p. 418)."
    ]
   ],
   "src": "Book · Ch. 9 §9.4.2, p. 413–414"
  }
 ],
 "14": [
  {
   "q": "In the second-chance (clock) algorithm, how is the victim page chosen?",
   "a": 1,
   "o": [
    [
     "The page with the lowest reference bit value is always replaced, whatever the time of arrival",
     "Selection follows a clock hand that advances around the circular queue, clearing reference bits, rather than scanning for a minimum (§9.4.5, p. 419)."
    ],
    [
     "The clock hand advances until it finds a page whose reference bit is 0, clearing the reference bits of pages it passes, and replaces that page",
     "Correct — §9.4.5 (p. 419): \"the pointer advances until it finds a page with a 0 reference bit. As it advances, it clears the reference bits ... the page is replaced\"; if all bits are set, the algorithm degenerates to FIFO."
    ],
    [
     "The page that was brought in most recently is replaced",
     "Replacing the newest page is the opposite of FIFO and of second chance (§9.4.2, p. 413)."
    ],
    [
     "The page whose modify bit is 1 is always replaced first",
     "The modify bit is used by the enhanced second-chance algorithm, where (0,0) is the best page to replace, not by the basic clock (§9.4.5, p. 419–420)."
    ]
   ],
   "src": "Book · Ch. 9 §9.4.5, p. 418–419"
  },
  {
   "q": "What is the minimum number of frames a process needs, per §9.5.1?",
   "a": 0,
   "o": [
    [
     "Enough frames to hold all the different pages that any single instruction can reference",
     "Correct — §9.5.1 (p. 422): \"we must have enough frames to hold all the different pages that any single instruction can reference\"; fewer frames mean the instruction would fault repeatedly."
    ],
    [
     "One frame, because each instruction touches one page",
     "Instructions can span (and reference) more than one page, so one frame is not enough (§9.5.1, p. 422)."
    ],
    [
     "Ten percent of the process's pages",
     "Percentage-based schemes are not the minimum; proportional allocation is a distribution policy (§9.5.2, p. 423)."
    ],
    [
     "All frames on the system",
     "That would allow only one process at a time and defeats multiprogramming (§9.5.1, p. 422)."
    ]
   ],
   "src": "Book · Ch. 9 §9.5.1, p. 422"
  },
  {
   "q": "What is the difference between global and local page replacement?",
   "a": 2,
   "o": [
    [
     "Global replacement only swaps pages of idle processes",
     "The distinction is about which frames a process may take, not about idle processes (§9.5.3, p. 424)."
    ],
    [
     "Local replacement allows a process to steal any free frame in the system",
     "Local replacement restricts a process to its own set of frames; stealing other processes' frames is global replacement (§9.5.3, p. 424)."
    ],
    [
     "Global replacement allows a process to select a replacement frame from all frames, even those belonging to another process; local replacement selects only from its own set",
     "Correct — §9.5.3 (p. 424): with global replacement a process \"can select a replacement frame from the set of all frames, even if that frame is currently allocated to some other process\"; with local replacement it selects only from its own set."
    ],
    [
     "Global replacement avoids thrashing, while local replacement causes it",
     "The book notes that global replacement can affect other processes, and says local replacement makes a process's performance depend on its own frame count, but it does not call one thrash-free (§9.5.3, p. 424)."
    ]
   ],
   "src": "Book · Ch. 9 §9.5.3, p. 424"
  },
  {
   "q": "What is thrashing?",
   "a": 1,
   "o": [
    [
     "A process that is blocked on a semaphore for a long time",
     "Blocking on a semaphore is a synchronisation problem (§5.6.3, p. 217), unrelated to paging behaviour."
    ],
    [
     "A process that spends more time paging than executing",
     "Correct — §9.6 (p. 425–426): \"a process is thrashing if it is spending more time paging than executing\", which happens when it does not have enough frames for its current locality."
    ],
    [
     "The CPU idling because the ready queue is empty",
     "An empty ready queue is simply an idle system, not thrashing (§6.2, p. 265)."
    ],
    [
     "A page table that is larger than main memory",
     "The page table is itself in memory; thrashing is about the pattern of page faults (§9.6.1, p. 426)."
    ]
   ],
   "src": "Book · Ch. 9 §9.6, p. 425–426"
  },
  {
   "q": "How does the working-set model use the parameter Δ?",
   "a": 0,
   "o": [
    [
     "Δ is the working-set window — the number of most recent references considered; the pages in that window are the working set",
     "Correct — §9.6.2 (p. 427–428): the working-set model uses a parameter Δ, the working-set window, and the working set is the set of pages in the most recent Δ page references."
    ],
    [
     "Δ is the total number of frames in the system",
     "The number of frames is a separate quantity; Δ is a window of references (§9.6.2, p. 427)."
    ],
    [
     "Δ is the page-fault rate threshold",
     "A fault-rate threshold belongs to the page-fault-frequency strategy (§9.6.3, p. 429)."
    ],
    [
     "Δ is the page size in bytes",
     "Page size is a hardware parameter discussed in §9.9.2 (§9.9.2, p. 440)."
    ]
   ],
   "src": "Book · Ch. 9 §9.6.2, p. 427–428"
  }
 ]
};
