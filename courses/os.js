// Operating Systems (CS332) — Static Data Layer
// Schema Hierarchy: Course (Operating Systems) -> Track (lectures / labs) -> Session (Lec 1..4, Lab 1..4) -> Content (notes, cards, qa, quiz)
window.COURSES = window.COURSES || {};
window.COURSES.os = {
  "id": "os",
  "name": "Operating Systems",
  "short": "OS",
  "code": "CS332",
  "by": "Dr. Khaled Wassif (Silberschatz, Galvin & Gagne 9th Ed.)",
  "tracks": {
    "lectures": {
      "id": "lectures",
      "name": "Lectures",
      "unit": "Lecture",
      "units": "lectures",
      "prefix": "L",
      "sessions": [
        {
          "n": 1,
          "code": "Lec 1",
          "title": "Chapter 1 (Part 1): Introduction, System Organization, Interrupts, Storage & I/O",
          "notes": [
            {
              "h": "What is an Operating System? Goals & Four Components",
              "pts": [
                "<b>Operating System (OS)</b>: a program that acts as an <b>intermediary</b> between a user of a computer and the computer hardware.",
                "<b>Three primary OS goals</b>: (1) <b>Execute user programs</b> and make solving user problems easier; (2) Make the computer system <b>convenient</b> to use; (3) Use the computer hardware in an <b>efficient</b> manner.",
                "<b>Four components of a computer system</b>: Hardware, Operating System, Application Programs, and Users."
              ],
              "table": [
                [
                  "Component",
                  "Role in the System",
                  "Examples"
                ],
                [
                  "Hardware",
                  "Provides basic computing resources",
                  "CPU, memory, I/O devices"
                ],
                [
                  "Operating System",
                  "Controls and coordinates use of hardware among various applications and users",
                  "Linux, Windows, Mac OS X, Solaris"
                ],
                [
                  "Application Programs",
                  "Define the ways in which system resources are used to solve users' computing problems",
                  "Word processors, compilers, web browsers, database systems, video games"
                ],
                [
                  "Users",
                  "Entities interacting with the system",
                  "People, machines, other computers"
                ]
              ]
            },
            {
              "h": "What Operating Systems Do: User View, System View & OS Definition",
              "pts": [
                "<b>User View</b> depends on the interface being used: <b>PC users</b> want convenience, ease of use, and performance without caring about resource utilization; <b>mainframe or minicomputer</b> shared systems must keep all users happy; <b>workstation users</b> have dedicated resources but frequently share server resources; <b>handheld computers</b> are resource-poor and optimized for usability and battery life; <b>embedded computers</b> in devices and automobiles have little or no user interface.",
                "<b>System View — OS as a Resource Allocator</b>: manages all resources (CPU time, memory space, file-storage space, I/O devices) and decides between conflicting requests for efficient and fair resource use.",
                "<b>System View — OS as a Control Program</b>: controls the execution of programs to prevent errors and improper use of the computer.",
                "<b>Operating System Definition</b>: there is no universally accepted definition. \"Everything a vendor ships when you order an OS\" is a good approximation, though it varies wildly.",
                "<b>The Kernel</b>: \"the one program running at all times on the computer.\" Everything else is either a <b>system program</b> (ships with the OS) or an <b>application program</b>."
              ]
            },
            {
              "h": "Computer Startup & Computer-System Organization",
              "pts": [
                "<b>Bootstrap program</b>: loaded when a computer is powered up or rebooted. Typically stored in <b>ROM or EPROM</b>, generally known as <b>firmware</b>.",
                "The bootstrap program initializes all aspects of the system (<b>CPU registers, device controllers, and memory contents</b>), locates and loads the <b>operating system kernel</b> into memory, and starts its execution.",
                "<b>Bus organization</b>: one or more CPUs and device controllers connect through a <b>common bus</b> providing access to <b>shared memory</b>. CPUs and device controllers execute in parallel, competing for memory cycles.",
                "<b>Concurrent I/O operation</b>: I/O devices and the CPU execute concurrently. Each <b>device controller</b> is in charge of a particular device type and has a <b>local buffer</b>.",
                "The CPU moves data from/to main memory to/from local buffers, while I/O transfers data between the device and the controller's local buffer. The device controller informs the CPU that its operation has finished by causing an <b>interrupt</b>."
              ]
            },
            {
              "h": "Common Functions of Interrupts & Interrupt Handling",
              "pts": [
                "An <b>interrupt</b> transfers control to the appropriate <b>interrupt service routine (ISR)</b> through the <b>interrupt vector</b>, which contains the memory addresses of all service routines.",
                "The interrupt architecture must <b>save the address of the interrupted instruction</b> so execution can resume later.",
                "A <b>trap</b> (or <b>exception</b>) is a <b>software-generated interrupt</b> caused either by an <b>error</b> (such as division by zero or invalid memory access) or a <b>user request</b> for an OS service (system call). Modern operating systems are <b>interrupt driven</b>.",
                "<b>Interrupt handling steps</b>: the OS preserves the state of the CPU by storing <b>registers and the program counter (PC)</b>, determines which type of interrupt occurred via <b>polling</b> or a <b>vectored interrupt system</b>, and executes separate code segments for each interrupt type."
              ],
              "table": [
                [
                  "Feature",
                  "Hardware Interrupt",
                  "Trap (Exception)"
                ],
                [
                  "Origin",
                  "Generated by hardware (e.g., device controller signaling I/O completion)",
                  "Software-generated interrupt"
                ],
                [
                  "Trigger",
                  "External asynchronous device event",
                  "Error (e.g., divide by zero) or user request (system call)"
                ],
                [
                  "Dispatch",
                  "Transfers control to ISR via interrupt vector; saves interrupted PC",
                  "Synchronous transfer to kernel handler"
                ]
              ]
            },
            {
              "h": "Storage Structure, Storage Hierarchy & Caching",
              "pts": [
                "<b>Main memory (RAM)</b>: the only large storage media that the CPU can access directly. It provides random access and is typically <b>volatile</b> (loses contents when power is removed).",
                "<b>Secondary storage</b>: extension of main memory that provides large <b>nonvolatile</b> storage capacity.",
                "<b>Magnetic disks</b>: rigid metal or glass platters covered with magnetic recording material. The disk surface is logically divided into <b>tracks</b>, which are subdivided into <b>sectors</b>. The <b>disk controller</b> determines the logical interaction between the device and the computer.",
                "<b>Solid-state disks (SSDs)</b>: nonvolatile flash storage that is faster than magnetic disks and increasingly widespread.",
                "<b>Storage-Device Hierarchy</b> (organized by <b>speed, cost, and volatility</b>, from fastest/smallest/most expensive to slowest/largest/least expensive): <b>Registers → Cache → Main Memory → Solid-State Disk → Magnetic Disk → Optical Disk → Magnetic Tapes</b>.",
                "<b>Caching</b>: copying information into a faster storage system temporarily. The faster storage (cache) is checked first: on a <b>hit</b>, information is used directly from cache; on a <b>miss</b>, data is copied into cache and used there. Because cache is smaller than the storage being cached, <b>cache size and replacement policy</b> are critical design problems. Main memory can be viewed as a cache for secondary storage.",
                "<b>Device driver</b>: software module for each device controller that manages I/O and provides a uniform interface between the controller and the kernel."
              ]
            },
            {
              "h": "I/O Structure & Direct Memory Access (DMA)",
              "pts": [
                "<b>Synchronous I/O</b>: after I/O starts, control returns to the user program <b>only upon I/O completion</b>. A wait instruction idles the CPU until the next interrupt (or a wait loop contends for memory). At most one I/O request is outstanding at a time, with no simultaneous I/O processing.",
                "<b>Asynchronous I/O</b>: after I/O starts, control returns to the user program <b>without waiting</b> for I/O completion. A system call lets the user wait for I/O completion when needed. The OS maintains a <b>Device-Status Table</b> with an entry for each I/O device indicating its <b>type, address, and state</b>.",
                "<b>Direct Memory Access (DMA)</b>: used for high-speed I/O devices able to transmit information at close to memory speeds. The device controller transfers an entire <b>block of data</b> directly between its buffer storage and main memory <b>without CPU intervention</b>.",
                "With DMA, <b>only one interrupt is generated per block</b> rather than one interrupt per byte, freeing the CPU to execute other work during the transfer."
              ]
            },
            {
              "h": "Computer-System Architecture: Multiprocessor & Clustered Systems",
              "pts": [
                "<b>Single-processor systems</b> use one general-purpose processor (almost all also include special-purpose device processors).",
                "<b>Multiprocessor (parallel / multicore) systems</b> have three major advantages: (1) <b>Increased throughput</b> (more work done in less time, though N processors speedup is less than N due to overhead and shared resource contention); (2) <b>Economy of scale</b> (sharing peripherals, mass storage, and power supplies costs less than separate PCs); (3) <b>Increased reliability</b> via <b>graceful degradation</b> (continuing service proportional to surviving hardware) or <b>fault tolerance</b>.",
                "<b>Asymmetric Multiprocessing</b>: each processor is assigned a specific task under a master-slave relationship. <b>Symmetric Multiprocessing (SMP)</b>: all processors are peers and perform all OS tasks; each processor has its own registers and local cache while sharing physical memory over the system bus.",
                "<b>UMA vs. NUMA</b>: Uniform Memory Access (access time to any RAM location is equal from any CPU) vs. Non-Uniform Memory Access. <b>Multicore</b> places multiple computing cores on a single chip (faster on-chip communication and lower power than multiple single-core chips). <b>Blade servers</b> place multiple independent multiprocessor boards in a single chassis.",
                "<b>Clustered systems</b>: multiple independent systems working together, usually sharing storage via a <b>Storage-Area Network (SAN)</b> to provide <b>high-availability</b> service. In <b>asymmetric clustering</b>, one machine is in hot-standby mode monitoring the active server; in <b>symmetric clustering</b>, two or more hosts run applications and monitor each other. Clusters also support <b>High-Performance Computing (HPC)</b> via parallelization and use a <b>Distributed Lock Manager (DLM)</b> to prevent conflicting disk operations."
              ]
            }
          ],
          "cards": [
            [
              "Operating System (OS)",
              "A program that acts as an intermediary between a user of a computer and the computer hardware."
            ],
            [
              "Three main goals of an OS",
              "(1) Execute user programs and make solving user problems easier; (2) Make the computer system convenient to use; (3) Use computer hardware in an efficient manner."
            ],
            [
              "Four components of a computer system",
              "Hardware, Operating System, Application Programs, and Users."
            ],
            [
              "OS as a Resource Allocator",
              "Manages all system resources (CPU time, memory space, file storage, I/O devices) and decides between conflicting requests for efficient and fair use."
            ],
            [
              "OS as a Control Program",
              "Controls the execution of programs to prevent errors and improper use of the computer."
            ],
            [
              "Kernel",
              "The one program running at all times on the computer; everything else is either a system program or an application program."
            ],
            [
              "Bootstrap Program",
              "Firmware stored in ROM or EPROM that runs at power-up/reboot, initializes CPU registers, device controllers, and memory, and loads the OS kernel."
            ],
            [
              "Device Controller & Local Buffer",
              "Hardware unit in charge of a specific device type; holds a local buffer and signals the CPU with an interrupt when an I/O operation finishes."
            ],
            [
              "Interrupt Vector",
              "An array of memory addresses pointing to the interrupt service routines (ISRs) for different interrupt requests."
            ],
            [
              "Trap (Exception)",
              "A software-generated interrupt caused either by an error (e.g., division by zero) or by a user request for an OS service (system call)."
            ],
            [
              "Main Memory vs. Secondary Storage",
              "Main memory (RAM) is volatile and directly accessible by the CPU; secondary storage (disks, SSDs) is nonvolatile and holds large data extensions."
            ],
            [
              "Magnetic Disk Structure",
              "Rigid metal or glass platters coated with magnetic material; surface is logically divided into circular tracks, which are subdivided into sectors."
            ],
            [
              "Storage-Device Hierarchy Order",
              "Registers → Cache → Main Memory → Solid-State Disk → Magnetic Disk → Optical Disk → Magnetic Tapes."
            ],
            [
              "Caching",
              "Temporarily copying information in use from slower storage to faster storage; checked first before accessing the slower backing store."
            ],
            [
              "Device Driver",
              "OS software module for a specific device controller that provides a consistent interface between the controller and the kernel."
            ],
            [
              "Synchronous vs. Asynchronous I/O",
              "Synchronous I/O waits until I/O finishes before returning control to the user program; Asynchronous I/O returns control immediately without waiting."
            ],
            [
              "Device-Status Table",
              "Kernel table containing an entry for each I/O device indicating its type, address, and current state (idle or busy with request queue)."
            ],
            [
              "Direct Memory Access (DMA)",
              "High-speed I/O structure where the device controller transfers entire blocks directly to/from main memory without CPU intervention, generating only one interrupt per block."
            ],
            [
              "Three Advantages of Multiprocessor Systems",
              "(1) Increased throughput, (2) Economy of scale, and (3) Increased reliability (graceful degradation / fault tolerance)."
            ],
            [
              "Asymmetric vs. Symmetric Multiprocessing (SMP)",
              "Asymmetric assigns specific tasks to processors (master-slave); SMP treats all processors as peers that perform all tasks and share memory."
            ],
            [
              "Graceful Degradation vs. Fault Tolerance",
              "Graceful degradation continues providing service proportional to remaining hardware; fault tolerance suffers no loss of service despite a component failure."
            ],
            [
              "Clustered System & DLM",
              "Multiple systems coupled via a LAN and shared Storage-Area Network (SAN) for high availability; uses a Distributed Lock Manager (DLM) to coordinate shared storage access."
            ]
          ],
          "qa": [
            [
              "What are the three main purposes of an operating system?",
              "1. To execute user programs and make solving user problems easier.<br>2. To make the computer system convenient to use.<br>3. To use the computer hardware in an efficient manner.",
              "Chapter 1 · Practice Exercise 1.1"
            ],
            [
              "What are the four components of a computer system, and what role does each play?",
              "<b>Hardware</b> (CPU, memory, I/O devices) provides basic computing resources; the <b>Operating System</b> controls and coordinates hardware use among applications and users; <b>Application Programs</b> (compilers, browsers, databases) define how resources are used to solve user problems; and <b>Users</b> (people, machines, other computers) interact with the system.",
              "Chapter 1 · Slide 1.5"
            ],
            [
              "How does an interrupt differ from a trap, and can traps be generated intentionally by a user program?",
              "An <b>interrupt</b> is a hardware-generated signal (e.g., from a device controller finishing I/O) that asynchronously transfers control to an ISR via the interrupt vector. A <b>trap</b> (or exception) is a software-generated interrupt caused either by a runtime error (like division by zero) or intentionally by a user program invoking a <b>system call</b> to request an operating-system service.",
              "Chapter 1 · Exercise 1.19"
            ],
            [
              "How does Direct Memory Access (DMA) improve system performance for high-speed I/O devices?",
              "Instead of the CPU transferring data byte-by-byte and receiving an interrupt for every byte, the CPU writes command parameters to the DMA controller and continues other work. The DMA controller transfers an entire block of data directly between the device buffer and main memory, interrupting the CPU <b>only once per block</b> upon completion.",
              "Chapter 1 · Exercise 1.20"
            ],
            [
              "Distinguish between Synchronous I/O and Asynchronous I/O.",
              "In <b>Synchronous I/O</b>, control returns to the user process only after the I/O operation completes (the CPU waits or idles, allowing at most one outstanding I/O request). In <b>Asynchronous I/O</b>, control returns to the user process immediately after I/O starts without waiting for completion, and the OS tracks ongoing requests in the <b>Device-Status Table</b>.",
              "Chapter 1 · Slides 1.20–1.22"
            ],
            [
              "What are the differences between Asymmetric Multiprocessing and Symmetric Multiprocessing (SMP)?",
              "In <b>Asymmetric Multiprocessing</b>, a boss/master processor controls the system and assigns specific predefined tasks to worker processors. In <b>Symmetric Multiprocessing (SMP)</b>, all processors are peers that perform all tasks independently; each CPU has its own registers and local cache while sharing physical main memory.",
              "Chapter 1 · Exercise 1.15"
            ],
            [
              "How do clustered systems differ from multiprocessor systems, and how do asymmetric and symmetric clusters differ?",
              "A multiprocessor system has multiple CPUs in a single system sharing physical memory over a system bus, whereas a <b>clustered system</b> connects multiple independent computer nodes over a network sharing storage via a <b>Storage-Area Network (SAN)</b>. In <b>asymmetric clustering</b>, one node stands in hot-standby mode monitoring the active node; in <b>symmetric clustering</b>, all nodes run applications concurrently while monitoring each other.",
              "Chapter 1 · Exercise 1.16"
            ],
            [
              "Why are caches useful, and why don't we simply replace a slow storage device with a cache of the same size?",
              "Caches exploit locality of reference by temporarily holding active data in faster storage, bridging the speed gap between fast CPUs and slower backing stores. We cannot replace a large disk with an equally large cache because fast cache memory (SRAM/DRAM) is orders of magnitude more <b>expensive per bit</b> and is <b>volatile</b>, whereas disks provide cheap, nonvolatile mass storage.",
              "Chapter 1 · Practice Exercise 1.10"
            ],
            [
              "What happens during computer startup when the power is turned on or rebooted?",
              "Execution begins with the <b>bootstrap program</b> stored in nonvolatile firmware (ROM or EPROM). It initializes all system aspects—including CPU registers, device controllers, and main memory—and then locates the operating-system kernel on storage, loads it into main memory, and transfers control to it.",
              "Chapter 1 · Slide 1.10"
            ],
            [
              "In what settings must an OS prioritize ease of use vs. resource utilization vs. battery life?",
              "Single-user <b>PCs/workstations</b> prioritize user convenience and responsiveness; shared <b>mainframes and minicomputers</b> must carefully manage CPU, memory, and I/O utilization to keep all users happy; and <b>handheld mobile computers</b> are resource-constrained and optimize heavily for touch usability and battery life.",
              "Chapter 1 · Exercise 1.13"
            ]
          ],
          "quiz": [
            {
              "q": "Which of the following best defines an operating system according to Chapter 1?",
              "o": [
                [
                  "A hardware controller that connects the CPU directly to magnetic disk sectors",
                  "Hardware controllers are physical components; the OS is software."
                ],
                [
                  "A program that acts as an intermediary between a user of a computer and the computer hardware",
                  "Correct. Slide 1.4 defines the OS as a program acting as an intermediary between the computer user and the computer hardware."
                ],
                [
                  "A collection of application programs such as compilers, web browsers, and database systems",
                  "Those are application programs that run on top of the operating system, not the OS itself."
                ],
                [
                  "The firmware chip (ROM/EPROM) soldered onto the motherboard",
                  "ROM/EPROM holds the bootstrap program, not the general-purpose operating system."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.4"
            },
            {
              "q": "Which component of a computer system defines the ways in which system resources are used to solve the computing problems of the users?",
              "o": [
                [
                  "Hardware",
                  "Hardware provides the raw computing resources (CPU, memory, I/O devices)."
                ],
                [
                  "The Kernel",
                  "The kernel controls and coordinates the use of hardware among applications and users."
                ],
                [
                  "Application programs",
                  "Correct. Slide 1.5 states that application programs (word processors, compilers, web browsers, database systems, video games) define the ways in which system resources are used to solve users' computing problems."
                ],
                [
                  "Bootstrap firmware",
                  "Bootstrap firmware only initializes hardware and loads the kernel at startup."
                ]
              ],
              "a": 2,
              "src": "Lecture 1 · Slide 1.5"
            },
            {
              "q": "From the <b>system view</b>, the operating system is primarily described as:",
              "o": [
                [
                  "A graphical desktop metaphor and touchscreen gesture recognizer",
                  "That is the user interface aspect of the user view."
                ],
                [
                  "A resource allocator and a control program",
                  "Correct. Slide 1.8 defines the system view of the OS in two roles: a resource allocator (managing CPU, memory, files, and I/O fairly and efficiently) and a control program (preventing errors and improper use)."
                ],
                [
                  "A compiler and assembler for high-level programming languages",
                  "Compilers and assemblers are system/language-support programs, not the core system view of the OS."
                ],
                [
                  "A peer-to-peer discovery protocol for distributed file sharing",
                  "That is a distributed computing model, not the system view of an OS."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.8"
            },
            {
              "q": "\"The one program running at all times on the computer\" is the definition of:",
              "o": [
                [
                  "The bootstrap loader",
                  "The bootstrap loader runs only during startup/reboot to load the kernel."
                ],
                [
                  "The command interpreter (shell)",
                  "The shell runs when a user logs in and can be replaced or terminated."
                ],
                [
                  "The kernel",
                  "Correct. Slide 1.9 defines the kernel as 'the one program running at all times on the computer,' while everything else is a system program or an application program."
                ],
                [
                  "A system daemon",
                  "Daemons are background system programs running in user context, not the kernel itself."
                ]
              ],
              "a": 2,
              "src": "Lecture 1 · Slide 1.9"
            },
            {
              "q": "Where is the bootstrap program typically stored so that it is immediately available when a computer is powered up?",
              "o": [
                [
                  "In volatile DRAM main memory",
                  "DRAM loses its contents when power is off and is in an unknown state at startup."
                ],
                [
                  "In ROM or EPROM (generally known as firmware)",
                  "Correct. Slide 1.10 notes that the bootstrap program is typically stored in ROM or EPROM (firmware) because it requires no initialization and persists without power."
                ],
                [
                  "In the CPU's general-purpose registers",
                  "CPU registers are volatile and initialized by the bootstrap program itself."
                ],
                [
                  "In the Device-Status Table",
                  "The Device-Status Table is an OS data structure in RAM created after the kernel boots."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.10"
            },
            {
              "q": "How does a device controller inform the CPU that it has finished an I/O operation?",
              "o": [
                [
                  "By overwriting the bootstrap program in ROM",
                  "ROM is read-only firmware and is not modified by I/O completion."
                ],
                [
                  "By causing a hardware interrupt",
                  "Correct. Slide 1.12 states that the device controller transfers data between the device and its local buffer and informs the CPU that it has finished its operation by causing an interrupt."
                ],
                [
                  "By executing a division-by-zero trap instruction",
                  "A trap is a software-generated interrupt from the CPU, not a hardware signal from a device controller."
                ],
                [
                  "By rebooting the common system bus",
                  "The controller signals an interrupt on the bus; it does not reboot it."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.12"
            },
            {
              "q": "What is a <b>trap</b> (or <b>exception</b>)?",
              "o": [
                [
                  "A hardware signal sent by a magnetic disk controller when a sector read completes",
                  "That is a hardware device interrupt."
                ],
                [
                  "A software-generated interrupt caused either by an error or by a user request",
                  "Correct. Slide 1.13 defines a trap or exception as a software-generated interrupt caused either by an error (e.g., division by zero) or a user request (system call)."
                ],
                [
                  "A table in ROM that stores the physical sector numbers of bad disk blocks",
                  "That is disk block mapping, not a trap."
                ],
                [
                  "A DMA cycle that steals memory bandwidth from the CPU",
                  "That is DMA cycle stealing."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.13"
            },
            {
              "q": "Through what structure does an interrupt transfer control to the appropriate interrupt service routine (ISR)?",
              "o": [
                [
                  "The Device-Status Table",
                  "The Device-Status Table tracks I/O device states and queues, not ISR addresses."
                ],
                [
                  "The interrupt vector, which contains the addresses of all the service routines",
                  "Correct. Slide 1.13 states that an interrupt transfers control to the appropriate interrupt service routine through the interrupt vector."
                ],
                [
                  "The bootstrap loader block",
                  "The boot block is only used during system startup."
                ],
                [
                  "The Distributed Lock Manager (DLM)",
                  "DLM coordinates storage access across clustered systems."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.13"
            },
            {
              "q": "Which storage medium is the <b>only</b> large storage media that the CPU can access directly?",
              "o": [
                [
                  "Magnetic disk",
                  "Magnetic disks are secondary storage accessed via I/O controllers, not directly by CPU load/store instructions."
                ],
                [
                  "Solid-state disk (SSD)",
                  "SSDs are secondary storage devices accessed through an I/O controller."
                ],
                [
                  "Main memory (RAM)",
                  "Correct. Slide 1.16 states that main memory is the only large storage media that the CPU can access directly."
                ],
                [
                  "Magnetic tape",
                  "Magnetic tape is slow tertiary storage."
                ]
              ],
              "a": 2,
              "src": "Lecture 1 · Slide 1.16"
            },
            {
              "q": "Which of the following lists storage levels in the correct order from <b>fastest and smallest</b> to <b>slowest and largest</b>?",
              "o": [
                [
                  "Main memory → Cache → Registers → Solid-state disk → Magnetic disk",
                  "Registers are faster than cache, which is faster than main memory."
                ],
                [
                  "Registers → Cache → Main memory → Solid-state disk → Magnetic disk → Optical disk → Magnetic tapes",
                  "Correct. Slide 1.18 (Storage-Device Hierarchy) orders storage from top to bottom as: Registers, Cache, Main memory, Solid-state disk, Magnetic disk, Optical disk, and Magnetic tapes."
                ],
                [
                  "Registers → Main memory → Cache → Magnetic disk → Solid-state disk",
                  "Cache is between registers and main memory, and SSDs are faster than magnetic disks."
                ],
                [
                  "Cache → Registers → Solid-state disk → Main memory → Magnetic tapes",
                  "Registers are at the very top, and main memory is much faster than SSDs."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.18"
            },
            {
              "q": "On a magnetic disk, the platter surface is logically divided into ________, which are further subdivided into ________.",
              "o": [
                [
                  "Sectors; tracks",
                  "Tracks are the concentric rings; sectors are the subdivisions of a track."
                ],
                [
                  "Tracks; sectors",
                  "Correct. Slide 1.16 states that the disk surface is logically divided into tracks, which are subdivided into sectors."
                ],
                [
                  "Frames; pages",
                  "Frames and pages are virtual memory concepts."
                ],
                [
                  "Buffers; registers",
                  "Buffers and registers are memory units, not magnetic platter divisions."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.16"
            },
            {
              "q": "In which I/O method does control return to the user program <b>only upon I/O completion</b>, allowing at most one outstanding I/O request at a time?",
              "o": [
                [
                  "Asynchronous I/O",
                  "Asynchronous I/O returns control to the user program immediately without waiting for I/O completion."
                ],
                [
                  "Direct Memory Access (DMA)",
                  "DMA transfers blocks asynchronously without CPU intervention."
                ],
                [
                  "Synchronous I/O",
                  "Correct. Slides 1.20–1.21 explain that in Synchronous I/O, control returns to the user program only upon I/O completion, idling the CPU via a wait instruction or wait loop."
                ],
                [
                  "Vectored I/O",
                  "Vectored I/O is a scatter-gather I/O technique, not the blocking wait loop described on Slide 1.20."
                ]
              ],
              "a": 2,
              "src": "Lecture 1 · Slides 1.20–1.21"
            },
            {
              "q": "What is the key advantage of Direct Memory Access (DMA) for high-speed I/O devices?",
              "o": [
                [
                  "It eliminates the need for device controllers and local buffers",
                  "DMA still requires a device/DMA controller and buffer storage."
                ],
                [
                  "It transfers blocks of data directly between buffer storage and main memory without CPU intervention, generating only one interrupt per block",
                  "Correct. Slide 1.23 states that DMA transfers blocks directly to main memory without CPU intervention and generates only one interrupt per block instead of one per byte."
                ],
                [
                  "It allows user-mode programs to execute privileged I/O instructions directly",
                  "I/O instructions remain privileged in kernel mode."
                ],
                [
                  "It converts volatile DRAM into nonvolatile ROM",
                  "DMA is a data-transfer mechanism and does not change memory volatility."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.23"
            },
            {
              "q": "Which of the following is <b>NOT</b> one of the three main advantages of multiprocessor systems?",
              "o": [
                [
                  "Increased throughput",
                  "Increased throughput is Advantage #1 on Slide 1.25."
                ],
                [
                  "Economy of scale",
                  "Economy of scale (sharing peripherals, storage, and power) is Advantage #2 on Slide 1.25."
                ],
                [
                  "Increased reliability (graceful degradation / fault tolerance)",
                  "Increased reliability is Advantage #3 on Slide 1.25."
                ],
                [
                  "Elimination of the need for cache coherency in hardware",
                  "Correct. Multiprocessor systems actually introduce the complex requirement of hardware cache coherency (Slide 1.42); they do not eliminate it."
                ]
              ],
              "a": 3,
              "src": "Lecture 1 · Slides 1.25 & 1.42"
            },
            {
              "q": "In a multiprocessor system, the ability to continue providing service proportional to the level of surviving hardware after a processor failure is called:",
              "o": [
                [
                  "Asymmetric clustering",
                  "Asymmetric clustering uses a separate standby computer in a cluster."
                ],
                [
                  "Graceful degradation",
                  "Correct. Slide 1.25 and Chapter 1.3.2 define graceful degradation as the ability to continue providing service proportional to the level of surviving hardware."
                ],
                [
                  "Programmed I/O",
                  "Programmed I/O is byte-by-byte CPU I/O transfer."
                ],
                [
                  "Spooling",
                  "Spooling overlaps the output of one job with the input of other jobs."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.25"
            },
            {
              "q": "How does Symmetric Multiprocessing (SMP) differ from Asymmetric Multiprocessing?",
              "o": [
                [
                  "In SMP, one master processor schedules all work while slave processors only run user code",
                  "That describes Asymmetric Multiprocessing."
                ],
                [
                  "In SMP, all processors are peers that perform all tasks within the operating system",
                  "Correct. Slide 1.25–1.26 explains that in SMP, all processors are peers; each processor has its own registers and cache and shares physical memory."
                ],
                [
                  "In SMP, processors do not share main memory and must communicate over a Wide Area Network",
                  "SMP processors share physical memory via a common system bus; separate networked systems are distributed/clustered systems."
                ],
                [
                  "In SMP, only one processor is powered on at a time while others remain in hot-standby mode",
                  "Hot-standby mode is used in asymmetric clustered systems, not SMP."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slides 1.25–1.26"
            },
            {
              "q": "In a clustered system, what is the role of a Distributed Lock Manager (DLM)?",
              "o": [
                [
                  "To translate PowerPC instructions into Intel x86 instructions",
                  "That is CPU emulation."
                ],
                [
                  "To ensure shared access to storage across cluster nodes without conflicting operations",
                  "Correct. Slide 1.28 states that clustered systems sharing storage via a SAN use a Distributed Lock Manager (DLM) to avoid conflicting operations."
                ],
                [
                  "To load the bootstrap program from ROM into CPU registers",
                  "That is performed by hardware reset and firmware."
                ],
                [
                  "To convert synchronous I/O into polling loops",
                  "DLM manages distributed storage locks, not local I/O polling."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.28"
            },
            {
              "q": "What is the difference between <b>asymmetric clustering</b> and <b>symmetric clustering</b>?",
              "o": [
                [
                  "Asymmetric clustering has one machine in hot-standby mode, whereas symmetric clustering has multiple nodes running applications and monitoring each other",
                  "Correct. Slide 1.28 defines asymmetric clustering as having one machine in hot-standby mode and symmetric clustering as having multiple nodes running applications while monitoring each other."
                ],
                [
                  "Asymmetric clustering shares a SAN, whereas symmetric clustering cannot share storage",
                  "Both cluster types typically share storage via a Storage-Area Network (SAN)."
                ],
                [
                  "Asymmetric clustering uses multiple cores on one chip, whereas symmetric clustering uses one core",
                  "Multicore refers to CPU chip design, not clustering."
                ],
                [
                  "Asymmetric clustering is used only for mobile phones, whereas symmetric clustering is for laptops",
                  "Clustering applies to server nodes connected for high availability or HPC."
                ]
              ],
              "a": 0,
              "src": "Lecture 1 · Slide 1.28"
            },
            {
              "q": "What software component provides a uniform interface between a specific hardware device controller and the OS kernel?",
              "o": [
                [
                  "The bootstrap loader",
                  "The bootstrap loader only loads the kernel at boot time."
                ],
                [
                  "The device driver",
                  "Correct. Slide 1.17 states that a device driver for each device controller manages I/O and provides the interface between the controller and the kernel."
                ],
                [
                  "The web portal",
                  "A web portal provides network access to internal servers."
                ],
                [
                  "The application program",
                  "Applications sit at the top layer and cannot access device controllers directly."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.17"
            },
            {
              "q": "When the OS preserves the state of the CPU upon an interrupt, which two items does Slide 1.14 explicitly state are stored?",
              "o": [
                [
                  "The magnetic disk tracks and sectors",
                  "Tracks and sectors are physical disk geometry."
                ],
                [
                  "The registers and the program counter (PC)",
                  "Correct. Slide 1.14 states: 'The operating system preserves the state of the CPU by storing registers and the program counter.'"
                ],
                [
                  "The ROM firmware and the SAN lock table",
                  "Neither is part of the per-instruction CPU state saved on interrupt."
                ],
                [
                  "The user's password and group ID",
                  "User and group IDs are security attributes, not CPU execution state."
                ]
              ],
              "a": 1,
              "src": "Lecture 1 · Slide 1.14"
            }
          ]
        },
        {
          "n": 2,
          "code": "Lec 2",
          "title": "Chapter 1 (Part 2): OS Structure, Dual-Mode Protection, Management Activities & Computing Environments",
          "notes": [
            {
              "h": "Operating-System Structure: Multiprogramming & Timesharing (Multitasking)",
              "pts": [
                "<b>Multiprogramming</b> is needed for efficiency because a single user cannot keep the CPU and I/O devices busy at all times.",
                "Multiprogramming organizes jobs (code and data) so the CPU always has one to execute: a subset of total jobs is kept in main memory, a job is selected from the job pool via <b>job scheduling</b>, and whenever the running job must wait (e.g., for I/O), the OS switches the CPU to another job in memory.",
                "<b>Timesharing (multitasking)</b> is a logical extension of multiprogramming in which the CPU switches jobs so frequently that users can interact with each job while it runs (<b>interactive computing</b>), keeping <b>response time short (typically &lt; 1 second)</b>.",
                "Each user has at least one program executing in memory, called a <b>process</b>. If several jobs are ready to run at the same time, the OS performs <b>CPU scheduling</b>. If processes do not fit in memory, <b>swapping</b> moves them in and out; <b>virtual memory</b> allows execution of processes that are not completely in memory."
              ],
              "table": [
                [
                  "Aspect",
                  "Multiprogramming",
                  "Timesharing (Multitasking)"
                ],
                [
                  "Primary Objective",
                  "Maximize CPU utilization so the CPU is never idle during I/O waits",
                  "Interactive computing with short response time (&lt; 1 second)"
                ],
                [
                  "Switching Trigger",
                  "Job waits for an event such as an I/O operation",
                  "Frequent timer-driven CPU scheduling multiplexes the CPU"
                ],
                [
                  "Memory Support",
                  "Subset of jobs kept simultaneously in memory via job scheduling",
                  "Swapping and virtual memory allow running processes larger than physical RAM"
                ]
              ]
            },
            {
              "h": "Operating-System Operations: Dual-Mode Operation & Timer Protection",
              "pts": [
                "To prevent user programs from interfering with one another or with the OS (e.g., infinite loops or illegal memory access), hardware provides <b>dual-mode operation</b>: <b>user mode</b> and <b>kernel mode</b> (also called supervisor, system, or privileged mode).",
                "A hardware <b>mode bit</b> added to the computer hardware indicates the current mode: <b>kernel mode = 0</b> and <b>user mode = 1</b>.",
                "Certain machine instructions that could cause harm (such as I/O control, timer management, and interrupt enabling/disabling) are designated as <b>privileged instructions</b>. The hardware allows privileged instructions to be executed <b>only in kernel mode</b>; attempting one in user mode traps to the OS as an illegal instruction.",
                "When a user program requests an OS service via a <b>system call</b>, a trap switches the mode bit from <code>1</code> to <code>0</code> (entering kernel mode). When the system call finishes, the OS resets the mode bit to <code>1</code> before returning control to the user program.",
                "Modern CPUs increasingly support <b>multi-mode operations</b>, such as a separate <b>virtual machine manager (VMM) mode</b> for guest VMs.",
                "<b>Timer protection</b> prevents a user program from getting stuck in an infinite loop or hogging resources: the OS initializes a fixed or variable timer counter (a privileged operation) that is decremented by the physical clock; when the counter reaches zero, it generates an interrupt returning control to the OS."
              ]
            },
            {
              "h": "Process Management & Memory Management",
              "pts": [
                "<b>Process</b>: a program in execution and the unit of work within the system. A <b>program is a passive entity</b> (e.g., an executable file on disk), whereas a <b>process is an active entity</b>.",
                "A process needs resources (CPU time, memory, I/O, files, initialization data) to accomplish its task, and process termination requires reclaiming all reusable resources.",
                "A <b>single-threaded process</b> has one <b>program counter (PC)</b> specifying the next instruction to execute sequentially. A <b>multi-threaded process</b> has <b>one program counter per thread</b>.",
                "<b>Six OS Process Management Activities</b>: (1) Creating and deleting both user and system processes; (2) Scheduling processes and threads on the CPUs; (3) Suspending and resuming processes; (4) Providing mechanisms for process synchronization; (5) Providing mechanisms for process communication; (6) Providing mechanisms for deadlock handling.",
                "<b>Memory Management</b> keeps several programs in memory to improve CPU utilization and response speed. <b>Three OS Memory Management Activities</b>: (1) Keeping track of which parts of memory are currently being used and by whom; (2) Deciding which processes (or parts thereof) and data to move into and out of memory; (3) Allocating and deallocating memory space as needed."
              ]
            },
            {
              "h": "Storage, Mass-Storage, Cache & I/O Subsystem Management",
              "pts": [
                "<b>File-System Management</b>: the OS abstracts physical storage properties (access speed, capacity, transfer rate, sequential vs. random access) into a uniform logical storage unit—the <b>file</b>—organized into <b>directories</b>. <b>Four OS File-System Activities</b>: (1) Creating and deleting files and directories; (2) Supporting primitives to manipulate files and directories; (3) Mapping files onto secondary storage; (4) Backing up files onto stable (nonvolatile) storage media.",
                "<b>Mass-Storage Management</b>: since computer speed hinges on the disk subsystem, the OS handles <b>three core disk activities</b>: (1) <b>Free-space management</b>, (2) <b>Storage allocation</b>, and (3) <b>Disk scheduling</b>. Slower <b>tertiary storage</b> (optical disks, magnetic tape) is also managed and varies between <b>WORM</b> (write-once, read-many-times) and <b>RW</b> (read-write).",
                "<b>Migration of Integer A (Disk → Main Memory → Cache → Hardware Register)</b>: in a <b>multitasking</b> environment, the OS must ensure processes always access the most recent value regardless of where it sits in the hierarchy; in a <b>multiprocessor</b> environment, hardware must provide <b>cache coherency</b> so all CPUs see the updated value in their caches; in a <b>distributed</b> environment, multiple replicas make consistency even more complex.",
                "<b>I/O Subsystem Responsibilities</b>: hides hardware device peculiarities from the user and provides (1) I/O memory management including <b>buffering</b> (storing data temporarily while being transferred), <b>caching</b> (storing parts of data in faster storage for performance), and <b>spooling</b> (overlapping the output of one job with the input of other jobs); (2) a general device-driver interface; and (3) drivers for specific hardware devices."
              ]
            },
            {
              "h": "Protection and Security",
              "pts": [
                "<b>Protection</b> is any mechanism for controlling the access of processes or users to resources defined by the OS.",
                "<b>Security</b> is the defense of the system against internal and external attacks, including <b>denial-of-service (DoS), worms, viruses, identity theft, and theft of service</b>.",
                "Systems first distinguish among users via <b>User Identities (User IDs / Security IDs)</b>—a unique name and number per user that is associated with all of that user's files and processes to enforce access control.",
                "A <b>Group Identifier (Group ID)</b> defines a set of users and is also associated with each process and file.",
                "<b>Privilege escalation</b> allows a user (e.g., via <code>setuid</code> or <code>sudo</code>) to change to an <b>effective ID</b> with more rights for a specific operation."
              ]
            },
            {
              "h": "Kernel Data Structures (Section 1.10)",
              "pts": [
                "<b>Linked Lists</b> accommodate variable-sized items with easy insertion/deletion but require linear retrieval time <b>O(n)</b>: (1) <b>Singly linked list</b> (each node points to successor), (2) <b>Doubly linked list</b> (each node points to predecessor and successor), (3) <b>Circularly linked list</b> (last element points to the first element instead of <code>null</code>).",
                "<b>Stack</b>: sequentially ordered <b>LIFO (Last-In, First-Out)</b> structure using <code>push</code> and <code>pop</code>; used by the OS when invoking function calls to store parameters, local variables, and the return address.",
                "<b>Queue</b>: sequentially ordered <b>FIFO (First-In, First-Out)</b> structure; used for printer job queues and CPU scheduling ready queues.",
                "<b>Trees</b>: hierarchical parent-child structures. An unbalanced <b>Binary Search Tree (BST)</b> (where <code>left_child &lt;= right_child</code>) has worst-case search time <b>O(n)</b>, whereas a <b>Balanced Binary Search Tree</b> (such as Linux's <b>red-black tree</b> used in CPU scheduling) has at most <code>lg n</code> levels and guarantees <b>O(lg n)</b> worst-case lookup.",
                "<b>Hash Functions & Hash Maps</b>: map <code>[key:value]</code> pairs (such as username to password) in <b>O(1)</b> time; <b>hash collisions</b> (two inputs yielding the same index) are resolved using a linked list at that table slot.",
                "<b>Bitmaps</b>: a string of <code>n</code> binary digits representing the status of <code>n</code> resources (e.g., <code>0</code> = available, <code>1</code> = unavailable). A bitmap is <b>8 times more space-efficient</b> than an array of 8-bit Booleans and is widely used to track disk block availability."
              ]
            },
            {
              "h": "Computing Environments & Open-Source Operating Systems",
              "pts": [
                "<b>Traditional Computing</b>: standalone PCs, web <b>portals</b> exposing internal servers, <b>network computers (thin clients)</b> for centralized security/maintenance, and home firewalls.",
                "<b>Mobile Computing</b>: handheld smartphones and tablets dominated by <b>Apple iOS</b> and <b>Google Android</b>; include <b>GPS chips, accelerometers, and gyroscopes</b> enabling navigation and augmented reality over IEEE 802.11 Wi-Fi or cellular networks, while trading off smaller memory/slower low-power CPUs for battery life.",
                "<b>Distributed Systems</b>: physically separate, possibly heterogeneous systems networked together (most commonly via <b>TCP/IP</b> across <b>LAN, MAN, WAN, or PAN</b>). A <b>Network Operating System</b> provides file sharing and message passing across autonomous hosts, whereas a <b>Distributed Operating System</b> creates the illusion that a single OS controls the entire network.",
                "<b>Client-Server vs. Peer-to-Peer (P2P)</b>: Client-Server splits systems into <b>compute servers</b> (e.g., databases) and <b>file servers</b> (e.g., web servers). In <b>P2P</b>, all nodes are peers acting as both client and server, avoiding the single-server bottleneck. P2P service discovery uses either a <b>centralized lookup service</b> (e.g., <b>Napster</b>) or a <b>broadcast discovery protocol</b> (e.g., <b>Gnutella</b>); <b>Skype</b> uses a hybrid P2P VoIP model.",
                "<b>Virtualization vs. Emulation</b>: <b>Emulation</b> translates instructions when the source CPU differs from the target CPU (e.g., Apple <b>Rosetta</b> running PowerPC code on Intel x86) or via <b>interpretation</b> (e.g., Java VM), which is slow. <b>Virtualization</b> runs guest OSs natively compiled for the same CPU architecture under a <b>Virtual Machine Manager (VMM)</b> such as VMware or Citrix XenServer.",
                "<b>Cloud Computing</b>: delivers computing, storage, and apps as a service over the network built on virtualization (e.g., <b>Amazon EC2</b>), using load balancers and firewalls. Models include <b>Public, Private, and Hybrid clouds</b>, plus <b>SaaS</b> (Software as a Service, e.g., online word processor), <b>PaaS</b> (Platform as a Service, e.g., database stack), and <b>IaaS</b> (Infrastructure as a Service, e.g., servers/storage).",
                "<b>Real-Time Embedded Systems</b>: the most prevalent form of computers (car engines, robots, appliances); have little/no UI and run a <b>Real-Time OS (RTOS)</b> with <b>well-defined, fixed time constraints</b>—operation is correct only if processing finishes within the deadline.",
                "<b>Open-Source Operating Systems</b>: distributed in source-code format rather than closed binary (countering DRM). Started by Richard Stallman's <b>Free Software Foundation (FSF)</b> and the <b>GNU Manifesto</b> using the <b>copyleft GNU General Public License (GPL)</b>. Key examples: <b>GNU/Linux</b> (kernel started by Linus Torvalds in 1991), <b>BSD UNIX</b> (FreeBSD, NetBSD, OpenBSD, and Apple's <b>Darwin</b> core in Mac OS X), and <b>OpenSolaris / Project Illumos</b>."
              ]
            }
          ],
          "cards": [
            [
              "Multiprogramming",
              "Keeps a subset of jobs in memory simultaneously so when one job waits for I/O, the CPU switches to another job."
            ],
            [
              "Timesharing (Multitasking)",
              "Logical extension of multiprogramming where the CPU switches jobs so frequently that users can interact with each running program (response time < 1s)."
            ],
            [
              "Dual-Mode Operation & Mode Bit",
              "Hardware protection mechanism with Kernel Mode (mode bit = 0) and User Mode (mode bit = 1)."
            ],
            [
              "Privileged Instructions",
              "Machine instructions (such as I/O, timer control, and interrupt management) that hardware permits to execute only in kernel mode (mode bit = 0)."
            ],
            [
              "Timer Interrupt",
              "Hardware counter initialized by the OS and decremented by the clock; interrupts the CPU at zero to prevent infinite loops or resource hogging."
            ],
            [
              "Process vs. Program",
              "A program is a passive entity (executable file stored on disk), whereas a process is an active entity (a program in execution with a program counter and resources)."
            ],
            [
              "Single-Threaded vs. Multi-Threaded Process",
              "A single-threaded process has one program counter; a multi-threaded process has one program counter per thread."
            ],
            [
              "Three Memory Management Activities",
              "(1) Track which parts of memory are used and by whom; (2) Decide which processes/data to move in and out; (3) Allocate and deallocate memory space."
            ],
            [
              "Three Mass-Storage Management Activities",
              "(1) Free-space management, (2) Storage allocation, and (3) Disk scheduling."
            ],
            [
              "Cache Coherency",
              "Hardware mechanism in multiprocessor systems ensuring that if one CPU updates a cached value, all other CPUs' caches immediately reflect the most recent value."
            ],
            [
              "Buffering vs. Caching vs. Spooling",
              "Buffering holds data temporarily during transfer; Caching keeps active data in faster storage; Spooling overlaps the output of one job with the input of other jobs."
            ],
            [
              "Protection vs. Security",
              "Protection controls access of internal processes/users to OS resources; Security defends the system against external and internal attacks (DoS, worms, viruses, identity theft)."
            ],
            [
              "User ID (UID), Group ID (GID) & Privilege Escalation",
              "UID identifies a single user; GID identifies a group of users; Privilege escalation switches a process to an effective ID with higher rights."
            ],
            [
              "Balanced Binary Search Tree (Red-Black Tree)",
              "Guarantees at most lg n levels and O(lg n) worst-case search time (unlike O(n) for an unbalanced BST); used in Linux's CPU scheduler."
            ],
            [
              "Bitmap",
              "A string of n bits representing the availability (0 or 1) of n resources such as disk blocks; 8x smaller than using 8-bit Booleans."
            ],
            [
              "Network OS vs. Distributed OS",
              "A Network OS provides file sharing and message passing across autonomous computers; a Distributed OS makes multiple networked computers appear as a single system."
            ],
            [
              "Compute Server vs. File Server",
              "A compute server executes action requests and returns results (e.g., database server); a file server provides an interface for clients to store and retrieve files (e.g., web server)."
            ],
            [
              "P2P Service Discovery (Napster vs. Gnutella)",
              "Napster used a centralized lookup index server; Gnutella used a decentralized broadcast discovery protocol across peers."
            ],
            [
              "Emulation vs. Virtualization",
              "Emulation translates instructions across different CPU architectures (slow, e.g., Rosetta); Virtualization runs guest OSs natively compiled for the same CPU via a VMM."
            ],
            [
              "SaaS vs. PaaS vs. IaaS",
              "SaaS delivers online applications; PaaS delivers a ready software stack (e.g., database server); IaaS delivers raw servers or storage over the Internet."
            ],
            [
              "Real-Time Operating System (RTOS)",
              "An OS with well-defined, fixed time constraints where correct operation depends on returning the correct result within the deadline."
            ],
            [
              "Copyleft & GNU GPL",
              "FSF licensing model (created by Richard Stallman) requiring that source code be distributed with binaries and any modifications be released under the same GPL license."
            ]
          ],
          "qa": [
            [
              "How does the distinction between kernel mode and user mode function as a rudimentary protection system?",
              "Hardware maintains a <b>mode bit</b> (<code>0</code> for kernel mode, <code>1</code> for user mode). User applications execute in user mode (<code>1</code>), where potentially harmful <b>privileged instructions</b> (direct I/O, modifying timer or memory-management registers, disabling interrupts) are blocked by hardware and trigger a trap. Only the OS kernel running in kernel mode (<code>0</code>) can execute privileged instructions.",
              "Chapter 1 · Practice Exercise 1.5"
            ],
            [
              "Why is multiprogramming needed, and how does timesharing (multitasking) extend it?",
              "A single user cannot keep both the CPU and I/O devices busy at all times. <b>Multiprogramming</b> keeps multiple jobs in memory simultaneously so the OS can switch to another job whenever the current job waits for I/O. <b>Timesharing</b> extends this by switching the CPU among processes so rapidly that every user can interact with their running program with a response time under 1 second.",
              "Chapter 1 · Slides 1.30–1.32"
            ],
            [
              "What is the main difficulty a programmer must overcome in writing an operating system for a real-time environment?",
              "A real-time operating system has <b>well-defined, fixed time constraints</b>. The programmer must guarantee that all sensing, processing, and control actions complete within strict deadlines; if a deadline is missed, the system fails even if the computed value is mathematically correct.",
              "Chapter 1 · Practice Exercise 1.3"
            ],
            [
              "List the six major activities of an operating system with respect to process management.",
              "1. Creating and deleting both user and system processes.<br>2. Scheduling processes and threads on the CPUs.<br>3. Suspending and resuming processes.<br>4. Providing mechanisms for process synchronization.<br>5. Providing mechanisms for process communication.<br>6. Providing mechanisms for deadlock handling.",
              "Chapter 1 · Slide 1.37"
            ],
            [
              "How does the problem of maintaining coherence of cached data manifest across single-processor multitasking, multiprocessor, and distributed environments?",
              "1. <b>Single-processor multitasking</b>: if integer <code>A</code> is modified in a register or cache by one process, the OS must ensure any other process accessing <code>A</code> sees the most recent value.<br>2. <b>Multiprocessor (SMP)</b>: copies of <code>A</code> may exist simultaneously in several CPUs' local caches, requiring hardware <b>cache coherency</b> so an update on one core invalidates or updates other cores.<br>3. <b>Distributed environment</b>: replicas of a file or datum may reside on separate networked hosts, requiring distributed consistency protocols.",
              "Chapter 1 · Slide 1.42 & Exercise 1.24"
            ],
            [
              "Distinguish between the Client-Server and Peer-to-Peer (P2P) models of distributed systems, including how P2P nodes discover services.",
              "In <b>Client-Server</b> systems, dedicated servers (compute servers or file servers) satisfy requests from clients, making the server a potential bottleneck. In <b>Peer-to-Peer (P2P)</b> systems, every node is a peer that can act as both client and server. P2P nodes discover services either by registering with a <b>centralized lookup service</b> (like Napster) or by broadcasting requests using a <b>decentralized discovery protocol</b> (like Gnutella).",
              "Chapter 1 · Practice Exercise 1.11"
            ],
            [
              "What is the difference between Emulation and Virtualization?",
              "<b>Emulation</b> is used when the source CPU architecture differs from the target CPU architecture (for example, Apple's Rosetta translating PowerPC instructions to run on an Intel x86 CPU, or a Java VM interpreting bytecode), which incurs heavy translation overhead. <b>Virtualization</b> runs guest operating systems that were natively compiled for the exact same underlying CPU architecture, managed and isolated by a Virtual Machine Manager (VMM).",
              "Chapter 1 · Slide 1.50"
            ],
            [
              "Compare Public, Private, and Hybrid clouds, as well as SaaS, PaaS, and IaaS.",
              "<b>Public cloud</b>: available over the Internet to anyone willing to pay; <b>Private cloud</b>: operated by a company for its own internal use; <b>Hybrid cloud</b>: combines public and private cloud components.<br><b>SaaS (Software as a Service)</b>: delivers complete applications over the Internet (e.g., word processor); <b>PaaS (Platform as a Service)</b>: delivers a ready software stack (e.g., database server); <b>IaaS (Infrastructure as a Service)</b>: provides raw compute servers or storage over the Internet.",
              "Chapter 1 · Slide 1.55"
            ],
            [
              "Compare lists, stacks, queues, balanced binary search trees, hash maps, and bitmaps as kernel data structures.",
              "<b>Linked lists</b> (singly, doubly, circular) handle variable-length items easily but have <code>O(n)</code> search; <b>Stacks (LIFO)</b> manage function-call frames via <code>push</code>/<code>pop</code>; <b>Queues (FIFO)</b> order CPU and printer scheduling; <b>Balanced BSTs</b> (e.g., Linux red-black trees) reduce worst-case search from <code>O(n)</code> to <code>O(lg n)</code>; <b>Hash maps</b> offer <code>O(1)</code> lookup and resolve collisions via linked lists; <b>Bitmaps</b> represent availability of <code>n</code> resources (such as disk blocks) using 1 bit per item.",
              "Chapter 1 · Section 1.10"
            ],
            [
              "What is the difference between Protection and Security, and how do User IDs, Group IDs, and Privilege Escalation work?",
              "<b>Protection</b> is any internal mechanism controlling the access of processes or users to OS resources, while <b>Security</b> defends the system against external and internal attacks (DoS, worms, viruses, identity theft). Each user is assigned a unique <b>User ID (UID)</b> and belongs to one or more <b>Group IDs (GIDs)</b> attached to all their processes and files; <b>privilege escalation</b> temporarily changes a process's effective ID to grant higher permissions.",
              "Chapter 1 · Slide 1.44"
            ]
          ],
          "quiz": [
            {
              "q": "Why is multiprogramming needed in an operating system?",
              "o": [
                [
                  "Because a single user cannot keep both the CPU and I/O devices busy at all times",
                  "Correct. Slide 1.30 states that multiprogramming is needed for efficiency because a single user cannot keep the CPU and I/O devices busy at all times."
                ],
                [
                  "Because single-processor CPUs cannot execute instructions without at least four cores",
                  "Multiprogramming works on a single-core CPU by switching between jobs in memory."
                ],
                [
                  "Because ROM firmware can only hold multiple programs simultaneously",
                  "Multiprogramming keeps multiple jobs in volatile main memory (RAM), not ROM."
                ],
                [
                  "Because DMA controllers cannot operate unless timesharing is disabled",
                  "DMA operates in both multiprogrammed and timesharing systems."
                ]
              ],
              "a": 0,
              "src": "Lecture 2 · Slide 1.30"
            },
            {
              "q": "In a timesharing (multitasking) system, if processes do not fit completely in main memory, what two mechanisms allow them to be executed?",
              "o": [
                [
                  "Polling and vectored interrupts",
                  "Polling and vectored interrupts are hardware interrupt-handling methods."
                ],
                [
                  "Swapping and virtual memory",
                  "Correct. Slide 1.32 states that if processes don't fit in memory, swapping moves them in and out to run, and virtual memory allows execution of processes not completely in memory."
                ],
                [
                  "Spooling and WORM optical storage",
                  "Spooling is for I/O device staging, and WORM is write-once optical media."
                ],
                [
                  "Asymmetric clustering and SAN locking",
                  "Clustering and SANs are multi-computer high-availability architectures."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.32"
            },
            {
              "q": "In dual-mode operation, what values of the hardware <b>mode bit</b> represent <b>kernel mode</b> and <b>user mode</b>?",
              "o": [
                [
                  "Kernel mode = 1; User mode = 0",
                  "This reverses the standard hardware mode bit convention."
                ],
                [
                  "Kernel mode = 0; User mode = 1",
                  "Correct. In dual-mode hardware (Slide 1.33–1.34), kernel mode is indicated by mode bit = 0 and user mode by mode bit = 1."
                ],
                [
                  "Kernel mode = -1; User mode = 2",
                  "A single hardware mode bit is binary (0 or 1)."
                ],
                [
                  "Both modes use mode bit = 0, distinguished only by the Group ID",
                  "The hardware mode bit explicitly flips between 0 (kernel) and 1 (user)."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slides 1.33–1.34"
            },
            {
              "q": "What happens when a user program invokes a system call in a dual-mode operating system?",
              "o": [
                [
                  "The mode bit remains 1 and the user program executes the privileged instruction directly",
                  "Privileged instructions cannot execute when mode bit = 1."
                ],
                [
                  "The system call traps to the kernel (setting mode bit = 0), executes in kernel mode, and resets the mode bit to 1 upon return",
                  "Correct. Slide 1.33 states that a system call changes the mode to kernel (0), and returning from the call resets it to user mode (1)."
                ],
                [
                  "The CPU reboots into the BIOS bootstrap loader to verify permissions",
                  "System calls happen thousands of times per second via software traps without rebooting."
                ],
                [
                  "The timer counter is permanently disabled until the process terminates",
                  "The timer continues protecting the CPU."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.33"
            },
            {
              "q": "Which hardware mechanism prevents a user process from getting stuck in an infinite loop and hogging the CPU forever?",
              "o": [
                [
                  "The DMA block controller",
                  "DMA handles high-speed I/O transfers, not CPU execution time limits."
                ],
                [
                  "A timer that decrements a counter and generates an interrupt when it reaches zero",
                  "Correct. Slide 1.34 explains that a timer is set to interrupt after a specific period; when the counter reaches zero, it generates an interrupt so the OS regains control."
                ],
                [
                  "A magnetic disk sector lock",
                  "Disk locks do not stop CPU-bound infinite loops."
                ],
                [
                  "A secondary storage WORM drive",
                  "WORM is write-once optical/tape media."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.34"
            },
            {
              "q": "What is the fundamental difference between a <b>program</b> and a <b>process</b>?",
              "o": [
                [
                  "A program is an active entity in RAM, while a process is a passive file on disk",
                  "This is backwards."
                ],
                [
                  "A program is a passive entity, whereas a process is an active entity (a program in execution)",
                  "Correct. Slide 1.35 states: 'A process is a program in execution. It is a unit of work within the system. Program is a passive entity, process is an active entity.'"
                ],
                [
                  "A program can only run in kernel mode, while a process runs only in VMM mode",
                  "Programs become user or system processes when executed."
                ],
                [
                  "A program has multiple program counters, while a multi-threaded process has none",
                  "A passive program has no active program counter; a multi-threaded process has one PC per thread."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.35"
            },
            {
              "q": "How many program counters (PCs) does a <b>multi-threaded process</b> have?",
              "o": [
                [
                  "Zero—threads share the disk controller's sector counter instead",
                  "Every thread tracks its next instruction via a program counter."
                ],
                [
                  "Exactly one program counter shared across all threads simultaneously",
                  "A single-threaded process has one program counter; a multi-threaded process has one per thread."
                ],
                [
                  "One program counter per thread",
                  "Correct. Slide 1.36 states that a single-threaded process has one program counter, while a multi-threaded process has one program counter per thread."
                ],
                [
                  "Two program counters per thread (one for RAM and one for ROM)",
                  "Each thread requires one program counter pointing to its next instruction."
                ]
              ],
              "a": 2,
              "src": "Lecture 2 · Slide 1.36"
            },
            {
              "q": "Which of the following is an activity of <b>Mass-Storage Management</b> rather than Memory Management?",
              "o": [
                [
                  "Keeping track of which parts of RAM are currently being used and by whom",
                  "That is a Main Memory Management activity (Slide 1.38)."
                ],
                [
                  "Free-space management, storage allocation, and disk scheduling",
                  "Correct. Slide 1.40 lists free-space management, storage allocation, and disk scheduling as the core OS activities of Mass-Storage Management."
                ],
                [
                  "Assigning User IDs and Group IDs for privilege escalation",
                  "That is Protection and Security (Slide 1.44)."
                ],
                [
                  "Setting the hardware mode bit to 0 during a trap",
                  "That is Dual-Mode Operation (Slide 1.33)."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.40"
            },
            {
              "q": "In a multiprocessor environment, when an integer <code>A</code> migrates from disk to main memory to local cache, what must be provided so all CPUs see the most recent value?",
              "o": [
                [
                  "Spooling in the printer daemon",
                  "Spooling stages I/O jobs, not CPU cache lines."
                ],
                [
                  "Cache coherency in hardware",
                  "Correct. Slide 1.42 states: 'Multiprocessor environment must provide cache coherency in hardware such that all CPUs have the most recent value in their cache.'"
                ],
                [
                  "A WORM tertiary tape drive",
                  "Tertiary tape storage has nothing to do with CPU cache lines."
                ],
                [
                  "Emulation via Rosetta",
                  "Rosetta is a CPU instruction translator."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.42"
            },
            {
              "q": "Within the OS I/O subsystem, what is <b>spooling</b>?",
              "o": [
                [
                  "Storing data temporarily while it is being transferred between two devices",
                  "That is buffering (Slide 1.43)."
                ],
                [
                  "Storing parts of data in faster storage for performance",
                  "That is caching (Slide 1.43)."
                ],
                [
                  "Overlapping of the output of one job with the input of other jobs",
                  "Correct. Slide 1.43 defines spooling as the overlapping of the output of one job with the input of other jobs (e.g., staging print jobs on disk)."
                ],
                [
                  "Polling every device controller in a tight CPU wait loop",
                  "That is busy-wait polling."
                ]
              ],
              "a": 2,
              "src": "Lecture 2 · Slide 1.43"
            },
            {
              "q": "How does Chapter 1 distinguish between <b>Protection</b> and <b>Security</b>?",
              "o": [
                [
                  "Protection defends against external worms and DoS attacks, while Security manages disk scheduling",
                  "This reverses Protection and Security."
                ],
                [
                  "Protection is any mechanism for controlling access of processes or users to OS resources, while Security is the defense of the system against internal and external attacks",
                  "Correct. Slide 1.44 defines Protection as controlling access of processes/users to OS resources and Security as defending the system against internal and external attacks (DoS, worms, viruses, identity theft, theft of service)."
                ],
                [
                  "Protection applies only to mobile devices, while Security applies only to mainframes",
                  "Both apply across all multiuser and networked systems."
                ],
                [
                  "Protection is handled exclusively by the user interface, while Security is handled by the compiler",
                  "Both are enforced throughout the operating system and hardware."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.44"
            },
            {
              "q": "What is the worst-case search performance of an <b>unbalanced</b> binary search tree of <code>n</code> items vs. a <b>balanced</b> binary search tree (such as Linux's red-black tree)?",
              "o": [
                [
                  "Unbalanced: O(1); Balanced: O(n)",
                  "An unbalanced tree can degenerate into a linked list of length n."
                ],
                [
                  "Unbalanced: O(n); Balanced: O(lg n)",
                  "Correct. Section 1.10.2 states that an unbalanced BST has worst-case O(n) performance, whereas a balanced BST has at most lg n levels and guarantees O(lg n) worst-case performance."
                ],
                [
                  "Unbalanced: O(lg n); Balanced: O(n²)",
                  "Balancing improves worst-case search to O(lg n)."
                ],
                [
                  "Both guarantee O(1) worst-case lookup without collisions",
                  "O(1) lookup is associated with hash functions, not trees."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Section 1.10.2"
            },
            {
              "q": "Why are <b>bitmaps</b> commonly used by operating systems to track the availability of thousands of disk blocks?",
              "o": [
                [
                  "Because each bit stores a full 64-bit memory pointer to the next block",
                  "A single bit is 0 or 1, not a 64-bit pointer."
                ],
                [
                  "Because using a single bit per resource makes the data structure eight times smaller than using an 8-bit Boolean value",
                  "Correct. Section 1.10.4 explains that bitmaps are highly space-efficient—an 8-bit Boolean per item would be eight times larger than a single bit per item."
                ],
                [
                  "Because bitmaps automatically encrypt file contents against worms",
                  "Bitmaps track resource status (0 = available, 1 = unavailable), not encryption."
                ],
                [
                  "Because bitmaps eliminate the need for secondary storage",
                  "Bitmaps track blocks on secondary storage."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Section 1.10.4"
            },
            {
              "q": "Which sensors/features does Slide 1.46 highlight as distinguishing mobile operating systems (Apple iOS and Google Android) from traditional laptops?",
              "o": [
                [
                  "Magnetic tape drives and blade server chassis",
                  "Those are data-center/mainframe components."
                ],
                [
                  "GPS, gyroscope/accelerometer, taking photos, and recording videos (enabling apps like augmented reality)",
                  "Correct. Slide 1.46 highlights GPS, gyroscopes, cameras, and video recording as mobile OS features that enable new app types like augmented reality."
                ],
                [
                  "Larger 10 TB magnetic hard disks and higher-wattage multicore processors",
                  "Mobile devices have smaller storage and lower-power processors than desktops."
                ],
                [
                  "Lack of wireless networking support",
                  "Mobile devices rely on IEEE 802.11 wireless and cellular data networks."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.46"
            },
            {
              "q": "In a Peer-to-Peer (P2P) distributed system, what are the two ways a node can discover available services on the network?",
              "o": [
                [
                  "By querying the BIOS ROM or triggering a division-by-zero trap",
                  "Those are local hardware/CPU operations."
                ],
                [
                  "By registering with a centralized lookup service (e.g., Napster) or broadcasting a request via a discovery protocol (e.g., Gnutella)",
                  "Correct. Slide 1.49 and Section 1.11.5 describe both methods: registering with a central lookup service on the network or broadcasting a request for service via a discovery protocol."
                ],
                [
                  "By switching the mode bit to 0 or modifying the interrupt vector",
                  "Those are local kernel mode transitions."
                ],
                [
                  "By compiling a Linux kernel module or running SYSGEN",
                  "Those are local OS configuration tasks."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.49"
            },
            {
              "q": "When is <b>emulation</b> used instead of native <b>virtualization</b>, and what is its main drawback?",
              "o": [
                [
                  "When the source CPU type is different from the target CPU type (e.g., PowerPC to Intel x86); it is generally the slowest method",
                  "Correct. Slide 1.50 states that emulation is used when the source CPU type differs from the target CPU type (e.g., PowerPC to Intel x86) and is generally the slowest method because every machine instruction must be translated."
                ],
                [
                  "When both host and guest OSs are compiled natively for the exact same CPU; it runs faster than bare metal",
                  "Running natively compiled guest OSs on the same CPU is virtualization, not emulation."
                ],
                [
                  "When a cloud provider wants to balance network traffic across firewalls",
                  "That is load balancing in cloud computing."
                ],
                [
                  "When storing an embedded OS in EPROM firmware",
                  "That is firmware storage."
                ]
              ],
              "a": 0,
              "src": "Lecture 2 · Slide 1.50"
            },
            {
              "q": "In Cloud Computing, what service model provides a software stack ready for application use via the Internet (for example, a database server)?",
              "o": [
                [
                  "Software as a Service (SaaS)",
                  "SaaS provides complete end-user applications (e.g., a word processor) over the Internet."
                ],
                [
                  "Platform as a Service (PaaS)",
                  "Correct. Slide 1.55 defines Platform as a Service (PaaS) as a software stack ready for application use via the Internet, such as a database server."
                ],
                [
                  "Infrastructure as a Service (IaaS)",
                  "IaaS provides raw servers or storage over the Internet (e.g., backup storage)."
                ],
                [
                  "Hardware-as-a-Interrupt (HaaI)",
                  "Not a cloud service model."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.55"
            },
            {
              "q": "What is the defining requirement of a <b>Real-Time Operating System (RTOS)</b>?",
              "o": [
                [
                  "It must provide a 3D graphical user interface with mouse and keyboard support",
                  "Real-time embedded systems usually have little or no user interface (Slide 1.56)."
                ],
                [
                  "It has well-defined, fixed time constraints, and correct operation occurs only if processing is done within those constraints",
                  "Correct. Slide 1.56 states that a real-time OS has well-defined, fixed time constraints: processing must be done within the constraint, and correct operation is achieved only if the constraints are met."
                ],
                [
                  "It must be licensed exclusively under Digital Rights Management (DRM)",
                  "RTOSs are defined by deterministic timing constraints, not DRM."
                ],
                [
                  "It requires a Storage-Area Network (SAN) with at least 32 cluster nodes",
                  "RTOSs typically run on small embedded controllers and sensors."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.56"
            },
            {
              "q": "Which organization started the free software movement and created the \"copyleft\" GNU General Public License (GPL)?",
              "o": [
                [
                  "Xerox PARC",
                  "Xerox PARC pioneered the graphical user interface (GUI) in the 1970s."
                ],
                [
                  "The Free Software Foundation (FSF), founded by Richard Stallman",
                  "Correct. Slide 1.57 and Section 1.12.1 state that the movement was started by Richard Stallman and the Free Software Foundation (FSF), which created the 'copyleft' GNU General Public License (GPL)."
                ],
                [
                  "Microsoft Corporation",
                  "Microsoft Windows is the classic example of a closed-source operating system."
                ],
                [
                  "The Open Handset Alliance",
                  "The Open Handset Alliance (led by Google) developed Android in the 2000s."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.57"
            },
            {
              "q": "Which open-source operating system forms the core kernel component (named <b>Darwin</b>) of Apple's Mac OS X?",
              "o": [
                [
                  "MS-DOS",
                  "MS-DOS was Microsoft's single-tasking 8088 OS."
                ],
                [
                  "BSD UNIX",
                  "Correct. Slide 1.57 and Section 1.12.3 state that Darwin, the open-source core kernel component of Mac OS X, is based on BSD UNIX (along with Mach)."
                ],
                [
                  "OpenSolaris Illumos",
                  "Illumos is derived from Sun's System V / OpenSolaris."
                ],
                [
                  "PCLinuxOS Supergamer",
                  "PCLinuxOS is a Linux LiveCD/LiveDVD distribution."
                ]
              ],
              "a": 1,
              "src": "Lecture 2 · Slide 1.57 & Section 1.12.3"
            }
          ]
        },
        {
          "n": 3,
          "code": "Lec 3",
          "title": "Chapter 2 (Part 1): OS Services, User Interfaces, System Calls & System Programs",
          "notes": [
            {
              "h": "Operating-System Services Helpful to the User",
              "pts": [
                "Operating systems provide an environment for the execution of programs and services to programs and users.",
                "<b>Six OS services that are helpful to the user</b>:",
                "1. <b>User Interface (UI)</b>: varies between <b>Command-Line Interface (CLI)</b>, <b>Batch</b> (commands/directives entered into files and executed), and <b>Graphical User Interface (GUI)</b>.",
                "2. <b>Program Execution</b>: the system must be able to load a program into memory, run that program, and end execution either <b>normally</b> or <b>abnormally</b> (indicating an error).",
                "3. <b>I/O Operations</b>: a running program may require I/O involving a file or an I/O device; for efficiency and protection, users cannot control I/O devices directly, so the OS provides the means to perform I/O.",
                "4. <b>File-System Manipulation</b>: programs need to read and write files and directories, create and delete them, search for a given file, list file information, and manage permissions based on ownership.",
                "5. <b>Communications</b>: processes may exchange information on the same computer or across a network via <b>shared memory</b> or <b>message passing</b> (packets moved by the OS).",
                "6. <b>Error Detection</b>: the OS must constantly detect and correct errors occurring in <b>CPU and memory hardware</b> (memory error, power failure), <b>I/O devices</b> (disk parity error, network connection failure, printer out of paper), or <b>user programs</b> (arithmetic overflow, illegal memory access, excessive CPU time)."
              ]
            },
            {
              "h": "Operating-System Services for System Efficiency",
              "pts": [
                "A second set of OS functions exists not for helping the individual user directly, but for ensuring the <b>efficient operation of the system itself via resource sharing</b>:",
                "1. <b>Resource Allocation</b>: when multiple users or multiple jobs run concurrently, resources must be allocated to each of them. Some resources (such as <b>CPU cycles, main memory, and file storage</b>) have special allocation code, whereas others (such as <b>I/O devices</b>) have general request and release code.",
                "2. <b>Accounting</b>: keeps track of which users use how much and what kinds of computer resources—used for billing or for accumulating usage statistics to reconfigure and improve the system.",
                "3. <b>Protection and Security</b>: concurrent processes must not interfere with each other or the OS. <b>Protection</b> ensures that all access to system resources is controlled; <b>Security</b> from outsiders requires user authentication (e.g., passwords) and defends external I/O devices and network adapters from invalid access attempts."
              ],
              "table": [
                [
                  "Category",
                  "Services Included",
                  "Primary Purpose"
                ],
                [
                  "User-Helpful Services (6)",
                  "User interface, Program execution, I/O operations, File-system manipulation, Communications, Error detection",
                  "Convenience of the user/programmer and ease of program execution"
                ],
                [
                  "System-Efficiency Services (3)",
                  "Resource allocation, Accounting, Protection and security",
                  "Efficient and safe operation of the shared computer system itself"
                ]
              ]
            },
            {
              "h": "User and Operating-System Interfaces: CLI, GUI & Touchscreen",
              "pts": [
                "<b>Command-Line Interface (CLI) / Command Interpreter</b>: allows users to directly enter commands to be performed by the OS. Sometimes implemented in the kernel, and sometimes as a special system program. On systems with multiple command interpreters, they are known as <b>shells</b> (e.g., Bourne shell <code>sh</code>, C shell <code>csh</code>, Bourne-Again shell <code>bash</code>, Korn shell <code>ksh</code>).",
                "<b>Two ways shells implement commands</b>: (1) The command interpreter itself contains the code to execute each command (size grows with number of commands); (2) Commands are implemented as separate <b>system programs</b> (used by UNIX: e.g., typing <code>rm file.txt</code> searches for the file <code>rm</code>, loads it into memory, and executes it with parameter <code>file.txt</code>—adding new commands does not require modifying the shell).",
                "<b>Graphical User Interface (GUI)</b>: user-friendly <b>desktop metaphor</b> using mouse, keyboard, and monitor where icons represent files, programs, and actions, and directories are known as <b>folders</b>. First invented at <b>Xerox PARC</b> in the early 1970s (Xerox Alto, 1973) and popularized by Apple Macintosh in the 1980s.",
                "<b>Combined CLI + GUI systems</b>: Microsoft Windows is a GUI with a CLI command shell; Apple Mac OS X pairs the <b>Aqua</b> GUI with a UNIX kernel and shells underneath; UNIX and Linux provide a CLI with optional GUI environments (<b>CDE, X-Windows, KDE, GNOME</b>).",
                "<b>Touchscreen Interfaces</b>: smartphones and tablets make a mouse impractical, so actions and selections are based on finger gestures (pressing, swiping) and a simulated <b>virtual keyboard</b>."
              ]
            },
            {
              "h": "System Calls & Application Programming Interfaces (APIs)",
              "pts": [
                "<b>System calls</b> provide the programming interface to the services made available by the OS. They are typically written in a high-level language (<b>C or C++</b>), with low-level hardware tasks written in assembly.",
                "Application programmers mostly access OS services via a high-level <b>Application Programming Interface (API)</b> rather than invoking system calls directly.",
                "<b>Three most common APIs</b>: (1) <b>Win32 / Windows API</b> for Windows systems; (2) <b>POSIX API</b> for POSIX-based systems (virtually all versions of UNIX, Linux, and Mac OS X); (3) <b>Java API</b> for the Java Virtual Machine (JVM). On UNIX/Linux, the C library providing the API is <code>libc</code>.",
                "<b>Why use an API rather than direct system calls?</b> (1) <b>Program portability</b>—an application written to an API can compile and run on any system supporting that same API; (2) <b>Simplicity</b>—actual system calls are often more detailed and complex to work with than high-level API functions (e.g., Windows API <code>CreateProcess()</code> invokes the kernel's <code>NTCreateProcess()</code> system call)."
              ]
            },
            {
              "h": "System-Call Implementation & Parameter Passing",
              "pts": [
                "<b>System-Call Interface & Number Table</b>: the runtime support library (included with the compiler) provides a <b>system-call interface</b>. A unique number is associated with each system call, and the system-call interface maintains a <b>table indexed according to these numbers</b>.",
                "When an application calls an API function like <code>open()</code>, the system-call interface intercepts the call, traps to kernel mode, looks up the system-call number in the kernel table, invokes the kernel implementation, and returns the status and return value to the user program.",
                "<b>Three general methods for passing parameters to the OS</b>:",
                "1. <b>Registers</b>: simplest approach—pass parameters directly in CPU registers. However, there may be more parameters than available registers.",
                "2. <b>Block or Table in Memory</b>: parameters are stored in a block or table in memory, and the <b>address of the block is passed as a parameter in a register</b>. This approach is taken by <b>Linux and Solaris</b>.",
                "3. <b>Stack</b>: parameters are <b>pushed onto the stack</b> by the program and <b>popped off the stack</b> by the operating system.",
                "<i>Key advantage</i>: the <b>block</b> and <b>stack</b> methods do not limit the number or length of parameters being passed."
              ],
              "table": [
                [
                  "Parameter-Passing Method",
                  "How It Works",
                  "Parameter Limit / OS Example"
                ],
                [
                  "1. CPU Registers",
                  "Parameters placed directly inside hardware registers",
                  "Limited by number of CPU registers"
                ],
                [
                  "2. Memory Block / Table",
                  "Parameters stored in a memory table; block address passed in a register",
                  "No limit on count/length (used by Linux and Solaris)"
                ],
                [
                  "3. Program Stack",
                  "Pushed onto stack by user program; popped off by OS kernel",
                  "No limit on count/length"
                ]
              ]
            },
            {
              "h": "Six Categories of System Calls",
              "pts": [
                "1. <b>Process Control</b>: <code>end</code>, <code>abort</code>; <code>load</code>, <code>execute</code>; <code>create_process</code>, <code>terminate_process</code>; <code>get/set_process_attributes</code>; <code>wait_time</code>; <code>wait_event</code>, <code>signal_event</code>; <code>allocate</code> and <code>free</code> memory; memory dump and single-step debugger; locks (<code>acquire_lock</code>, <code>release_lock</code>) for shared data.",
                "2. <b>File Management</b>: <code>create</code>, <code>delete</code> file; <code>open</code>, <code>close</code>; <code>read</code>, <code>write</code>, <code>reposition</code>; <code>get</code> and <code>set</code> file attributes.",
                "3. <b>Device Management</b>: <code>request</code> device, <code>release</code> device; <code>read</code>, <code>write</code>, <code>reposition</code>; <code>get/set</code> device attributes; logically attach or detach devices. (UNIX merges files and devices into a combined file-device structure).",
                "4. <b>Information Maintenance</b>: <code>get/set</code> time or date; <code>get/set</code> system data; <code>get/set</code> process, file, or device attributes; memory dumps and time profiling.",
                "5. <b>Communications</b>: create/delete communication connection; <b>message-passing model</b> (<code>get_hostid</code>, <code>get_processid</code>, <code>open/close_connection</code>, <code>accept_connection</code>, <code>wait_for_connection</code>, <code>read/write_message</code> between client and server daemon) vs. <b>shared-memory model</b> (<code>shared_memory_create</code>, <code>shared_memory_attach</code>—fast memory-speed transfer, but processes must synchronize access).",
                "6. <b>Protection</b>: control access to resources; <code>get</code> and <code>set</code> permissions; <code>allow</code> and <code>deny</code> user access."
              ]
            },
            {
              "h": "System Programs (System Utilities)",
              "pts": [
                "<b>System programs</b> provide a convenient environment for program development and execution. Some are simple user interfaces to system calls, while others are complex. Most users' view of the OS is defined by <b>system programs and application programs</b>, not raw system calls.",
                "<b>Seven categories of system programs</b>: (1) <b>File management</b> (create, delete, copy, rename, print, dump, list files/directories); (2) <b>Status information</b> (date, time, free memory/disk, user count, performance/logging/debugging info, configuration <b>registry</b>); (3) <b>File modification</b> (text editors, commands to search/transform text); (4) <b>Programming-language support</b> (compilers, assemblers, debuggers, interpreters); (5) <b>Program loading and execution</b> (absolute loaders, relocatable loaders, linkage editors, overlay loaders); (6) <b>Communications</b> (virtual connections, messaging, web browsing, email, remote login, file transfer); (7) <b>Background services</b> (launched at boot time, run in <b>user context</b> rather than kernel context, known as <b>services, subsystems, or daemons</b> such as network daemons, print servers, and schedulers).",
                "<b>Application programs</b> do not pertain to the system, are run by users via CLI/mouse/touch, and are not considered part of the OS."
              ]
            }
          ],
          "cards": [
            [
              "Six User-Helpful OS Services",
              "User interface, Program execution, I/O operations, File-system manipulation, Communications, and Error detection."
            ],
            [
              "Three System-Efficiency OS Services",
              "Resource allocation, Accounting, and Protection & Security."
            ],
            [
              "Two Ways Shells Implement Commands",
              "(1) Built-in code inside the command interpreter itself; (2) External system program files loaded and executed on demand (e.g., UNIX `rm`)."
            ],
            [
              "Desktop Metaphor GUI Origin",
              "Invented at Xerox PARC in the early 1970s (Xerox Alto, 1973) and popularized by Apple Macintosh; uses icons, windows, menus, and folders."
            ],
            [
              "Three Most Common APIs",
              "Win32 API (Windows), POSIX API (UNIX, Linux, Mac OS X), and Java API (Java Virtual Machine)."
            ],
            [
              "Why Programmers Prefer APIs Over Raw System Calls",
              "Program portability across systems supporting the API, and simpler high-level abstractions compared to detailed low-level system calls."
            ],
            [
              "System-Call Interface & Number Table",
              "Runtime support layer in `libc` that intercepts API calls, indexes a kernel table by system-call number, invokes the kernel handler, and returns status."
            ],
            [
              "Three Methods of System-Call Parameter Passing",
              "(1) In CPU registers; (2) In a memory block/table whose address is passed in a register (Linux/Solaris); (3) Pushed onto the stack by the program and popped by the OS."
            ],
            [
              "Six Categories of System Calls",
              "Process control, File management, Device management, Information maintenance, Communications, and Protection."
            ],
            [
              "Message-Passing vs. Shared-Memory IPC",
              "Message passing is simpler and conflict-free for small data or network links; Shared memory runs at memory speed after `shared_memory_attach()`, but processes must synchronize writes."
            ],
            [
              "System Programs (Utilities)",
              "Software layer above the OS providing a convenient environment for development and execution; defines most users' view of the system."
            ],
            [
              "Loaders in System Programs",
              "Absolute loaders, relocatable loaders, linkage editors, and overlay loaders used for program loading and execution."
            ],
            [
              "Background Services (Daemons)",
              "Constantly running system-program processes launched at boot time that execute in user context (not kernel context) to handle tasks like networking, printing, and scheduling."
            ]
          ],
          "qa": [
            [
              "The services and functions provided by an operating system can be divided into two main categories. Briefly describe the two categories and how they differ.",
              "1. <b>User-helpful services</b> (user interface, program execution, I/O operations, file-system manipulation, communications, error detection) are provided for the convenience of the programmer and user to make running programs easier.<br>2. <b>System-efficiency services</b> (resource allocation, accounting, protection and security) ensure the efficient, fair, and protected operation of the shared computer system itself across multiple concurrent users and jobs.",
              "Chapter 2 · Exercise 2.12"
            ],
            [
              "What is the purpose of the command interpreter, and why is it usually separate from the kernel?",
              "The command interpreter (shell) gets and executes the next user-specified command. Keeping it separate from the kernel allows users to choose among multiple shells (`sh`, `bash`, `csh`, `ksh`), prevents shell bugs from crashing the kernel, and—when commands are external system programs like `rm`—lets programmers add new commands simply by creating new executable files without modifying or recompiling the shell or kernel.",
              "Chapter 2 · Practice Exercise 2.5"
            ],
            [
              "What is the purpose of system calls, and why do application programmers prefer using an API over invoking system calls directly?",
              "<b>System calls</b> provide the programming interface to services made available by the OS kernel. Programmers prefer coding to an <b>API</b> (Win32, POSIX, Java) because: (1) it provides <b>program portability</b> across any system supporting that API, and (2) raw system calls are much more detailed, low-level, and architecture-specific than API functions.",
              "Chapter 2 · Practice Exercise 2.1 & Slide 2.13"
            ],
            [
              "Describe the three general methods for passing parameters to the operating system during a system call.",
              "1. <b>Registers</b>: pass parameters directly in CPU registers (simplest, but limited by the number of hardware registers).<br>2. <b>Block or table in memory</b>: store parameters in a memory block/table and pass the block's address in a register (used by Linux and Solaris; no limit on parameter count).<br>3. <b>Stack</b>: push parameters onto the program stack and let the OS pop them off (also places no limit on the number or length of parameters).",
              "Chapter 2 · Exercise 2.13 & Slide 2.18"
            ],
            [
              "What are the six major categories of system calls provided by an operating system?",
              "1. <b>Process control</b> (`end`, `abort`, `load`, `execute`, `fork`, `wait`, locks)<br>2. <b>File management</b> (`create`, `delete`, `open`, `close`, `read`, `write`, `reposition`, attributes)<br>3. <b>Device management</b> (`request`, `release`, `read`, `write`, `ioctl`, attach/detach)<br>4. <b>Information maintenance</b> (`time`, `date`, `getpid`, `sleep`, `dump`, profiling)<br>5. <b>Communications</b> (message passing and shared memory creation/attachment)<br>6. <b>Protection</b> (`chmod`, `umask`, `chown`, `allow/deny_user`)",
              "Chapter 2 · Slides 2.20–2.23"
            ],
            [
              "What are the advantages and disadvantages of using the same system-call interface for manipulating both files and devices (as in UNIX)?",
              "<b>Advantages</b>: a unified file-device model simplifies the API and user programs—once a device or file is opened, the exact same `read()`, `write()`, `reposition()`, and `close()` calls work on both, treating devices as special file names.<br><b>Disadvantages</b>: some device-specific hardware operations do not fit cleanly into sequential byte-stream reads/writes, requiring escape-hatch calls like `ioctl()`.",
              "Chapter 2 · Exercise 2.16"
            ],
            [
              "What are the two models of interprocess communication (IPC), and what are the strengths and weaknesses of each?",
              "1. <b>Message-passing model</b>: processes exchange messages directly or via a mailbox through the OS. <i>Strengths</i>: no synchronization conflicts, easy to implement for smaller data sets and across networked computers. <i>Weakness</i>: slower per-transfer system-call overhead.<br>2. <b>Shared-memory model</b>: processes use `shared_memory_create()` and `shared_memory_attach()` to access a common RAM region. <i>Strength</i>: maximum speed and convenience at native memory speeds. <i>Weakness</i>: processes must handle protection and synchronization themselves to avoid simultaneous conflicting writes.",
              "Chapter 2 · Exercise 2.18"
            ],
            [
              "What is the purpose of system programs, and into what seven categories are they divided?",
              "System programs (utilities) provide a convenient environment for program development and execution, defining most users' practical view of the OS. Their 7 categories are: (1) File management, (2) Status information (including the registry), (3) File modification, (4) Programming-language support, (5) Program loading and execution, (6) Communications, and (7) Background services (daemons).",
              "Chapter 2 · Practice Exercise 2.7 & Slides 2.28–2.31"
            ],
            [
              "What are background services (daemons), and in what execution context do they run?",
              "Background services—also called <b>subsystems</b> or <b>daemons</b>—are constantly running system-program processes launched at boot time (such as network listeners, process schedulers, error loggers, and print servers). Importantly, they run in <b>user context</b> rather than kernel context.",
              "Chapter 2 · Slide 2.31"
            ],
            [
              "Where can errors occur that the OS Error Detection service must monitor and handle?",
              "1. <b>CPU and memory hardware</b> (e.g., memory parity error or power failure).<br>2. <b>I/O devices</b> (e.g., parity error on disk, broken network connection, or lack of paper in a printer).<br>3. <b>User programs</b> (e.g., arithmetic overflow, attempt to access an illegal memory location, or excessive CPU time).",
              "Chapter 2 · Slide 2.5"
            ]
          ],
          "quiz": [
            {
              "q": "Which of the following OS services is categorized primarily as ensuring the <b>efficient operation of the system itself</b> via resource sharing, rather than directly helping an individual user?",
              "o": [
                [
                  "User interface (CLI, Batch, GUI)",
                  "User interface is a user-helpful service (Slide 2.4)."
                ],
                [
                  "Program execution and file-system manipulation",
                  "Both are user-helpful services (Slide 2.4)."
                ],
                [
                  "Resource allocation, accounting, and protection/security",
                  "Correct. Slide 2.6 groups Resource allocation, Accounting, and Protection and security as the OS functions that ensure efficient operation of the system itself via resource sharing."
                ],
                [
                  "Text editing and compiler syntax checking",
                  "Those are system utilities, not core OS resource-sharing services."
                ]
              ],
              "a": 2,
              "src": "Lecture 3 · Slide 2.6"
            },
            {
              "q": "In UNIX, when a user types a command such as <code>rm file.txt</code> into the shell, how is the command typically executed?",
              "o": [
                [
                  "The shell rewrites the ROM bootstrap loader and reboots the kernel",
                  "Commands run as normal user processes without touching ROM."
                ],
                [
                  "The command name is just the name of a system program file (`rm`) that the shell locates, loads into memory, and executes, so adding new commands requires no shell modification",
                  "Correct. Slide 2.8 and Section 2.2.1 explain that in UNIX, commands are names of external program files (`rm`), allowing new features/commands to be added without modifying the shell."
                ],
                [
                  "The shell must be recompiled from C source code every time a new command is added",
                  "Only shells that hardcode every command internally require shell modification."
                ],
                [
                  "The graphics adapter executes `rm` directly inside the monitor buffer",
                  "File deletion is performed by a system program invoking file-system calls."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.8"
            },
            {
              "q": "Where was the desktop-metaphor Graphical User Interface (GUI) originally invented in the 1970s?",
              "o": [
                [
                  "At the Free Software Foundation (FSF)",
                  "FSF was founded by Richard Stallman in the 1980s for open-source GNU software."
                ],
                [
                  "At Xerox PARC research facility",
                  "Correct. Slide 2.10 states that the GUI was invented at the Xerox PARC research facility in the 1970s (first appearing on the Xerox Alto in 1973)."
                ],
                [
                  "At Sun Microsystems for Solaris 10 DTrace",
                  "Solaris 10 was released decades later."
                ],
                [
                  "At Carnegie Mellon University for the Mach microkernel",
                  "CMU developed the Mach microkernel in the mid-1980s."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.10"
            },
            {
              "q": "Which of the following accurately describes Apple Mac OS X's user interface and underlying kernel as stated on Slide 2.10?",
              "o": [
                [
                  "MS-DOS CLI with no graphical interface",
                  "Mac OS X uses the Aqua GUI."
                ],
                [
                  "\"Aqua\" GUI interface with a UNIX kernel underneath and shells available",
                  "Correct. Slide 2.10 states: 'Apple Mac OS X is \"Aqua\" GUI interface with UNIX kernel underneath and shells available.'"
                ],
                [
                  "KDE and GNOME only, running on a Windows NT kernel",
                  "KDE and GNOME are UNIX/Linux desktops, not Mac OS X's Aqua UI."
                ],
                [
                  "Touchscreen-only Cocoa Touch with no command-line shell",
                  "Cocoa Touch is iOS; Mac OS X uses Aqua and includes UNIX shells."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.10"
            },
            {
              "q": "What are the three most common Application Programming Interfaces (APIs) used by application programmers to access OS services?",
              "o": [
                [
                  "ROM BIOS, EPROM, and GRUB",
                  "Those are firmware and boot-loader components."
                ],
                [
                  "Win32 API (Windows), POSIX API (UNIX, Linux, Mac OS X), and Java API (JVM)",
                  "Correct. Slide 2.13 lists the three most common APIs: Win32 API for Windows, POSIX API for POSIX-based systems, and Java API for the Java virtual machine."
                ],
                [
                  "FIFO, LIFO, and Red-Black Trees",
                  "Those are kernel data structures."
                ],
                [
                  "LAN, WAN, and PAN",
                  "Those are network distance classifications."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.13"
            },
            {
              "q": "How does the <b>system-call interface</b> in the runtime support library invoke a requested system call inside the OS kernel?",
              "o": [
                [
                  "It emails the request to a peer-to-peer lookup server",
                  "System calls are local kernel traps, not network messages."
                ],
                [
                  "It maintains a table indexed according to system-call numbers, invokes the corresponding system call in the OS kernel, and returns the status and return values",
                  "Correct. Slide 2.16 states that a number is associated with each system call, and the system-call interface maintains a table indexed according to these numbers."
                ],
                [
                  "It requires the application programmer to manually rewrite the kernel's assembly source code",
                  "Slide 2.16 emphasizes that the caller need know nothing about how the system call is implemented."
                ],
                [
                  "It overwrites the interrupt vector with user-mode stack frames",
                  "The interrupt/trap vector is protected in kernel memory."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.16"
            },
            {
              "q": "Which method of passing parameters to the OS during a system call is specifically used by <b>Linux and Solaris</b> when there are many parameters?",
              "o": [
                [
                  "Storing parameters in a block (or table) in memory and passing the block's address as a parameter in a register",
                  "Correct. Slide 2.18 states: 'Parameters stored in a block, or table, in memory, and block address passed as a parameter in a register — This approach taken by Linux and Solaris.'"
                ],
                [
                  "Writing parameters into the ROM bootstrap sector on disk",
                  "ROM is read-only firmware."
                ],
                [
                  "Discarding all parameters beyond the first two CPU registers",
                  "Linux and Solaris use a memory block/table precisely to avoid register count limits."
                ],
                [
                  "Sending parameters over an external Storage-Area Network (SAN)",
                  "System call parameter passing happens in local memory/registers."
                ]
              ],
              "a": 0,
              "src": "Lecture 3 · Slide 2.18"
            },
            {
              "q": "Why do some operating systems prefer the <b>block</b> or <b>stack</b> parameter-passing methods over passing parameters solely in registers?",
              "o": [
                [
                  "Because CPU registers are nonvolatile and cannot be overwritten",
                  "Registers are volatile and fast, just limited in count."
                ],
                [
                  "Because block and stack methods do not limit the number or length of parameters being passed",
                  "Correct. Slide 2.18 explicitly notes: 'Block and stack methods do not limit the number or length of parameters being passed.'"
                ],
                [
                  "Because registers can only be accessed in user mode",
                  "Registers are accessible in both user and kernel modes."
                ],
                [
                  "Because block and stack methods do not require main memory (RAM)",
                  "Both block and stack methods store parameters in main memory."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.18"
            },
            {
              "q": "Under which of the six system-call categories do <code>end</code>, <code>abort</code>, <code>load</code>, <code>execute</code>, <code>wait event</code>, and <code>signal event</code> belong?",
              "o": [
                [
                  "File management",
                  "File management covers `create`, `delete`, `open`, `close`, `read`, `write`, `reposition`."
                ],
                [
                  "Process control",
                  "Correct. Slide 2.20 lists `end`, `abort`, `load`, `execute`, `create/terminate process`, `wait time`, `wait/signal event`, memory allocation, and locks under Process control."
                ],
                [
                  "Information maintenance",
                  "Information maintenance covers `time`, `date`, system data, and process/file/device attributes."
                ],
                [
                  "Device management",
                  "Device management covers `request/release device`, `read`, `write`, and logical attach/detach."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.20"
            },
            {
              "q": "Under which system-call category do <code>get time or date</code>, <code>get system data</code>, and <code>get/set process, file, or device attributes</code> fall?",
              "o": [
                [
                  "Protection",
                  "Protection covers permissions and allowing/denying user access."
                ],
                [
                  "Communications",
                  "Communications covers connections, message passing, and shared memory."
                ],
                [
                  "Information maintenance",
                  "Correct. Slide 2.22 classifies getting/setting time or date, system data, and process/file/device attributes under Information maintenance."
                ],
                [
                  "Process control",
                  "Process control manages process creation, execution, synchronization, and termination."
                ]
              ],
              "a": 2,
              "src": "Lecture 3 · Slide 2.22"
            },
            {
              "q": "Which category of system programs is used by some systems to implement a <b>registry</b> for storing and retrieving configuration information?",
              "o": [
                [
                  "File modification",
                  "File modification consists of text editors and text search/transformation tools."
                ],
                [
                  "Status information",
                  "Correct. Slide 2.29 states under Status information: 'Some systems implement a registry - used to store and retrieve configuration information.'"
                ],
                [
                  "Programming-language support",
                  "Programming-language support includes compilers, assemblers, debuggers, and interpreters."
                ],
                [
                  "Program loading and execution",
                  "Program loading and execution includes absolute/relocatable loaders and linkage editors."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.29"
            },
            {
              "q": "Absolute loaders, relocatable loaders, linkage editors, and overlay-loaders belong to which category of system programs?",
              "o": [
                [
                  "Background services (daemons)",
                  "Daemons are constantly running background services."
                ],
                [
                  "Program loading and execution",
                  "Correct. Slide 2.30 lists absolute loaders, relocatable loaders, linkage editors, and overlay-loaders under Program loading and execution."
                ],
                [
                  "Status information",
                  "Status information reports date, time, memory, disk space, and logs."
                ],
                [
                  "Communications",
                  "Communications creates virtual connections among processes, users, and systems."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.30"
            },
            {
              "q": "Which statement is TRUE regarding <b>Background Services</b> (also known as services, subsystems, or daemons) according to Slide 2.31?",
              "o": [
                [
                  "They run in kernel context rather than user context",
                  "Slide 2.31 explicitly states: 'Run in user context not kernel context.'"
                ],
                [
                  "They launch at boot time, run in user context (not kernel context), and provide facilities like disk checking, process scheduling, error logging, and printing",
                  "Correct. Slide 2.31 lists all of these exact characteristics for background services / daemons."
                ],
                [
                  "They can only be launched manually by a finger poke on a touchscreen",
                  "Application programs are launched by CLI, mouse click, or finger poke; background services launch at boot time."
                ],
                [
                  "They overwrite the kernel in ROM during system shutdown",
                  "Daemons run as user-context processes in RAM."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.31"
            },
            {
              "q": "According to Slide 2.28, what defines most users' view of the operating system?",
              "o": [
                [
                  "The raw assembly-language interrupt vector in low memory",
                  "Users never interact with the raw interrupt vector."
                ],
                [
                  "The system programs (and application programs), not the actual system calls",
                  "Correct. Slide 2.28 states: 'Most users' view of the operating system is defined by system programs, not the actual system calls.'"
                ],
                [
                  "The internal microcode of the disk controller",
                  "Disk controller microcode is hidden behind device drivers."
                ],
                [
                  "The numeric system-call index table inside `libc`",
                  "The system-call index table is hidden from users and programmers."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.28"
            },
            {
              "q": "In the <b>shared-memory</b> communication model, why must communicating processes coordinate their actions carefully?",
              "o": [
                [
                  "Because the operating system forces every byte written to shared memory to pass through a network router",
                  "Shared memory transfers occur directly at memory speed within the computer."
                ],
                [
                  "Because the processes themselves are responsible for ensuring they do not write to the same memory location simultaneously",
                  "Correct. Section 2.4.5 explains that once the OS removes memory-protection restrictions for a shared region, the format of data and synchronization (avoiding simultaneous conflicting writes) are the responsibility of the processes."
                ],
                [
                  "Because shared memory is stored in read-only EPROM",
                  "Shared memory is allocated in read-write RAM."
                ],
                [
                  "Because shared memory can only hold 1 bit of data at a time",
                  "Shared memory regions can be arbitrary sizes."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Section 2.4.5"
            },
            {
              "q": "When a C program calls <code>printf(\"Greetings\")</code> on a UNIX or Linux system, what happens behind the scenes?",
              "o": [
                [
                  "`printf()` writes directly to the video monitor's hardware ports in user mode without involving the kernel",
                  "User-mode code cannot access I/O hardware directly."
                ],
                [
                  "The standard C library intercepts `printf()`, invokes the `write()` system call in the kernel, and returns the result to the user program",
                  "Correct. Slide 2.25 and Section 2.4.1 illustrate the Standard C Library intercepting `printf()` in user mode, invoking the `write()` system call in kernel mode, and passing the return value back."
                ],
                [
                  "The compiler replaces `printf()` with a `fork()` system call",
                  "`fork()` creates a new process; `write()` outputs data."
                ],
                [
                  "The kernel terminates the program abnormally with a core dump",
                  "`printf()` performs normal standard output via `write()`."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.25"
            },
            {
              "q": "Which of the following is an example of an error in a <b>user program</b> that the OS Error Detection service must catch?",
              "o": [
                [
                  "Lack of paper in the printer",
                  "That is an I/O device error."
                ],
                [
                  "A parity error on a magnetic disk or a failed network connection",
                  "Those are I/O device errors."
                ],
                [
                  "Arithmetic overflow, an attempt to access an illegal memory location, or using too much CPU time",
                  "Correct. Section 2.1 lists arithmetic overflow, attempting to access an illegal memory location, and excessive CPU time as user-program errors."
                ],
                [
                  "A power failure in the main memory supply",
                  "That is a CPU/memory hardware error."
                ]
              ],
              "a": 2,
              "src": "Lecture 3 · Slide 2.5 & Section 2.1"
            },
            {
              "q": "Why do many operating systems, including UNIX, merge I/O devices and files into a combined file-device structure?",
              "o": [
                [
                  "Because magnetic disks cannot store directories",
                  "Disks store hierarchical directories."
                ],
                [
                  "Because the operations on devices and files (`request`/`open`, `read`, `write`, `reposition`, `release`/`close`) are so similar that a single set of system calls can handle both",
                  "Correct. Section 2.4.3 explains that because device operations closely mirror file operations, UNIX merges them into a combined file-device structure using the same system calls."
                ],
                [
                  "To allow MS-DOS applications to bypass dual-mode protection",
                  "UNIX uses dual-mode protection; combining file and device interfaces is an API design choice."
                ],
                [
                  "To eliminate the need for device drivers in the kernel",
                  "Device drivers are still required beneath the unified system-call interface."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.21 & Section 2.4.3"
            },
            {
              "q": "In the <b>message-passing</b> model of interprocess communication, what are the special-purpose system programs that execute <code>wait_for_connection()</code> to listen for incoming client requests?",
              "o": [
                [
                  "Bootstrap loaders",
                  "Bootstrap loaders run only at system startup."
                ],
                [
                  "Daemons (server processes)",
                  "Correct. Section 2.4.5 states that most processes receiving connections are special-purpose daemons (servers) that execute `wait_for_connection()` and awaken when a client connects."
                ],
                [
                  "Absolute loaders",
                  "Absolute loaders load executable binaries into memory."
                ],
                [
                  "Interrupt vectors",
                  "Interrupt vectors are address tables in low memory."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Section 2.4.5"
            },
            {
              "q": "Which of the following system calls belongs to the <b>Protection</b> category on Slide 2.23?",
              "o": [
                [
                  "`reposition` and `delete file`",
                  "Those belong to File management."
                ],
                [
                  "`get and set permissions` and `allow and deny user access`",
                  "Correct. Slide 2.23 lists 'Control access to resources', 'Get and set permissions', and 'Allow and deny user access' under Protection."
                ],
                [
                  "`wait for time` and `allocate and free memory`",
                  "Those belong to Process control."
                ],
                [
                  "`get time or date` and `set system data`",
                  "Those belong to Information maintenance."
                ]
              ],
              "a": 1,
              "src": "Lecture 3 · Slide 2.23"
            }
          ]
        },
        {
          "n": 4,
          "code": "Lec 4",
          "title": "Chapter 2 (Part 2): OS Design, Kernel Structures, Mobile OS, Debugging, SYSGEN & Boot",
          "notes": [
            {
              "h": "OS Design Goals & Separation of Policy from Mechanism",
              "pts": [
                "Designing an OS starts by defining goals and specifications, which are heavily affected by the <b>choice of hardware</b> and the <b>type of system</b> (batch, time-sharing, single-user, multiuser, distributed, real-time, or general-purpose).",
                "<b>User Goals</b>: the OS should be convenient to use, easy to learn, reliable, safe, and fast.",
                "<b>System Goals</b>: the OS should be easy to design, implement, and maintain, as well as flexible, reliable, error-free, and efficient.",
                "<b>Fundamental software engineering principle — Separate Policy from Mechanism</b>: <b>Policy</b> decides <i>What will be done?</i> while <b>Mechanism</b> determines <i>How to do it?</i>",
                "<i>Why separate them?</i> It provides <b>maximum flexibility</b> if policy decisions need to be changed later (e.g., the timer hardware/interrupt is the <b>mechanism</b> for CPU protection, while choosing how long to set the timer for a given user or whether to favor I/O-bound over CPU-bound jobs is a <b>policy</b> decision)."
              ],
              "table": [
                [
                  "Concept",
                  "Question Answered",
                  "OS Example"
                ],
                [
                  "Mechanism",
                  "How to do something?",
                  "Timer construct that interrupts the CPU when a counter reaches zero"
                ],
                [
                  "Policy",
                  "What will be done?",
                  "Deciding how long the timer quantum is set for a particular user or class of jobs"
                ]
              ]
            },
            {
              "h": "Operating-System Implementation Languages",
              "pts": [
                "<b>Historical evolution</b>: early operating systems were written in <b>assembly language</b>; later systems used system programming languages like <b>ALGOL</b> (Burroughs MCP) and <b>PL/1</b> (MIT MULTICS); today, kernels are written primarily in <b>C and C++</b>.",
                "<b>Modern language mix</b>: lowest kernel levels (saving/restoring registers, low-level device handlers) in <b>assembly</b>, main kernel body in <b>C</b>, and system programs in <b>C, C++, or scripting languages</b> (Perl, Python, shell scripts).",
                "<b>Advantages of high-level languages</b>: faster code development, more compact code, easier to understand and debug, automatic performance improvements when compilers improve (via simple recompilation), and much <b>easier to port</b> to other hardware architectures (e.g., MS-DOS in Intel 8088 assembly only ran on x86, whereas Linux in C runs on x86, SPARC, PowerPC, and ARM).",
                "<b>Disadvantages & mitigation</b>: reduced speed and increased storage—mitigated by modern optimizing compilers and the fact that only a tiny fraction of OS code (the <b>interrupt handler, I/O manager, memory manager, and CPU scheduler</b>) is performance-critical and can have bottlenecks replaced with assembly if needed."
              ]
            },
            {
              "h": "Operating-System Structure: Simple & Traditional UNIX",
              "pts": [
                "<b>Simple Structure (MS-DOS)</b>: written to provide the most functionality in the least space; <b>not divided into modules</b>. Its interfaces and levels of functionality are not well separated—application programs can access basic I/O routines to write directly to the display and disk drives, making MS-DOS vulnerable to crashes from errant programs. (The Intel 8088 hardware also lacked dual-mode and hardware protection).",
                "<b>Traditional UNIX Structure</b>: limited by early hardware functionality, original UNIX consists of two separable parts: (1) <b>Systems programs</b> and (2) <b>The Kernel</b>.",
                "The traditional UNIX kernel consists of everything <b>below the system-call interface and above the physical hardware</b> (signals, terminal handling, character/block I/O, file system, swapping, CPU scheduling, page replacement, demand paging, virtual memory). It is \"beyond simple, but not fully layered\"—a <b>monolithic structure</b> that is difficult to implement and maintain, but provides distinct <b>performance advantages</b> (very low overhead in the system-call interface and in-kernel communication)."
              ]
            },
            {
              "h": "Layered Approach & Microkernel System Structure",
              "pts": [
                "<b>Layered Approach</b>: divides the OS into <code>N + 1</code> layers where <b>Layer 0 is the hardware</b> and <b>Layer N is the user interface</b>. Each layer uses functions and services of <b>only lower-level layers</b>.",
                "<i>Layered pros & cons</i>: main advantage is <b>simplicity of construction and debugging</b> (Layer 0 is debugged first, then Layer 1, etc.). Two major disadvantages: (1) <b>careful layer definition</b> is difficult when components have circular dependencies (e.g., virtual-memory backing-store driver vs. CPU scheduler); (2) <b>performance overhead</b> as system-call parameters are modified and passed through multiple layers.",
                "<b>Microkernel System Structure (e.g., Mach, Tru64 UNIX, QNX Neutrino)</b>: moves as much as possible from the kernel into <b>user space</b>, leaving a small microkernel that provides minimal process/memory management and <b>message passing</b>.",
                "In a microkernel, client programs and user-mode services (file system, device drivers, IPC) communicate <b>indirectly by exchanging messages through the microkernel</b>.",
                "<i>Microkernel benefits (4)</i>: (1) <b>Easier to extend</b> (new services added in user space without modifying the kernel); (2) <b>Easier to port</b> to new hardware; (3) <b>More reliable</b> (less code runs in kernel mode, so a crashed file server doesn't crash the kernel); (4) <b>More secure</b>.",
                "<i>Microkernel detriment (1)</i>: <b>performance overhead of user-space to kernel-space communication</b> (message passing and context switching, which led Windows NT to move layers back into kernel space between NT 1.0, NT 4.0, and XP)."
              ]
            },
            {
              "h": "Loadable Kernel Modules & Hybrid Systems",
              "pts": [
                "<b>Loadable Kernel Modules (LKMs)</b>: the best modern methodology for OS design (used by Linux, Solaris, Mac OS X, Windows). The kernel has a set of core components and dynamically links in additional services via object-oriented modules at boot time or runtime without recompiling the kernel.",
                "<i>Why LKMs beat pure layering and pure microkernels</i>: like layers, each component has defined, protected interfaces, but LKMs are <b>more flexible because any module can call any other module</b>; like a microkernel, the core kernel stays clean, but LKMs are <b>more efficient because modules communicate directly without message-passing overhead</b>.",
                "<b>Solaris 7 Loadable Module Types</b>: (1) Scheduling classes, (2) File systems, (3) Loadable system calls, (4) Executable formats, (5) STREAMS modules, (6) Miscellaneous modules, and (7) Device and bus drivers.",
                "<b>Hybrid Systems</b> combine multiple structures for performance, security, and usability: <b>Linux and Solaris</b> are monolithic (single kernel address space for speed) plus modular (dynamic LKMs); <b>Windows</b> is mostly monolithic plus microkernel-style user-mode subsystem personalities and loadable modules.",
                "<b>Apple Mac OS X Structure</b>: a hybrid layered system featuring the <b>Aqua UI</b> and application environments (<b>Cocoa</b> for Objective-C, Java, QuickTime, BSD) over the <b>Darwin kernel environment</b>, which combines the <b>Mach microkernel</b> (memory management, RPC/IPC message passing, thread scheduling), <b>BSD UNIX</b> (CLI, networking, file systems, POSIX/Pthreads APIs), an <b>I/O kit</b>, and dynamically loadable modules called <b>kernel extensions (kexts)</b>."
              ],
              "table": [
                [
                  "OS Architecture",
                  "Core Structure",
                  "Key Strengths & Trade-offs"
                ],
                [
                  "Simple (MS-DOS)",
                  "Unmodularized; direct hardware access",
                  "Tiny footprint, but zero protection; user crash brings down whole system"
                ],
                [
                  "Monolithic (Traditional UNIX)",
                  "Single large kernel below syscall interface",
                  "Fast in-kernel communication, but difficult to maintain and extend"
                ],
                [
                  "Layered",
                  "Strict hierarchy Layer 0 (H/W) → Layer N (UI)",
                  "Easy step-by-step debugging, but hard to order layers and adds call overhead"
                ],
                [
                  "Microkernel (Mach, QNX)",
                  "Minimal kernel; services in user space via IPC",
                  "Highly extensible, portable, reliable, and secure, but suffers IPC overhead"
                ],
                [
                  "Loadable Modules / Hybrid",
                  "Monolithic core + dynamic kernel modules",
                  "Combines monolithic speed with modular extensibility (Linux, Solaris, Mac OS X)"
                ]
              ]
            },
            {
              "h": "Mobile Operating Systems: Apple iOS & Google Android",
              "pts": [
                "<b>Apple iOS</b>: closed-source mobile OS for iPhone and iPad structured on Mac OS X, but compiled for <b>ARM</b> CPU architecture rather than Intel x86 (does not run Mac OS X apps natively). Its 4 layers from top to bottom are: (1) <b>Cocoa Touch</b> (Objective-C API supporting touchscreens and mobile hardware), (2) <b>Media Services</b> (graphics, audio, video), (3) <b>Core Services</b> (cloud computing, databases), and (4) <b>Core OS</b> (based on the Mac OS X Darwin kernel).",
                "<b>Google Android</b>: open-source mobile OS developed by the <b>Open Handset Alliance</b> (led by Google) running on a variety of hardware platforms.",
                "<b>Android Architecture Stack</b>: sits on a <b>modified Linux kernel</b> (managing processes, memory, device drivers, and added <b>power management</b>). Above the kernel are native C/C++ libraries—<b>WebKit</b> (web browser), <b>SQLite</b> (database), <b>OpenGL / Surface Manager</b> (graphics/multimedia), and a smaller <b>libc</b> for slower mobile CPUs—plus the <b>Android Runtime</b> consisting of Core Libraries and the <b>Dalvik Virtual Machine</b>.",
                "For Android apps written in Java using the separate Android API, Java class files are first compiled to <b>Java bytecode</b> and then translated into an executable file that runs in the <b>Dalvik VM</b> (optimized for mobile devices with limited memory and CPU)."
              ]
            },
            {
              "h": "OS Debugging, Performance Tuning, SYSGEN & System Boot",
              "pts": [
                "<b>Operating-System Debugging</b>: finding and fixing errors (bugs) in hardware and software, including performance tuning. OSs write error info to <b>log files</b>. An application failure generates a <b>core dump</b> file capturing the process's memory for debugger analysis. A kernel failure (<b>crash</b>) generates a <b>crash dump</b> file capturing kernel memory (often written to a raw disk partition with no file system and copied to a file after reboot).",
                "<b>Performance Tuning</b> removes bottlenecks by monitoring system behavior via (1) <b>trace listings</b> of logged events, (2) interactive tools like UNIX <code>top</code> and <b>Windows Task Manager</b>, (3) <b>profiling</b> (periodic sampling of the instruction pointer to identify statistical trends), and (4) <b>DTrace</b> (dynamic tracing probes in user and kernel modes).",
                "<b>Operating System Generation (SYSGEN)</b>: configures a general-purpose OS distribution for a specific computer site by determining CPU type/options, boot disk partitions, available memory, available devices (device/interrupt numbers), and OS options (buffer sizes, CPU scheduling algorithm, max processes). Three SYSGEN approaches: (1) modify source code and completely recompile the kernel (most tailored), (2) link selected modules from a precompiled library, or (3) construct a completely table-driven system (runtime selection).",
                "<b>System Boot</b>: when power is initialized, execution starts at a fixed memory location in <b>ROM/EEPROM firmware</b> holding the initial bootstrap code. It runs diagnostics, initializes hardware, and either runs the entire OS from ROM (small embedded/mobile devices) or uses a <b>two-step boot process</b> where ROM code loads a fixed <b>boot block</b> from disk (the boot/system disk), which loads a full bootstrap loader such as <b>GRUB</b> (allowing selection of kernel versions and options), which then loads the kernel into RAM and starts execution."
              ]
            }
          ],
          "cards": [
            [
              "User Goals vs. System Goals in OS Design",
              "User goals: convenient, easy to learn/use, reliable, safe, fast; System goals: easy to design/implement/maintain, flexible, reliable, error-free, efficient."
            ],
            [
              "Policy vs. Mechanism",
              "Policy decides 'What will be done?'; Mechanism determines 'How to do it?'. Separating them maximizes flexibility when policies change."
            ],
            [
              "Advantages of Implementing an OS in C/C++ over Assembly",
              "Faster to write, more compact, easier to understand and debug, benefits from compiler optimizations, and much easier to port to other CPU architectures."
            ],
            [
              "MS-DOS Simple Structure Vulnerability",
              "Not divided into modules and lacks hardware dual-mode protection on the Intel 8088, allowing user programs to access basic I/O directly and crash the whole system."
            ],
            [
              "Traditional UNIX Kernel Definition",
              "Everything below the system-call interface and above the physical hardware (file system, CPU scheduling, memory management, signals, I/O in one monolithic level)."
            ],
            [
              "Layered Approach Rule & Main Advantage",
              "Layer 0 is hardware and Layer N is the UI; each layer calls only lower layers, which simplifies construction, debugging, and verification."
            ],
            [
              "Two Disadvantages of the Layered Approach",
              "(1) Difficulty of ordering layers without circular dependencies (e.g., backing-store driver vs. CPU scheduler); (2) Performance overhead of passing parameters across layers."
            ],
            [
              "Microkernel Architecture (Mach)",
              "Moves nonessential services (file system, device drivers, IPC) out of the kernel into user space; modules communicate via message passing."
            ],
            [
              "Four Benefits & One Detriment of Microkernels",
              "Benefits: easier to extend, easier to port, more reliable, more secure. Detriment: performance overhead of user-to-kernel space message passing."
            ],
            [
              "Loadable Kernel Modules (LKMs)",
              "Object-oriented core kernel that dynamically links modules at boot/runtime; more flexible than layers (any module calls any module) and faster than microkernels (no message passing)."
            ],
            [
              "Mac OS X Hybrid Architecture",
              "Aqua UI + Cocoa Objective-C environment over the Darwin kernel, which combines the Mach microkernel, BSD UNIX, I/O kit, and kernel extensions."
            ],
            [
              "Four Layers of Apple iOS",
              "Cocoa Touch (top) → Media Services → Core Services → Core OS (bottom, based on Darwin/Mac OS X kernel on ARM)."
            ],
            [
              "Android Runtime & Dalvik VM",
              "Based on a modified Linux kernel (with power management); Java class files compile to Java bytecode and translate into executables for the Dalvik virtual machine."
            ],
            [
              "Core Dump vs. Crash Dump",
              "A core dump captures the memory of a failed user process; a crash dump captures kernel memory when the operating system itself crashes."
            ],
            [
              "Profiling",
              "Periodic sampling of the instruction pointer (program counter) using timer interrupts to determine statistical trends of where a program spends time."
            ],
            [
              "SYSGEN (System Generation)",
              "Program that obtains hardware-specific site configuration (CPU, memory, devices, scheduling options) to build a compiled, linked, or table-driven kernel."
            ],
            [
              "System Boot & GRUB",
              "Power-on starts at a fixed ROM firmware address; in a two-step boot, ROM loads the disk boot block, which loads the GRUB bootstrap loader to select and start the kernel."
            ]
          ],
          "qa": [
            [
              "Why is the separation of mechanism and policy desirable in operating-system design?",
              "<b>Mechanisms</b> determine <i>how</i> to do something, whereas <b>policies</b> decide <i>what</i> will be done. Separating them provides maximum flexibility: if policy decisions change later (or differ across installations, such as changing the timer quantum or prioritizing I/O-bound vs. CPU-bound processes), only policy parameters or loadable tables need to be updated without rewriting the underlying kernel mechanisms.",
              "Chapter 2 · Exercise 2.19 & Slide 2.33"
            ],
            [
              "What are the advantages and disadvantages of writing an operating system in a high-level language such as C instead of assembly language?",
              "<b>Advantages</b>: the code can be written faster, is more compact, is easier to read and debug, benefits automatically from compiler optimizations via recompilation, and is far easier to <b>port</b> to different CPU architectures (e.g., Linux on x86, ARM, SPARC, PowerPC vs. MS-DOS locked to Intel 8088).<br><b>Disadvantages</b>: slightly reduced speed and increased storage—though modern optimizing compilers minimize this, and any true bottleneck routines (interrupt handler, I/O manager, memory manager, CPU scheduler) can be rewritten in assembly.",
              "Chapter 2 · Slide 2.34 & Section 2.6.3"
            ],
            [
              "What is the main advantage of the layered approach to system design, and what are its two main disadvantages?",
              "<b>Main advantage</b>: simplicity of construction and debugging—since each layer uses services only from lower-level layers (starting with Layer 0 hardware), layers can be verified and debugged sequentially from bottom to top.<br><b>Disadvantages</b>: (1) appropriately defining layers is difficult when components depend on each other (e.g., virtual-memory backing-store driver vs. CPU scheduler); (2) passing and modifying parameters through multiple layers adds performance overhead to system calls.",
              "Chapter 2 · Practice Exercise 2.8 & Exercise 2.20"
            ],
            [
              "What are the main advantages of the microkernel approach, how do user programs and system services interact in it, and what is its main disadvantage?",
              "In a <b>microkernel</b> (such as Mach or QNX), nonessential services (file systems, device drivers) run in user space, and client programs interact with them indirectly by <b>exchanging messages (message passing) through the microkernel</b>.<br><b>Advantages</b>: easier to extend, easier to port to new hardware, and more reliable and secure (since less code runs in kernel mode).<br><b>Disadvantage</b>: performance overhead of user-space to kernel-space communication and context switching.",
              "Chapter 2 · Exercise 2.21 & Slide 2.40"
            ],
            [
              "What are the advantages of using loadable kernel modules (LKMs) over pure layered or microkernel designs?",
              "Loadable kernel modules allow a core kernel to dynamically link in new functionality (such as device drivers or file systems) at boot time or runtime without recompiling the kernel. LKMs are <b>more flexible than a layered system</b> because any module can call any other module, and <b>more efficient than a microkernel</b> because modules communicate directly inside kernel space without invoking message passing.",
              "Chapter 2 · Exercise 2.22 & Slide 2.42"
            ],
            [
              "Explain how Linux, Windows, and Apple Mac OS X function as hybrid operating systems.",
              "1. <b>Linux and Solaris</b>: monolithic (the kernel runs in a single address space for high performance) plus modular (using dynamically loadable kernel modules).<br>2. <b>Windows</b>: largely monolithic for performance, but incorporates microkernel features (user-mode subsystem personalities) and loadable kernel modules.<br>3. <b>Mac OS X</b>: layered Aqua UI and Cocoa programming environment above the Darwin kernel environment, which combines the <b>Mach microkernel</b>, <b>BSD UNIX</b> kernel components, an I/O kit, and loadable kernel extensions.",
              "Chapter 2 · Slides 2.44–2.45"
            ],
            [
              "How are Apple iOS and Google Android similar, and how are they different (including how Android executes Java programs)?",
              "<b>Similarities</b>: both are layered mobile software stacks providing rich frameworks for touchscreen mobile devices.<br><b>Differences</b>: iOS is closed-source, built on the Mac OS X Darwin kernel for ARM, and uses Objective-C with the Cocoa Touch API. Android is open-source, built on a modified Linux kernel (with added power management), and uses a separate Android Java API where Java class files are compiled to Java bytecode and then translated into executables for the <b>Dalvik virtual machine</b> (rather than a standard JVM) junto with SQLite, WebKit, and a smaller `libc`.",
              "Chapter 2 · Exercises 2.23–2.24 & Slides 2.46–2.48"
            ],
            [
              "Distinguish between a core dump and a crash dump, and explain how statistical profiling works.",
              "A <b>core dump</b> captures the memory of a failed user-level application process, whereas a <b>crash dump</b> captures kernel memory when the OS kernel itself fails (often written to a raw disk partition without a file system and extracted upon reboot). <b>Statistical profiling</b> periodically samples the CPU's instruction pointer (program counter) via regular timer interrupts to identify which sections of code consume the most execution time.",
              "Chapter 2 · Exercise 2.14 & Slide 2.49"
            ],
            [
              "Why do some systems store the operating system in firmware, while others store it on disk, and how does a multi-boot loader like GRUB work?",
              "Small embedded systems, phones, and consoles store the OS in <b>ROM/EPROM firmware</b> for ruggedness and simplicity, but firmware is expensive, small, slower than RAM, and hard to update. General-purpose OSs store a small bootstrap loader in ROM that reads a disk <b>boot block</b> (Block 0), which loads a full bootstrap program like <b>GRUB</b> from disk. GRUB understands file systems and presents a menu allowing the user to boot from multiple disks, operating systems, or kernel versions.",
              "Chapter 2 · Practice Exercises 2.10–2.11 & Slide 2.54"
            ],
            [
              "What is the role of the SYSGEN program, and what are the three ways it can generate an operating system?",
              "<b>SYSGEN (System Generation)</b> configures an OS distribution for a specific hardware site by gathering CPU, memory, disk partition, device interrupt, and scheduling parameters. It can generate the OS by: (1) modifying source code and completely recompiling the kernel, (2) linking selected precompiled modules from a library, or (3) building a completely table-driven system where selection happens at runtime.",
              "Chapter 2 · Slide 2.53 & Section 2.9"
            ]
          ],
          "quiz": [
            {
              "q": "In operating-system design, the principle of separating <b>policy</b> from <b>mechanism</b> states that:",
              "o": [
                [
                  "Mechanisms decide what will be done, whereas policies determine how to do it",
                  "This reverses the definitions of policy and mechanism."
                ],
                [
                  "Policies decide what will be done, whereas mechanisms determine how to do it",
                  "Correct. Slide 2.33 states: 'Policy: What will be done? Mechanism: How to do it? Mechanisms determine how to do something, policies decide what will be done.'"
                ],
                [
                  "Policies must always be written in assembly language, while mechanisms are written in Python",
                  "Both mechanisms and policies are architectural concepts, not language restrictions."
                ],
                [
                  "Only single-tasking systems like MS-DOS separate policy from mechanism",
                  "Microkernels and table-driven schedulers (like Solaris) exemplify strong policy/mechanism separation."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slide 2.33"
            },
            {
              "q": "Why is separating policy from mechanism considered a vital principle in OS software engineering?",
              "o": [
                [
                  "Because it eliminates the need for a CPU timer interrupt",
                  "The timer is the mechanism; the duration is the policy."
                ],
                [
                  "Because it allows maximum flexibility if policy decisions are to be changed later without rewriting the underlying mechanism",
                  "Correct. Slide 2.33 states: 'The separation of policy from mechanism is a very important principle, it allows maximum flexibility if policy decisions are to be changed later.'"
                ],
                [
                  "Because it allows user-mode applications to overwrite the kernel's interrupt vector",
                  "Kernel protection remains strictly enforced."
                ],
                [
                  "Because it forces all operating systems to have the exact same graphical user interface",
                  "Encoding a global look-and-feel into the kernel (as in Windows) actually couples policy and mechanism."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slide 2.33"
            },
            {
              "q": "Which of the following is a major advantage of implementing an operating system in a high-level language like C or C++ rather than assembly language?",
              "o": [
                [
                  "It requires zero RAM and runs directly inside CPU registers",
                  "High-level languages actually use slightly more storage than hand-tuned assembly."
                ],
                [
                  "It is much easier to port to other hardware architectures, as well as faster to write, understand, and debug",
                  "Correct. Slide 2.34 and Section 2.6.3 emphasize that a high-level language OS is far easier to port to other hardware and easier to write, compact, understand, and debug."
                ],
                [
                  "It eliminates the need for a compiler",
                  "C and C++ require a compiler."
                ],
                [
                  "It allows MS-DOS 8088 assembly code to run natively on ARM without emulation",
                  "MS-DOS was written in 8088 assembly and could not run natively on non-x86 CPUs."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slide 2.34"
            },
            {
              "q": "Why was MS-DOS vulnerable to entire system crashes whenever an errant user program failed?",
              "o": [
                [
                  "Because MS-DOS used a Mach microkernel with excessive message-passing overhead",
                  "MS-DOS used a Simple Structure, not a microkernel."
                ],
                [
                  "Because its interfaces and levels of functionality were not well separated, and the Intel 8088 lacked dual-mode hardware protection",
                  "Correct. Slide 2.36 and Section 2.7.1 explain that MS-DOS was not divided into modules, its interfaces and levels of functionality were not well separated, and the Intel 8088 provided no dual mode or hardware protection."
                ],
                [
                  "Because MS-DOS forced all programs to run inside a Dalvik virtual machine",
                  "Dalvik is Android's virtual machine."
                ],
                [
                  "Because MS-DOS stored all user applications in read-only ROM",
                  "MS-DOS loaded programs into RAM."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slide 2.36"
            },
            {
              "q": "In the traditional UNIX system structure (Slides 2.37–2.38), what constitutes the <b>kernel</b>?",
              "o": [
                [
                  "Only the Bourne shell and the C compiler",
                  "Shells and compilers live above the system-call interface as systems programs."
                ],
                [
                  "Everything below the system-call interface and above the physical hardware",
                  "Correct. Slide 2.37 states that the UNIX OS consists of two separable parts—systems programs and the kernel—where the kernel 'consists of everything below the system-call interface and above the physical hardware.'"
                ],
                [
                  "Only the ROM BIOS device drivers",
                  "ROM BIOS is an MS-DOS hardware layer."
                ],
                [
                  "User-space servers communicating exclusively through a Mach message-passing bus",
                  "Traditional UNIX is monolithic ('beyond simple but not fully layered'), not a microkernel."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slides 2.37–2.38"
            },
            {
              "q": "In the <b>Layered Approach</b> to OS structure (Slide 2.39), what are Layer 0 and Layer N, and what rule governs calls between layers?",
              "o": [
                [
                  "Layer 0 is the user interface, Layer N is the hardware, and each layer calls only higher layers",
                  "This is upside down: Layer 0 is hardware and Layer N is the user interface."
                ],
                [
                  "Layer 0 is the hardware, Layer N is the user interface, and each layer uses functions and services of only lower-level layers",
                  "Correct. Slide 2.39 states: 'The bottom layer (layer 0) is the hardware; the highest (layer N) is the user interface. With modularity, layers are selected such that each uses functions (operations) and services of only lower-level layers.'"
                ],
                [
                  "Layer 0 is the Dalvik VM, Layer N is SQLite, and any layer can call any other layer freely",
                  "Calling any module freely is a property of Loadable Kernel Modules, not strict layering."
                ],
                [
                  "All layers execute in user mode with mode bit = 1",
                  "Lower OS layers execute in kernel mode."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slide 2.39"
            },
            {
              "q": "How does a <b>Microkernel</b> system structure (such as Mach) organize the operating system, and how do user modules communicate?",
              "o": [
                [
                  "It places all file systems, device drivers, and GUI windows inside a single monolithic kernel address space",
                  "A microkernel moves nonessential services out of the kernel into user space."
                ],
                [
                  "It moves as much from the kernel into user space as possible, and communication takes place between user modules using message passing",
                  "Correct. Slide 2.40 states that a microkernel 'moves as much from the kernel into user space' and 'communication takes place between user modules using message passing.'"
                ],
                [
                  "It compiles all user applications into ROM firmware during SYSGEN",
                  "User modules run in RAM in user mode."
                ],
                [
                  "It eliminates dual-mode operation so user programs can write directly to disk controllers",
                  "Microkernels strictly enforce user mode for services and kernel mode for the microkernel."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slides 2.40–2.41"
            },
            {
              "q": "What is the main <b>detriment</b> (disadvantage) of a Microkernel system structure listed on Slide 2.40?",
              "o": [
                [
                  "It is impossible to extend with new services",
                  "Easier extension is a benefit of microkernels."
                ],
                [
                  "It is less reliable and less secure because all code runs in kernel mode",
                  "Higher reliability and security are benefits of microkernels because less code runs in kernel mode."
                ],
                [
                  "Performance overhead of user-space to kernel-space communication",
                  "Correct. Slide 2.40 explicitly lists 'Detriments: Performance overhead of user space to kernel space communication.'"
                ],
                [
                  "It cannot be ported to new hardware architectures",
                  "Easier portability is a key benefit of microkernels."
                ]
              ],
              "a": 2,
              "src": "Lecture 4 · Slide 2.40"
            },
            {
              "q": "Why are <b>Loadable Kernel Modules (LKMs)</b> (used in Linux and Solaris) considered more flexible than a layered system and more efficient than a microkernel?",
              "o": [
                [
                  "Because any module can call any other module (more flexible than strict layers), and modules communicate directly in kernel space without invoking message passing (more efficient than a microkernel)",
                  "Correct. Slide 2.42 and Section 2.7.4 explain both advantages of loadable kernel modules."
                ],
                [
                  "Because LKMs require recompiling the entire kernel every time a device driver is loaded",
                  "LKMs link dynamically at boot or runtime without recompiling the kernel."
                ],
                [
                  "Because LKMs run exclusively in user space via TCP/IP sockets",
                  "LKMs are dynamically loaded inside the kernel."
                ],
                [
                  "Because LKMs disable virtual memory and swapping",
                  "LKMs work alongside full virtual memory management."
                ]
              ],
              "a": 0,
              "src": "Lecture 4 · Slide 2.42 & Section 2.7.4"
            },
            {
              "q": "How does Slide 2.44 characterize the hybrid kernel architecture of <b>Linux and Solaris</b>?",
              "o": [
                [
                  "Pure microkernels running all device drivers in user mode",
                  "Linux and Solaris run their kernels in kernel address space."
                ],
                [
                  "Monolithic (kernels in a single kernel address space for performance) plus modular for dynamic loading of functionality",
                  "Correct. Slide 2.44 states: 'Linux and Solaris kernels in kernel address space, so monolithic, plus modular for dynamic loading of functionality.'"
                ],
                [
                  "Unstructured MS-DOS systems without hardware protection",
                  "Both Linux and Solaris have full hardware protection and modular kernels."
                ],
                [
                  "Closed-source systems based on the Aqua UI and Cocoa Touch",
                  "Aqua and Cocoa Touch are Apple Mac OS X and iOS technologies."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slide 2.44"
            },
            {
              "q": "In the <b>Apple Mac OS X</b> hybrid structure (Slides 2.44–2.45), what are the main components of the kernel environment underneath the Aqua UI and Cocoa environment?",
              "o": [
                [
                  "MS-DOS ROM BIOS and Windows NT personalities",
                  "Those are Microsoft architectures."
                ],
                [
                  "The Mach microkernel and BSD UNIX parts, plus an I/O kit and dynamically loadable modules (kernel extensions)",
                  "Correct. Slide 2.44 states: 'Below is kernel consisting of Mach microkernel and BSD Unix parts, plus I/O kit and dynamically loadable modules (called kernel extensions).'"
                ],
                [
                  "The Dalvik virtual machine and SQLite kernel",
                  "Dalvik and SQLite are part of the Android user-space stack."
                ],
                [
                  "A pure 7-layer THE multiprogramming kernel with no modules",
                  "Mac OS X uses the Darwin hybrid kernel."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slides 2.44–2.45"
            },
            {
              "q": "Why does <b>Apple iOS</b> not run Mac OS X applications natively despite being structured on Mac OS X (Slide 2.46)?",
              "o": [
                [
                  "Because iOS uses the MS-DOS fat16 kernel",
                  "iOS uses the Core OS layer based on the Mac OS X Darwin kernel."
                ],
                [
                  "Because iOS runs on a different CPU architecture (ARM vs. Intel) and uses the mobile-specific Cocoa Touch API",
                  "Correct. Slide 2.46 notes that iOS does not run OS X applications natively, runs on a different CPU architecture (ARM vs. Intel), and provides the Cocoa Touch Objective-C API for mobile apps."
                ],
                [
                  "Because iOS is written entirely in interpreted BASIC",
                  "iOS apps use Objective-C and Cocoa Touch."
                ],
                [
                  "Because iOS lacks a media services or core services layer",
                  "Slide 2.46 lists Cocoa Touch, Media services, Core services, and Core OS as iOS's layers."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slide 2.46"
            },
            {
              "q": "In the <b>Google Android</b> architecture (Slides 2.47–2.48), how are applications developed and executed?",
              "o": [
                [
                  "Apps are written in Objective-C using Cocoa Touch and run on the Mach microkernel",
                  "That describes Apple iOS."
                ],
                [
                  "Apps are developed in Java (using the Android API); Java class files are compiled to Java bytecode and then translated into an executable that runs in the Dalvik virtual machine above a modified Linux kernel",
                  "Correct. Slide 2.47 states: 'Based on Linux kernel but modified... Runtime environment includes core set of libraries and Dalvik virtual machine. Apps developed in Java plus Android API: Java class files compiled to Java bytecode then translated to executable that runs in Dalvik VM.'"
                ],
                [
                  "Apps are written in 8088 assembly and overwrite the command interpreter",
                  "That describes MS-DOS."
                ],
                [
                  "Apps run unmodified Windows Win32 binaries inside Citrix XenServer",
                  "Android runs Dalvik executables on a modified Linux kernel."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slides 2.47–2.48"
            },
            {
              "q": "In Operating-System Debugging (Slide 2.49), what is the difference between a <b>core dump</b> and a <b>crash dump</b>?",
              "o": [
                [
                  "A core dump is generated by a failure in an application (capturing process memory), whereas a crash dump is generated by an operating-system failure (capturing kernel memory)",
                  "Correct. Slide 2.49 states: 'Failure of an application can generate core dump file capturing memory of the process. Operating system failure can generate crash dump file containing kernel memory.'"
                ],
                [
                  "A core dump captures magnetic disk tracks, whereas a crash dump captures ROM firmware",
                  "Both capture memory states—process memory vs. kernel memory."
                ],
                [
                  "A core dump is used only for network profiling, whereas a crash dump is used for SYSGEN",
                  "Both are post-failure memory snapshots used for debugging."
                ],
                [
                  "There is no difference; both terms refer to clearing the terminal screen",
                  "They are distinct user-process vs. kernel memory dump files."
                ]
              ],
              "a": 0,
              "src": "Lecture 4 · Slide 2.49"
            },
            {
              "q": "What is <b>profiling</b> in the context of OS debugging and performance tuning (Slide 2.49)?",
              "o": [
                [
                  "Erasing the boot sector of a magnetic disk",
                  "That destroys the boot block."
                ],
                [
                  "Periodic sampling of the instruction pointer to look for statistical trends",
                  "Correct. Slide 2.49 defines profiling as 'periodic sampling of instruction pointer to look for statistical trends.'"
                ],
                [
                  "Creating user IDs and group IDs for password authentication",
                  "That is security and access control."
                ],
                [
                  "Translating Java bytecode into Dalvik executables",
                  "That is Android app compilation."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slide 2.49"
            },
            {
              "q": "Which interactive tools does Slide 2.50 give as examples for displaying measures of system behavior during performance tuning?",
              "o": [
                [
                  "The `top` program (UNIX) and Windows Task Manager",
                  "Correct. Slide 2.50 cites the `top` program and Windows Task Manager as examples of tools that compute and display measures of system behavior."
                ],
                [
                  "Napster and Gnutella",
                  "Napster and Gnutella are P2P file-sharing systems."
                ],
                [
                  "GRUB and ROM BIOS",
                  "GRUB and ROM BIOS are boot loaders."
                ],
                [
                  "SQLite and WebKit",
                  "SQLite and WebKit are Android database and browser libraries."
                ]
              ],
              "a": 0,
              "src": "Lecture 4 · Slide 2.50"
            },
            {
              "q": "What is the purpose of the <b>SYSGEN</b> (System Generation) program described on Slide 2.53?",
              "o": [
                [
                  "To generate random passwords for peer-to-peer nodes",
                  "SYSGEN configures an operating system for a specific hardware site."
                ],
                [
                  "To obtain information concerning the specific configuration of the hardware system and build a system-specific or system-tuned kernel",
                  "Correct. Slide 2.53 states: 'SYSGEN program obtains information concerning the specific configuration of the hardware system — Used to build system-specific compiled kernel or system-tuned.'"
                ],
                [
                  "To convert a process core dump into an application binary",
                  "Debuggers inspect core dumps; SYSGEN configures kernels."
                ],
                [
                  "To emulate an IBM PowerPC processor on an Intel x86 laptop",
                  "That is Rosetta CPU emulation."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slide 2.53"
            },
            {
              "q": "During <b>System Boot</b> (Slide 2.54), what is the two-step boot process used on many systems?",
              "o": [
                [
                  "The user manually types the kernel binary in hexadecimal into RAM, then presses Enter",
                  "Booting is automated by firmware and bootstrap loaders."
                ],
                [
                  "ROM code loads a boot block at a fixed disk location, which in turn loads the full bootstrap loader (such as GRUB) from disk to locate and start the kernel",
                  "Correct. Slide 2.54 describes the two-step process where a boot block at a fixed location is loaded by ROM code, which then loads the bootstrap loader (e.g., GRUB) from disk."
                ],
                [
                  "The OS kernel loads first from volatile RAM and then installs the ROM chip",
                  "ROM firmware must run first because RAM is volatile and uninitialized at power-on."
                ],
                [
                  "The DMA controller formats the hard disk on every reboot before loading the shell",
                  "Formatting would erase the disk; the boot block is read without formatting."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Slide 2.54"
            },
            {
              "q": "What capability does the common open-source bootstrap loader <b>GRUB</b> provide during system startup (Slide 2.54)?",
              "o": [
                [
                  "It allows selection of the kernel from multiple disks, versions, and kernel options",
                  "Correct. Slide 2.54 states: 'Common bootstrap loader, GRUB, allows selection of kernel from multiple disks, versions, kernel options.'"
                ],
                [
                  "It translates C++ source files into Java bytecode",
                  "GRUB is a boot loader, not a Java compiler."
                ],
                [
                  "It replaces the CPU's arithmetic logic unit (ALU) during floating-point operations",
                  "GRUB only runs during the boot sequence to load the kernel."
                ],
                [
                  "It provides a graphical web browser inside the Android runtime",
                  "WebKit provides the browser framework in Android."
                ]
              ],
              "a": 0,
              "src": "Lecture 4 · Slide 2.54"
            },
            {
              "q": "Why must a kernel failure (crash) often write its memory state to a dedicated raw disk area containing <b>no file system</b> before rebooting?",
              "o": [
                [
                  "Because magnetic disks cannot hold files larger than 1 KB",
                  "Disks hold gigabytes or terabytes of files."
                ],
                [
                  "Because a kernel failure in the file-system code makes it risky for the crashed kernel to try saving its state to a file on the file system",
                  "Correct. Section 2.8.1 explains that if the kernel crashes due to a bug in the file-system code, attempting to use the file system to write a dump could corrupt disk data; instead, it writes to a raw disk area with no file system and gathers the crash dump after reboot."
                ],
                [
                  "Because kernel memory is stored in nonvolatile ROM",
                  "Kernel memory is in volatile RAM and would be lost on reboot if not written to disk."
                ],
                [
                  "Because `top` and Task Manager forbid file-system access",
                  "`top` and Task Manager are user-space monitoring utilities."
                ]
              ],
              "a": 1,
              "src": "Lecture 4 · Section 2.8.1"
            }
          ]
        }
      ]
    },
    "labs": {
      "id": "labs",
      "name": "Labs",
      "unit": "Lab",
      "units": "labs",
      "prefix": "Lab ",
      "sessions": [
        {
          "n": 1,
          "code": "Lab 1",
          "title": "Lab 1: Virtualization, Open-Source OS Environments & Kernel Data Structures",
          "notes": [
            {
              "h": "Running Linux in a Virtual Machine (VMware Player & VirtualBox)",
              "pts": [
                "As described in Chapter 1 (Slide 1.57 & Section 1.12.2), you can run and explore guest operating systems such as <b>GNU/Linux</b> on a host system using a free <b>Virtual Machine Manager (VMM)</b> like <b>VMware Player</b> (free on Windows) or <b>VirtualBox</b> (open-source and free across platforms).",
                "<b>Three-step workflow to run Linux on Windows using VMware Player</b>: (1) Download and install the free <b>VMware Player</b> tool; (2) Choose a preinstalled Linux virtual machine image (<b>virtual appliance</b>) or the textbook's <b>Debian Linux</b> virtual machine image (which includes the Linux kernel source code and <code>gcc</code> development tools); (3) Boot the virtual machine within VMware Player.",
                "<b>LiveCD and LiveDVD distributions</b>: an OS image like <b>PCLinuxOS</b> (or <b>PCLinuxOS Supergamer DVD</b> with graphics drivers and games) can be booted and run directly from a CD-ROM/DVD without installing onto the system's hard disk; rebooting resets the machine to its installed host OS."
              ]
            },
            {
              "h": "Exploring Open-Source Kernel Source Trees (FreeBSD, Darwin & Illumos)",
              "pts": [
                "<b>BSD UNIX</b> started in 1978 at UC Berkeley (UCB) as a derivative of AT&T UNIX; after AT&T lawsuit delays, the fully functional open-source <b>4.4BSD-lite</b> was released in 1994, spawning <b>FreeBSD, NetBSD, OpenBSD, and Dragonfly BSD</b>.",
                "In a FreeBSD virtual machine, the full system source code comes stored in <code>/usr/src/</code>, the kernel source code resides in <code>/usr/src/sys</code>, and the virtual memory implementation resides in <code>/usr/src/sys/vm</code>.",
                "<b>Mac OS X Darwin (<code>xnu</code>)</b>: Apple's open-source kernel component is based on BSD UNIX and Mach; every release's open-source package beginning with <code>xnu</code> is posted at <code>opensource.apple.com</code>.",
                "<b>Solaris / OpenSolaris / Project Illumos</b>: Sun Microsystems originally built <b>SunOS</b> on BSD UNIX, moved to AT&T System V UNIX for <b>Solaris</b> in 1991, and open-sourced most of it in 2005 as <b>OpenSolaris</b>, which the community expanded into <b>Project Illumos</b>."
              ],
              "table": [
                [
                  "Open-Source OS / Kernel",
                  "Key Lineage & License",
                  "Source Path / Package"
                ],
                [
                  "GNU/Linux",
                  "Linus Torvalds (1991) kernel + GNU tools; Copyleft GNU GPL",
                  "Included in textbook Debian VM (`/usr/src/linux`) + `<linux/*.h>`"
                ],
                [
                  "FreeBSD",
                  "UC Berkeley 4.4BSD-lite (1994)",
                  "System source in `/usr/src/`; kernel in `/usr/src/sys`; VM in `/usr/src/sys/vm`"
                ],
                [
                  "Apple Darwin",
                  "BSD UNIX + Mach microkernel; open-source core of Mac OS X",
                  "Package name begins with `xnu` on `opensource.apple.com`"
                ],
                [
                  "OpenSolaris / Illumos",
                  "SunOS (BSD) → Solaris (AT&T System V, 1991) → OpenSolaris (2005)",
                  "Community-maintained under Project Illumos"
                ]
              ]
            },
            {
              "h": "Linux Kernel Data Structure Headers & Resource Bitmaps",
              "pts": [
                "The Linux kernel provides production implementations of core data structures directly inside the kernel source tree:",
                "1. <b>Circular Doubly Linked List</b>: defined in <code>&lt;linux/list.h&gt;</code> and <code>&lt;linux/types.h&gt;</code> using an embedded <code>struct list_head</code>.",
                "2. <b>Queue (FIFO)</b>: known in Linux as <b><code>kfifo</code></b>, implemented in <code>kernel/kfifo.c</code>.",
                "3. <b>Balanced Binary Search Tree</b>: implemented using <b>red-black trees</b> in <code>&lt;linux/rbtree.h&gt;</code> (used by the Linux Completely Fair Scheduler [CFS] to guarantee <code>O(lg n)</code> worst-case operations).",
                "4. <b>Bitmap Resource Status Exercise</b>: a bitmap is a string of <code>n</code> bits where bit <code>i</code> indicates the status of resource <code>i</code> (<code>0</code> = available, <code>1</code> = unavailable). For the 9-bit bitmap <code>001011101</code> (indexed 0 to 8 from left to right): <b>resources 0, 1, 3, and 7 are available (0)</b>, while <b>resources 2, 4, 5, 6, and 8 are unavailable (1)</b>."
              ],
              "code": "/* Linux Kernel Data Structure Source Locations (Section 1.10) */\n#include <linux/list.h>   /* Circular, doubly linked list (struct list_head) */\n#include <linux/rbtree.h> /* Red-black balanced binary search tree — O(lg n) */\n/* kernel/kfifo.c        -> Linux kernel FIFO queue implementation (kfifo)  */\n\n/* Bitmap Example (Section 1.10.4): 0 = available, 1 = unavailable */\n/* Index:  0 1 2 3 4 5 6 7 8                                       */\n/* Bits:   0 0 1 0 1 1 1 0 1                                       */\n/* Available (0):   resources 0, 1, 3, 7                           */\n/* Unavailable (1): resources 2, 4, 5, 6, 8                        */"
            },
            {
              "h": "Lab Analysis: Privileged Instructions & Hardware Protection (Practice Exercise 1.6)",
              "pts": [
                "In a dual-mode CPU (<b>kernel mode = 0</b>, <b>user mode = 1</b>), any instruction that can alter timer protection, bypass memory isolation, corrupt device state, or disable interrupts <b>must be privileged</b>.",
                "<b>Privileged instructions (executable ONLY in kernel mode)</b>: (a) <b>Set value of timer</b> (otherwise a user process could prevent timer interrupts and hog the CPU); (c) <b>Clear memory</b> (outside the user process's own space); (e) <b>Turn off interrupts</b> (otherwise a process could never be preempted); (f) <b>Modify entries in the device-status table</b>; (g) <b>Switch from user to kernel mode</b> (direct mode-bit manipulation must be restricted; user programs can only request a transition via a regulated trap/system call); (h) <b>Access I/O device</b> directly.",
                "<b>Non-privileged instructions (safe in user mode)</b>: (b) <b>Read the clock</b> (reading the time does not harm the system); (d) <b>Issue a trap instruction</b> (user programs intentionally execute traps to invoke system calls)."
              ]
            }
          ],
          "cards": [
            [
              "LiveCD / LiveDVD (e.g., PCLinuxOS)",
              "An operating system that boots and runs directly from optical media in RAM without being installed on the hard disk."
            ],
            [
              "FreeBSD Kernel & Virtual Memory Source Paths",
              "System source is in `/usr/src/`, kernel source is in `/usr/src/sys`, and virtual memory code is in `/usr/src/sys/vm`."
            ],
            [
              "Apple Darwin Kernel Package Name",
              "Begins with `xnu` (available in open-source form at `opensource.apple.com`)."
            ],
            [
              "Linux Kernel Linked-List Header",
              "`<linux/list.h>` (provides the circular doubly linked list used throughout the Linux kernel)."
            ],
            [
              "Linux Kernel Queue Implementation (`kfifo`)",
              "Found in `kernel/kfifo.c` inside the Linux kernel source directory."
            ],
            [
              "Linux Kernel Balanced BST Header",
              "`<linux/rbtree.h>` (provides red-black trees with O(lg n) worst-case search, used in CPU scheduling)."
            ],
            [
              "Bitmap `001011101` Resource Status",
              "With 0 = available and 1 = unavailable: resources 0, 1, 3, 7 are available; resources 2, 4, 5, 6, 8 are unavailable."
            ],
            [
              "Privileged vs. Unprivileged Instructions (Ex. 1.6)",
              "Privileged: set timer, clear memory, turn off interrupts, modify device-status table, switch to kernel mode, access I/O device. Unprivileged: read the clock, issue a trap instruction."
            ]
          ],
          "qa": [
            [
              "Which of the following instructions should be privileged, and why? (a) Set value of timer, (b) Read the clock, (c) Clear memory, (d) Issue a trap instruction, (e) Turn off interrupts, (f) Modify entries in device-status table, (g) Switch from user to kernel mode, (h) Access I/O device.",
              "<b>Privileged (kernel mode only)</b>: <b>(a)</b> Set value of timer, <b>(c)</b> Clear memory, <b>(e)</b> Turn off interrupts, <b>(f)</b> Modify entries in device-status table, <b>(g)</b> Switch from user to kernel mode, and <b>(h)</b> Access I/O device—because allowing a user program to execute any of these directly would let it monopolize the CPU, corrupt other processes or kernel memory, or hijack I/O.<br><b>Non-privileged (allowed in user mode)</b>: <b>(b)</b> Read the clock (harmless read operation) and <b>(d)</b> Issue a trap instruction (the standard mechanism for a user program to invoke an OS system call).",
              "Chapter 1 · Practice Exercise 1.6"
            ],
            [
              "Where are the linked-list, FIFO queue, and balanced binary search tree data structures located in the Linux kernel source code?",
              "1. <b>Linked list</b>: <code>&lt;linux/list.h&gt;</code> (circular doubly linked list).<br>2. <b>FIFO queue</b>: known as <code>kfifo</code>, implemented in <code>kernel/kfifo.c</code>.<br>3. <b>Balanced binary search tree</b>: implemented using red-black trees in <code>&lt;linux/rbtree.h&gt;</code>.",
              "Chapter 1 · Section 1.10"
            ],
            [
              "In FreeBSD, where is the kernel source code stored, and where would you look to examine its virtual memory implementation?",
              "In a FreeBSD distribution, the system source code is stored in <code>/usr/src/</code>, the kernel source code is in <code>/usr/src/sys</code>, and the virtual memory implementation files are in <code>/usr/src/sys/vm</code>.",
              "Chapter 1 · Section 1.12.3"
            ],
            [
              "Given the 9-bit resource bitmap `001011101` (where 0 = available and 1 = unavailable), which resources are available and which are unavailable?",
              "Indexing from 0 on the left: bits 0, 1, 3, and 7 are <code>0</code>, so <b>resources 0, 1, 3, and 7 are available</b>. Bits 2, 4, 5, 6, and 8 are <code>1</code>, so <b>resources 2, 4, 5, 6, and 8 are unavailable</b>.",
              "Chapter 1 · Section 1.10.4"
            ]
          ],
          "quiz": [
            {
              "q": "In Practice Exercise 1.6, which two instructions from the list are <b>safe to execute in user mode</b> (i.e., do NOT need to be privileged)?",
              "o": [
                [
                  "Set value of timer and Turn off interrupts",
                  "Both must be privileged so a user program cannot disable preemption."
                ],
                [
                  "Read the clock and Issue a trap instruction",
                  "Correct. Reading the clock does not modify system state, and issuing a trap instruction is how a user-mode program requests an OS system call."
                ],
                [
                  "Clear memory and Access I/O device",
                  "Both must be privileged to protect memory and I/O devices."
                ],
                [
                  "Modify entries in the device-status table and Switch directly from user to kernel mode",
                  "Both must be privileged to protect kernel data structures and mode isolation."
                ]
              ],
              "a": 1,
              "src": "Lab 1 · Practice Exercise 1.6"
            },
            {
              "q": "In the Linux kernel source tree, what is the name of the kernel FIFO queue implementation, and which header provides the red-black balanced binary search tree?",
              "o": [
                [
                  "Queue: `Win32Queue`; Tree: `<windows/bst.h>`",
                  "Those are not Linux kernel components."
                ],
                [
                  "Queue: `kfifo` (in `kernel/kfifo.c`); Tree: `<linux/rbtree.h>`",
                  "Correct. Section 1.10 ('Linux Kernel Data Structures') states that a queue in Linux is known as `kfifo` (`kernel/kfifo.c`) and balanced BSTs use red-black trees in `<linux/rbtree.h>`."
                ],
                [
                  "Queue: `dtrace_queue`; Tree: `<solaris/avl.h>`",
                  "Those are Solaris terms, not Linux kernel structures."
                ],
                [
                  "Queue: `rom_fifo`; Tree: `<grub/tree.h>`",
                  "Not Linux kernel data structures."
                ]
              ],
              "a": 1,
              "src": "Lab 1 · Section 1.10"
            },
            {
              "q": "In a FreeBSD system, which directory contains the kernel's virtual memory implementation source files?",
              "o": [
                [
                  "`C:\\Windows\\System32`",
                  "That is a Windows directory."
                ],
                [
                  "`/usr/src/sys/vm`",
                  "Correct. Section 1.12.3 states that FreeBSD source is in `/usr/src/`, kernel source is in `/usr/src/sys`, and virtual memory implementation code is in `/usr/src/sys/vm`."
                ],
                [
                  "`/boot/grub/menu.lst`",
                  "That is a GRUB configuration path."
                ],
                [
                  "`/dalvik/bytecode/vm`",
                  "Dalvik is Android's virtual machine."
                ]
              ],
              "a": 1,
              "src": "Lab 1 · Section 1.12.3"
            },
            {
              "q": "Consider the 9-bit resource bitmap <code>001011101</code> where <code>0</code> indicates available and <code>1</code> indicates unavailable (0-indexed from left). Which resources are <b>available</b>?",
              "o": [
                [
                  "Resources 2, 4, 5, 6, and 8",
                  "Those positions hold `1`, which means unavailable."
                ],
                [
                  "Resources 0, 1, 3, and 7",
                  "Correct. Section 1.10.4 shows that in `001011101`, indices 0, 1, 3, and 7 contain `0` (available), while indices 2, 4, 5, 6, and 8 contain `1` (unavailable)."
                ],
                [
                  "Only resource 0",
                  "Indices 1, 3, and 7 also contain `0`."
                ],
                [
                  "All 9 resources",
                  "Five of the bits are `1` (unavailable)."
                ]
              ],
              "a": 1,
              "src": "Lab 1 · Section 1.10.4"
            },
            {
              "q": "What is a <b>LiveCD / LiveDVD</b> Linux distribution (such as PCLinuxOS)?",
              "o": [
                [
                  "A distribution that permanently formats all magnetic disks as soon as the CD is inserted",
                  "A LiveCD runs without touching or formatting the hard disk."
                ],
                [
                  "An operating system that can be booted and run directly from a CD-ROM or DVD without being installed on a system's hard disk",
                  "Correct. Section 1.12.2 defines a LiveCD/LiveDVD as an OS that boots and runs from optical media without hard-disk installation, resetting to the host OS upon reboot."
                ],
                [
                  "A closed-source Windows service pack",
                  "PCLinuxOS is an open-source GNU/Linux LiveCD."
                ],
                [
                  "A hardware DMA controller chip",
                  "It is a bootable software distribution."
                ]
              ],
              "a": 1,
              "src": "Lab 1 · Section 1.12.2"
            },
            {
              "q": "What does the GNU General Public License (GPL) require when distributing binaries of GPL-licensed software?",
              "o": [
                [
                  "That source code be kept secret and encrypted with DRM",
                  "GPL is the opposite of closed-source DRM."
                ],
                [
                  "That the source code be distributed with any binaries and any changes made to the source code be released under the same GPL license",
                  "Correct. Section 1.12.1 states: 'Fundamentally, GPL requires that the source code be distributed with any binaries and that any changes made to the source code be released under the same GPL license.'"
                ],
                [
                  "That the software only be executed on IBM mainframes",
                  "GPL software like Linux runs on virtually all architectures."
                ],
                [
                  "That users pay a per-system-call royalty to AT&T",
                  "GPL codifies free software ('copyleft') with no per-call royalties."
                ]
              ],
              "a": 1,
              "src": "Lab 1 · Section 1.12.1"
            },
            {
              "q": "InApple's open-source Darwin kernel repository (`opensource.apple.com`), what prefix begins the name of the package containing the Mac OS X kernel?",
              "o": [
                [
                  "`ntoskrnl`",
                  "That is the Windows NT kernel executable."
                ],
                [
                  "`xnu`",
                  "Correct. Section 1.12.3 states: 'The name of the package that contains the kernel begins with \"xnu.\"'"
                ],
                [
                  "`msdos.sys`",
                  "That is an MS-DOS system file."
                ],
                [
                  "`dalvik.ko`",
                  "Dalvik is the Android runtime VM."
                ]
              ],
              "a": 1,
              "src": "Lab 1 · Section 1.12.3"
            },
            {
              "q": "When DMA controller transfers data while the CPU executes other programs (Exercise 1.20c), what form of interference can occur between the DMA controller and the CPU?",
              "o": [
                [
                  "The DMA controller overwrites the CPU's program counter with random values",
                  "DMA transfers data cleanly to its assigned memory buffer."
                ],
                [
                  "Both the DMA controller and the CPU compete for access to the common memory bus (cycle stealing), momentarily delaying CPU memory accesses",
                  "Correct. Slide 1.11 and Exercise 1.20c explain that CPUs and device/DMA controllers connect through a common bus and compete for memory cycles."
                ],
                [
                  "The DMA controller switches the CPU permanently into user mode",
                  "DMA does not alter the CPU mode bit."
                ],
                [
                  "The DMA controller deletes the interrupt vector table",
                  "DMA uses its interrupt line normally when the block finishes."
                ]
              ],
              "a": 1,
              "src": "Lab 1 · Slide 1.11 & Exercise 1.20"
            }
          ]
        },
        {
          "n": 2,
          "code": "Lab 2",
          "title": "Lab 2: UNIX Shells, Standard C Library, POSIX read() API & System-Call Tracing",
          "notes": [
            {
              "h": "Single-Tasking (MS-DOS) vs. Multitasking (FreeBSD) Process Execution",
              "pts": [
                "<b>MS-DOS (Single-Tasking Execution — Figure 2.9)</b>: invokes a command interpreter at startup. Because MS-DOS is single-tasking, running a program does <b>not create a new process</b>; instead, it loads the program into memory <b>writing over most of the command interpreter itself</b> to give the program maximum memory. When the program terminates or traps, the small resident portion of the command interpreter reloads the rest of the interpreter from disk and makes the error code available.",
                "<b>FreeBSD / UNIX (Multitasking Execution — Figure 2.10)</b>: when a user logs on, their chosen shell (`sh`, `csh`, `bash`, `ksh`) runs. To start a new process, the shell executes a <b><code>fork()</code></b> system call, and the selected program is loaded into memory via an <b><code>exec()</code></b> system call.",
                "Depending on how the command was issued, the shell either <b>waits</b> (`wait()`) for the process to finish or runs the process <b>\"in the background\"</b> (immediately requesting another command while background I/O goes through files or a GUI). When done, the process calls <b><code>exit()</code></b> returning status `0` (normal) or a nonzero error code."
              ],
              "code": "/* FreeBSD / UNIX Shell Process Execution Sequence (Section 2.4.1) */\npid_t pid = fork();          /* 1. Create a new child process */\nif (pid == 0) {\n    execvp(cmd, argv);       /* 2. Load and execute program in child */\n    exit(1);                 /* If exec fails, exit with nonzero error */\n} else if (!background) {\n    wait(&status);           /* 3a. Foreground: wait for child to finish */\n}                            /* 3b. Background: prompt for next command immediately */"
            },
            {
              "h": "Standard C Library (`libc`) & the `printf()` → `write()` System Call Path",
              "pts": [
                "The standard C library (<b><code>libc</code></b>) provides the system-call interface for C programs on UNIX and Linux.",
                "When a C program invokes <code>printf(\"Greetings\");</code> in <b>user mode</b> (<code>mode bit = 1</code>), the C library intercepts the call, formats the string, and invokes the <b><code>write()</code></b> system call.",
                "The <code>write()</code> call traps into <b>kernel mode</b> (<code>mode bit = 0</code>), where the kernel's <code>write()</code> handler transfers the characters to the output device/file. The kernel returns the byte count/status to <code>libc</code> in user mode, which passes the result back to <code>main()</code>."
              ],
              "code": "#include <stdio.h>\n\nint main(void)\n{\n    /* User mode: calls printf() in standard C library (libc) */\n    /* libc invokes write() system call -> traps to Kernel Mode (bit = 0) */\n    /* Kernel executes write() -> returns status to user mode (bit = 1) */\n    printf(\"Greetings\\n\");\n    return 0;\n}"
            },
            {
              "h": "POSIX `read()` API Specification (`man read`)",
              "pts": [
                "On UNIX/Linux systems, you can inspect any POSIX API function from the command line by running <b><code>man read</code></b>.",
                "Programs using <code>read()</code> must include the <b><code>&lt;unistd.h&gt;</code></b> header file, which defines the <code>ssize_t</code> and <code>size_t</code> data types.",
                "<b>Three parameters of <code>ssize_t read(int fd, void *buf, size_t count)</code></b>: (1) <code>int fd</code> — the file descriptor to be read; (2) <code>void *buf</code> — pointer to the memory buffer where data will be read into; (3) <code>size_t count</code> — the maximum number of bytes to read into the buffer.",
                "<b>Return values of <code>read()</code></b>: on success, returns the <b>number of bytes read</b>; a return value of <b><code>0</code> indicates End of File (EOF)</b>; if an error occurs, <code>read()</code> returns <b><code>-1</code></b>."
              ],
              "code": "#include <unistd.h>\n\n/* POSIX read() API prototype (from `man read`) */\nssize_t read(int fd, void *buf, size_t count);\n\n/* Return values:\n *   > 0 : number of bytes successfully read into buf\n *     0 : End of File (EOF) reached\n *    -1 : error occurred (errno is set)\n */"
            },
            {
              "h": "Windows vs. UNIX System Calls & Programming Problem 2.26 (`FileCopy` & `strace`/`dtrace`)",
              "pts": [
                "Slide 2.24 & Page 68 map the exact Windows Win32 API calls to their UNIX/POSIX counterparts across all six system-call categories:",
                "<b>File-Copy System-Call Sequence (Figure 2.5 & Problem 2.26)</b>: (1) Acquire input file name (write prompt to screen, accept input); (2) Acquire output file name (write prompt, accept input); (3) Open input file—if file doesn't exist or is access-protected, print message and abort; (4) Create output file—if file already exists, abort (or delete and recreate / prompt user); (5) Loop: <code>read()</code> from input file and <code>write()</code> to output file until read fails (EOF or hardware parity/disk-full error); (6) Close both files, write completion message to screen, and terminate normally.",
                "<b>Tracing System Calls (Problem 2.26)</b>: once compiled, you can trace every system call executed by your file-copy program using <b><code>strace</code></b> on Linux systems or <b><code>dtrace</code></b> on Solaris and Mac OS X systems."
              ],
              "table": [
                [
                  "Category",
                  "Windows (Win32 API)",
                  "UNIX / Linux (POSIX)"
                ],
                [
                  "Process Control",
                  "`CreateProcess()`, `ExitProcess()`, `WaitForSingleObject()`",
                  "`fork()`, `exit()`, `wait()`"
                ],
                [
                  "File Manipulation",
                  "`CreateFile()`, `ReadFile()`, `WriteFile()`, `CloseHandle()`",
                  "`open()`, `read()`, `write()`, `close()`"
                ],
                [
                  "Device Manipulation",
                  "`SetConsoleMode()`, `ReadConsole()`, `WriteConsole()`",
                  "`ioctl()`, `read()`, `write()`"
                ],
                [
                  "Information Maintenance",
                  "`GetCurrentProcessID()`, `SetTimer()`, `Sleep()`",
                  "`getpid()`, `alarm()`, `sleep()`"
                ],
                [
                  "Communication",
                  "`CreatePipe()`, `CreateFileMapping()`, `MapViewOfFile()`",
                  "`pipe()`, `shm_open()`, `mmap()`"
                ],
                [
                  "Protection",
                  "`SetFileSecurity()`, `InitializeSecurityDescriptor()`, `SetSecurityDescriptorGroup()`",
                  "`chmod()`, `umask()`, `chown()`"
                ]
              ]
            }
          ],
          "cards": [
            [
              "MS-DOS Program Execution",
              "Single-tasking: overwrites most of the command interpreter in memory to give the program maximum space, then reloads the interpreter from disk when the program finishes."
            ],
            [
              "FreeBSD / UNIX Program Execution",
              "Multitasking: the shell calls `fork()` to create a new process, the child calls `exec()` to load the program, and the shell either calls `wait()` or runs it in the background."
            ],
            [
              "Standard C Library (`libc`) Role in `printf()`",
              "`libc` intercepts `printf()` in user mode, invokes the `write()` system call in kernel mode, and returns the status to the C program."
            ],
            [
              "Header & Prototype for POSIX `read()`",
              "`#include <unistd.h>` — `ssize_t read(int fd, void *buf, size_t count)`."
            ],
            [
              "Return Values of POSIX `read()`",
              "Positive integer = number of bytes read; `0` = End of File (EOF); `-1` = error."
            ],
            [
              "Windows vs. UNIX Process Control Calls",
              "`CreateProcess()` ↔ `fork()`; `ExitProcess()` ↔ `exit()`; `WaitForSingleObject()` ↔ `wait()`."
            ],
            [
              "Windows vs. UNIX File Manipulation Calls",
              "`CreateFile()` ↔ `open()`; `ReadFile()` ↔ `read()`; `WriteFile()` ↔ `write()`; `CloseHandle()` ↔ `close()`."
            ],
            [
              "Windows vs. UNIX Shared Memory & Pipe Calls",
              "`CreatePipe()` ↔ `pipe()`; `CreateFileMapping()` ↔ `shm_open()`; `MapViewOfFile()` ↔ `mmap()`."
            ],
            [
              "Windows vs. UNIX Protection Calls",
              "`SetFileSecurity()` ↔ `chmod()`; `InitializeSecurityDescriptor()` ↔ `umask()`; `SetSecurityDescriptorGroup()` ↔ `chown()`."
            ],
            [
              "Linux & Solaris System-Call Tracing Utilities",
              "Linux uses `strace`; Solaris and Mac OS X use `dtrace`."
            ]
          ],
          "qa": [
            [
              "What system calls have to be executed by a command interpreter or shell in order to start a new process on a multitasking UNIX system like FreeBSD?",
              "First, the shell executes the <b><code>fork()</code></b> system call to create a new child process. Next, the child process executes an <b><code>exec()</code></b> system call to load the selected program binary into memory and begin execution. The shell then either executes <b><code>wait()</code></b> to wait for the process to finish or continues running while the child executes in the background until it terminates with <b><code>exit()</code></b>.",
              "Chapter 2 · Practice Exercise 2.6 & Section 2.4.1"
            ],
            [
              "How does single-tasking MS-DOS run a program differently from multitasking FreeBSD?",
              "Because MS-DOS is single-tasking, it does not create a new process; instead, it loads the program into memory <b>writing over most of the command interpreter itself</b> to maximize available memory, and reloads the command interpreter from disk after the program terminates. FreeBSD keeps the shell in memory and spawns a separate concurrent child process via <code>fork()</code> and <code>exec()</code>.",
              "Chapter 2 · Figures 2.9 & 2.10"
            ],
            [
              "Explain the parameters and return values of the POSIX `read()` function (`#include <unistd.h>`).",
              "Prototype: <code>ssize_t read(int fd, void *buf, size_t count)</code>.<br>• <code>fd</code>: integer file descriptor to read from.<br>• <code>buf</code>: pointer to the buffer where read data will be stored.<br>• <code>count</code>: maximum number of bytes to read.<br><b>Return value</b>: number of bytes read on success, <code>0</code> when End of File (EOF) is reached, or <code>-1</code> if an error occurs.",
              "Chapter 2 · Section 2.3 (Page 64)"
            ],
            [
              "Outline the complete sequence of system calls required to copy the contents of a source file to a destination file (`FileCopy`, Figure 2.5), and name the utilities used to trace these calls on Linux and Solaris/Mac OS X.",
              "1. Write prompts and read the input and output file names.<br>2. Call <code>open()</code> on the input file (if it does not exist or is protected, print an error and abort).<br>3. Call <code>create()</code> / <code>open()</code> for the output file (if it already exists, abort or replace).<br>4. Loop: call <code>read()</code> from the input file and <code>write()</code> to the output file until <code>read()</code> returns 0 (EOF) or an error.<br>5. Call <code>close()</code> on both files, write a completion message, and terminate normally.<br>System calls are traced using <b><code>strace</code></b> on Linux and <b><code>dtrace</code></b> on Solaris and Mac OS X.",
              "Chapter 2 · Figure 2.5 & Programming Problem 2.26"
            ]
          ],
          "quiz": [
            {
              "q": "In a multitasking UNIX system like FreeBSD, which pair of system calls does the shell use to create a new process and load the requested program into memory?",
              "o": [
                [
                  "`CreateProcess()` and `WaitForSingleObject()`",
                  "Those are Windows Win32 API functions."
                ],
                [
                  "`fork()` followed by `exec()`",
                  "Correct. Practice Exercise 2.6 and Section 2.4.1 explain that the shell executes `fork()` to create a new process and `exec()` to load the selected program into memory."
                ],
                [
                  "`malloc()` followed by `free()`",
                  "Those are user-space heap allocation library functions."
                ],
                [
                  "`chmod()` followed by `chown()`",
                  "Those are file-protection system calls."
                ]
              ],
              "a": 1,
              "src": "Lab 2 · Section 2.4.1"
            },
            {
              "q": "Why does MS-DOS reload most of its command interpreter from disk after a user program finishes executing?",
              "o": [
                [
                  "Because MS-DOS is a single-tasking OS that loads the user program over most of the command interpreter in memory to give the program as much memory as possible",
                  "Correct. Section 2.4.1 (Figure 2.9) explains that MS-DOS overwrites most of its command interpreter when running a program and reloads it from disk upon termination."
                ],
                [
                  "Because MS-DOS stores its command interpreter in volatile CPU registers",
                  "The command interpreter is loaded into RAM from disk."
                ],
                [
                  "Because MS-DOS uses `fork()` to delete the shell process",
                  "MS-DOS is single-tasking and does not have `fork()`."
                ],
                [
                  "Because the Mach microkernel purges user space after every message",
                  "MS-DOS does not use a Mach microkernel."
                ]
              ],
              "a": 0,
              "src": "Lab 2 · Figure 2.9"
            },
            {
              "q": "In the POSIX API (`#include <unistd.h>`), what do return values of <code>0</code> and <code>-1</code> from <code>ssize_t read(int fd, void *buf, size_t count)</code> signify?",
              "o": [
                [
                  "`0` indicates an error; `-1` indicates End of File (EOF)",
                  "This reverses the `0` and `-1` return codes."
                ],
                [
                  "`0` indicates End of File (EOF); `-1` indicates that an error occurred",
                  "Correct. Section 2.3 ('Example of Standard API', page 64) states: 'On a successful read, the number of bytes read is returned. A return value of 0 indicates end of file. If an error occurs, read() returns -1.'"
                ],
                [
                  "Both `0` and `-1` indicate that `count` bytes were successfully read",
                  "A positive return value indicates the number of bytes read."
                ],
                [
                  "`0` switches the CPU to kernel mode; `-1` switches to user mode",
                  "Mode transitions happen inside the system call, not via the return value."
                ]
              ],
              "a": 1,
              "src": "Lab 2 · Section 2.3 (Page 64)"
            },
            {
              "q": "Which UNIX/POSIX system call corresponds to the Windows Win32 API function <code>WaitForSingleObject()</code>?",
              "o": [
                [
                  "`fork()`",
                  "`fork()` corresponds to `CreateProcess()`."
                ],
                [
                  "`wait()`",
                  "Correct. The table on Slide 2.24 / Page 68 maps Windows `WaitForSingleObject()` to UNIX `wait()` under Process Control."
                ],
                [
                  "`ioctl()`",
                  "`ioctl()` corresponds to `SetConsoleMode()`."
                ],
                [
                  "`mmap()`",
                  "`mmap()` corresponds to `MapViewOfFile()`."
                ]
              ],
              "a": 1,
              "src": "Lab 2 · Slide 2.24"
            },
            {
              "q": "Which UNIX/POSIX system calls correspond to the Windows shared-memory functions <code>CreateFileMapping()</code> and <code>MapViewOfFile()</code>?",
              "o": [
                [
                  "`open()` and `close()`",
                  "Those correspond to `CreateFile()` and `CloseHandle()`."
                ],
                [
                  "`shm_open()` and `mmap()`",
                  "Correct. The table on Slide 2.24 / Page 68 maps `CreateFileMapping()` to `shm_open()` and `MapViewOfFile()` to `mmap()` under Communication."
                ],
                [
                  "`chmod()` and `umask()`",
                  "Those correspond to `SetFileSecurity()` and `InitializeSecurityDescriptor()`."
                ],
                [
                  "`getpid()` and `alarm()`",
                  "Those correspond to `GetCurrentProcessID()` and `SetTimer()`."
                ]
              ],
              "a": 1,
              "src": "Lab 2 · Slide 2.24"
            },
            {
              "q": "Which UNIX/POSIX system calls correspond to the Windows Protection functions <code>SetFileSecurity()</code>, <code>InitializeSecurityDescriptor()</code>, and <code>SetSecurityDescriptorGroup()</code>?",
              "o": [
                [
                  "`chmod()`, `umask()`, and `chown()`",
                  "Correct. Slide 2.24 / Page 68 maps those three Windows Protection API calls directly to `chmod()`, `umask()`, and `chown()`."
                ],
                [
                  "`read()`, `write()`, and `ioctl()`",
                  "Those are File and Device manipulation calls."
                ],
                [
                  "`fork()`, `exit()`, and `wait()`",
                  "Those are Process Control calls."
                ],
                [
                  "`pipe()`, `shm_open()`, and `mmap()`",
                  "Those are Communication calls."
                ]
              ],
              "a": 0,
              "src": "Lab 2 · Slide 2.24"
            },
            {
              "q": "In Programming Problem 2.26, which command-line utility is used on <b>Linux</b> systems to trace the system calls executed by a running program?",
              "o": [
                [
                  "`lsmod`",
                  "`lsmod` lists currently loaded kernel modules."
                ],
                [
                  "`strace`",
                  "Correct. Programming Problem 2.26 states: 'Linux systems provide the strace utility, and Solaris and Mac OS X systems use the dtrace command.'"
                ],
                [
                  "`mkfs`",
                  "`mkfs` formats a file system."
                ],
                [
                  "`rmmod`",
                  "`rmmod` removes a kernel module."
                ]
              ],
              "a": 1,
              "src": "Lab 2 · Programming Problem 2.26"
            },
            {
              "q": "When a FreeBSD shell runs a command \"in the background,\" why can the background process NOT receive input directly from the keyboard?",
              "o": [
                [
                  "Because the keyboard hardware is physically disconnected during multitasking",
                  "The keyboard remains connected and active."
                ],
                [
                  "Because the foreground shell is already using the keyboard resource to accept the user's next command, so the background process must perform I/O through files or a GUI",
                  "Correct. Section 2.4.1 (page 71) explains that when a process runs in the background, the shell immediately requests another command and uses the keyboard, so background I/O is done through files or a GUI interface."
                ],
                [
                  "Because `fork()` disables all file descriptors in the child process",
                  "`fork()` inherits open file descriptors."
                ],
                [
                  "Because background processes run in ROM firmware",
                  "Background processes run in RAM in user mode."
                ]
              ],
              "a": 1,
              "src": "Lab 2 · Section 2.4.1"
            }
          ]
        },
        {
          "n": 3,
          "code": "Lab 3",
          "title": "Lab 3: OS Debugging, Dynamic Kernel Tracing (DTrace), SYSGEN & GRUB Boot",
          "notes": [
            {
              "h": "Failure Analysis: Core Dumps, Kernel Crash Dumps & Kernighan's Law",
              "pts": [
                "<b>User-Level Process Debugging</b>: when an application fails, the OS writes error info to a log file and can take a <b>core dump</b>—a capture of the process's memory stored in a file for later inspection by a debugger.",
                "<b>Kernel Crash Dump</b>: a failure in the kernel is called a <b>crash</b>. Because a kernel failure inside file-system code makes it risky to write directly to a file on the file system before rebooting, the kernel saves its memory state to a dedicated <b>raw section of disk set aside with no file system</b>. When the system reboots, a recovery process gathers the data from that raw disk area and writes it to a <b>crash dump</b> file inside the file system.",
                "<b>Kernighan's Law (Page 87)</b>: <i>\"Debugging is twice as hard as writing the code in the first place. Therefore, if you write the code as cleverly as possible, you are, by definition, not smart enough to debug it.\"</i>"
              ]
            },
            {
              "h": "Performance Tuning (`top`, Task Manager), Single-Step Traps & Statistical Profiling",
              "pts": [
                "<b>Interactive Bottleneck Monitoring</b>: UNIX provides the <b><code>top</code></b> command to display system resource usage and a sorted list of the top resource-consuming processes; Windows provides the <b>Windows Task Manager</b> (showing applications, processes, CPU/memory usage, and networking statistics).",
                "<b>Single-Step Mode vs. Statistical Time Profiling</b>: microprocessors provide a <b>single-step</b> CPU mode that executes a trap after every instruction for a debugger, whereas <b>time profiling</b> uses regular timer interrupts to record the value of the <b>program counter (instruction pointer)</b> at each tick—building a statistical picture of where the program spends its execution time without halting multiuser kernels."
              ]
            },
            {
              "h": "Dynamic Kernel Tracing with DTrace & Writing D Scripts",
              "pts": [
                "<b>DTrace (Solaris 10, FreeBSD, Mac OS X)</b> dynamically adds probes to a running production system—both in user processes (<code>U</code>) and in the kernel (<code>K</code>)—with <b>zero performance impact when not enabled</b> and proportional, safe impact while enabled.",
                "<b>DTrace Architecture</b>: composed of a safe bytecode <b>compiler</b> (which forbids loops and unauthorized kernel state modifications; restricted to root/DTrace-privileged users), a framework, <b>providers</b> that create probes (stored in a kernel hash table hashed by name and indexed by unique probe ID), <b>consumers</b>, and <b>Enabling Control Blocks (ECBs)</b> containing optional filter predicates.",
                "When a probe is enabled, the target instruction is dynamically rewritten to call <code>dtrace_probe(probe_identifier)</code>; when the consumer terminates, its ECBs are removed and the original machine code is restored completely.",
                "<b>Scheduler CPU-Time D Script (<code>sched.d</code>)</b>: the D script below enables scheduler probes (<code>sched:::on-cpu</code> and <code>sched:::off-cpu</code>) with predicate <code>uid == 101</code> to record and sum the exact CPU time in nanoseconds spent by each process belonging to user ID 101."
              ],
              "code": "/* Solaris / FreeBSD / Mac OS X DTrace Script: sched.d (Section 2.8.3) */\n/* Run with: # dtrace -s sched.d                                       */\n\nsched:::on-cpu\nuid == 101\n{\n    self->ts = timestamp;\n}\n\nsched:::off-cpu\nself->ts\n{\n    @time[execname] = sum(timestamp - self->ts);\n    self->ts = 0;\n}"
            },
            {
              "h": "System Generation (`SYSGEN`) & Two-Stage `GRUB` Boot Configuration",
              "pts": [
                "<b>Five Hardware & Site Questions Answered by <code>SYSGEN</code> (Section 2.9)</b>: (1) What CPU(s) and instruction-set options are installed? (2) How will the boot disk be formatted and partitioned? (3) How much memory is available? (Some systems determine this themselves by referencing memory locations sequentially until an <b>\"illegal address\" fault</b> is generated!) (4) What devices are available (device number, interrupt number, model)? (5) What OS options/parameters are desired (buffer sizes, CPU-scheduling algorithm, maximum processes)?",
                "<b>Three <code>SYSGEN</code> Construction Approaches</b>: (1) Modify source code and completely recompile the OS (most tailored/compact, slowest to generate); (2) Link selected modules from a precompiled library (faster, no recompilation); (3) Completely table-driven system where all code stays in the kernel and selection occurs at runtime.",
                "<b>Two-Stage Disk Boot with <code>GRUB</code> (Section 2.10)</b>: on CPU reset, the instruction register loads a predefined ROM address. ROM firmware runs diagnostics and reads a single <b>boot block</b> at a fixed disk location (e.g., Block 0) into RAM. The boot block loads the full open-source bootstrap program <b>GRUB</b> from the boot disk/partition, which traverses the file system, lets the user pick a kernel version/options, loads the kernel into RAM, and starts execution."
              ]
            }
          ],
          "cards": [
            [
              "Why Kernel Crash Dumps Use a Raw Disk Partition",
              "If the kernel crashed due to a bug in the file-system code, writing a file through the file system could corrupt disk data; writing to a raw partition with no file system is safe."
            ],
            [
              "Kernighan's Law",
              "Debugging is twice as hard as writing the code in the first place; if you write code as cleverly as possible, you are by definition not smart enough to debug it."
            ],
            [
              "DTrace `U` vs. `K` Trace Lines",
              "Lines ending with `U` are executed in user mode; lines ending with `K` are executed in kernel mode (e.g., following `ioctl()` into the kernel)."
            ],
            [
              "DTrace Safety Guarantees",
              "DTrace bytecode is verified by the compiler to have no loops, monitors buffer/CPU limits, requires root/DTrace privileges, and restores original code when probes are removed."
            ],
            [
              "DTrace Enabling Control Block (ECB)",
              "Kernel action block executed when a probe fires; contains an optional predicate ('if statement') and actions to capture data."
            ],
            [
              "How Systems Auto-Detect Available RAM During SYSGEN",
              "By referencing memory location after memory location sequentially until an 'illegal address' fault is generated."
            ],
            [
              "Three Approaches to SYSGEN Kernel Construction",
              "(1) Modify source code and recompile; (2) Link selected modules from a precompiled library; (3) Table-driven runtime selection."
            ],
            [
              "Boot Disk (System Disk) & Block Zero",
              "A disk containing a boot partition; ROM firmware reads the fixed boot block (Block 0) into memory to launch the second-stage bootstrap loader like GRUB."
            ]
          ],
          "qa": [
            [
              "Why can traditional CPU breakpoints not be used to debug a multiuser operating-system kernel in production, and how does DTrace solve this?",
              "A CPU breakpoint halts execution of the entire kernel so a debugger can inspect state, which freezes the system for all users. <b>DTrace</b> solves this by dynamically inserting safe bytecode probes (`dtrace_probe()`) with no loops, executing Enabling Control Blocks (ECBs) with predicates on per-CPU buffers, and restoring the exact original instructions when tracing finishes—causing zero impact when disabled and safe, low-overhead tracing on live production systems.",
              "Chapter 2 · Section 2.8.3"
            ],
            [
              "In DTrace, what do the `sched:::on-cpu` and `sched:::off-cpu` probes do in the `sched.d` script for `uid == 101`?",
              "When a process owned by user ID 101 (`uid == 101`) is scheduled onto a CPU (`sched:::on-cpu`), the script saves the current kernel `timestamp` into thread-local variable `self->ts`. When that thread leaves the CPU (`sched:::off-cpu`), it adds the elapsed time (`timestamp - self->ts`) into the aggregation `@time[execname] = sum(...)` and resets `self->ts = 0`, outputting total CPU nanoseconds per executable name.",
              "Chapter 2 · Figure 2.21 (Page 90)"
            ],
            [
              "How can a system determine how much physical memory is available during SYSGEN or initialization without operator input?",
              "As described in Section 2.9, some systems determine available memory automatically by referencing memory location after memory location sequentially until an <b>\"illegal address\" fault</b> is generated; that fault defines the final legal address and thus the total available RAM.",
              "Chapter 2 · Section 2.9 (Page 92)"
            ],
            [
              "Compare the three approaches for generating an operating system after SYSGEN collects hardware configuration parameters.",
              "1. <b>Source-code modification and full compilation</b>: produces the most compact, tailored object kernel for the site, but takes the longest to compile.<br>2. <b>Linking precompiled library modules</b>: links only needed device drivers and modules without recompiling—much faster generation, though slightly more general.<br>3. <b>Completely table-driven</b>: all code remains in the kernel image and selection happens at execution time via configuration tables—easiest to modify, but produces the largest kernel.",
              "Chapter 2 · Section 2.9 (Page 92)"
            ]
          ],
          "quiz": [
            {
              "q": "In Solaris 10 DTrace output (Figure 2.20) tracing an application calling <code>ioctl()</code>, what do the letters <code>U</code> and <code>K</code> at the end of each line indicate?",
              "o": [
                [
                  "`U` = Unallocated memory; `K` = Kilobytes freed",
                  "`U` and `K` indicate the CPU execution mode of each function call."
                ],
                [
                  "`U` = executed in User mode; `K` = executed in Kernel mode",
                  "Correct. Section 2.8.3 (page 87) states: 'Lines ending with \"U\" are executed in user mode, and lines ending in \"K\" in kernel mode.'"
                ],
                [
                  "`U` = UDP packet; `K` = Kernel panic",
                  "They denote user mode vs. kernel mode transitions."
                ],
                [
                  "`U` = UNIX BSD; `K` = Korn shell",
                  "They denote execution modes, not OS or shell types."
                ]
              ],
              "a": 1,
              "src": "Lab 3 · Section 2.8.3 (Page 87)"
            },
            {
              "q": "How does the DTrace compiler guarantee that dynamically injected kernel probe code is \"safe\" and will not hang a running production kernel?",
              "o": [
                [
                  "By running the kernel inside MS-DOS real mode",
                  "DTrace runs on Solaris, FreeBSD, and Mac OS X kernels."
                ],
                [
                  "By forbidding loops in D bytecode, restricting kernel state modifications, and monitoring memory buffer and CPU time limits",
                  "Correct. Section 2.8.3 (pages 89–90) explains that the DTrace compiler assures bytecode safety by disallowing loops, restricting state modifications, and terminating consumers if buffer or CPU limits are exceeded."
                ],
                [
                  "By rebooting the server after every single system call",
                  "DTrace runs live on production systems without rebooting."
                ],
                [
                  "By allowing any unprivileged guest user to overwrite kernel structures",
                  "Only root or users with DTrace privileges are allowed to use DTrace."
                ]
              ],
              "a": 1,
              "src": "Lab 3 · Section 2.8.3 (Pages 89–90)"
            },
            {
              "q": "What happens to the kernel instructions of a probed function after a DTrace consumer terminates and no Enabling Control Blocks (ECBs) remain on that probe?",
              "o": [
                [
                  "The `dtrace_probe()` call remains active forever and slows down the system until reboot",
                  "DTrace removes the probe completely when no consumers remain."
                ],
                [
                  "The kernel rewrites the code to remove the `dtrace_probe()` call and restores the exact original instructions, leaving zero overhead",
                  "Correct. Section 2.8.3 (page 90) states: 'That involves rewriting the code to remove the dtrace_probe() call and put back the original code. Thus, before a probe is created and after it is destroyed, the system is exactly the same, as if no probing occurred.'"
                ],
                [
                  "The function is deleted from the kernel symbol table",
                  "The function continues normal operation."
                ],
                [
                  "The kernel writes a crash dump to the raw disk partition",
                  "Removing a probe is a normal dynamic operation, not a crash."
                ]
              ],
              "a": 1,
              "src": "Lab 3 · Section 2.8.3 (Page 90)"
            },
            {
              "q": "According to Section 2.9, how do some systems automatically determine how much physical memory is available during SYSGEN / startup?",
              "o": [
                [
                  "By reading the sticker on the computer chassis via the webcam",
                  "Hardware probes memory electronically."
                ],
                [
                  "By referencing memory location after memory location sequentially until an \"illegal address\" fault is generated",
                  "Correct. Section 2.9 (page 92) states: 'Some systems will determine this value themselves by referencing memory location after memory location until an \"illegal address\" fault is generated. This procedure defines the final legal address and hence the amount of available memory.'"
                ],
                [
                  "By multiplying the number of magnetic disk sectors by 512",
                  "Disk capacity does not determine physical RAM size."
                ],
                [
                  "By running `lsmod` in the Bourne shell",
                  "`lsmod` lists loaded Linux kernel modules."
                ]
              ],
              "a": 1,
              "src": "Lab 3 · Section 2.9 (Page 92)"
            },
            {
              "q": "Among the three SYSGEN kernel construction methods, which one does NOT require recompiling or relinking the kernel because all code is always part of the system and selection occurs at execution time?",
              "o": [
                [
                  "Modifying a copy of the OS source code and completely compiling it",
                  "That is the full source compilation approach."
                ],
                [
                  "Selecting modules from a precompiled library and linking them together",
                  "That is the precompiled library linking approach."
                ],
                [
                  "Constructing a system that is completely table driven",
                  "Correct. Section 2.9 (page 92) states: 'At the other extreme, it is possible to construct a system that is completely table driven. All the code is always part of the system, and selection occurs at execution time, rather than at compile or link time.'"
                ],
                [
                  "Burning the entire OS into non-erasable ROM chips",
                  "ROM storage is a firmware deployment method, not table-driven SYSGEN."
                ]
              ],
              "a": 2,
              "src": "Lab 3 · Section 2.9 (Page 92)"
            },
            {
              "q": "Why do cellular phones, tablets, and game consoles often store their entire operating system in ROM/EPROM firmware, whereas general-purpose PCs store the OS on disk?",
              "o": [
                [
                  "Because ROM is faster and cheaper per gigabyte than magnetic disks",
                  "Section 2.10 explicitly notes that executing code in firmware is slower than in RAM and firmware is relatively expensive, so only small amounts are available."
                ],
                [
                  "Because storing the OS in ROM is suitable for small operating systems, simple supporting hardware, and rugged operation, whereas large general-purpose OSs change frequently and need disk capacity",
                  "Correct. Section 2.10 (page 93) explains this exact trade-off between ROM firmware and disk-based bootstrap loading."
                ],
                [
                  "Because general-purpose PCs do not have a predefined CPU reset address",
                  "All CPUs jump to a predefined ROM address upon reset."
                ],
                [
                  "Because GRUB can only boot from magnetic tape",
                  "GRUB boots from disk partitions."
                ]
              ],
              "a": 1,
              "src": "Lab 3 · Section 2.10 (Page 93)"
            },
            {
              "q": "In the DTrace `sched.d` script (Figure 2.21), what does the expression <code>@time[execname] = sum(timestamp - self-&gt;ts);</code> compute?",
              "o": [
                [
                  "The number of disk sectors used by each file",
                  "The script probes `sched:::on-cpu` and `sched:::off-cpu` timestamps."
                ],
                [
                  "The cumulative CPU time (in nanoseconds) spent running on the CPUs by each process executable name for user ID 101",
                  "Correct. Section 2.8.3 (page 90) explains that `@time[execname] = sum(timestamp - self->ts)` records and sums the amount of CPU time in nanoseconds spent by each process running with `uid == 101`."
                ],
                [
                  "The wall-clock boot time of the BIOS ROM",
                  "It measures on-CPU to off-CPU intervals per process."
                ],
                [
                  "The number of syntax errors in a C program",
                  "It is a DTrace runtime scheduler aggregation."
                ]
              ],
              "a": 1,
              "src": "Lab 3 · Section 2.8.3 (Page 90)"
            },
            {
              "q": "In DTrace, what is the data structure used inside the kernel to keep track of all probes created by providers?",
              "o": [
                [
                  "An unsorted flat text file in `/tmp`",
                  "Kernel probes are tracked in memory, not in `/tmp` text files."
                ],
                [
                  "A hash-table data structure hashed by name and indexed according to unique probe identifiers",
                  "Correct. Section 2.8.3 (page 89) states: 'The probes are stored in a hash-table data structure that is hashed by name and indexed according to unique probe identifiers.'"
                ],
                [
                  "A 9-bit disk availability bitmap",
                  "Bitmaps track disk blocks, not named DTrace probes."
                ],
                [
                  "The MS-DOS resident command interpreter",
                  "DTrace is a Solaris/BSD/Mac OS X kernel facility."
                ]
              ],
              "a": 1,
              "src": "Lab 3 · Section 2.8.3 (Page 89)"
            }
          ]
        },
        {
          "n": 4,
          "code": "Lab 4",
          "title": "Lab 4: Linux Kernel Modules Project — Part I (simple.c) & Part II (Kernel Linked Lists)",
          "notes": [
            {
              "h": "Part I: Writing a Loadable Linux Kernel Module (`simple.c`)",
              "pts": [
                "In the Chapter 2 Programming Project (Pages 96–98), you write C code that interacts directly with the Linux kernel as a dynamically loadable kernel module.",
                "<b>Required Kernel Headers</b>: <code>&lt;linux/init.h&gt;</code>, <code>&lt;linux/kernel.h&gt;</code>, and <code>&lt;linux/module.h&gt;</code>.",
                "<b>Module Entry & Exit Points</b>: <code>int simple_init(void)</code> is the module entry point invoked when the module is loaded into the kernel (must return <code>0</code> for success, or any nonzero value for failure). <code>void simple_exit(void)</code> is the module exit point invoked when the module is removed (returns <code>void</code>). Neither takes any parameters.",
                "<b>Registration & License Macros</b>: <code>module_init(simple_init);</code> and <code>module_exit(simple_exit);</code> register the entry and exit functions. <code>MODULE_LICENSE(\"GPL\");</code>, <code>MODULE_DESCRIPTION(\"Simple Module\");</code>, and <code>MODULE_AUTHOR(\"SGG\");</code> declare standard module metadata.",
                "<b>Kernel Logging with <code>printk()</code></b>: <code>printk()</code> is the kernel equivalent of <code>printf()</code>. It writes output to the <b>kernel log buffer</b> (read via <code>dmesg</code>) and accepts a priority flag defined in <code>&lt;linux/printk.h&gt;</code> such as <b><code>KERN_INFO</code></b> (informational message)."
              ],
              "code": "#include <linux/init.h>\n#include <linux/kernel.h>\n#include <linux/module.h>\n\n/* This function is called when the module is loaded. */\nint simple_init(void)\n{\n    printk(KERN_INFO \"Loading Module\\n\");\n    return 0;\n}\n\n/* This function is called when the module is removed. */\nvoid simple_exit(void)\n{\n    printk(KERN_INFO \"Removing Module\\n\");\n}\n\n/* Macros for registering module entry and exit points. */\nmodule_init(simple_init);\nmodule_exit(simple_exit);\n\nMODULE_LICENSE(\"GPL\");\nMODULE_DESCRIPTION(\"Simple Module\");\nMODULE_AUTHOR(\"SGG\");"
            },
            {
              "h": "Part I: Compiling, Loading, Inspecting & Removing Kernel Modules",
              "pts": [
                "1. <b>List currently loaded modules</b>: run <code>lsmod</code>, which displays three columns: <b>name</b>, <b>size</b>, and <b>where the module is being used</b>.",
                "2. <b>Compile the module</b>: run <code>make</code> using the project <code>Makefile</code>. Compilation produces <b><code>simple.ko</code></b>, which represents the compiled kernel module.",
                "3. <b>Insert the module into the kernel</b>: run <code>sudo insmod simple.ko</code> (this invokes <code>simple_init()</code>).",
                "4. <b>Verify in the kernel log buffer</b>: run <code>dmesg</code> to confirm <code>\"Loading Module\"</code> appears.",
                "5. <b>Remove the kernel module</b>: run <code>sudo rmmod simple</code> (note that the <code>.ko</code> suffix is unnecessary; this invokes <code>simple_exit()</code>).",
                "6. <b>Clear the kernel log buffer</b>: because the log buffer fills up quickly, clear it periodically with <code>sudo dmesg -c</code>."
              ],
              "table": [
                [
                  "Terminal Command",
                  "Purpose in Kernel Module Workflow"
                ],
                [
                  "`lsmod`",
                  "Lists currently loaded kernel modules in 3 columns: name, size, and where used"
                ],
                [
                  "`make`",
                  "Compiles `simple.c` via the `Makefile` to produce `simple.ko`"
                ],
                [
                  "`sudo insmod simple.ko`",
                  "Loads `simple.ko` into the kernel and invokes `simple_init()`"
                ],
                [
                  "`dmesg`",
                  "Reads the kernel log buffer to view `printk(KERN_INFO ...)` messages"
                ],
                [
                  "`sudo rmmod simple`",
                  "Unloads the `simple` module (no `.ko` suffix needed) and invokes `simple_exit()`"
                ],
                [
                  "`sudo dmesg -c`",
                  "Clears the kernel log buffer"
                ]
              ]
            },
            {
              "h": "Part II: Kernel Circular Doubly Linked Lists (`<linux/list.h>` & `kmalloc`)",
              "pts": [
                "In Part II (Pages 99–101), you extend the kernel module to use Linux's circular, doubly linked list defined in <b><code>&lt;linux/list.h&gt;</code></b> and <b><code>&lt;linux/types.h&gt;</code></b>.",
                "Instead of wrapping data inside a generic list container, Linux <b>embeds <code>struct list_head list;</code></b> (which simply holds <code>next</code> and <code>prev</code> pointers) directly inside your custom struct: <code>struct birthday { int day; int month; int year; struct list_head list; };</code>.",
                "<b>Declaring the List Head</b>: <code>static LIST_HEAD(birthday_list);</code> defines and initializes a <code>struct list_head</code> variable named <code>birthday_list</code> that acts as the head of the list.",
                "<b>Allocating Kernel Memory & Adding Nodes</b>: use <b><code>kmalloc(sizeof(*person), GFP_KERNEL)</code></b>—the kernel equivalent of user-level <code>malloc()</code>, where <b><code>GFP_KERNEL</code></b> indicates routine kernel memory allocation. Initialize the node's list member with <b><code>INIT_LIST_HEAD(&amp;person-&gt;list);</code></b> and append it to the end of the list with <b><code>list_add_tail(&amp;person-&gt;list, &amp;birthday_list);</code></b>."
              ],
              "code": "#include <linux/list.h>\n#include <linux/types.h>\n#include <linux/slab.h>   /* for kmalloc() and kfree() */\n\nstruct birthday {\n    int day;\n    int month;\n    int year;\n    struct list_head list; /* embedded next/prev pointers */\n};\n\nstatic LIST_HEAD(birthday_list);\n\n/* Creating and inserting a node inside simple_init() */\nstruct birthday *person;\nperson = kmalloc(sizeof(*person), GFP_KERNEL);\nperson->day = 2;\nperson->month = 8;\nperson->year = 1995;\nINIT_LIST_HEAD(&person->list);\nlist_add_tail(&person->list, &birthday_list);"
            },
            {
              "h": "Part II: Traversing, Safely Deleting & Freeing Kernel Linked Lists (`kfree`)",
              "pts": [
                "<b>Traversing the Linked List</b>: use the <b><code>list_for_each_entry(ptr, &amp;birthday_list, list)</code></b> macro, which takes 3 arguments: (1) a pointer <code>ptr</code> to the struct being iterated over, (2) a pointer <code>&amp;birthday_list</code> to the head of the list, and (3) the name <code>list</code> of the <code>struct list_head</code> member inside <code>struct birthday</code>.",
                "<b>Removing Elements Safely During Traversal</b>: when deleting nodes inside a loop in <code>simple_exit()</code>, you must use <b><code>list_for_each_entry_safe(ptr, next, &amp;birthday_list, list)</code></b>, which takes an extra pointer argument <code>next</code> to preserve the next pointer before the current node is unlinked.",
                "Inside the safe loop, call <b><code>list_del(&amp;ptr-&gt;list);</code></b> to unlink the element from the list, and then call <b><code>kfree(ptr);</code></b> to return the memory allocated with <code>kmalloc()</code> back to the kernel—preventing kernel memory leaks."
              ],
              "code": "/* Traversing the list in simple_init() */\nstruct birthday *ptr;\nlist_for_each_entry(ptr, &birthday_list, list) {\n    printk(KERN_INFO \"Birthday: %d/%d/%d\\n\", ptr->day, ptr->month, ptr->year);\n}\n\n/* Safely deleting and freeing all nodes in simple_exit() */\nstruct birthday *ptr, *next;\nlist_for_each_entry_safe(ptr, next, &birthday_list, list) {\n    list_del(&ptr->list);\n    kfree(ptr);\n}"
            }
          ],
          "cards": [
            [
              "`simple_init()` Return Value Convention",
              "Must return an `int`: `0` represents success, and any nonzero value represents failure."
            ],
            [
              "`simple_exit()` Return Type",
              "Returns `void` and takes `void` (no parameters); invoked when the module is unloaded with `rmmod`."
            ],
            [
              "`printk()` vs. `printf()`",
              "`printk()` is the kernel equivalent of `printf()`; it supports priority flags like `KERN_INFO` (`<linux/printk.h>`) and writes to the kernel log buffer read by `dmesg`."
            ],
            [
              "Three Columns of `lsmod` Output",
              "Name, Size, and Where the module is being used."
            ],
            [
              "`insmod` vs. `rmmod` Commands",
              "`sudo insmod simple.ko` loads the compiled `.ko` module; `sudo rmmod simple` removes it (without the `.ko` suffix)."
            ],
            [
              "`sudo dmesg -c`",
              "Clears the kernel log buffer after displaying its contents."
            ],
            [
              "`struct list_head` (`<linux/types.h>`)",
              "Simple structure holding `next` and `prev` pointers that is embedded directly inside custom kernel structs to form circular doubly linked lists."
            ],
            [
              "`kmalloc(sizeof(*person), GFP_KERNEL)`",
              "Kernel equivalent of `malloc()`; allocates kernel memory using the `GFP_KERNEL` flag for routine kernel allocation."
            ],
            [
              "`list_for_each_entry` Parameters",
              "Takes 3 parameters: `(ptr, &birthday_list, list)` — struct pointer, pointer to list head, and name of the embedded `list_head` member."
            ],
            [
              "`list_for_each_entry_safe` + `list_del` + `kfree`",
              "Used in `simple_exit()` to preserve the `next` pointer while unlinking nodes with `list_del(&ptr->list)` and returning memory to the kernel with `kfree(ptr)`."
            ]
          ],
          "qa": [
            [
              "In a Linux kernel module (`simple.c`), what are the signatures and return types of the module entry and exit functions, and which macros register them?",
              "• <b>Entry point</b>: <code>int simple_init(void)</code> — invoked when the module is loaded; returns <code>0</code> on success and nonzero on failure. Registered with <code>module_init(simple_init);</code>.<br>• <b>Exit point</b>: <code>void simple_exit(void)</code> — invoked when the module is removed; returns <code>void</code>. Registered with <code>module_exit(simple_exit);</code>.",
              "Chapter 2 · Programming Project Part I (Page 97)"
            ],
            [
              "How does `printk()` differ from the standard C `printf()` function, and how do you view and clear its output?",
              "<code>printk()</code> is the Linux kernel equivalent of <code>printf()</code>. Unlike <code>printf()</code>, it writes to the <b>kernel log buffer</b> and allows specifying a priority flag (such as <code>KERN_INFO</code> from <code>&lt;linux/printk.h&gt;</code>). Its output is read from user space using the <b><code>dmesg</code></b> command and cleared using <b><code>sudo dmesg -c</code></b>.",
              "Chapter 2 · Programming Project Part I (Page 98)"
            ],
            [
              "Explain how to declare, allocate, initialize, and insert a `struct birthday` node into a Linux kernel linked list.",
              "1. Declare the list head with <code>static LIST_HEAD(birthday_list);</code>.<br>2. Allocate kernel memory for a node using <code>person = kmalloc(sizeof(*person), GFP_KERNEL);</code>.<br>3. Set the struct fields (`day`, `month`, `year`) and initialize its embedded `struct list_head` member using <code>INIT_LIST_HEAD(&amp;person-&gt;list);</code>.<br>4. Append the node to the tail of the list using <code>list_add_tail(&amp;person-&gt;list, &amp;birthday_list);</code>.",
              "Chapter 2 · Programming Project Part II (Pages 99–100)"
            ],
            [
              "Why must `list_for_each_entry_safe()` be used instead of `list_for_each_entry()` when deleting nodes from a Linux kernel linked list, and why is `kfree()` critical?",
              "When you unlink a node with <code>list_del(&amp;ptr-&gt;list)</code>, the current node's pointers are modified, which would break a normal traversal loop. <code>list_for_each_entry_safe(ptr, next, &amp;birthday_list, list)</code> saves the <code>next</code> pointer before the body runs so the list structure is preserved. Calling <code>kfree(ptr)</code> returns the <code>kmalloc()</code>-allocated memory back to the kernel, preventing unrecoverable kernel memory leaks.",
              "Chapter 2 · Programming Project Part II (Pages 100–101)"
            ]
          ],
          "quiz": [
            {
              "q": "When `make` compiles the Linux kernel module source file `simple.c`, what is the name of the compiled kernel module file produced?",
              "o": [
                [
                  "`simple.exe`",
                  "`.exe` is a Windows executable extension."
                ],
                [
                  "`simple.ko`",
                  "Correct. Page 98 states: 'The file simple.ko represents the compiled kernel module.'"
                ],
                [
                  "`simple.dll`",
                  "`.dll` is a Windows dynamic link library."
                ],
                [
                  "`simple.jar`",
                  "`.jar` is a Java archive."
                ]
              ],
              "a": 1,
              "src": "Lab 4 · Page 98"
            },
            {
              "q": "What value must a Linux kernel module entry point function (`int simple_init(void)`) return to indicate that the module loaded successfully?",
              "o": [
                [
                  "`1`",
                  "Any nonzero value represents failure."
                ],
                [
                  "`0`",
                  "Correct. Page 97 states: 'The module entry point function must return an integer value, with 0 representing success and any other value representing failure.'"
                ],
                [
                  "`-1`",
                  "`-1` is nonzero and indicates failure."
                ],
                [
                  "`NULL`",
                  "The return type is `int`, with `0` for success."
                ]
              ],
              "a": 1,
              "src": "Lab 4 · Page 97"
            },
            {
              "q": "Which terminal commands are used to (1) insert `simple.ko` into the kernel, (2) remove it from the kernel, and (3) view the `printk()` messages in the kernel log buffer?",
              "o": [
                [
                  "`gcc simple.ko`, `del simple`, and `cat /etc/passwd`",
                  "Those are not kernel module management commands."
                ],
                [
                  "`sudo insmod simple.ko`, `sudo rmmod simple`, and `dmesg`",
                  "Correct. Page 98 specifies `sudo insmod simple.ko` to load, `sudo rmmod simple` to remove (without `.ko`), and `dmesg` to read the kernel log buffer."
                ],
                [
                  "`fork simple.ko`, `exit simple`, and `top`",
                  "`fork`/`exit` are C system calls, and `top` monitors CPU processes."
                ],
                [
                  "`strace simple.ko`, `dtrace simple`, and `lsmod -c`",
                  "`lsmod` lists modules; `sudo dmesg -c` clears the kernel log buffer."
                ]
              ],
              "a": 1,
              "src": "Lab 4 · Page 98"
            },
            {
              "q": "What are the three columns displayed when you run the `lsmod` command?",
              "o": [
                [
                  "PID, UID, and CPU Time",
                  "Those are process columns in `ps` or `top`."
                ],
                [
                  "Name, size, and where the module is being used",
                  "Correct. Page 97 states: 'This command will list the current kernel modules in three columns: name, size, and where the module is being used.'"
                ],
                [
                  "Track, sector, and cylinder",
                  "Those are magnetic disk geometry terms."
                ],
                [
                  "File descriptor, buffer address, and byte count",
                  "Those are the parameters of POSIX `read()`."
                ]
              ],
              "a": 1,
              "src": "Lab 4 · Page 97"
            },
            {
              "q": "In Linux kernel module programming (Part II, Page 100), which function and flag are used as the kernel equivalent of user-level `malloc()` for routine kernel memory allocation?",
              "o": [
                [
                  "`VirtualAlloc(size, MEM_COMMIT)`",
                  "That is a Windows Win32 API call."
                ],
                [
                  "`kmalloc(sizeof(*person), GFP_KERNEL)`",
                  "Correct. Page 100 states: 'The kmalloc() function is the kernel equivalent of the user-level malloc() function for allocating memory, except that kernel memory is being allocated. (The GFP_KERNEL flag indicates routine kernel memory allocation.)'"
                ],
                [
                  "`sbrk(0)`",
                  "`sbrk()` is a legacy UNIX user-space heap call."
                ],
                [
                  "`printk(KERN_INFO, sizeof(*person))`",
                  "`printk()` logs messages to the kernel buffer; it does not allocate memory."
                ]
              ],
              "a": 1,
              "src": "Lab 4 · Page 100"
            },
            {
              "q": "What are the three parameters passed to the `list_for_each_entry(ptr, &birthday_list, list)` macro when traversing a kernel linked list?",
              "o": [
                [
                  "The file descriptor, the buffer pointer, and the byte count",
                  "Those are the parameters of `read()`."
                ],
                [
                  "A pointer to the structure being iterated over (`ptr`), a pointer to the head of the list (`&birthday_list`), and the name of the variable containing the `list_head` structure (`list`)",
                  "Correct. Page 100 lists these exact three parameters for `list_for_each_entry()`."
                ],
                [
                  "The day, the month, and the year integers",
                  "Those are the data fields of `struct birthday`, not the macro parameters."
                ],
                [
                  "The module name, the license string, and the author string",
                  "Those are for `MODULE_*` macros."
                ]
              ],
              "a": 1,
              "src": "Lab 4 · Page 100"
            },
            {
              "q": "When removing all elements from a Linux kernel linked list inside `simple_exit()`, why must you use `list_for_each_entry_safe(ptr, next, &birthday_list, list)` followed by `list_del(&ptr->list)` and `kfree(ptr)`?",
              "o": [
                [
                  "Because `list_for_each_entry_safe` automatically recompiles the kernel after every deletion",
                  "It is a C macro that preserves the `next` pointer during node deletion."
                ],
                [
                  "Because `next` preserves the next pointer of the item being deleted so the list structure remains intact during `list_del()`, and `kfree(ptr)` returns the `kmalloc()` memory to the kernel to prevent memory leaks",
                  "Correct. Pages 100–101 explain that `list_for_each_entry_safe()` maintains the `next` pointer before `list_del()` removes the element, and `kfree(ptr)` returns allocated kernel memory."
                ],
                [
                  "Because `kfree()` writes the birthday list to the ROM BIOS boot sector",
                  "`kfree()` frees kernel RAM allocated by `kmalloc()`."
                ],
                [
                  "Because `list_del()` only works in user mode with `mode bit = 1`",
                  "Kernel modules execute in kernel mode (`mode bit = 0`)."
                ]
              ],
              "a": 1,
              "src": "Lab 4 · Pages 100–101"
            },
            {
              "q": "Which Linux command clears the kernel log buffer when it fills up with `printk()` messages?",
              "o": [
                [
                  "`sudo rmmod -c`",
                  "`rmmod` removes a module, not the log buffer."
                ],
                [
                  "`sudo dmesg -c`",
                  "Correct. Page 98 states: 'Because the kernel log buffer can fill up quickly, it often makes sense to clear the buffer periodically. This can be accomplished as follows: sudo dmesg -c'"
                ],
                [
                  "`lsmod --clear`",
                  "`lsmod` only lists currently loaded modules."
                ],
                [
                  "`make clean-log`",
                  "`make` builds or cleans compiled object files, not the live kernel ring buffer."
                ]
              ],
              "a": 1,
              "src": "Lab 4 · Page 98"
            }
          ]
        }
      ]
    }
  },
  "lectures": [
    {
      "n": 1,
      "code": "Lec 1",
      "title": "Chapter 1 (Part 1): Introduction, System Organization, Interrupts, Storage & I/O",
      "notes": [
        {
          "h": "What is an Operating System? Goals & Four Components",
          "pts": [
            "<b>Operating System (OS)</b>: a program that acts as an <b>intermediary</b> between a user of a computer and the computer hardware.",
            "<b>Three primary OS goals</b>: (1) <b>Execute user programs</b> and make solving user problems easier; (2) Make the computer system <b>convenient</b> to use; (3) Use the computer hardware in an <b>efficient</b> manner.",
            "<b>Four components of a computer system</b>: Hardware, Operating System, Application Programs, and Users."
          ],
          "table": [
            [
              "Component",
              "Role in the System",
              "Examples"
            ],
            [
              "Hardware",
              "Provides basic computing resources",
              "CPU, memory, I/O devices"
            ],
            [
              "Operating System",
              "Controls and coordinates use of hardware among various applications and users",
              "Linux, Windows, Mac OS X, Solaris"
            ],
            [
              "Application Programs",
              "Define the ways in which system resources are used to solve users' computing problems",
              "Word processors, compilers, web browsers, database systems, video games"
            ],
            [
              "Users",
              "Entities interacting with the system",
              "People, machines, other computers"
            ]
          ]
        },
        {
          "h": "What Operating Systems Do: User View, System View & OS Definition",
          "pts": [
            "<b>User View</b> depends on the interface being used: <b>PC users</b> want convenience, ease of use, and performance without caring about resource utilization; <b>mainframe or minicomputer</b> shared systems must keep all users happy; <b>workstation users</b> have dedicated resources but frequently share server resources; <b>handheld computers</b> are resource-poor and optimized for usability and battery life; <b>embedded computers</b> in devices and automobiles have little or no user interface.",
            "<b>System View — OS as a Resource Allocator</b>: manages all resources (CPU time, memory space, file-storage space, I/O devices) and decides between conflicting requests for efficient and fair resource use.",
            "<b>System View — OS as a Control Program</b>: controls the execution of programs to prevent errors and improper use of the computer.",
            "<b>Operating System Definition</b>: there is no universally accepted definition. \"Everything a vendor ships when you order an OS\" is a good approximation, though it varies wildly.",
            "<b>The Kernel</b>: \"the one program running at all times on the computer.\" Everything else is either a <b>system program</b> (ships with the OS) or an <b>application program</b>."
          ]
        },
        {
          "h": "Computer Startup & Computer-System Organization",
          "pts": [
            "<b>Bootstrap program</b>: loaded when a computer is powered up or rebooted. Typically stored in <b>ROM or EPROM</b>, generally known as <b>firmware</b>.",
            "The bootstrap program initializes all aspects of the system (<b>CPU registers, device controllers, and memory contents</b>), locates and loads the <b>operating system kernel</b> into memory, and starts its execution.",
            "<b>Bus organization</b>: one or more CPUs and device controllers connect through a <b>common bus</b> providing access to <b>shared memory</b>. CPUs and device controllers execute in parallel, competing for memory cycles.",
            "<b>Concurrent I/O operation</b>: I/O devices and the CPU execute concurrently. Each <b>device controller</b> is in charge of a particular device type and has a <b>local buffer</b>.",
            "The CPU moves data from/to main memory to/from local buffers, while I/O transfers data between the device and the controller's local buffer. The device controller informs the CPU that its operation has finished by causing an <b>interrupt</b>."
          ]
        },
        {
          "h": "Common Functions of Interrupts & Interrupt Handling",
          "pts": [
            "An <b>interrupt</b> transfers control to the appropriate <b>interrupt service routine (ISR)</b> through the <b>interrupt vector</b>, which contains the memory addresses of all service routines.",
            "The interrupt architecture must <b>save the address of the interrupted instruction</b> so execution can resume later.",
            "A <b>trap</b> (or <b>exception</b>) is a <b>software-generated interrupt</b> caused either by an <b>error</b> (such as division by zero or invalid memory access) or a <b>user request</b> for an OS service (system call). Modern operating systems are <b>interrupt driven</b>.",
            "<b>Interrupt handling steps</b>: the OS preserves the state of the CPU by storing <b>registers and the program counter (PC)</b>, determines which type of interrupt occurred via <b>polling</b> or a <b>vectored interrupt system</b>, and executes separate code segments for each interrupt type."
          ],
          "table": [
            [
              "Feature",
              "Hardware Interrupt",
              "Trap (Exception)"
            ],
            [
              "Origin",
              "Generated by hardware (e.g., device controller signaling I/O completion)",
              "Software-generated interrupt"
            ],
            [
              "Trigger",
              "External asynchronous device event",
              "Error (e.g., divide by zero) or user request (system call)"
            ],
            [
              "Dispatch",
              "Transfers control to ISR via interrupt vector; saves interrupted PC",
              "Synchronous transfer to kernel handler"
            ]
          ]
        },
        {
          "h": "Storage Structure, Storage Hierarchy & Caching",
          "pts": [
            "<b>Main memory (RAM)</b>: the only large storage media that the CPU can access directly. It provides random access and is typically <b>volatile</b> (loses contents when power is removed).",
            "<b>Secondary storage</b>: extension of main memory that provides large <b>nonvolatile</b> storage capacity.",
            "<b>Magnetic disks</b>: rigid metal or glass platters covered with magnetic recording material. The disk surface is logically divided into <b>tracks</b>, which are subdivided into <b>sectors</b>. The <b>disk controller</b> determines the logical interaction between the device and the computer.",
            "<b>Solid-state disks (SSDs)</b>: nonvolatile flash storage that is faster than magnetic disks and increasingly widespread.",
            "<b>Storage-Device Hierarchy</b> (organized by <b>speed, cost, and volatility</b>, from fastest/smallest/most expensive to slowest/largest/least expensive): <b>Registers → Cache → Main Memory → Solid-State Disk → Magnetic Disk → Optical Disk → Magnetic Tapes</b>.",
            "<b>Caching</b>: copying information into a faster storage system temporarily. The faster storage (cache) is checked first: on a <b>hit</b>, information is used directly from cache; on a <b>miss</b>, data is copied into cache and used there. Because cache is smaller than the storage being cached, <b>cache size and replacement policy</b> are critical design problems. Main memory can be viewed as a cache for secondary storage.",
            "<b>Device driver</b>: software module for each device controller that manages I/O and provides a uniform interface between the controller and the kernel."
          ]
        },
        {
          "h": "I/O Structure & Direct Memory Access (DMA)",
          "pts": [
            "<b>Synchronous I/O</b>: after I/O starts, control returns to the user program <b>only upon I/O completion</b>. A wait instruction idles the CPU until the next interrupt (or a wait loop contends for memory). At most one I/O request is outstanding at a time, with no simultaneous I/O processing.",
            "<b>Asynchronous I/O</b>: after I/O starts, control returns to the user program <b>without waiting</b> for I/O completion. A system call lets the user wait for I/O completion when needed. The OS maintains a <b>Device-Status Table</b> with an entry for each I/O device indicating its <b>type, address, and state</b>.",
            "<b>Direct Memory Access (DMA)</b>: used for high-speed I/O devices able to transmit information at close to memory speeds. The device controller transfers an entire <b>block of data</b> directly between its buffer storage and main memory <b>without CPU intervention</b>.",
            "With DMA, <b>only one interrupt is generated per block</b> rather than one interrupt per byte, freeing the CPU to execute other work during the transfer."
          ]
        },
        {
          "h": "Computer-System Architecture: Multiprocessor & Clustered Systems",
          "pts": [
            "<b>Single-processor systems</b> use one general-purpose processor (almost all also include special-purpose device processors).",
            "<b>Multiprocessor (parallel / multicore) systems</b> have three major advantages: (1) <b>Increased throughput</b> (more work done in less time, though N processors speedup is less than N due to overhead and shared resource contention); (2) <b>Economy of scale</b> (sharing peripherals, mass storage, and power supplies costs less than separate PCs); (3) <b>Increased reliability</b> via <b>graceful degradation</b> (continuing service proportional to surviving hardware) or <b>fault tolerance</b>.",
            "<b>Asymmetric Multiprocessing</b>: each processor is assigned a specific task under a master-slave relationship. <b>Symmetric Multiprocessing (SMP)</b>: all processors are peers and perform all OS tasks; each processor has its own registers and local cache while sharing physical memory over the system bus.",
            "<b>UMA vs. NUMA</b>: Uniform Memory Access (access time to any RAM location is equal from any CPU) vs. Non-Uniform Memory Access. <b>Multicore</b> places multiple computing cores on a single chip (faster on-chip communication and lower power than multiple single-core chips). <b>Blade servers</b> place multiple independent multiprocessor boards in a single chassis.",
            "<b>Clustered systems</b>: multiple independent systems working together, usually sharing storage via a <b>Storage-Area Network (SAN)</b> to provide <b>high-availability</b> service. In <b>asymmetric clustering</b>, one machine is in hot-standby mode monitoring the active server; in <b>symmetric clustering</b>, two or more hosts run applications and monitor each other. Clusters also support <b>High-Performance Computing (HPC)</b> via parallelization and use a <b>Distributed Lock Manager (DLM)</b> to prevent conflicting disk operations."
          ]
        }
      ],
      "cards": [
        [
          "Operating System (OS)",
          "A program that acts as an intermediary between a user of a computer and the computer hardware."
        ],
        [
          "Three main goals of an OS",
          "(1) Execute user programs and make solving user problems easier; (2) Make the computer system convenient to use; (3) Use computer hardware in an efficient manner."
        ],
        [
          "Four components of a computer system",
          "Hardware, Operating System, Application Programs, and Users."
        ],
        [
          "OS as a Resource Allocator",
          "Manages all system resources (CPU time, memory space, file storage, I/O devices) and decides between conflicting requests for efficient and fair use."
        ],
        [
          "OS as a Control Program",
          "Controls the execution of programs to prevent errors and improper use of the computer."
        ],
        [
          "Kernel",
          "The one program running at all times on the computer; everything else is either a system program or an application program."
        ],
        [
          "Bootstrap Program",
          "Firmware stored in ROM or EPROM that runs at power-up/reboot, initializes CPU registers, device controllers, and memory, and loads the OS kernel."
        ],
        [
          "Device Controller & Local Buffer",
          "Hardware unit in charge of a specific device type; holds a local buffer and signals the CPU with an interrupt when an I/O operation finishes."
        ],
        [
          "Interrupt Vector",
          "An array of memory addresses pointing to the interrupt service routines (ISRs) for different interrupt requests."
        ],
        [
          "Trap (Exception)",
          "A software-generated interrupt caused either by an error (e.g., division by zero) or by a user request for an OS service (system call)."
        ],
        [
          "Main Memory vs. Secondary Storage",
          "Main memory (RAM) is volatile and directly accessible by the CPU; secondary storage (disks, SSDs) is nonvolatile and holds large data extensions."
        ],
        [
          "Magnetic Disk Structure",
          "Rigid metal or glass platters coated with magnetic material; surface is logically divided into circular tracks, which are subdivided into sectors."
        ],
        [
          "Storage-Device Hierarchy Order",
          "Registers → Cache → Main Memory → Solid-State Disk → Magnetic Disk → Optical Disk → Magnetic Tapes."
        ],
        [
          "Caching",
          "Temporarily copying information in use from slower storage to faster storage; checked first before accessing the slower backing store."
        ],
        [
          "Device Driver",
          "OS software module for a specific device controller that provides a consistent interface between the controller and the kernel."
        ],
        [
          "Synchronous vs. Asynchronous I/O",
          "Synchronous I/O waits until I/O finishes before returning control to the user program; Asynchronous I/O returns control immediately without waiting."
        ],
        [
          "Device-Status Table",
          "Kernel table containing an entry for each I/O device indicating its type, address, and current state (idle or busy with request queue)."
        ],
        [
          "Direct Memory Access (DMA)",
          "High-speed I/O structure where the device controller transfers entire blocks directly to/from main memory without CPU intervention, generating only one interrupt per block."
        ],
        [
          "Three Advantages of Multiprocessor Systems",
          "(1) Increased throughput, (2) Economy of scale, and (3) Increased reliability (graceful degradation / fault tolerance)."
        ],
        [
          "Asymmetric vs. Symmetric Multiprocessing (SMP)",
          "Asymmetric assigns specific tasks to processors (master-slave); SMP treats all processors as peers that perform all tasks and share memory."
        ],
        [
          "Graceful Degradation vs. Fault Tolerance",
          "Graceful degradation continues providing service proportional to remaining hardware; fault tolerance suffers no loss of service despite a component failure."
        ],
        [
          "Clustered System & DLM",
          "Multiple systems coupled via a LAN and shared Storage-Area Network (SAN) for high availability; uses a Distributed Lock Manager (DLM) to coordinate shared storage access."
        ]
      ],
      "qa": [
        [
          "What are the three main purposes of an operating system?",
          "1. To execute user programs and make solving user problems easier.<br>2. To make the computer system convenient to use.<br>3. To use the computer hardware in an efficient manner.",
          "Chapter 1 · Practice Exercise 1.1"
        ],
        [
          "What are the four components of a computer system, and what role does each play?",
          "<b>Hardware</b> (CPU, memory, I/O devices) provides basic computing resources; the <b>Operating System</b> controls and coordinates hardware use among applications and users; <b>Application Programs</b> (compilers, browsers, databases) define how resources are used to solve user problems; and <b>Users</b> (people, machines, other computers) interact with the system.",
          "Chapter 1 · Slide 1.5"
        ],
        [
          "How does an interrupt differ from a trap, and can traps be generated intentionally by a user program?",
          "An <b>interrupt</b> is a hardware-generated signal (e.g., from a device controller finishing I/O) that asynchronously transfers control to an ISR via the interrupt vector. A <b>trap</b> (or exception) is a software-generated interrupt caused either by a runtime error (like division by zero) or intentionally by a user program invoking a <b>system call</b> to request an operating-system service.",
          "Chapter 1 · Exercise 1.19"
        ],
        [
          "How does Direct Memory Access (DMA) improve system performance for high-speed I/O devices?",
          "Instead of the CPU transferring data byte-by-byte and receiving an interrupt for every byte, the CPU writes command parameters to the DMA controller and continues other work. The DMA controller transfers an entire block of data directly between the device buffer and main memory, interrupting the CPU <b>only once per block</b> upon completion.",
          "Chapter 1 · Exercise 1.20"
        ],
        [
          "Distinguish between Synchronous I/O and Asynchronous I/O.",
          "In <b>Synchronous I/O</b>, control returns to the user process only after the I/O operation completes (the CPU waits or idles, allowing at most one outstanding I/O request). In <b>Asynchronous I/O</b>, control returns to the user process immediately after I/O starts without waiting for completion, and the OS tracks ongoing requests in the <b>Device-Status Table</b>.",
          "Chapter 1 · Slides 1.20–1.22"
        ],
        [
          "What are the differences between Asymmetric Multiprocessing and Symmetric Multiprocessing (SMP)?",
          "In <b>Asymmetric Multiprocessing</b>, a boss/master processor controls the system and assigns specific predefined tasks to worker processors. In <b>Symmetric Multiprocessing (SMP)</b>, all processors are peers that perform all tasks independently; each CPU has its own registers and local cache while sharing physical main memory.",
          "Chapter 1 · Exercise 1.15"
        ],
        [
          "How do clustered systems differ from multiprocessor systems, and how do asymmetric and symmetric clusters differ?",
          "A multiprocessor system has multiple CPUs in a single system sharing physical memory over a system bus, whereas a <b>clustered system</b> connects multiple independent computer nodes over a network sharing storage via a <b>Storage-Area Network (SAN)</b>. In <b>asymmetric clustering</b>, one node stands in hot-standby mode monitoring the active node; in <b>symmetric clustering</b>, all nodes run applications concurrently while monitoring each other.",
          "Chapter 1 · Exercise 1.16"
        ],
        [
          "Why are caches useful, and why don't we simply replace a slow storage device with a cache of the same size?",
          "Caches exploit locality of reference by temporarily holding active data in faster storage, bridging the speed gap between fast CPUs and slower backing stores. We cannot replace a large disk with an equally large cache because fast cache memory (SRAM/DRAM) is orders of magnitude more <b>expensive per bit</b> and is <b>volatile</b>, whereas disks provide cheap, nonvolatile mass storage.",
          "Chapter 1 · Practice Exercise 1.10"
        ],
        [
          "What happens during computer startup when the power is turned on or rebooted?",
          "Execution begins with the <b>bootstrap program</b> stored in nonvolatile firmware (ROM or EPROM). It initializes all system aspects—including CPU registers, device controllers, and main memory—and then locates the operating-system kernel on storage, loads it into main memory, and transfers control to it.",
          "Chapter 1 · Slide 1.10"
        ],
        [
          "In what settings must an OS prioritize ease of use vs. resource utilization vs. battery life?",
          "Single-user <b>PCs/workstations</b> prioritize user convenience and responsiveness; shared <b>mainframes and minicomputers</b> must carefully manage CPU, memory, and I/O utilization to keep all users happy; and <b>handheld mobile computers</b> are resource-constrained and optimize heavily for touch usability and battery life.",
          "Chapter 1 · Exercise 1.13"
        ]
      ],
      "quiz": [
        {
          "q": "Which of the following best defines an operating system according to Chapter 1?",
          "o": [
            [
              "A hardware controller that connects the CPU directly to magnetic disk sectors",
              "Hardware controllers are physical components; the OS is software."
            ],
            [
              "A program that acts as an intermediary between a user of a computer and the computer hardware",
              "Correct. Slide 1.4 defines the OS as a program acting as an intermediary between the computer user and the computer hardware."
            ],
            [
              "A collection of application programs such as compilers, web browsers, and database systems",
              "Those are application programs that run on top of the operating system, not the OS itself."
            ],
            [
              "The firmware chip (ROM/EPROM) soldered onto the motherboard",
              "ROM/EPROM holds the bootstrap program, not the general-purpose operating system."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.4"
        },
        {
          "q": "Which component of a computer system defines the ways in which system resources are used to solve the computing problems of the users?",
          "o": [
            [
              "Hardware",
              "Hardware provides the raw computing resources (CPU, memory, I/O devices)."
            ],
            [
              "The Kernel",
              "The kernel controls and coordinates the use of hardware among applications and users."
            ],
            [
              "Application programs",
              "Correct. Slide 1.5 states that application programs (word processors, compilers, web browsers, database systems, video games) define the ways in which system resources are used to solve users' computing problems."
            ],
            [
              "Bootstrap firmware",
              "Bootstrap firmware only initializes hardware and loads the kernel at startup."
            ]
          ],
          "a": 2,
          "src": "Lecture 1 · Slide 1.5"
        },
        {
          "q": "From the <b>system view</b>, the operating system is primarily described as:",
          "o": [
            [
              "A graphical desktop metaphor and touchscreen gesture recognizer",
              "That is the user interface aspect of the user view."
            ],
            [
              "A resource allocator and a control program",
              "Correct. Slide 1.8 defines the system view of the OS in two roles: a resource allocator (managing CPU, memory, files, and I/O fairly and efficiently) and a control program (preventing errors and improper use)."
            ],
            [
              "A compiler and assembler for high-level programming languages",
              "Compilers and assemblers are system/language-support programs, not the core system view of the OS."
            ],
            [
              "A peer-to-peer discovery protocol for distributed file sharing",
              "That is a distributed computing model, not the system view of an OS."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.8"
        },
        {
          "q": "\"The one program running at all times on the computer\" is the definition of:",
          "o": [
            [
              "The bootstrap loader",
              "The bootstrap loader runs only during startup/reboot to load the kernel."
            ],
            [
              "The command interpreter (shell)",
              "The shell runs when a user logs in and can be replaced or terminated."
            ],
            [
              "The kernel",
              "Correct. Slide 1.9 defines the kernel as 'the one program running at all times on the computer,' while everything else is a system program or an application program."
            ],
            [
              "A system daemon",
              "Daemons are background system programs running in user context, not the kernel itself."
            ]
          ],
          "a": 2,
          "src": "Lecture 1 · Slide 1.9"
        },
        {
          "q": "Where is the bootstrap program typically stored so that it is immediately available when a computer is powered up?",
          "o": [
            [
              "In volatile DRAM main memory",
              "DRAM loses its contents when power is off and is in an unknown state at startup."
            ],
            [
              "In ROM or EPROM (generally known as firmware)",
              "Correct. Slide 1.10 notes that the bootstrap program is typically stored in ROM or EPROM (firmware) because it requires no initialization and persists without power."
            ],
            [
              "In the CPU's general-purpose registers",
              "CPU registers are volatile and initialized by the bootstrap program itself."
            ],
            [
              "In the Device-Status Table",
              "The Device-Status Table is an OS data structure in RAM created after the kernel boots."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.10"
        },
        {
          "q": "How does a device controller inform the CPU that it has finished an I/O operation?",
          "o": [
            [
              "By overwriting the bootstrap program in ROM",
              "ROM is read-only firmware and is not modified by I/O completion."
            ],
            [
              "By causing a hardware interrupt",
              "Correct. Slide 1.12 states that the device controller transfers data between the device and its local buffer and informs the CPU that it has finished its operation by causing an interrupt."
            ],
            [
              "By executing a division-by-zero trap instruction",
              "A trap is a software-generated interrupt from the CPU, not a hardware signal from a device controller."
            ],
            [
              "By rebooting the common system bus",
              "The controller signals an interrupt on the bus; it does not reboot it."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.12"
        },
        {
          "q": "What is a <b>trap</b> (or <b>exception</b>)?",
          "o": [
            [
              "A hardware signal sent by a magnetic disk controller when a sector read completes",
              "That is a hardware device interrupt."
            ],
            [
              "A software-generated interrupt caused either by an error or by a user request",
              "Correct. Slide 1.13 defines a trap or exception as a software-generated interrupt caused either by an error (e.g., division by zero) or a user request (system call)."
            ],
            [
              "A table in ROM that stores the physical sector numbers of bad disk blocks",
              "That is disk block mapping, not a trap."
            ],
            [
              "A DMA cycle that steals memory bandwidth from the CPU",
              "That is DMA cycle stealing."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.13"
        },
        {
          "q": "Through what structure does an interrupt transfer control to the appropriate interrupt service routine (ISR)?",
          "o": [
            [
              "The Device-Status Table",
              "The Device-Status Table tracks I/O device states and queues, not ISR addresses."
            ],
            [
              "The interrupt vector, which contains the addresses of all the service routines",
              "Correct. Slide 1.13 states that an interrupt transfers control to the appropriate interrupt service routine through the interrupt vector."
            ],
            [
              "The bootstrap loader block",
              "The boot block is only used during system startup."
            ],
            [
              "The Distributed Lock Manager (DLM)",
              "DLM coordinates storage access across clustered systems."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.13"
        },
        {
          "q": "Which storage medium is the <b>only</b> large storage media that the CPU can access directly?",
          "o": [
            [
              "Magnetic disk",
              "Magnetic disks are secondary storage accessed via I/O controllers, not directly by CPU load/store instructions."
            ],
            [
              "Solid-state disk (SSD)",
              "SSDs are secondary storage devices accessed through an I/O controller."
            ],
            [
              "Main memory (RAM)",
              "Correct. Slide 1.16 states that main memory is the only large storage media that the CPU can access directly."
            ],
            [
              "Magnetic tape",
              "Magnetic tape is slow tertiary storage."
            ]
          ],
          "a": 2,
          "src": "Lecture 1 · Slide 1.16"
        },
        {
          "q": "Which of the following lists storage levels in the correct order from <b>fastest and smallest</b> to <b>slowest and largest</b>?",
          "o": [
            [
              "Main memory → Cache → Registers → Solid-state disk → Magnetic disk",
              "Registers are faster than cache, which is faster than main memory."
            ],
            [
              "Registers → Cache → Main memory → Solid-state disk → Magnetic disk → Optical disk → Magnetic tapes",
              "Correct. Slide 1.18 (Storage-Device Hierarchy) orders storage from top to bottom as: Registers, Cache, Main memory, Solid-state disk, Magnetic disk, Optical disk, and Magnetic tapes."
            ],
            [
              "Registers → Main memory → Cache → Magnetic disk → Solid-state disk",
              "Cache is between registers and main memory, and SSDs are faster than magnetic disks."
            ],
            [
              "Cache → Registers → Solid-state disk → Main memory → Magnetic tapes",
              "Registers are at the very top, and main memory is much faster than SSDs."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.18"
        },
        {
          "q": "On a magnetic disk, the platter surface is logically divided into ________, which are further subdivided into ________.",
          "o": [
            [
              "Sectors; tracks",
              "Tracks are the concentric rings; sectors are the subdivisions of a track."
            ],
            [
              "Tracks; sectors",
              "Correct. Slide 1.16 states that the disk surface is logically divided into tracks, which are subdivided into sectors."
            ],
            [
              "Frames; pages",
              "Frames and pages are virtual memory concepts."
            ],
            [
              "Buffers; registers",
              "Buffers and registers are memory units, not magnetic platter divisions."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.16"
        },
        {
          "q": "In which I/O method does control return to the user program <b>only upon I/O completion</b>, allowing at most one outstanding I/O request at a time?",
          "o": [
            [
              "Asynchronous I/O",
              "Asynchronous I/O returns control to the user program immediately without waiting for I/O completion."
            ],
            [
              "Direct Memory Access (DMA)",
              "DMA transfers blocks asynchronously without CPU intervention."
            ],
            [
              "Synchronous I/O",
              "Correct. Slides 1.20–1.21 explain that in Synchronous I/O, control returns to the user program only upon I/O completion, idling the CPU via a wait instruction or wait loop."
            ],
            [
              "Vectored I/O",
              "Vectored I/O is a scatter-gather I/O technique, not the blocking wait loop described on Slide 1.20."
            ]
          ],
          "a": 2,
          "src": "Lecture 1 · Slides 1.20–1.21"
        },
        {
          "q": "What is the key advantage of Direct Memory Access (DMA) for high-speed I/O devices?",
          "o": [
            [
              "It eliminates the need for device controllers and local buffers",
              "DMA still requires a device/DMA controller and buffer storage."
            ],
            [
              "It transfers blocks of data directly between buffer storage and main memory without CPU intervention, generating only one interrupt per block",
              "Correct. Slide 1.23 states that DMA transfers blocks directly to main memory without CPU intervention and generates only one interrupt per block instead of one per byte."
            ],
            [
              "It allows user-mode programs to execute privileged I/O instructions directly",
              "I/O instructions remain privileged in kernel mode."
            ],
            [
              "It converts volatile DRAM into nonvolatile ROM",
              "DMA is a data-transfer mechanism and does not change memory volatility."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.23"
        },
        {
          "q": "Which of the following is <b>NOT</b> one of the three main advantages of multiprocessor systems?",
          "o": [
            [
              "Increased throughput",
              "Increased throughput is Advantage #1 on Slide 1.25."
            ],
            [
              "Economy of scale",
              "Economy of scale (sharing peripherals, storage, and power) is Advantage #2 on Slide 1.25."
            ],
            [
              "Increased reliability (graceful degradation / fault tolerance)",
              "Increased reliability is Advantage #3 on Slide 1.25."
            ],
            [
              "Elimination of the need for cache coherency in hardware",
              "Correct. Multiprocessor systems actually introduce the complex requirement of hardware cache coherency (Slide 1.42); they do not eliminate it."
            ]
          ],
          "a": 3,
          "src": "Lecture 1 · Slides 1.25 & 1.42"
        },
        {
          "q": "In a multiprocessor system, the ability to continue providing service proportional to the level of surviving hardware after a processor failure is called:",
          "o": [
            [
              "Asymmetric clustering",
              "Asymmetric clustering uses a separate standby computer in a cluster."
            ],
            [
              "Graceful degradation",
              "Correct. Slide 1.25 and Chapter 1.3.2 define graceful degradation as the ability to continue providing service proportional to the level of surviving hardware."
            ],
            [
              "Programmed I/O",
              "Programmed I/O is byte-by-byte CPU I/O transfer."
            ],
            [
              "Spooling",
              "Spooling overlaps the output of one job with the input of other jobs."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.25"
        },
        {
          "q": "How does Symmetric Multiprocessing (SMP) differ from Asymmetric Multiprocessing?",
          "o": [
            [
              "In SMP, one master processor schedules all work while slave processors only run user code",
              "That describes Asymmetric Multiprocessing."
            ],
            [
              "In SMP, all processors are peers that perform all tasks within the operating system",
              "Correct. Slide 1.25–1.26 explains that in SMP, all processors are peers; each processor has its own registers and cache and shares physical memory."
            ],
            [
              "In SMP, processors do not share main memory and must communicate over a Wide Area Network",
              "SMP processors share physical memory via a common system bus; separate networked systems are distributed/clustered systems."
            ],
            [
              "In SMP, only one processor is powered on at a time while others remain in hot-standby mode",
              "Hot-standby mode is used in asymmetric clustered systems, not SMP."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slides 1.25–1.26"
        },
        {
          "q": "In a clustered system, what is the role of a Distributed Lock Manager (DLM)?",
          "o": [
            [
              "To translate PowerPC instructions into Intel x86 instructions",
              "That is CPU emulation."
            ],
            [
              "To ensure shared access to storage across cluster nodes without conflicting operations",
              "Correct. Slide 1.28 states that clustered systems sharing storage via a SAN use a Distributed Lock Manager (DLM) to avoid conflicting operations."
            ],
            [
              "To load the bootstrap program from ROM into CPU registers",
              "That is performed by hardware reset and firmware."
            ],
            [
              "To convert synchronous I/O into polling loops",
              "DLM manages distributed storage locks, not local I/O polling."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.28"
        },
        {
          "q": "What is the difference between <b>asymmetric clustering</b> and <b>symmetric clustering</b>?",
          "o": [
            [
              "Asymmetric clustering has one machine in hot-standby mode, whereas symmetric clustering has multiple nodes running applications and monitoring each other",
              "Correct. Slide 1.28 defines asymmetric clustering as having one machine in hot-standby mode and symmetric clustering as having multiple nodes running applications while monitoring each other."
            ],
            [
              "Asymmetric clustering shares a SAN, whereas symmetric clustering cannot share storage",
              "Both cluster types typically share storage via a Storage-Area Network (SAN)."
            ],
            [
              "Asymmetric clustering uses multiple cores on one chip, whereas symmetric clustering uses one core",
              "Multicore refers to CPU chip design, not clustering."
            ],
            [
              "Asymmetric clustering is used only for mobile phones, whereas symmetric clustering is for laptops",
              "Clustering applies to server nodes connected for high availability or HPC."
            ]
          ],
          "a": 0,
          "src": "Lecture 1 · Slide 1.28"
        },
        {
          "q": "What software component provides a uniform interface between a specific hardware device controller and the OS kernel?",
          "o": [
            [
              "The bootstrap loader",
              "The bootstrap loader only loads the kernel at boot time."
            ],
            [
              "The device driver",
              "Correct. Slide 1.17 states that a device driver for each device controller manages I/O and provides the interface between the controller and the kernel."
            ],
            [
              "The web portal",
              "A web portal provides network access to internal servers."
            ],
            [
              "The application program",
              "Applications sit at the top layer and cannot access device controllers directly."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.17"
        },
        {
          "q": "When the OS preserves the state of the CPU upon an interrupt, which two items does Slide 1.14 explicitly state are stored?",
          "o": [
            [
              "The magnetic disk tracks and sectors",
              "Tracks and sectors are physical disk geometry."
            ],
            [
              "The registers and the program counter (PC)",
              "Correct. Slide 1.14 states: 'The operating system preserves the state of the CPU by storing registers and the program counter.'"
            ],
            [
              "The ROM firmware and the SAN lock table",
              "Neither is part of the per-instruction CPU state saved on interrupt."
            ],
            [
              "The user's password and group ID",
              "User and group IDs are security attributes, not CPU execution state."
            ]
          ],
          "a": 1,
          "src": "Lecture 1 · Slide 1.14"
        }
      ]
    },
    {
      "n": 2,
      "code": "Lec 2",
      "title": "Chapter 1 (Part 2): OS Structure, Dual-Mode Protection, Management Activities & Computing Environments",
      "notes": [
        {
          "h": "Operating-System Structure: Multiprogramming & Timesharing (Multitasking)",
          "pts": [
            "<b>Multiprogramming</b> is needed for efficiency because a single user cannot keep the CPU and I/O devices busy at all times.",
            "Multiprogramming organizes jobs (code and data) so the CPU always has one to execute: a subset of total jobs is kept in main memory, a job is selected from the job pool via <b>job scheduling</b>, and whenever the running job must wait (e.g., for I/O), the OS switches the CPU to another job in memory.",
            "<b>Timesharing (multitasking)</b> is a logical extension of multiprogramming in which the CPU switches jobs so frequently that users can interact with each job while it runs (<b>interactive computing</b>), keeping <b>response time short (typically &lt; 1 second)</b>.",
            "Each user has at least one program executing in memory, called a <b>process</b>. If several jobs are ready to run at the same time, the OS performs <b>CPU scheduling</b>. If processes do not fit in memory, <b>swapping</b> moves them in and out; <b>virtual memory</b> allows execution of processes that are not completely in memory."
          ],
          "table": [
            [
              "Aspect",
              "Multiprogramming",
              "Timesharing (Multitasking)"
            ],
            [
              "Primary Objective",
              "Maximize CPU utilization so the CPU is never idle during I/O waits",
              "Interactive computing with short response time (&lt; 1 second)"
            ],
            [
              "Switching Trigger",
              "Job waits for an event such as an I/O operation",
              "Frequent timer-driven CPU scheduling multiplexes the CPU"
            ],
            [
              "Memory Support",
              "Subset of jobs kept simultaneously in memory via job scheduling",
              "Swapping and virtual memory allow running processes larger than physical RAM"
            ]
          ]
        },
        {
          "h": "Operating-System Operations: Dual-Mode Operation & Timer Protection",
          "pts": [
            "To prevent user programs from interfering with one another or with the OS (e.g., infinite loops or illegal memory access), hardware provides <b>dual-mode operation</b>: <b>user mode</b> and <b>kernel mode</b> (also called supervisor, system, or privileged mode).",
            "A hardware <b>mode bit</b> added to the computer hardware indicates the current mode: <b>kernel mode = 0</b> and <b>user mode = 1</b>.",
            "Certain machine instructions that could cause harm (such as I/O control, timer management, and interrupt enabling/disabling) are designated as <b>privileged instructions</b>. The hardware allows privileged instructions to be executed <b>only in kernel mode</b>; attempting one in user mode traps to the OS as an illegal instruction.",
            "When a user program requests an OS service via a <b>system call</b>, a trap switches the mode bit from <code>1</code> to <code>0</code> (entering kernel mode). When the system call finishes, the OS resets the mode bit to <code>1</code> before returning control to the user program.",
            "Modern CPUs increasingly support <b>multi-mode operations</b>, such as a separate <b>virtual machine manager (VMM) mode</b> for guest VMs.",
            "<b>Timer protection</b> prevents a user program from getting stuck in an infinite loop or hogging resources: the OS initializes a fixed or variable timer counter (a privileged operation) that is decremented by the physical clock; when the counter reaches zero, it generates an interrupt returning control to the OS."
          ]
        },
        {
          "h": "Process Management & Memory Management",
          "pts": [
            "<b>Process</b>: a program in execution and the unit of work within the system. A <b>program is a passive entity</b> (e.g., an executable file on disk), whereas a <b>process is an active entity</b>.",
            "A process needs resources (CPU time, memory, I/O, files, initialization data) to accomplish its task, and process termination requires reclaiming all reusable resources.",
            "A <b>single-threaded process</b> has one <b>program counter (PC)</b> specifying the next instruction to execute sequentially. A <b>multi-threaded process</b> has <b>one program counter per thread</b>.",
            "<b>Six OS Process Management Activities</b>: (1) Creating and deleting both user and system processes; (2) Scheduling processes and threads on the CPUs; (3) Suspending and resuming processes; (4) Providing mechanisms for process synchronization; (5) Providing mechanisms for process communication; (6) Providing mechanisms for deadlock handling.",
            "<b>Memory Management</b> keeps several programs in memory to improve CPU utilization and response speed. <b>Three OS Memory Management Activities</b>: (1) Keeping track of which parts of memory are currently being used and by whom; (2) Deciding which processes (or parts thereof) and data to move into and out of memory; (3) Allocating and deallocating memory space as needed."
          ]
        },
        {
          "h": "Storage, Mass-Storage, Cache & I/O Subsystem Management",
          "pts": [
            "<b>File-System Management</b>: the OS abstracts physical storage properties (access speed, capacity, transfer rate, sequential vs. random access) into a uniform logical storage unit—the <b>file</b>—organized into <b>directories</b>. <b>Four OS File-System Activities</b>: (1) Creating and deleting files and directories; (2) Supporting primitives to manipulate files and directories; (3) Mapping files onto secondary storage; (4) Backing up files onto stable (nonvolatile) storage media.",
            "<b>Mass-Storage Management</b>: since computer speed hinges on the disk subsystem, the OS handles <b>three core disk activities</b>: (1) <b>Free-space management</b>, (2) <b>Storage allocation</b>, and (3) <b>Disk scheduling</b>. Slower <b>tertiary storage</b> (optical disks, magnetic tape) is also managed and varies between <b>WORM</b> (write-once, read-many-times) and <b>RW</b> (read-write).",
            "<b>Migration of Integer A (Disk → Main Memory → Cache → Hardware Register)</b>: in a <b>multitasking</b> environment, the OS must ensure processes always access the most recent value regardless of where it sits in the hierarchy; in a <b>multiprocessor</b> environment, hardware must provide <b>cache coherency</b> so all CPUs see the updated value in their caches; in a <b>distributed</b> environment, multiple replicas make consistency even more complex.",
            "<b>I/O Subsystem Responsibilities</b>: hides hardware device peculiarities from the user and provides (1) I/O memory management including <b>buffering</b> (storing data temporarily while being transferred), <b>caching</b> (storing parts of data in faster storage for performance), and <b>spooling</b> (overlapping the output of one job with the input of other jobs); (2) a general device-driver interface; and (3) drivers for specific hardware devices."
          ]
        },
        {
          "h": "Protection and Security",
          "pts": [
            "<b>Protection</b> is any mechanism for controlling the access of processes or users to resources defined by the OS.",
            "<b>Security</b> is the defense of the system against internal and external attacks, including <b>denial-of-service (DoS), worms, viruses, identity theft, and theft of service</b>.",
            "Systems first distinguish among users via <b>User Identities (User IDs / Security IDs)</b>—a unique name and number per user that is associated with all of that user's files and processes to enforce access control.",
            "A <b>Group Identifier (Group ID)</b> defines a set of users and is also associated with each process and file.",
            "<b>Privilege escalation</b> allows a user (e.g., via <code>setuid</code> or <code>sudo</code>) to change to an <b>effective ID</b> with more rights for a specific operation."
          ]
        },
        {
          "h": "Kernel Data Structures (Section 1.10)",
          "pts": [
            "<b>Linked Lists</b> accommodate variable-sized items with easy insertion/deletion but require linear retrieval time <b>O(n)</b>: (1) <b>Singly linked list</b> (each node points to successor), (2) <b>Doubly linked list</b> (each node points to predecessor and successor), (3) <b>Circularly linked list</b> (last element points to the first element instead of <code>null</code>).",
            "<b>Stack</b>: sequentially ordered <b>LIFO (Last-In, First-Out)</b> structure using <code>push</code> and <code>pop</code>; used by the OS when invoking function calls to store parameters, local variables, and the return address.",
            "<b>Queue</b>: sequentially ordered <b>FIFO (First-In, First-Out)</b> structure; used for printer job queues and CPU scheduling ready queues.",
            "<b>Trees</b>: hierarchical parent-child structures. An unbalanced <b>Binary Search Tree (BST)</b> (where <code>left_child &lt;= right_child</code>) has worst-case search time <b>O(n)</b>, whereas a <b>Balanced Binary Search Tree</b> (such as Linux's <b>red-black tree</b> used in CPU scheduling) has at most <code>lg n</code> levels and guarantees <b>O(lg n)</b> worst-case lookup.",
            "<b>Hash Functions & Hash Maps</b>: map <code>[key:value]</code> pairs (such as username to password) in <b>O(1)</b> time; <b>hash collisions</b> (two inputs yielding the same index) are resolved using a linked list at that table slot.",
            "<b>Bitmaps</b>: a string of <code>n</code> binary digits representing the status of <code>n</code> resources (e.g., <code>0</code> = available, <code>1</code> = unavailable). A bitmap is <b>8 times more space-efficient</b> than an array of 8-bit Booleans and is widely used to track disk block availability."
          ]
        },
        {
          "h": "Computing Environments & Open-Source Operating Systems",
          "pts": [
            "<b>Traditional Computing</b>: standalone PCs, web <b>portals</b> exposing internal servers, <b>network computers (thin clients)</b> for centralized security/maintenance, and home firewalls.",
            "<b>Mobile Computing</b>: handheld smartphones and tablets dominated by <b>Apple iOS</b> and <b>Google Android</b>; include <b>GPS chips, accelerometers, and gyroscopes</b> enabling navigation and augmented reality over IEEE 802.11 Wi-Fi or cellular networks, while trading off smaller memory/slower low-power CPUs for battery life.",
            "<b>Distributed Systems</b>: physically separate, possibly heterogeneous systems networked together (most commonly via <b>TCP/IP</b> across <b>LAN, MAN, WAN, or PAN</b>). A <b>Network Operating System</b> provides file sharing and message passing across autonomous hosts, whereas a <b>Distributed Operating System</b> creates the illusion that a single OS controls the entire network.",
            "<b>Client-Server vs. Peer-to-Peer (P2P)</b>: Client-Server splits systems into <b>compute servers</b> (e.g., databases) and <b>file servers</b> (e.g., web servers). In <b>P2P</b>, all nodes are peers acting as both client and server, avoiding the single-server bottleneck. P2P service discovery uses either a <b>centralized lookup service</b> (e.g., <b>Napster</b>) or a <b>broadcast discovery protocol</b> (e.g., <b>Gnutella</b>); <b>Skype</b> uses a hybrid P2P VoIP model.",
            "<b>Virtualization vs. Emulation</b>: <b>Emulation</b> translates instructions when the source CPU differs from the target CPU (e.g., Apple <b>Rosetta</b> running PowerPC code on Intel x86) or via <b>interpretation</b> (e.g., Java VM), which is slow. <b>Virtualization</b> runs guest OSs natively compiled for the same CPU architecture under a <b>Virtual Machine Manager (VMM)</b> such as VMware or Citrix XenServer.",
            "<b>Cloud Computing</b>: delivers computing, storage, and apps as a service over the network built on virtualization (e.g., <b>Amazon EC2</b>), using load balancers and firewalls. Models include <b>Public, Private, and Hybrid clouds</b>, plus <b>SaaS</b> (Software as a Service, e.g., online word processor), <b>PaaS</b> (Platform as a Service, e.g., database stack), and <b>IaaS</b> (Infrastructure as a Service, e.g., servers/storage).",
            "<b>Real-Time Embedded Systems</b>: the most prevalent form of computers (car engines, robots, appliances); have little/no UI and run a <b>Real-Time OS (RTOS)</b> with <b>well-defined, fixed time constraints</b>—operation is correct only if processing finishes within the deadline.",
            "<b>Open-Source Operating Systems</b>: distributed in source-code format rather than closed binary (countering DRM). Started by Richard Stallman's <b>Free Software Foundation (FSF)</b> and the <b>GNU Manifesto</b> using the <b>copyleft GNU General Public License (GPL)</b>. Key examples: <b>GNU/Linux</b> (kernel started by Linus Torvalds in 1991), <b>BSD UNIX</b> (FreeBSD, NetBSD, OpenBSD, and Apple's <b>Darwin</b> core in Mac OS X), and <b>OpenSolaris / Project Illumos</b>."
          ]
        }
      ],
      "cards": [
        [
          "Multiprogramming",
          "Keeps a subset of jobs in memory simultaneously so when one job waits for I/O, the CPU switches to another job."
        ],
        [
          "Timesharing (Multitasking)",
          "Logical extension of multiprogramming where the CPU switches jobs so frequently that users can interact with each running program (response time < 1s)."
        ],
        [
          "Dual-Mode Operation & Mode Bit",
          "Hardware protection mechanism with Kernel Mode (mode bit = 0) and User Mode (mode bit = 1)."
        ],
        [
          "Privileged Instructions",
          "Machine instructions (such as I/O, timer control, and interrupt management) that hardware permits to execute only in kernel mode (mode bit = 0)."
        ],
        [
          "Timer Interrupt",
          "Hardware counter initialized by the OS and decremented by the clock; interrupts the CPU at zero to prevent infinite loops or resource hogging."
        ],
        [
          "Process vs. Program",
          "A program is a passive entity (executable file stored on disk), whereas a process is an active entity (a program in execution with a program counter and resources)."
        ],
        [
          "Single-Threaded vs. Multi-Threaded Process",
          "A single-threaded process has one program counter; a multi-threaded process has one program counter per thread."
        ],
        [
          "Three Memory Management Activities",
          "(1) Track which parts of memory are used and by whom; (2) Decide which processes/data to move in and out; (3) Allocate and deallocate memory space."
        ],
        [
          "Three Mass-Storage Management Activities",
          "(1) Free-space management, (2) Storage allocation, and (3) Disk scheduling."
        ],
        [
          "Cache Coherency",
          "Hardware mechanism in multiprocessor systems ensuring that if one CPU updates a cached value, all other CPUs' caches immediately reflect the most recent value."
        ],
        [
          "Buffering vs. Caching vs. Spooling",
          "Buffering holds data temporarily during transfer; Caching keeps active data in faster storage; Spooling overlaps the output of one job with the input of other jobs."
        ],
        [
          "Protection vs. Security",
          "Protection controls access of internal processes/users to OS resources; Security defends the system against external and internal attacks (DoS, worms, viruses, identity theft)."
        ],
        [
          "User ID (UID), Group ID (GID) & Privilege Escalation",
          "UID identifies a single user; GID identifies a group of users; Privilege escalation switches a process to an effective ID with higher rights."
        ],
        [
          "Balanced Binary Search Tree (Red-Black Tree)",
          "Guarantees at most lg n levels and O(lg n) worst-case search time (unlike O(n) for an unbalanced BST); used in Linux's CPU scheduler."
        ],
        [
          "Bitmap",
          "A string of n bits representing the availability (0 or 1) of n resources such as disk blocks; 8x smaller than using 8-bit Booleans."
        ],
        [
          "Network OS vs. Distributed OS",
          "A Network OS provides file sharing and message passing across autonomous computers; a Distributed OS makes multiple networked computers appear as a single system."
        ],
        [
          "Compute Server vs. File Server",
          "A compute server executes action requests and returns results (e.g., database server); a file server provides an interface for clients to store and retrieve files (e.g., web server)."
        ],
        [
          "P2P Service Discovery (Napster vs. Gnutella)",
          "Napster used a centralized lookup index server; Gnutella used a decentralized broadcast discovery protocol across peers."
        ],
        [
          "Emulation vs. Virtualization",
          "Emulation translates instructions across different CPU architectures (slow, e.g., Rosetta); Virtualization runs guest OSs natively compiled for the same CPU via a VMM."
        ],
        [
          "SaaS vs. PaaS vs. IaaS",
          "SaaS delivers online applications; PaaS delivers a ready software stack (e.g., database server); IaaS delivers raw servers or storage over the Internet."
        ],
        [
          "Real-Time Operating System (RTOS)",
          "An OS with well-defined, fixed time constraints where correct operation depends on returning the correct result within the deadline."
        ],
        [
          "Copyleft & GNU GPL",
          "FSF licensing model (created by Richard Stallman) requiring that source code be distributed with binaries and any modifications be released under the same GPL license."
        ]
      ],
      "qa": [
        [
          "How does the distinction between kernel mode and user mode function as a rudimentary protection system?",
          "Hardware maintains a <b>mode bit</b> (<code>0</code> for kernel mode, <code>1</code> for user mode). User applications execute in user mode (<code>1</code>), where potentially harmful <b>privileged instructions</b> (direct I/O, modifying timer or memory-management registers, disabling interrupts) are blocked by hardware and trigger a trap. Only the OS kernel running in kernel mode (<code>0</code>) can execute privileged instructions.",
          "Chapter 1 · Practice Exercise 1.5"
        ],
        [
          "Why is multiprogramming needed, and how does timesharing (multitasking) extend it?",
          "A single user cannot keep both the CPU and I/O devices busy at all times. <b>Multiprogramming</b> keeps multiple jobs in memory simultaneously so the OS can switch to another job whenever the current job waits for I/O. <b>Timesharing</b> extends this by switching the CPU among processes so rapidly that every user can interact with their running program with a response time under 1 second.",
          "Chapter 1 · Slides 1.30–1.32"
        ],
        [
          "What is the main difficulty a programmer must overcome in writing an operating system for a real-time environment?",
          "A real-time operating system has <b>well-defined, fixed time constraints</b>. The programmer must guarantee that all sensing, processing, and control actions complete within strict deadlines; if a deadline is missed, the system fails even if the computed value is mathematically correct.",
          "Chapter 1 · Practice Exercise 1.3"
        ],
        [
          "List the six major activities of an operating system with respect to process management.",
          "1. Creating and deleting both user and system processes.<br>2. Scheduling processes and threads on the CPUs.<br>3. Suspending and resuming processes.<br>4. Providing mechanisms for process synchronization.<br>5. Providing mechanisms for process communication.<br>6. Providing mechanisms for deadlock handling.",
          "Chapter 1 · Slide 1.37"
        ],
        [
          "How does the problem of maintaining coherence of cached data manifest across single-processor multitasking, multiprocessor, and distributed environments?",
          "1. <b>Single-processor multitasking</b>: if integer <code>A</code> is modified in a register or cache by one process, the OS must ensure any other process accessing <code>A</code> sees the most recent value.<br>2. <b>Multiprocessor (SMP)</b>: copies of <code>A</code> may exist simultaneously in several CPUs' local caches, requiring hardware <b>cache coherency</b> so an update on one core invalidates or updates other cores.<br>3. <b>Distributed environment</b>: replicas of a file or datum may reside on separate networked hosts, requiring distributed consistency protocols.",
          "Chapter 1 · Slide 1.42 & Exercise 1.24"
        ],
        [
          "Distinguish between the Client-Server and Peer-to-Peer (P2P) models of distributed systems, including how P2P nodes discover services.",
          "In <b>Client-Server</b> systems, dedicated servers (compute servers or file servers) satisfy requests from clients, making the server a potential bottleneck. In <b>Peer-to-Peer (P2P)</b> systems, every node is a peer that can act as both client and server. P2P nodes discover services either by registering with a <b>centralized lookup service</b> (like Napster) or by broadcasting requests using a <b>decentralized discovery protocol</b> (like Gnutella).",
          "Chapter 1 · Practice Exercise 1.11"
        ],
        [
          "What is the difference between Emulation and Virtualization?",
          "<b>Emulation</b> is used when the source CPU architecture differs from the target CPU architecture (for example, Apple's Rosetta translating PowerPC instructions to run on an Intel x86 CPU, or a Java VM interpreting bytecode), which incurs heavy translation overhead. <b>Virtualization</b> runs guest operating systems that were natively compiled for the exact same underlying CPU architecture, managed and isolated by a Virtual Machine Manager (VMM).",
          "Chapter 1 · Slide 1.50"
        ],
        [
          "Compare Public, Private, and Hybrid clouds, as well as SaaS, PaaS, and IaaS.",
          "<b>Public cloud</b>: available over the Internet to anyone willing to pay; <b>Private cloud</b>: operated by a company for its own internal use; <b>Hybrid cloud</b>: combines public and private cloud components.<br><b>SaaS (Software as a Service)</b>: delivers complete applications over the Internet (e.g., word processor); <b>PaaS (Platform as a Service)</b>: delivers a ready software stack (e.g., database server); <b>IaaS (Infrastructure as a Service)</b>: provides raw compute servers or storage over the Internet.",
          "Chapter 1 · Slide 1.55"
        ],
        [
          "Compare lists, stacks, queues, balanced binary search trees, hash maps, and bitmaps as kernel data structures.",
          "<b>Linked lists</b> (singly, doubly, circular) handle variable-length items easily but have <code>O(n)</code> search; <b>Stacks (LIFO)</b> manage function-call frames via <code>push</code>/<code>pop</code>; <b>Queues (FIFO)</b> order CPU and printer scheduling; <b>Balanced BSTs</b> (e.g., Linux red-black trees) reduce worst-case search from <code>O(n)</code> to <code>O(lg n)</code>; <b>Hash maps</b> offer <code>O(1)</code> lookup and resolve collisions via linked lists; <b>Bitmaps</b> represent availability of <code>n</code> resources (such as disk blocks) using 1 bit per item.",
          "Chapter 1 · Section 1.10"
        ],
        [
          "What is the difference between Protection and Security, and how do User IDs, Group IDs, and Privilege Escalation work?",
          "<b>Protection</b> is any internal mechanism controlling the access of processes or users to OS resources, while <b>Security</b> defends the system against external and internal attacks (DoS, worms, viruses, identity theft). Each user is assigned a unique <b>User ID (UID)</b> and belongs to one or more <b>Group IDs (GIDs)</b> attached to all their processes and files; <b>privilege escalation</b> temporarily changes a process's effective ID to grant higher permissions.",
          "Chapter 1 · Slide 1.44"
        ]
      ],
      "quiz": [
        {
          "q": "Why is multiprogramming needed in an operating system?",
          "o": [
            [
              "Because a single user cannot keep both the CPU and I/O devices busy at all times",
              "Correct. Slide 1.30 states that multiprogramming is needed for efficiency because a single user cannot keep the CPU and I/O devices busy at all times."
            ],
            [
              "Because single-processor CPUs cannot execute instructions without at least four cores",
              "Multiprogramming works on a single-core CPU by switching between jobs in memory."
            ],
            [
              "Because ROM firmware can only hold multiple programs simultaneously",
              "Multiprogramming keeps multiple jobs in volatile main memory (RAM), not ROM."
            ],
            [
              "Because DMA controllers cannot operate unless timesharing is disabled",
              "DMA operates in both multiprogrammed and timesharing systems."
            ]
          ],
          "a": 0,
          "src": "Lecture 2 · Slide 1.30"
        },
        {
          "q": "In a timesharing (multitasking) system, if processes do not fit completely in main memory, what two mechanisms allow them to be executed?",
          "o": [
            [
              "Polling and vectored interrupts",
              "Polling and vectored interrupts are hardware interrupt-handling methods."
            ],
            [
              "Swapping and virtual memory",
              "Correct. Slide 1.32 states that if processes don't fit in memory, swapping moves them in and out to run, and virtual memory allows execution of processes not completely in memory."
            ],
            [
              "Spooling and WORM optical storage",
              "Spooling is for I/O device staging, and WORM is write-once optical media."
            ],
            [
              "Asymmetric clustering and SAN locking",
              "Clustering and SANs are multi-computer high-availability architectures."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.32"
        },
        {
          "q": "In dual-mode operation, what values of the hardware <b>mode bit</b> represent <b>kernel mode</b> and <b>user mode</b>?",
          "o": [
            [
              "Kernel mode = 1; User mode = 0",
              "This reverses the standard hardware mode bit convention."
            ],
            [
              "Kernel mode = 0; User mode = 1",
              "Correct. In dual-mode hardware (Slide 1.33–1.34), kernel mode is indicated by mode bit = 0 and user mode by mode bit = 1."
            ],
            [
              "Kernel mode = -1; User mode = 2",
              "A single hardware mode bit is binary (0 or 1)."
            ],
            [
              "Both modes use mode bit = 0, distinguished only by the Group ID",
              "The hardware mode bit explicitly flips between 0 (kernel) and 1 (user)."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slides 1.33–1.34"
        },
        {
          "q": "What happens when a user program invokes a system call in a dual-mode operating system?",
          "o": [
            [
              "The mode bit remains 1 and the user program executes the privileged instruction directly",
              "Privileged instructions cannot execute when mode bit = 1."
            ],
            [
              "The system call traps to the kernel (setting mode bit = 0), executes in kernel mode, and resets the mode bit to 1 upon return",
              "Correct. Slide 1.33 states that a system call changes the mode to kernel (0), and returning from the call resets it to user mode (1)."
            ],
            [
              "The CPU reboots into the BIOS bootstrap loader to verify permissions",
              "System calls happen thousands of times per second via software traps without rebooting."
            ],
            [
              "The timer counter is permanently disabled until the process terminates",
              "The timer continues protecting the CPU."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.33"
        },
        {
          "q": "Which hardware mechanism prevents a user process from getting stuck in an infinite loop and hogging the CPU forever?",
          "o": [
            [
              "The DMA block controller",
              "DMA handles high-speed I/O transfers, not CPU execution time limits."
            ],
            [
              "A timer that decrements a counter and generates an interrupt when it reaches zero",
              "Correct. Slide 1.34 explains that a timer is set to interrupt after a specific period; when the counter reaches zero, it generates an interrupt so the OS regains control."
            ],
            [
              "A magnetic disk sector lock",
              "Disk locks do not stop CPU-bound infinite loops."
            ],
            [
              "A secondary storage WORM drive",
              "WORM is write-once optical/tape media."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.34"
        },
        {
          "q": "What is the fundamental difference between a <b>program</b> and a <b>process</b>?",
          "o": [
            [
              "A program is an active entity in RAM, while a process is a passive file on disk",
              "This is backwards."
            ],
            [
              "A program is a passive entity, whereas a process is an active entity (a program in execution)",
              "Correct. Slide 1.35 states: 'A process is a program in execution. It is a unit of work within the system. Program is a passive entity, process is an active entity.'"
            ],
            [
              "A program can only run in kernel mode, while a process runs only in VMM mode",
              "Programs become user or system processes when executed."
            ],
            [
              "A program has multiple program counters, while a multi-threaded process has none",
              "A passive program has no active program counter; a multi-threaded process has one PC per thread."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.35"
        },
        {
          "q": "How many program counters (PCs) does a <b>multi-threaded process</b> have?",
          "o": [
            [
              "Zero—threads share the disk controller's sector counter instead",
              "Every thread tracks its next instruction via a program counter."
            ],
            [
              "Exactly one program counter shared across all threads simultaneously",
              "A single-threaded process has one program counter; a multi-threaded process has one per thread."
            ],
            [
              "One program counter per thread",
              "Correct. Slide 1.36 states that a single-threaded process has one program counter, while a multi-threaded process has one program counter per thread."
            ],
            [
              "Two program counters per thread (one for RAM and one for ROM)",
              "Each thread requires one program counter pointing to its next instruction."
            ]
          ],
          "a": 2,
          "src": "Lecture 2 · Slide 1.36"
        },
        {
          "q": "Which of the following is an activity of <b>Mass-Storage Management</b> rather than Memory Management?",
          "o": [
            [
              "Keeping track of which parts of RAM are currently being used and by whom",
              "That is a Main Memory Management activity (Slide 1.38)."
            ],
            [
              "Free-space management, storage allocation, and disk scheduling",
              "Correct. Slide 1.40 lists free-space management, storage allocation, and disk scheduling as the core OS activities of Mass-Storage Management."
            ],
            [
              "Assigning User IDs and Group IDs for privilege escalation",
              "That is Protection and Security (Slide 1.44)."
            ],
            [
              "Setting the hardware mode bit to 0 during a trap",
              "That is Dual-Mode Operation (Slide 1.33)."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.40"
        },
        {
          "q": "In a multiprocessor environment, when an integer <code>A</code> migrates from disk to main memory to local cache, what must be provided so all CPUs see the most recent value?",
          "o": [
            [
              "Spooling in the printer daemon",
              "Spooling stages I/O jobs, not CPU cache lines."
            ],
            [
              "Cache coherency in hardware",
              "Correct. Slide 1.42 states: 'Multiprocessor environment must provide cache coherency in hardware such that all CPUs have the most recent value in their cache.'"
            ],
            [
              "A WORM tertiary tape drive",
              "Tertiary tape storage has nothing to do with CPU cache lines."
            ],
            [
              "Emulation via Rosetta",
              "Rosetta is a CPU instruction translator."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.42"
        },
        {
          "q": "Within the OS I/O subsystem, what is <b>spooling</b>?",
          "o": [
            [
              "Storing data temporarily while it is being transferred between two devices",
              "That is buffering (Slide 1.43)."
            ],
            [
              "Storing parts of data in faster storage for performance",
              "That is caching (Slide 1.43)."
            ],
            [
              "Overlapping of the output of one job with the input of other jobs",
              "Correct. Slide 1.43 defines spooling as the overlapping of the output of one job with the input of other jobs (e.g., staging print jobs on disk)."
            ],
            [
              "Polling every device controller in a tight CPU wait loop",
              "That is busy-wait polling."
            ]
          ],
          "a": 2,
          "src": "Lecture 2 · Slide 1.43"
        },
        {
          "q": "How does Chapter 1 distinguish between <b>Protection</b> and <b>Security</b>?",
          "o": [
            [
              "Protection defends against external worms and DoS attacks, while Security manages disk scheduling",
              "This reverses Protection and Security."
            ],
            [
              "Protection is any mechanism for controlling access of processes or users to OS resources, while Security is the defense of the system against internal and external attacks",
              "Correct. Slide 1.44 defines Protection as controlling access of processes/users to OS resources and Security as defending the system against internal and external attacks (DoS, worms, viruses, identity theft, theft of service)."
            ],
            [
              "Protection applies only to mobile devices, while Security applies only to mainframes",
              "Both apply across all multiuser and networked systems."
            ],
            [
              "Protection is handled exclusively by the user interface, while Security is handled by the compiler",
              "Both are enforced throughout the operating system and hardware."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.44"
        },
        {
          "q": "What is the worst-case search performance of an <b>unbalanced</b> binary search tree of <code>n</code> items vs. a <b>balanced</b> binary search tree (such as Linux's red-black tree)?",
          "o": [
            [
              "Unbalanced: O(1); Balanced: O(n)",
              "An unbalanced tree can degenerate into a linked list of length n."
            ],
            [
              "Unbalanced: O(n); Balanced: O(lg n)",
              "Correct. Section 1.10.2 states that an unbalanced BST has worst-case O(n) performance, whereas a balanced BST has at most lg n levels and guarantees O(lg n) worst-case performance."
            ],
            [
              "Unbalanced: O(lg n); Balanced: O(n²)",
              "Balancing improves worst-case search to O(lg n)."
            ],
            [
              "Both guarantee O(1) worst-case lookup without collisions",
              "O(1) lookup is associated with hash functions, not trees."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Section 1.10.2"
        },
        {
          "q": "Why are <b>bitmaps</b> commonly used by operating systems to track the availability of thousands of disk blocks?",
          "o": [
            [
              "Because each bit stores a full 64-bit memory pointer to the next block",
              "A single bit is 0 or 1, not a 64-bit pointer."
            ],
            [
              "Because using a single bit per resource makes the data structure eight times smaller than using an 8-bit Boolean value",
              "Correct. Section 1.10.4 explains that bitmaps are highly space-efficient—an 8-bit Boolean per item would be eight times larger than a single bit per item."
            ],
            [
              "Because bitmaps automatically encrypt file contents against worms",
              "Bitmaps track resource status (0 = available, 1 = unavailable), not encryption."
            ],
            [
              "Because bitmaps eliminate the need for secondary storage",
              "Bitmaps track blocks on secondary storage."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Section 1.10.4"
        },
        {
          "q": "Which sensors/features does Slide 1.46 highlight as distinguishing mobile operating systems (Apple iOS and Google Android) from traditional laptops?",
          "o": [
            [
              "Magnetic tape drives and blade server chassis",
              "Those are data-center/mainframe components."
            ],
            [
              "GPS, gyroscope/accelerometer, taking photos, and recording videos (enabling apps like augmented reality)",
              "Correct. Slide 1.46 highlights GPS, gyroscopes, cameras, and video recording as mobile OS features that enable new app types like augmented reality."
            ],
            [
              "Larger 10 TB magnetic hard disks and higher-wattage multicore processors",
              "Mobile devices have smaller storage and lower-power processors than desktops."
            ],
            [
              "Lack of wireless networking support",
              "Mobile devices rely on IEEE 802.11 wireless and cellular data networks."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.46"
        },
        {
          "q": "In a Peer-to-Peer (P2P) distributed system, what are the two ways a node can discover available services on the network?",
          "o": [
            [
              "By querying the BIOS ROM or triggering a division-by-zero trap",
              "Those are local hardware/CPU operations."
            ],
            [
              "By registering with a centralized lookup service (e.g., Napster) or broadcasting a request via a discovery protocol (e.g., Gnutella)",
              "Correct. Slide 1.49 and Section 1.11.5 describe both methods: registering with a central lookup service on the network or broadcasting a request for service via a discovery protocol."
            ],
            [
              "By switching the mode bit to 0 or modifying the interrupt vector",
              "Those are local kernel mode transitions."
            ],
            [
              "By compiling a Linux kernel module or running SYSGEN",
              "Those are local OS configuration tasks."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.49"
        },
        {
          "q": "When is <b>emulation</b> used instead of native <b>virtualization</b>, and what is its main drawback?",
          "o": [
            [
              "When the source CPU type is different from the target CPU type (e.g., PowerPC to Intel x86); it is generally the slowest method",
              "Correct. Slide 1.50 states that emulation is used when the source CPU type differs from the target CPU type (e.g., PowerPC to Intel x86) and is generally the slowest method because every machine instruction must be translated."
            ],
            [
              "When both host and guest OSs are compiled natively for the exact same CPU; it runs faster than bare metal",
              "Running natively compiled guest OSs on the same CPU is virtualization, not emulation."
            ],
            [
              "When a cloud provider wants to balance network traffic across firewalls",
              "That is load balancing in cloud computing."
            ],
            [
              "When storing an embedded OS in EPROM firmware",
              "That is firmware storage."
            ]
          ],
          "a": 0,
          "src": "Lecture 2 · Slide 1.50"
        },
        {
          "q": "In Cloud Computing, what service model provides a software stack ready for application use via the Internet (for example, a database server)?",
          "o": [
            [
              "Software as a Service (SaaS)",
              "SaaS provides complete end-user applications (e.g., a word processor) over the Internet."
            ],
            [
              "Platform as a Service (PaaS)",
              "Correct. Slide 1.55 defines Platform as a Service (PaaS) as a software stack ready for application use via the Internet, such as a database server."
            ],
            [
              "Infrastructure as a Service (IaaS)",
              "IaaS provides raw servers or storage over the Internet (e.g., backup storage)."
            ],
            [
              "Hardware-as-a-Interrupt (HaaI)",
              "Not a cloud service model."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.55"
        },
        {
          "q": "What is the defining requirement of a <b>Real-Time Operating System (RTOS)</b>?",
          "o": [
            [
              "It must provide a 3D graphical user interface with mouse and keyboard support",
              "Real-time embedded systems usually have little or no user interface (Slide 1.56)."
            ],
            [
              "It has well-defined, fixed time constraints, and correct operation occurs only if processing is done within those constraints",
              "Correct. Slide 1.56 states that a real-time OS has well-defined, fixed time constraints: processing must be done within the constraint, and correct operation is achieved only if the constraints are met."
            ],
            [
              "It must be licensed exclusively under Digital Rights Management (DRM)",
              "RTOSs are defined by deterministic timing constraints, not DRM."
            ],
            [
              "It requires a Storage-Area Network (SAN) with at least 32 cluster nodes",
              "RTOSs typically run on small embedded controllers and sensors."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.56"
        },
        {
          "q": "Which organization started the free software movement and created the \"copyleft\" GNU General Public License (GPL)?",
          "o": [
            [
              "Xerox PARC",
              "Xerox PARC pioneered the graphical user interface (GUI) in the 1970s."
            ],
            [
              "The Free Software Foundation (FSF), founded by Richard Stallman",
              "Correct. Slide 1.57 and Section 1.12.1 state that the movement was started by Richard Stallman and the Free Software Foundation (FSF), which created the 'copyleft' GNU General Public License (GPL)."
            ],
            [
              "Microsoft Corporation",
              "Microsoft Windows is the classic example of a closed-source operating system."
            ],
            [
              "The Open Handset Alliance",
              "The Open Handset Alliance (led by Google) developed Android in the 2000s."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.57"
        },
        {
          "q": "Which open-source operating system forms the core kernel component (named <b>Darwin</b>) of Apple's Mac OS X?",
          "o": [
            [
              "MS-DOS",
              "MS-DOS was Microsoft's single-tasking 8088 OS."
            ],
            [
              "BSD UNIX",
              "Correct. Slide 1.57 and Section 1.12.3 state that Darwin, the open-source core kernel component of Mac OS X, is based on BSD UNIX (along with Mach)."
            ],
            [
              "OpenSolaris Illumos",
              "Illumos is derived from Sun's System V / OpenSolaris."
            ],
            [
              "PCLinuxOS Supergamer",
              "PCLinuxOS is a Linux LiveCD/LiveDVD distribution."
            ]
          ],
          "a": 1,
          "src": "Lecture 2 · Slide 1.57 & Section 1.12.3"
        }
      ]
    },
    {
      "n": 3,
      "code": "Lec 3",
      "title": "Chapter 2 (Part 1): OS Services, User Interfaces, System Calls & System Programs",
      "notes": [
        {
          "h": "Operating-System Services Helpful to the User",
          "pts": [
            "Operating systems provide an environment for the execution of programs and services to programs and users.",
            "<b>Six OS services that are helpful to the user</b>:",
            "1. <b>User Interface (UI)</b>: varies between <b>Command-Line Interface (CLI)</b>, <b>Batch</b> (commands/directives entered into files and executed), and <b>Graphical User Interface (GUI)</b>.",
            "2. <b>Program Execution</b>: the system must be able to load a program into memory, run that program, and end execution either <b>normally</b> or <b>abnormally</b> (indicating an error).",
            "3. <b>I/O Operations</b>: a running program may require I/O involving a file or an I/O device; for efficiency and protection, users cannot control I/O devices directly, so the OS provides the means to perform I/O.",
            "4. <b>File-System Manipulation</b>: programs need to read and write files and directories, create and delete them, search for a given file, list file information, and manage permissions based on ownership.",
            "5. <b>Communications</b>: processes may exchange information on the same computer or across a network via <b>shared memory</b> or <b>message passing</b> (packets moved by the OS).",
            "6. <b>Error Detection</b>: the OS must constantly detect and correct errors occurring in <b>CPU and memory hardware</b> (memory error, power failure), <b>I/O devices</b> (disk parity error, network connection failure, printer out of paper), or <b>user programs</b> (arithmetic overflow, illegal memory access, excessive CPU time)."
          ]
        },
        {
          "h": "Operating-System Services for System Efficiency",
          "pts": [
            "A second set of OS functions exists not for helping the individual user directly, but for ensuring the <b>efficient operation of the system itself via resource sharing</b>:",
            "1. <b>Resource Allocation</b>: when multiple users or multiple jobs run concurrently, resources must be allocated to each of them. Some resources (such as <b>CPU cycles, main memory, and file storage</b>) have special allocation code, whereas others (such as <b>I/O devices</b>) have general request and release code.",
            "2. <b>Accounting</b>: keeps track of which users use how much and what kinds of computer resources—used for billing or for accumulating usage statistics to reconfigure and improve the system.",
            "3. <b>Protection and Security</b>: concurrent processes must not interfere with each other or the OS. <b>Protection</b> ensures that all access to system resources is controlled; <b>Security</b> from outsiders requires user authentication (e.g., passwords) and defends external I/O devices and network adapters from invalid access attempts."
          ],
          "table": [
            [
              "Category",
              "Services Included",
              "Primary Purpose"
            ],
            [
              "User-Helpful Services (6)",
              "User interface, Program execution, I/O operations, File-system manipulation, Communications, Error detection",
              "Convenience of the user/programmer and ease of program execution"
            ],
            [
              "System-Efficiency Services (3)",
              "Resource allocation, Accounting, Protection and security",
              "Efficient and safe operation of the shared computer system itself"
            ]
          ]
        },
        {
          "h": "User and Operating-System Interfaces: CLI, GUI & Touchscreen",
          "pts": [
            "<b>Command-Line Interface (CLI) / Command Interpreter</b>: allows users to directly enter commands to be performed by the OS. Sometimes implemented in the kernel, and sometimes as a special system program. On systems with multiple command interpreters, they are known as <b>shells</b> (e.g., Bourne shell <code>sh</code>, C shell <code>csh</code>, Bourne-Again shell <code>bash</code>, Korn shell <code>ksh</code>).",
            "<b>Two ways shells implement commands</b>: (1) The command interpreter itself contains the code to execute each command (size grows with number of commands); (2) Commands are implemented as separate <b>system programs</b> (used by UNIX: e.g., typing <code>rm file.txt</code> searches for the file <code>rm</code>, loads it into memory, and executes it with parameter <code>file.txt</code>—adding new commands does not require modifying the shell).",
            "<b>Graphical User Interface (GUI)</b>: user-friendly <b>desktop metaphor</b> using mouse, keyboard, and monitor where icons represent files, programs, and actions, and directories are known as <b>folders</b>. First invented at <b>Xerox PARC</b> in the early 1970s (Xerox Alto, 1973) and popularized by Apple Macintosh in the 1980s.",
            "<b>Combined CLI + GUI systems</b>: Microsoft Windows is a GUI with a CLI command shell; Apple Mac OS X pairs the <b>Aqua</b> GUI with a UNIX kernel and shells underneath; UNIX and Linux provide a CLI with optional GUI environments (<b>CDE, X-Windows, KDE, GNOME</b>).",
            "<b>Touchscreen Interfaces</b>: smartphones and tablets make a mouse impractical, so actions and selections are based on finger gestures (pressing, swiping) and a simulated <b>virtual keyboard</b>."
          ]
        },
        {
          "h": "System Calls & Application Programming Interfaces (APIs)",
          "pts": [
            "<b>System calls</b> provide the programming interface to the services made available by the OS. They are typically written in a high-level language (<b>C or C++</b>), with low-level hardware tasks written in assembly.",
            "Application programmers mostly access OS services via a high-level <b>Application Programming Interface (API)</b> rather than invoking system calls directly.",
            "<b>Three most common APIs</b>: (1) <b>Win32 / Windows API</b> for Windows systems; (2) <b>POSIX API</b> for POSIX-based systems (virtually all versions of UNIX, Linux, and Mac OS X); (3) <b>Java API</b> for the Java Virtual Machine (JVM). On UNIX/Linux, the C library providing the API is <code>libc</code>.",
            "<b>Why use an API rather than direct system calls?</b> (1) <b>Program portability</b>—an application written to an API can compile and run on any system supporting that same API; (2) <b>Simplicity</b>—actual system calls are often more detailed and complex to work with than high-level API functions (e.g., Windows API <code>CreateProcess()</code> invokes the kernel's <code>NTCreateProcess()</code> system call)."
          ]
        },
        {
          "h": "System-Call Implementation & Parameter Passing",
          "pts": [
            "<b>System-Call Interface & Number Table</b>: the runtime support library (included with the compiler) provides a <b>system-call interface</b>. A unique number is associated with each system call, and the system-call interface maintains a <b>table indexed according to these numbers</b>.",
            "When an application calls an API function like <code>open()</code>, the system-call interface intercepts the call, traps to kernel mode, looks up the system-call number in the kernel table, invokes the kernel implementation, and returns the status and return value to the user program.",
            "<b>Three general methods for passing parameters to the OS</b>:",
            "1. <b>Registers</b>: simplest approach—pass parameters directly in CPU registers. However, there may be more parameters than available registers.",
            "2. <b>Block or Table in Memory</b>: parameters are stored in a block or table in memory, and the <b>address of the block is passed as a parameter in a register</b>. This approach is taken by <b>Linux and Solaris</b>.",
            "3. <b>Stack</b>: parameters are <b>pushed onto the stack</b> by the program and <b>popped off the stack</b> by the operating system.",
            "<i>Key advantage</i>: the <b>block</b> and <b>stack</b> methods do not limit the number or length of parameters being passed."
          ],
          "table": [
            [
              "Parameter-Passing Method",
              "How It Works",
              "Parameter Limit / OS Example"
            ],
            [
              "1. CPU Registers",
              "Parameters placed directly inside hardware registers",
              "Limited by number of CPU registers"
            ],
            [
              "2. Memory Block / Table",
              "Parameters stored in a memory table; block address passed in a register",
              "No limit on count/length (used by Linux and Solaris)"
            ],
            [
              "3. Program Stack",
              "Pushed onto stack by user program; popped off by OS kernel",
              "No limit on count/length"
            ]
          ]
        },
        {
          "h": "Six Categories of System Calls",
          "pts": [
            "1. <b>Process Control</b>: <code>end</code>, <code>abort</code>; <code>load</code>, <code>execute</code>; <code>create_process</code>, <code>terminate_process</code>; <code>get/set_process_attributes</code>; <code>wait_time</code>; <code>wait_event</code>, <code>signal_event</code>; <code>allocate</code> and <code>free</code> memory; memory dump and single-step debugger; locks (<code>acquire_lock</code>, <code>release_lock</code>) for shared data.",
            "2. <b>File Management</b>: <code>create</code>, <code>delete</code> file; <code>open</code>, <code>close</code>; <code>read</code>, <code>write</code>, <code>reposition</code>; <code>get</code> and <code>set</code> file attributes.",
            "3. <b>Device Management</b>: <code>request</code> device, <code>release</code> device; <code>read</code>, <code>write</code>, <code>reposition</code>; <code>get/set</code> device attributes; logically attach or detach devices. (UNIX merges files and devices into a combined file-device structure).",
            "4. <b>Information Maintenance</b>: <code>get/set</code> time or date; <code>get/set</code> system data; <code>get/set</code> process, file, or device attributes; memory dumps and time profiling.",
            "5. <b>Communications</b>: create/delete communication connection; <b>message-passing model</b> (<code>get_hostid</code>, <code>get_processid</code>, <code>open/close_connection</code>, <code>accept_connection</code>, <code>wait_for_connection</code>, <code>read/write_message</code> between client and server daemon) vs. <b>shared-memory model</b> (<code>shared_memory_create</code>, <code>shared_memory_attach</code>—fast memory-speed transfer, but processes must synchronize access).",
            "6. <b>Protection</b>: control access to resources; <code>get</code> and <code>set</code> permissions; <code>allow</code> and <code>deny</code> user access."
          ]
        },
        {
          "h": "System Programs (System Utilities)",
          "pts": [
            "<b>System programs</b> provide a convenient environment for program development and execution. Some are simple user interfaces to system calls, while others are complex. Most users' view of the OS is defined by <b>system programs and application programs</b>, not raw system calls.",
            "<b>Seven categories of system programs</b>: (1) <b>File management</b> (create, delete, copy, rename, print, dump, list files/directories); (2) <b>Status information</b> (date, time, free memory/disk, user count, performance/logging/debugging info, configuration <b>registry</b>); (3) <b>File modification</b> (text editors, commands to search/transform text); (4) <b>Programming-language support</b> (compilers, assemblers, debuggers, interpreters); (5) <b>Program loading and execution</b> (absolute loaders, relocatable loaders, linkage editors, overlay loaders); (6) <b>Communications</b> (virtual connections, messaging, web browsing, email, remote login, file transfer); (7) <b>Background services</b> (launched at boot time, run in <b>user context</b> rather than kernel context, known as <b>services, subsystems, or daemons</b> such as network daemons, print servers, and schedulers).",
            "<b>Application programs</b> do not pertain to the system, are run by users via CLI/mouse/touch, and are not considered part of the OS."
          ]
        }
      ],
      "cards": [
        [
          "Six User-Helpful OS Services",
          "User interface, Program execution, I/O operations, File-system manipulation, Communications, and Error detection."
        ],
        [
          "Three System-Efficiency OS Services",
          "Resource allocation, Accounting, and Protection & Security."
        ],
        [
          "Two Ways Shells Implement Commands",
          "(1) Built-in code inside the command interpreter itself; (2) External system program files loaded and executed on demand (e.g., UNIX `rm`)."
        ],
        [
          "Desktop Metaphor GUI Origin",
          "Invented at Xerox PARC in the early 1970s (Xerox Alto, 1973) and popularized by Apple Macintosh; uses icons, windows, menus, and folders."
        ],
        [
          "Three Most Common APIs",
          "Win32 API (Windows), POSIX API (UNIX, Linux, Mac OS X), and Java API (Java Virtual Machine)."
        ],
        [
          "Why Programmers Prefer APIs Over Raw System Calls",
          "Program portability across systems supporting the API, and simpler high-level abstractions compared to detailed low-level system calls."
        ],
        [
          "System-Call Interface & Number Table",
          "Runtime support layer in `libc` that intercepts API calls, indexes a kernel table by system-call number, invokes the kernel handler, and returns status."
        ],
        [
          "Three Methods of System-Call Parameter Passing",
          "(1) In CPU registers; (2) In a memory block/table whose address is passed in a register (Linux/Solaris); (3) Pushed onto the stack by the program and popped by the OS."
        ],
        [
          "Six Categories of System Calls",
          "Process control, File management, Device management, Information maintenance, Communications, and Protection."
        ],
        [
          "Message-Passing vs. Shared-Memory IPC",
          "Message passing is simpler and conflict-free for small data or network links; Shared memory runs at memory speed after `shared_memory_attach()`, but processes must synchronize writes."
        ],
        [
          "System Programs (Utilities)",
          "Software layer above the OS providing a convenient environment for development and execution; defines most users' view of the system."
        ],
        [
          "Loaders in System Programs",
          "Absolute loaders, relocatable loaders, linkage editors, and overlay loaders used for program loading and execution."
        ],
        [
          "Background Services (Daemons)",
          "Constantly running system-program processes launched at boot time that execute in user context (not kernel context) to handle tasks like networking, printing, and scheduling."
        ]
      ],
      "qa": [
        [
          "The services and functions provided by an operating system can be divided into two main categories. Briefly describe the two categories and how they differ.",
          "1. <b>User-helpful services</b> (user interface, program execution, I/O operations, file-system manipulation, communications, error detection) are provided for the convenience of the programmer and user to make running programs easier.<br>2. <b>System-efficiency services</b> (resource allocation, accounting, protection and security) ensure the efficient, fair, and protected operation of the shared computer system itself across multiple concurrent users and jobs.",
          "Chapter 2 · Exercise 2.12"
        ],
        [
          "What is the purpose of the command interpreter, and why is it usually separate from the kernel?",
          "The command interpreter (shell) gets and executes the next user-specified command. Keeping it separate from the kernel allows users to choose among multiple shells (`sh`, `bash`, `csh`, `ksh`), prevents shell bugs from crashing the kernel, and—when commands are external system programs like `rm`—lets programmers add new commands simply by creating new executable files without modifying or recompiling the shell or kernel.",
          "Chapter 2 · Practice Exercise 2.5"
        ],
        [
          "What is the purpose of system calls, and why do application programmers prefer using an API over invoking system calls directly?",
          "<b>System calls</b> provide the programming interface to services made available by the OS kernel. Programmers prefer coding to an <b>API</b> (Win32, POSIX, Java) because: (1) it provides <b>program portability</b> across any system supporting that API, and (2) raw system calls are much more detailed, low-level, and architecture-specific than API functions.",
          "Chapter 2 · Practice Exercise 2.1 & Slide 2.13"
        ],
        [
          "Describe the three general methods for passing parameters to the operating system during a system call.",
          "1. <b>Registers</b>: pass parameters directly in CPU registers (simplest, but limited by the number of hardware registers).<br>2. <b>Block or table in memory</b>: store parameters in a memory block/table and pass the block's address in a register (used by Linux and Solaris; no limit on parameter count).<br>3. <b>Stack</b>: push parameters onto the program stack and let the OS pop them off (also places no limit on the number or length of parameters).",
          "Chapter 2 · Exercise 2.13 & Slide 2.18"
        ],
        [
          "What are the six major categories of system calls provided by an operating system?",
          "1. <b>Process control</b> (`end`, `abort`, `load`, `execute`, `fork`, `wait`, locks)<br>2. <b>File management</b> (`create`, `delete`, `open`, `close`, `read`, `write`, `reposition`, attributes)<br>3. <b>Device management</b> (`request`, `release`, `read`, `write`, `ioctl`, attach/detach)<br>4. <b>Information maintenance</b> (`time`, `date`, `getpid`, `sleep`, `dump`, profiling)<br>5. <b>Communications</b> (message passing and shared memory creation/attachment)<br>6. <b>Protection</b> (`chmod`, `umask`, `chown`, `allow/deny_user`)",
          "Chapter 2 · Slides 2.20–2.23"
        ],
        [
          "What are the advantages and disadvantages of using the same system-call interface for manipulating both files and devices (as in UNIX)?",
          "<b>Advantages</b>: a unified file-device model simplifies the API and user programs—once a device or file is opened, the exact same `read()`, `write()`, `reposition()`, and `close()` calls work on both, treating devices as special file names.<br><b>Disadvantages</b>: some device-specific hardware operations do not fit cleanly into sequential byte-stream reads/writes, requiring escape-hatch calls like `ioctl()`.",
          "Chapter 2 · Exercise 2.16"
        ],
        [
          "What are the two models of interprocess communication (IPC), and what are the strengths and weaknesses of each?",
          "1. <b>Message-passing model</b>: processes exchange messages directly or via a mailbox through the OS. <i>Strengths</i>: no synchronization conflicts, easy to implement for smaller data sets and across networked computers. <i>Weakness</i>: slower per-transfer system-call overhead.<br>2. <b>Shared-memory model</b>: processes use `shared_memory_create()` and `shared_memory_attach()` to access a common RAM region. <i>Strength</i>: maximum speed and convenience at native memory speeds. <i>Weakness</i>: processes must handle protection and synchronization themselves to avoid simultaneous conflicting writes.",
          "Chapter 2 · Exercise 2.18"
        ],
        [
          "What is the purpose of system programs, and into what seven categories are they divided?",
          "System programs (utilities) provide a convenient environment for program development and execution, defining most users' practical view of the OS. Their 7 categories are: (1) File management, (2) Status information (including the registry), (3) File modification, (4) Programming-language support, (5) Program loading and execution, (6) Communications, and (7) Background services (daemons).",
          "Chapter 2 · Practice Exercise 2.7 & Slides 2.28–2.31"
        ],
        [
          "What are background services (daemons), and in what execution context do they run?",
          "Background services—also called <b>subsystems</b> or <b>daemons</b>—are constantly running system-program processes launched at boot time (such as network listeners, process schedulers, error loggers, and print servers). Importantly, they run in <b>user context</b> rather than kernel context.",
          "Chapter 2 · Slide 2.31"
        ],
        [
          "Where can errors occur that the OS Error Detection service must monitor and handle?",
          "1. <b>CPU and memory hardware</b> (e.g., memory parity error or power failure).<br>2. <b>I/O devices</b> (e.g., parity error on disk, broken network connection, or lack of paper in a printer).<br>3. <b>User programs</b> (e.g., arithmetic overflow, attempt to access an illegal memory location, or excessive CPU time).",
          "Chapter 2 · Slide 2.5"
        ]
      ],
      "quiz": [
        {
          "q": "Which of the following OS services is categorized primarily as ensuring the <b>efficient operation of the system itself</b> via resource sharing, rather than directly helping an individual user?",
          "o": [
            [
              "User interface (CLI, Batch, GUI)",
              "User interface is a user-helpful service (Slide 2.4)."
            ],
            [
              "Program execution and file-system manipulation",
              "Both are user-helpful services (Slide 2.4)."
            ],
            [
              "Resource allocation, accounting, and protection/security",
              "Correct. Slide 2.6 groups Resource allocation, Accounting, and Protection and security as the OS functions that ensure efficient operation of the system itself via resource sharing."
            ],
            [
              "Text editing and compiler syntax checking",
              "Those are system utilities, not core OS resource-sharing services."
            ]
          ],
          "a": 2,
          "src": "Lecture 3 · Slide 2.6"
        },
        {
          "q": "In UNIX, when a user types a command such as <code>rm file.txt</code> into the shell, how is the command typically executed?",
          "o": [
            [
              "The shell rewrites the ROM bootstrap loader and reboots the kernel",
              "Commands run as normal user processes without touching ROM."
            ],
            [
              "The command name is just the name of a system program file (`rm`) that the shell locates, loads into memory, and executes, so adding new commands requires no shell modification",
              "Correct. Slide 2.8 and Section 2.2.1 explain that in UNIX, commands are names of external program files (`rm`), allowing new features/commands to be added without modifying the shell."
            ],
            [
              "The shell must be recompiled from C source code every time a new command is added",
              "Only shells that hardcode every command internally require shell modification."
            ],
            [
              "The graphics adapter executes `rm` directly inside the monitor buffer",
              "File deletion is performed by a system program invoking file-system calls."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.8"
        },
        {
          "q": "Where was the desktop-metaphor Graphical User Interface (GUI) originally invented in the 1970s?",
          "o": [
            [
              "At the Free Software Foundation (FSF)",
              "FSF was founded by Richard Stallman in the 1980s for open-source GNU software."
            ],
            [
              "At Xerox PARC research facility",
              "Correct. Slide 2.10 states that the GUI was invented at the Xerox PARC research facility in the 1970s (first appearing on the Xerox Alto in 1973)."
            ],
            [
              "At Sun Microsystems for Solaris 10 DTrace",
              "Solaris 10 was released decades later."
            ],
            [
              "At Carnegie Mellon University for the Mach microkernel",
              "CMU developed the Mach microkernel in the mid-1980s."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.10"
        },
        {
          "q": "Which of the following accurately describes Apple Mac OS X's user interface and underlying kernel as stated on Slide 2.10?",
          "o": [
            [
              "MS-DOS CLI with no graphical interface",
              "Mac OS X uses the Aqua GUI."
            ],
            [
              "\"Aqua\" GUI interface with a UNIX kernel underneath and shells available",
              "Correct. Slide 2.10 states: 'Apple Mac OS X is \"Aqua\" GUI interface with UNIX kernel underneath and shells available.'"
            ],
            [
              "KDE and GNOME only, running on a Windows NT kernel",
              "KDE and GNOME are UNIX/Linux desktops, not Mac OS X's Aqua UI."
            ],
            [
              "Touchscreen-only Cocoa Touch with no command-line shell",
              "Cocoa Touch is iOS; Mac OS X uses Aqua and includes UNIX shells."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.10"
        },
        {
          "q": "What are the three most common Application Programming Interfaces (APIs) used by application programmers to access OS services?",
          "o": [
            [
              "ROM BIOS, EPROM, and GRUB",
              "Those are firmware and boot-loader components."
            ],
            [
              "Win32 API (Windows), POSIX API (UNIX, Linux, Mac OS X), and Java API (JVM)",
              "Correct. Slide 2.13 lists the three most common APIs: Win32 API for Windows, POSIX API for POSIX-based systems, and Java API for the Java virtual machine."
            ],
            [
              "FIFO, LIFO, and Red-Black Trees",
              "Those are kernel data structures."
            ],
            [
              "LAN, WAN, and PAN",
              "Those are network distance classifications."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.13"
        },
        {
          "q": "How does the <b>system-call interface</b> in the runtime support library invoke a requested system call inside the OS kernel?",
          "o": [
            [
              "It emails the request to a peer-to-peer lookup server",
              "System calls are local kernel traps, not network messages."
            ],
            [
              "It maintains a table indexed according to system-call numbers, invokes the corresponding system call in the OS kernel, and returns the status and return values",
              "Correct. Slide 2.16 states that a number is associated with each system call, and the system-call interface maintains a table indexed according to these numbers."
            ],
            [
              "It requires the application programmer to manually rewrite the kernel's assembly source code",
              "Slide 2.16 emphasizes that the caller need know nothing about how the system call is implemented."
            ],
            [
              "It overwrites the interrupt vector with user-mode stack frames",
              "The interrupt/trap vector is protected in kernel memory."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.16"
        },
        {
          "q": "Which method of passing parameters to the OS during a system call is specifically used by <b>Linux and Solaris</b> when there are many parameters?",
          "o": [
            [
              "Storing parameters in a block (or table) in memory and passing the block's address as a parameter in a register",
              "Correct. Slide 2.18 states: 'Parameters stored in a block, or table, in memory, and block address passed as a parameter in a register — This approach taken by Linux and Solaris.'"
            ],
            [
              "Writing parameters into the ROM bootstrap sector on disk",
              "ROM is read-only firmware."
            ],
            [
              "Discarding all parameters beyond the first two CPU registers",
              "Linux and Solaris use a memory block/table precisely to avoid register count limits."
            ],
            [
              "Sending parameters over an external Storage-Area Network (SAN)",
              "System call parameter passing happens in local memory/registers."
            ]
          ],
          "a": 0,
          "src": "Lecture 3 · Slide 2.18"
        },
        {
          "q": "Why do some operating systems prefer the <b>block</b> or <b>stack</b> parameter-passing methods over passing parameters solely in registers?",
          "o": [
            [
              "Because CPU registers are nonvolatile and cannot be overwritten",
              "Registers are volatile and fast, just limited in count."
            ],
            [
              "Because block and stack methods do not limit the number or length of parameters being passed",
              "Correct. Slide 2.18 explicitly notes: 'Block and stack methods do not limit the number or length of parameters being passed.'"
            ],
            [
              "Because registers can only be accessed in user mode",
              "Registers are accessible in both user and kernel modes."
            ],
            [
              "Because block and stack methods do not require main memory (RAM)",
              "Both block and stack methods store parameters in main memory."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.18"
        },
        {
          "q": "Under which of the six system-call categories do <code>end</code>, <code>abort</code>, <code>load</code>, <code>execute</code>, <code>wait event</code>, and <code>signal event</code> belong?",
          "o": [
            [
              "File management",
              "File management covers `create`, `delete`, `open`, `close`, `read`, `write`, `reposition`."
            ],
            [
              "Process control",
              "Correct. Slide 2.20 lists `end`, `abort`, `load`, `execute`, `create/terminate process`, `wait time`, `wait/signal event`, memory allocation, and locks under Process control."
            ],
            [
              "Information maintenance",
              "Information maintenance covers `time`, `date`, system data, and process/file/device attributes."
            ],
            [
              "Device management",
              "Device management covers `request/release device`, `read`, `write`, and logical attach/detach."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.20"
        },
        {
          "q": "Under which system-call category do <code>get time or date</code>, <code>get system data</code>, and <code>get/set process, file, or device attributes</code> fall?",
          "o": [
            [
              "Protection",
              "Protection covers permissions and allowing/denying user access."
            ],
            [
              "Communications",
              "Communications covers connections, message passing, and shared memory."
            ],
            [
              "Information maintenance",
              "Correct. Slide 2.22 classifies getting/setting time or date, system data, and process/file/device attributes under Information maintenance."
            ],
            [
              "Process control",
              "Process control manages process creation, execution, synchronization, and termination."
            ]
          ],
          "a": 2,
          "src": "Lecture 3 · Slide 2.22"
        },
        {
          "q": "Which category of system programs is used by some systems to implement a <b>registry</b> for storing and retrieving configuration information?",
          "o": [
            [
              "File modification",
              "File modification consists of text editors and text search/transformation tools."
            ],
            [
              "Status information",
              "Correct. Slide 2.29 states under Status information: 'Some systems implement a registry - used to store and retrieve configuration information.'"
            ],
            [
              "Programming-language support",
              "Programming-language support includes compilers, assemblers, debuggers, and interpreters."
            ],
            [
              "Program loading and execution",
              "Program loading and execution includes absolute/relocatable loaders and linkage editors."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.29"
        },
        {
          "q": "Absolute loaders, relocatable loaders, linkage editors, and overlay-loaders belong to which category of system programs?",
          "o": [
            [
              "Background services (daemons)",
              "Daemons are constantly running background services."
            ],
            [
              "Program loading and execution",
              "Correct. Slide 2.30 lists absolute loaders, relocatable loaders, linkage editors, and overlay-loaders under Program loading and execution."
            ],
            [
              "Status information",
              "Status information reports date, time, memory, disk space, and logs."
            ],
            [
              "Communications",
              "Communications creates virtual connections among processes, users, and systems."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.30"
        },
        {
          "q": "Which statement is TRUE regarding <b>Background Services</b> (also known as services, subsystems, or daemons) according to Slide 2.31?",
          "o": [
            [
              "They run in kernel context rather than user context",
              "Slide 2.31 explicitly states: 'Run in user context not kernel context.'"
            ],
            [
              "They launch at boot time, run in user context (not kernel context), and provide facilities like disk checking, process scheduling, error logging, and printing",
              "Correct. Slide 2.31 lists all of these exact characteristics for background services / daemons."
            ],
            [
              "They can only be launched manually by a finger poke on a touchscreen",
              "Application programs are launched by CLI, mouse click, or finger poke; background services launch at boot time."
            ],
            [
              "They overwrite the kernel in ROM during system shutdown",
              "Daemons run as user-context processes in RAM."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.31"
        },
        {
          "q": "According to Slide 2.28, what defines most users' view of the operating system?",
          "o": [
            [
              "The raw assembly-language interrupt vector in low memory",
              "Users never interact with the raw interrupt vector."
            ],
            [
              "The system programs (and application programs), not the actual system calls",
              "Correct. Slide 2.28 states: 'Most users' view of the operating system is defined by system programs, not the actual system calls.'"
            ],
            [
              "The internal microcode of the disk controller",
              "Disk controller microcode is hidden behind device drivers."
            ],
            [
              "The numeric system-call index table inside `libc`",
              "The system-call index table is hidden from users and programmers."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.28"
        },
        {
          "q": "In the <b>shared-memory</b> communication model, why must communicating processes coordinate their actions carefully?",
          "o": [
            [
              "Because the operating system forces every byte written to shared memory to pass through a network router",
              "Shared memory transfers occur directly at memory speed within the computer."
            ],
            [
              "Because the processes themselves are responsible for ensuring they do not write to the same memory location simultaneously",
              "Correct. Section 2.4.5 explains that once the OS removes memory-protection restrictions for a shared region, the format of data and synchronization (avoiding simultaneous conflicting writes) are the responsibility of the processes."
            ],
            [
              "Because shared memory is stored in read-only EPROM",
              "Shared memory is allocated in read-write RAM."
            ],
            [
              "Because shared memory can only hold 1 bit of data at a time",
              "Shared memory regions can be arbitrary sizes."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Section 2.4.5"
        },
        {
          "q": "When a C program calls <code>printf(\"Greetings\")</code> on a UNIX or Linux system, what happens behind the scenes?",
          "o": [
            [
              "`printf()` writes directly to the video monitor's hardware ports in user mode without involving the kernel",
              "User-mode code cannot access I/O hardware directly."
            ],
            [
              "The standard C library intercepts `printf()`, invokes the `write()` system call in the kernel, and returns the result to the user program",
              "Correct. Slide 2.25 and Section 2.4.1 illustrate the Standard C Library intercepting `printf()` in user mode, invoking the `write()` system call in kernel mode, and passing the return value back."
            ],
            [
              "The compiler replaces `printf()` with a `fork()` system call",
              "`fork()` creates a new process; `write()` outputs data."
            ],
            [
              "The kernel terminates the program abnormally with a core dump",
              "`printf()` performs normal standard output via `write()`."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.25"
        },
        {
          "q": "Which of the following is an example of an error in a <b>user program</b> that the OS Error Detection service must catch?",
          "o": [
            [
              "Lack of paper in the printer",
              "That is an I/O device error."
            ],
            [
              "A parity error on a magnetic disk or a failed network connection",
              "Those are I/O device errors."
            ],
            [
              "Arithmetic overflow, an attempt to access an illegal memory location, or using too much CPU time",
              "Correct. Section 2.1 lists arithmetic overflow, attempting to access an illegal memory location, and excessive CPU time as user-program errors."
            ],
            [
              "A power failure in the main memory supply",
              "That is a CPU/memory hardware error."
            ]
          ],
          "a": 2,
          "src": "Lecture 3 · Slide 2.5 & Section 2.1"
        },
        {
          "q": "Why do many operating systems, including UNIX, merge I/O devices and files into a combined file-device structure?",
          "o": [
            [
              "Because magnetic disks cannot store directories",
              "Disks store hierarchical directories."
            ],
            [
              "Because the operations on devices and files (`request`/`open`, `read`, `write`, `reposition`, `release`/`close`) are so similar that a single set of system calls can handle both",
              "Correct. Section 2.4.3 explains that because device operations closely mirror file operations, UNIX merges them into a combined file-device structure using the same system calls."
            ],
            [
              "To allow MS-DOS applications to bypass dual-mode protection",
              "UNIX uses dual-mode protection; combining file and device interfaces is an API design choice."
            ],
            [
              "To eliminate the need for device drivers in the kernel",
              "Device drivers are still required beneath the unified system-call interface."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.21 & Section 2.4.3"
        },
        {
          "q": "In the <b>message-passing</b> model of interprocess communication, what are the special-purpose system programs that execute <code>wait_for_connection()</code> to listen for incoming client requests?",
          "o": [
            [
              "Bootstrap loaders",
              "Bootstrap loaders run only at system startup."
            ],
            [
              "Daemons (server processes)",
              "Correct. Section 2.4.5 states that most processes receiving connections are special-purpose daemons (servers) that execute `wait_for_connection()` and awaken when a client connects."
            ],
            [
              "Absolute loaders",
              "Absolute loaders load executable binaries into memory."
            ],
            [
              "Interrupt vectors",
              "Interrupt vectors are address tables in low memory."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Section 2.4.5"
        },
        {
          "q": "Which of the following system calls belongs to the <b>Protection</b> category on Slide 2.23?",
          "o": [
            [
              "`reposition` and `delete file`",
              "Those belong to File management."
            ],
            [
              "`get and set permissions` and `allow and deny user access`",
              "Correct. Slide 2.23 lists 'Control access to resources', 'Get and set permissions', and 'Allow and deny user access' under Protection."
            ],
            [
              "`wait for time` and `allocate and free memory`",
              "Those belong to Process control."
            ],
            [
              "`get time or date` and `set system data`",
              "Those belong to Information maintenance."
            ]
          ],
          "a": 1,
          "src": "Lecture 3 · Slide 2.23"
        }
      ]
    },
    {
      "n": 4,
      "code": "Lec 4",
      "title": "Chapter 2 (Part 2): OS Design, Kernel Structures, Mobile OS, Debugging, SYSGEN & Boot",
      "notes": [
        {
          "h": "OS Design Goals & Separation of Policy from Mechanism",
          "pts": [
            "Designing an OS starts by defining goals and specifications, which are heavily affected by the <b>choice of hardware</b> and the <b>type of system</b> (batch, time-sharing, single-user, multiuser, distributed, real-time, or general-purpose).",
            "<b>User Goals</b>: the OS should be convenient to use, easy to learn, reliable, safe, and fast.",
            "<b>System Goals</b>: the OS should be easy to design, implement, and maintain, as well as flexible, reliable, error-free, and efficient.",
            "<b>Fundamental software engineering principle — Separate Policy from Mechanism</b>: <b>Policy</b> decides <i>What will be done?</i> while <b>Mechanism</b> determines <i>How to do it?</i>",
            "<i>Why separate them?</i> It provides <b>maximum flexibility</b> if policy decisions need to be changed later (e.g., the timer hardware/interrupt is the <b>mechanism</b> for CPU protection, while choosing how long to set the timer for a given user or whether to favor I/O-bound over CPU-bound jobs is a <b>policy</b> decision)."
          ],
          "table": [
            [
              "Concept",
              "Question Answered",
              "OS Example"
            ],
            [
              "Mechanism",
              "How to do something?",
              "Timer construct that interrupts the CPU when a counter reaches zero"
            ],
            [
              "Policy",
              "What will be done?",
              "Deciding how long the timer quantum is set for a particular user or class of jobs"
            ]
          ]
        },
        {
          "h": "Operating-System Implementation Languages",
          "pts": [
            "<b>Historical evolution</b>: early operating systems were written in <b>assembly language</b>; later systems used system programming languages like <b>ALGOL</b> (Burroughs MCP) and <b>PL/1</b> (MIT MULTICS); today, kernels are written primarily in <b>C and C++</b>.",
            "<b>Modern language mix</b>: lowest kernel levels (saving/restoring registers, low-level device handlers) in <b>assembly</b>, main kernel body in <b>C</b>, and system programs in <b>C, C++, or scripting languages</b> (Perl, Python, shell scripts).",
            "<b>Advantages of high-level languages</b>: faster code development, more compact code, easier to understand and debug, automatic performance improvements when compilers improve (via simple recompilation), and much <b>easier to port</b> to other hardware architectures (e.g., MS-DOS in Intel 8088 assembly only ran on x86, whereas Linux in C runs on x86, SPARC, PowerPC, and ARM).",
            "<b>Disadvantages & mitigation</b>: reduced speed and increased storage—mitigated by modern optimizing compilers and the fact that only a tiny fraction of OS code (the <b>interrupt handler, I/O manager, memory manager, and CPU scheduler</b>) is performance-critical and can have bottlenecks replaced with assembly if needed."
          ]
        },
        {
          "h": "Operating-System Structure: Simple & Traditional UNIX",
          "pts": [
            "<b>Simple Structure (MS-DOS)</b>: written to provide the most functionality in the least space; <b>not divided into modules</b>. Its interfaces and levels of functionality are not well separated—application programs can access basic I/O routines to write directly to the display and disk drives, making MS-DOS vulnerable to crashes from errant programs. (The Intel 8088 hardware also lacked dual-mode and hardware protection).",
            "<b>Traditional UNIX Structure</b>: limited by early hardware functionality, original UNIX consists of two separable parts: (1) <b>Systems programs</b> and (2) <b>The Kernel</b>.",
            "The traditional UNIX kernel consists of everything <b>below the system-call interface and above the physical hardware</b> (signals, terminal handling, character/block I/O, file system, swapping, CPU scheduling, page replacement, demand paging, virtual memory). It is \"beyond simple, but not fully layered\"—a <b>monolithic structure</b> that is difficult to implement and maintain, but provides distinct <b>performance advantages</b> (very low overhead in the system-call interface and in-kernel communication)."
          ]
        },
        {
          "h": "Layered Approach & Microkernel System Structure",
          "pts": [
            "<b>Layered Approach</b>: divides the OS into <code>N + 1</code> layers where <b>Layer 0 is the hardware</b> and <b>Layer N is the user interface</b>. Each layer uses functions and services of <b>only lower-level layers</b>.",
            "<i>Layered pros & cons</i>: main advantage is <b>simplicity of construction and debugging</b> (Layer 0 is debugged first, then Layer 1, etc.). Two major disadvantages: (1) <b>careful layer definition</b> is difficult when components have circular dependencies (e.g., virtual-memory backing-store driver vs. CPU scheduler); (2) <b>performance overhead</b> as system-call parameters are modified and passed through multiple layers.",
            "<b>Microkernel System Structure (e.g., Mach, Tru64 UNIX, QNX Neutrino)</b>: moves as much as possible from the kernel into <b>user space</b>, leaving a small microkernel that provides minimal process/memory management and <b>message passing</b>.",
            "In a microkernel, client programs and user-mode services (file system, device drivers, IPC) communicate <b>indirectly by exchanging messages through the microkernel</b>.",
            "<i>Microkernel benefits (4)</i>: (1) <b>Easier to extend</b> (new services added in user space without modifying the kernel); (2) <b>Easier to port</b> to new hardware; (3) <b>More reliable</b> (less code runs in kernel mode, so a crashed file server doesn't crash the kernel); (4) <b>More secure</b>.",
            "<i>Microkernel detriment (1)</i>: <b>performance overhead of user-space to kernel-space communication</b> (message passing and context switching, which led Windows NT to move layers back into kernel space between NT 1.0, NT 4.0, and XP)."
          ]
        },
        {
          "h": "Loadable Kernel Modules & Hybrid Systems",
          "pts": [
            "<b>Loadable Kernel Modules (LKMs)</b>: the best modern methodology for OS design (used by Linux, Solaris, Mac OS X, Windows). The kernel has a set of core components and dynamically links in additional services via object-oriented modules at boot time or runtime without recompiling the kernel.",
            "<i>Why LKMs beat pure layering and pure microkernels</i>: like layers, each component has defined, protected interfaces, but LKMs are <b>more flexible because any module can call any other module</b>; like a microkernel, the core kernel stays clean, but LKMs are <b>more efficient because modules communicate directly without message-passing overhead</b>.",
            "<b>Solaris 7 Loadable Module Types</b>: (1) Scheduling classes, (2) File systems, (3) Loadable system calls, (4) Executable formats, (5) STREAMS modules, (6) Miscellaneous modules, and (7) Device and bus drivers.",
            "<b>Hybrid Systems</b> combine multiple structures for performance, security, and usability: <b>Linux and Solaris</b> are monolithic (single kernel address space for speed) plus modular (dynamic LKMs); <b>Windows</b> is mostly monolithic plus microkernel-style user-mode subsystem personalities and loadable modules.",
            "<b>Apple Mac OS X Structure</b>: a hybrid layered system featuring the <b>Aqua UI</b> and application environments (<b>Cocoa</b> for Objective-C, Java, QuickTime, BSD) over the <b>Darwin kernel environment</b>, which combines the <b>Mach microkernel</b> (memory management, RPC/IPC message passing, thread scheduling), <b>BSD UNIX</b> (CLI, networking, file systems, POSIX/Pthreads APIs), an <b>I/O kit</b>, and dynamically loadable modules called <b>kernel extensions (kexts)</b>."
          ],
          "table": [
            [
              "OS Architecture",
              "Core Structure",
              "Key Strengths & Trade-offs"
            ],
            [
              "Simple (MS-DOS)",
              "Unmodularized; direct hardware access",
              "Tiny footprint, but zero protection; user crash brings down whole system"
            ],
            [
              "Monolithic (Traditional UNIX)",
              "Single large kernel below syscall interface",
              "Fast in-kernel communication, but difficult to maintain and extend"
            ],
            [
              "Layered",
              "Strict hierarchy Layer 0 (H/W) → Layer N (UI)",
              "Easy step-by-step debugging, but hard to order layers and adds call overhead"
            ],
            [
              "Microkernel (Mach, QNX)",
              "Minimal kernel; services in user space via IPC",
              "Highly extensible, portable, reliable, and secure, but suffers IPC overhead"
            ],
            [
              "Loadable Modules / Hybrid",
              "Monolithic core + dynamic kernel modules",
              "Combines monolithic speed with modular extensibility (Linux, Solaris, Mac OS X)"
            ]
          ]
        },
        {
          "h": "Mobile Operating Systems: Apple iOS & Google Android",
          "pts": [
            "<b>Apple iOS</b>: closed-source mobile OS for iPhone and iPad structured on Mac OS X, but compiled for <b>ARM</b> CPU architecture rather than Intel x86 (does not run Mac OS X apps natively). Its 4 layers from top to bottom are: (1) <b>Cocoa Touch</b> (Objective-C API supporting touchscreens and mobile hardware), (2) <b>Media Services</b> (graphics, audio, video), (3) <b>Core Services</b> (cloud computing, databases), and (4) <b>Core OS</b> (based on the Mac OS X Darwin kernel).",
            "<b>Google Android</b>: open-source mobile OS developed by the <b>Open Handset Alliance</b> (led by Google) running on a variety of hardware platforms.",
            "<b>Android Architecture Stack</b>: sits on a <b>modified Linux kernel</b> (managing processes, memory, device drivers, and added <b>power management</b>). Above the kernel are native C/C++ libraries—<b>WebKit</b> (web browser), <b>SQLite</b> (database), <b>OpenGL / Surface Manager</b> (graphics/multimedia), and a smaller <b>libc</b> for slower mobile CPUs—plus the <b>Android Runtime</b> consisting of Core Libraries and the <b>Dalvik Virtual Machine</b>.",
            "For Android apps written in Java using the separate Android API, Java class files are first compiled to <b>Java bytecode</b> and then translated into an executable file that runs in the <b>Dalvik VM</b> (optimized for mobile devices with limited memory and CPU)."
          ]
        },
        {
          "h": "OS Debugging, Performance Tuning, SYSGEN & System Boot",
          "pts": [
            "<b>Operating-System Debugging</b>: finding and fixing errors (bugs) in hardware and software, including performance tuning. OSs write error info to <b>log files</b>. An application failure generates a <b>core dump</b> file capturing the process's memory for debugger analysis. A kernel failure (<b>crash</b>) generates a <b>crash dump</b> file capturing kernel memory (often written to a raw disk partition with no file system and copied to a file after reboot).",
            "<b>Performance Tuning</b> removes bottlenecks by monitoring system behavior via (1) <b>trace listings</b> of logged events, (2) interactive tools like UNIX <code>top</code> and <b>Windows Task Manager</b>, (3) <b>profiling</b> (periodic sampling of the instruction pointer to identify statistical trends), and (4) <b>DTrace</b> (dynamic tracing probes in user and kernel modes).",
            "<b>Operating System Generation (SYSGEN)</b>: configures a general-purpose OS distribution for a specific computer site by determining CPU type/options, boot disk partitions, available memory, available devices (device/interrupt numbers), and OS options (buffer sizes, CPU scheduling algorithm, max processes). Three SYSGEN approaches: (1) modify source code and completely recompile the kernel (most tailored), (2) link selected modules from a precompiled library, or (3) construct a completely table-driven system (runtime selection).",
            "<b>System Boot</b>: when power is initialized, execution starts at a fixed memory location in <b>ROM/EEPROM firmware</b> holding the initial bootstrap code. It runs diagnostics, initializes hardware, and either runs the entire OS from ROM (small embedded/mobile devices) or uses a <b>two-step boot process</b> where ROM code loads a fixed <b>boot block</b> from disk (the boot/system disk), which loads a full bootstrap loader such as <b>GRUB</b> (allowing selection of kernel versions and options), which then loads the kernel into RAM and starts execution."
          ]
        }
      ],
      "cards": [
        [
          "User Goals vs. System Goals in OS Design",
          "User goals: convenient, easy to learn/use, reliable, safe, fast; System goals: easy to design/implement/maintain, flexible, reliable, error-free, efficient."
        ],
        [
          "Policy vs. Mechanism",
          "Policy decides 'What will be done?'; Mechanism determines 'How to do it?'. Separating them maximizes flexibility when policies change."
        ],
        [
          "Advantages of Implementing an OS in C/C++ over Assembly",
          "Faster to write, more compact, easier to understand and debug, benefits from compiler optimizations, and much easier to port to other CPU architectures."
        ],
        [
          "MS-DOS Simple Structure Vulnerability",
          "Not divided into modules and lacks hardware dual-mode protection on the Intel 8088, allowing user programs to access basic I/O directly and crash the whole system."
        ],
        [
          "Traditional UNIX Kernel Definition",
          "Everything below the system-call interface and above the physical hardware (file system, CPU scheduling, memory management, signals, I/O in one monolithic level)."
        ],
        [
          "Layered Approach Rule & Main Advantage",
          "Layer 0 is hardware and Layer N is the UI; each layer calls only lower layers, which simplifies construction, debugging, and verification."
        ],
        [
          "Two Disadvantages of the Layered Approach",
          "(1) Difficulty of ordering layers without circular dependencies (e.g., backing-store driver vs. CPU scheduler); (2) Performance overhead of passing parameters across layers."
        ],
        [
          "Microkernel Architecture (Mach)",
          "Moves nonessential services (file system, device drivers, IPC) out of the kernel into user space; modules communicate via message passing."
        ],
        [
          "Four Benefits & One Detriment of Microkernels",
          "Benefits: easier to extend, easier to port, more reliable, more secure. Detriment: performance overhead of user-to-kernel space message passing."
        ],
        [
          "Loadable Kernel Modules (LKMs)",
          "Object-oriented core kernel that dynamically links modules at boot/runtime; more flexible than layers (any module calls any module) and faster than microkernels (no message passing)."
        ],
        [
          "Mac OS X Hybrid Architecture",
          "Aqua UI + Cocoa Objective-C environment over the Darwin kernel, which combines the Mach microkernel, BSD UNIX, I/O kit, and kernel extensions."
        ],
        [
          "Four Layers of Apple iOS",
          "Cocoa Touch (top) → Media Services → Core Services → Core OS (bottom, based on Darwin/Mac OS X kernel on ARM)."
        ],
        [
          "Android Runtime & Dalvik VM",
          "Based on a modified Linux kernel (with power management); Java class files compile to Java bytecode and translate into executables for the Dalvik virtual machine."
        ],
        [
          "Core Dump vs. Crash Dump",
          "A core dump captures the memory of a failed user process; a crash dump captures kernel memory when the operating system itself crashes."
        ],
        [
          "Profiling",
          "Periodic sampling of the instruction pointer (program counter) using timer interrupts to determine statistical trends of where a program spends time."
        ],
        [
          "SYSGEN (System Generation)",
          "Program that obtains hardware-specific site configuration (CPU, memory, devices, scheduling options) to build a compiled, linked, or table-driven kernel."
        ],
        [
          "System Boot & GRUB",
          "Power-on starts at a fixed ROM firmware address; in a two-step boot, ROM loads the disk boot block, which loads the GRUB bootstrap loader to select and start the kernel."
        ]
      ],
      "qa": [
        [
          "Why is the separation of mechanism and policy desirable in operating-system design?",
          "<b>Mechanisms</b> determine <i>how</i> to do something, whereas <b>policies</b> decide <i>what</i> will be done. Separating them provides maximum flexibility: if policy decisions change later (or differ across installations, such as changing the timer quantum or prioritizing I/O-bound vs. CPU-bound processes), only policy parameters or loadable tables need to be updated without rewriting the underlying kernel mechanisms.",
          "Chapter 2 · Exercise 2.19 & Slide 2.33"
        ],
        [
          "What are the advantages and disadvantages of writing an operating system in a high-level language such as C instead of assembly language?",
          "<b>Advantages</b>: the code can be written faster, is more compact, is easier to read and debug, benefits automatically from compiler optimizations via recompilation, and is far easier to <b>port</b> to different CPU architectures (e.g., Linux on x86, ARM, SPARC, PowerPC vs. MS-DOS locked to Intel 8088).<br><b>Disadvantages</b>: slightly reduced speed and increased storage—though modern optimizing compilers minimize this, and any true bottleneck routines (interrupt handler, I/O manager, memory manager, CPU scheduler) can be rewritten in assembly.",
          "Chapter 2 · Slide 2.34 & Section 2.6.3"
        ],
        [
          "What is the main advantage of the layered approach to system design, and what are its two main disadvantages?",
          "<b>Main advantage</b>: simplicity of construction and debugging—since each layer uses services only from lower-level layers (starting with Layer 0 hardware), layers can be verified and debugged sequentially from bottom to top.<br><b>Disadvantages</b>: (1) appropriately defining layers is difficult when components depend on each other (e.g., virtual-memory backing-store driver vs. CPU scheduler); (2) passing and modifying parameters through multiple layers adds performance overhead to system calls.",
          "Chapter 2 · Practice Exercise 2.8 & Exercise 2.20"
        ],
        [
          "What are the main advantages of the microkernel approach, how do user programs and system services interact in it, and what is its main disadvantage?",
          "In a <b>microkernel</b> (such as Mach or QNX), nonessential services (file systems, device drivers) run in user space, and client programs interact with them indirectly by <b>exchanging messages (message passing) through the microkernel</b>.<br><b>Advantages</b>: easier to extend, easier to port to new hardware, and more reliable and secure (since less code runs in kernel mode).<br><b>Disadvantage</b>: performance overhead of user-space to kernel-space communication and context switching.",
          "Chapter 2 · Exercise 2.21 & Slide 2.40"
        ],
        [
          "What are the advantages of using loadable kernel modules (LKMs) over pure layered or microkernel designs?",
          "Loadable kernel modules allow a core kernel to dynamically link in new functionality (such as device drivers or file systems) at boot time or runtime without recompiling the kernel. LKMs are <b>more flexible than a layered system</b> because any module can call any other module, and <b>more efficient than a microkernel</b> because modules communicate directly inside kernel space without invoking message passing.",
          "Chapter 2 · Exercise 2.22 & Slide 2.42"
        ],
        [
          "Explain how Linux, Windows, and Apple Mac OS X function as hybrid operating systems.",
          "1. <b>Linux and Solaris</b>: monolithic (the kernel runs in a single address space for high performance) plus modular (using dynamically loadable kernel modules).<br>2. <b>Windows</b>: largely monolithic for performance, but incorporates microkernel features (user-mode subsystem personalities) and loadable kernel modules.<br>3. <b>Mac OS X</b>: layered Aqua UI and Cocoa programming environment above the Darwin kernel environment, which combines the <b>Mach microkernel</b>, <b>BSD UNIX</b> kernel components, an I/O kit, and loadable kernel extensions.",
          "Chapter 2 · Slides 2.44–2.45"
        ],
        [
          "How are Apple iOS and Google Android similar, and how are they different (including how Android executes Java programs)?",
          "<b>Similarities</b>: both are layered mobile software stacks providing rich frameworks for touchscreen mobile devices.<br><b>Differences</b>: iOS is closed-source, built on the Mac OS X Darwin kernel for ARM, and uses Objective-C with the Cocoa Touch API. Android is open-source, built on a modified Linux kernel (with added power management), and uses a separate Android Java API where Java class files are compiled to Java bytecode and then translated into executables for the <b>Dalvik virtual machine</b> (rather than a standard JVM) junto with SQLite, WebKit, and a smaller `libc`.",
          "Chapter 2 · Exercises 2.23–2.24 & Slides 2.46–2.48"
        ],
        [
          "Distinguish between a core dump and a crash dump, and explain how statistical profiling works.",
          "A <b>core dump</b> captures the memory of a failed user-level application process, whereas a <b>crash dump</b> captures kernel memory when the OS kernel itself fails (often written to a raw disk partition without a file system and extracted upon reboot). <b>Statistical profiling</b> periodically samples the CPU's instruction pointer (program counter) via regular timer interrupts to identify which sections of code consume the most execution time.",
          "Chapter 2 · Exercise 2.14 & Slide 2.49"
        ],
        [
          "Why do some systems store the operating system in firmware, while others store it on disk, and how does a multi-boot loader like GRUB work?",
          "Small embedded systems, phones, and consoles store the OS in <b>ROM/EPROM firmware</b> for ruggedness and simplicity, but firmware is expensive, small, slower than RAM, and hard to update. General-purpose OSs store a small bootstrap loader in ROM that reads a disk <b>boot block</b> (Block 0), which loads a full bootstrap program like <b>GRUB</b> from disk. GRUB understands file systems and presents a menu allowing the user to boot from multiple disks, operating systems, or kernel versions.",
          "Chapter 2 · Practice Exercises 2.10–2.11 & Slide 2.54"
        ],
        [
          "What is the role of the SYSGEN program, and what are the three ways it can generate an operating system?",
          "<b>SYSGEN (System Generation)</b> configures an OS distribution for a specific hardware site by gathering CPU, memory, disk partition, device interrupt, and scheduling parameters. It can generate the OS by: (1) modifying source code and completely recompiling the kernel, (2) linking selected precompiled modules from a library, or (3) building a completely table-driven system where selection happens at runtime.",
          "Chapter 2 · Slide 2.53 & Section 2.9"
        ]
      ],
      "quiz": [
        {
          "q": "In operating-system design, the principle of separating <b>policy</b> from <b>mechanism</b> states that:",
          "o": [
            [
              "Mechanisms decide what will be done, whereas policies determine how to do it",
              "This reverses the definitions of policy and mechanism."
            ],
            [
              "Policies decide what will be done, whereas mechanisms determine how to do it",
              "Correct. Slide 2.33 states: 'Policy: What will be done? Mechanism: How to do it? Mechanisms determine how to do something, policies decide what will be done.'"
            ],
            [
              "Policies must always be written in assembly language, while mechanisms are written in Python",
              "Both mechanisms and policies are architectural concepts, not language restrictions."
            ],
            [
              "Only single-tasking systems like MS-DOS separate policy from mechanism",
              "Microkernels and table-driven schedulers (like Solaris) exemplify strong policy/mechanism separation."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slide 2.33"
        },
        {
          "q": "Why is separating policy from mechanism considered a vital principle in OS software engineering?",
          "o": [
            [
              "Because it eliminates the need for a CPU timer interrupt",
              "The timer is the mechanism; the duration is the policy."
            ],
            [
              "Because it allows maximum flexibility if policy decisions are to be changed later without rewriting the underlying mechanism",
              "Correct. Slide 2.33 states: 'The separation of policy from mechanism is a very important principle, it allows maximum flexibility if policy decisions are to be changed later.'"
            ],
            [
              "Because it allows user-mode applications to overwrite the kernel's interrupt vector",
              "Kernel protection remains strictly enforced."
            ],
            [
              "Because it forces all operating systems to have the exact same graphical user interface",
              "Encoding a global look-and-feel into the kernel (as in Windows) actually couples policy and mechanism."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slide 2.33"
        },
        {
          "q": "Which of the following is a major advantage of implementing an operating system in a high-level language like C or C++ rather than assembly language?",
          "o": [
            [
              "It requires zero RAM and runs directly inside CPU registers",
              "High-level languages actually use slightly more storage than hand-tuned assembly."
            ],
            [
              "It is much easier to port to other hardware architectures, as well as faster to write, understand, and debug",
              "Correct. Slide 2.34 and Section 2.6.3 emphasize that a high-level language OS is far easier to port to other hardware and easier to write, compact, understand, and debug."
            ],
            [
              "It eliminates the need for a compiler",
              "C and C++ require a compiler."
            ],
            [
              "It allows MS-DOS 8088 assembly code to run natively on ARM without emulation",
              "MS-DOS was written in 8088 assembly and could not run natively on non-x86 CPUs."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slide 2.34"
        },
        {
          "q": "Why was MS-DOS vulnerable to entire system crashes whenever an errant user program failed?",
          "o": [
            [
              "Because MS-DOS used a Mach microkernel with excessive message-passing overhead",
              "MS-DOS used a Simple Structure, not a microkernel."
            ],
            [
              "Because its interfaces and levels of functionality were not well separated, and the Intel 8088 lacked dual-mode hardware protection",
              "Correct. Slide 2.36 and Section 2.7.1 explain that MS-DOS was not divided into modules, its interfaces and levels of functionality were not well separated, and the Intel 8088 provided no dual mode or hardware protection."
            ],
            [
              "Because MS-DOS forced all programs to run inside a Dalvik virtual machine",
              "Dalvik is Android's virtual machine."
            ],
            [
              "Because MS-DOS stored all user applications in read-only ROM",
              "MS-DOS loaded programs into RAM."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slide 2.36"
        },
        {
          "q": "In the traditional UNIX system structure (Slides 2.37–2.38), what constitutes the <b>kernel</b>?",
          "o": [
            [
              "Only the Bourne shell and the C compiler",
              "Shells and compilers live above the system-call interface as systems programs."
            ],
            [
              "Everything below the system-call interface and above the physical hardware",
              "Correct. Slide 2.37 states that the UNIX OS consists of two separable parts—systems programs and the kernel—where the kernel 'consists of everything below the system-call interface and above the physical hardware.'"
            ],
            [
              "Only the ROM BIOS device drivers",
              "ROM BIOS is an MS-DOS hardware layer."
            ],
            [
              "User-space servers communicating exclusively through a Mach message-passing bus",
              "Traditional UNIX is monolithic ('beyond simple but not fully layered'), not a microkernel."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slides 2.37–2.38"
        },
        {
          "q": "In the <b>Layered Approach</b> to OS structure (Slide 2.39), what are Layer 0 and Layer N, and what rule governs calls between layers?",
          "o": [
            [
              "Layer 0 is the user interface, Layer N is the hardware, and each layer calls only higher layers",
              "This is upside down: Layer 0 is hardware and Layer N is the user interface."
            ],
            [
              "Layer 0 is the hardware, Layer N is the user interface, and each layer uses functions and services of only lower-level layers",
              "Correct. Slide 2.39 states: 'The bottom layer (layer 0) is the hardware; the highest (layer N) is the user interface. With modularity, layers are selected such that each uses functions (operations) and services of only lower-level layers.'"
            ],
            [
              "Layer 0 is the Dalvik VM, Layer N is SQLite, and any layer can call any other layer freely",
              "Calling any module freely is a property of Loadable Kernel Modules, not strict layering."
            ],
            [
              "All layers execute in user mode with mode bit = 1",
              "Lower OS layers execute in kernel mode."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slide 2.39"
        },
        {
          "q": "How does a <b>Microkernel</b> system structure (such as Mach) organize the operating system, and how do user modules communicate?",
          "o": [
            [
              "It places all file systems, device drivers, and GUI windows inside a single monolithic kernel address space",
              "A microkernel moves nonessential services out of the kernel into user space."
            ],
            [
              "It moves as much from the kernel into user space as possible, and communication takes place between user modules using message passing",
              "Correct. Slide 2.40 states that a microkernel 'moves as much from the kernel into user space' and 'communication takes place between user modules using message passing.'"
            ],
            [
              "It compiles all user applications into ROM firmware during SYSGEN",
              "User modules run in RAM in user mode."
            ],
            [
              "It eliminates dual-mode operation so user programs can write directly to disk controllers",
              "Microkernels strictly enforce user mode for services and kernel mode for the microkernel."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slides 2.40–2.41"
        },
        {
          "q": "What is the main <b>detriment</b> (disadvantage) of a Microkernel system structure listed on Slide 2.40?",
          "o": [
            [
              "It is impossible to extend with new services",
              "Easier extension is a benefit of microkernels."
            ],
            [
              "It is less reliable and less secure because all code runs in kernel mode",
              "Higher reliability and security are benefits of microkernels because less code runs in kernel mode."
            ],
            [
              "Performance overhead of user-space to kernel-space communication",
              "Correct. Slide 2.40 explicitly lists 'Detriments: Performance overhead of user space to kernel space communication.'"
            ],
            [
              "It cannot be ported to new hardware architectures",
              "Easier portability is a key benefit of microkernels."
            ]
          ],
          "a": 2,
          "src": "Lecture 4 · Slide 2.40"
        },
        {
          "q": "Why are <b>Loadable Kernel Modules (LKMs)</b> (used in Linux and Solaris) considered more flexible than a layered system and more efficient than a microkernel?",
          "o": [
            [
              "Because any module can call any other module (more flexible than strict layers), and modules communicate directly in kernel space without invoking message passing (more efficient than a microkernel)",
              "Correct. Slide 2.42 and Section 2.7.4 explain both advantages of loadable kernel modules."
            ],
            [
              "Because LKMs require recompiling the entire kernel every time a device driver is loaded",
              "LKMs link dynamically at boot or runtime without recompiling the kernel."
            ],
            [
              "Because LKMs run exclusively in user space via TCP/IP sockets",
              "LKMs are dynamically loaded inside the kernel."
            ],
            [
              "Because LKMs disable virtual memory and swapping",
              "LKMs work alongside full virtual memory management."
            ]
          ],
          "a": 0,
          "src": "Lecture 4 · Slide 2.42 & Section 2.7.4"
        },
        {
          "q": "How does Slide 2.44 characterize the hybrid kernel architecture of <b>Linux and Solaris</b>?",
          "o": [
            [
              "Pure microkernels running all device drivers in user mode",
              "Linux and Solaris run their kernels in kernel address space."
            ],
            [
              "Monolithic (kernels in a single kernel address space for performance) plus modular for dynamic loading of functionality",
              "Correct. Slide 2.44 states: 'Linux and Solaris kernels in kernel address space, so monolithic, plus modular for dynamic loading of functionality.'"
            ],
            [
              "Unstructured MS-DOS systems without hardware protection",
              "Both Linux and Solaris have full hardware protection and modular kernels."
            ],
            [
              "Closed-source systems based on the Aqua UI and Cocoa Touch",
              "Aqua and Cocoa Touch are Apple Mac OS X and iOS technologies."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slide 2.44"
        },
        {
          "q": "In the <b>Apple Mac OS X</b> hybrid structure (Slides 2.44–2.45), what are the main components of the kernel environment underneath the Aqua UI and Cocoa environment?",
          "o": [
            [
              "MS-DOS ROM BIOS and Windows NT personalities",
              "Those are Microsoft architectures."
            ],
            [
              "The Mach microkernel and BSD UNIX parts, plus an I/O kit and dynamically loadable modules (kernel extensions)",
              "Correct. Slide 2.44 states: 'Below is kernel consisting of Mach microkernel and BSD Unix parts, plus I/O kit and dynamically loadable modules (called kernel extensions).'"
            ],
            [
              "The Dalvik virtual machine and SQLite kernel",
              "Dalvik and SQLite are part of the Android user-space stack."
            ],
            [
              "A pure 7-layer THE multiprogramming kernel with no modules",
              "Mac OS X uses the Darwin hybrid kernel."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slides 2.44–2.45"
        },
        {
          "q": "Why does <b>Apple iOS</b> not run Mac OS X applications natively despite being structured on Mac OS X (Slide 2.46)?",
          "o": [
            [
              "Because iOS uses the MS-DOS fat16 kernel",
              "iOS uses the Core OS layer based on the Mac OS X Darwin kernel."
            ],
            [
              "Because iOS runs on a different CPU architecture (ARM vs. Intel) and uses the mobile-specific Cocoa Touch API",
              "Correct. Slide 2.46 notes that iOS does not run OS X applications natively, runs on a different CPU architecture (ARM vs. Intel), and provides the Cocoa Touch Objective-C API for mobile apps."
            ],
            [
              "Because iOS is written entirely in interpreted BASIC",
              "iOS apps use Objective-C and Cocoa Touch."
            ],
            [
              "Because iOS lacks a media services or core services layer",
              "Slide 2.46 lists Cocoa Touch, Media services, Core services, and Core OS as iOS's layers."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slide 2.46"
        },
        {
          "q": "In the <b>Google Android</b> architecture (Slides 2.47–2.48), how are applications developed and executed?",
          "o": [
            [
              "Apps are written in Objective-C using Cocoa Touch and run on the Mach microkernel",
              "That describes Apple iOS."
            ],
            [
              "Apps are developed in Java (using the Android API); Java class files are compiled to Java bytecode and then translated into an executable that runs in the Dalvik virtual machine above a modified Linux kernel",
              "Correct. Slide 2.47 states: 'Based on Linux kernel but modified... Runtime environment includes core set of libraries and Dalvik virtual machine. Apps developed in Java plus Android API: Java class files compiled to Java bytecode then translated to executable that runs in Dalvik VM.'"
            ],
            [
              "Apps are written in 8088 assembly and overwrite the command interpreter",
              "That describes MS-DOS."
            ],
            [
              "Apps run unmodified Windows Win32 binaries inside Citrix XenServer",
              "Android runs Dalvik executables on a modified Linux kernel."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slides 2.47–2.48"
        },
        {
          "q": "In Operating-System Debugging (Slide 2.49), what is the difference between a <b>core dump</b> and a <b>crash dump</b>?",
          "o": [
            [
              "A core dump is generated by a failure in an application (capturing process memory), whereas a crash dump is generated by an operating-system failure (capturing kernel memory)",
              "Correct. Slide 2.49 states: 'Failure of an application can generate core dump file capturing memory of the process. Operating system failure can generate crash dump file containing kernel memory.'"
            ],
            [
              "A core dump captures magnetic disk tracks, whereas a crash dump captures ROM firmware",
              "Both capture memory states—process memory vs. kernel memory."
            ],
            [
              "A core dump is used only for network profiling, whereas a crash dump is used for SYSGEN",
              "Both are post-failure memory snapshots used for debugging."
            ],
            [
              "There is no difference; both terms refer to clearing the terminal screen",
              "They are distinct user-process vs. kernel memory dump files."
            ]
          ],
          "a": 0,
          "src": "Lecture 4 · Slide 2.49"
        },
        {
          "q": "What is <b>profiling</b> in the context of OS debugging and performance tuning (Slide 2.49)?",
          "o": [
            [
              "Erasing the boot sector of a magnetic disk",
              "That destroys the boot block."
            ],
            [
              "Periodic sampling of the instruction pointer to look for statistical trends",
              "Correct. Slide 2.49 defines profiling as 'periodic sampling of instruction pointer to look for statistical trends.'"
            ],
            [
              "Creating user IDs and group IDs for password authentication",
              "That is security and access control."
            ],
            [
              "Translating Java bytecode into Dalvik executables",
              "That is Android app compilation."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slide 2.49"
        },
        {
          "q": "Which interactive tools does Slide 2.50 give as examples for displaying measures of system behavior during performance tuning?",
          "o": [
            [
              "The `top` program (UNIX) and Windows Task Manager",
              "Correct. Slide 2.50 cites the `top` program and Windows Task Manager as examples of tools that compute and display measures of system behavior."
            ],
            [
              "Napster and Gnutella",
              "Napster and Gnutella are P2P file-sharing systems."
            ],
            [
              "GRUB and ROM BIOS",
              "GRUB and ROM BIOS are boot loaders."
            ],
            [
              "SQLite and WebKit",
              "SQLite and WebKit are Android database and browser libraries."
            ]
          ],
          "a": 0,
          "src": "Lecture 4 · Slide 2.50"
        },
        {
          "q": "What is the purpose of the <b>SYSGEN</b> (System Generation) program described on Slide 2.53?",
          "o": [
            [
              "To generate random passwords for peer-to-peer nodes",
              "SYSGEN configures an operating system for a specific hardware site."
            ],
            [
              "To obtain information concerning the specific configuration of the hardware system and build a system-specific or system-tuned kernel",
              "Correct. Slide 2.53 states: 'SYSGEN program obtains information concerning the specific configuration of the hardware system — Used to build system-specific compiled kernel or system-tuned.'"
            ],
            [
              "To convert a process core dump into an application binary",
              "Debuggers inspect core dumps; SYSGEN configures kernels."
            ],
            [
              "To emulate an IBM PowerPC processor on an Intel x86 laptop",
              "That is Rosetta CPU emulation."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slide 2.53"
        },
        {
          "q": "During <b>System Boot</b> (Slide 2.54), what is the two-step boot process used on many systems?",
          "o": [
            [
              "The user manually types the kernel binary in hexadecimal into RAM, then presses Enter",
              "Booting is automated by firmware and bootstrap loaders."
            ],
            [
              "ROM code loads a boot block at a fixed disk location, which in turn loads the full bootstrap loader (such as GRUB) from disk to locate and start the kernel",
              "Correct. Slide 2.54 describes the two-step process where a boot block at a fixed location is loaded by ROM code, which then loads the bootstrap loader (e.g., GRUB) from disk."
            ],
            [
              "The OS kernel loads first from volatile RAM and then installs the ROM chip",
              "ROM firmware must run first because RAM is volatile and uninitialized at power-on."
            ],
            [
              "The DMA controller formats the hard disk on every reboot before loading the shell",
              "Formatting would erase the disk; the boot block is read without formatting."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Slide 2.54"
        },
        {
          "q": "What capability does the common open-source bootstrap loader <b>GRUB</b> provide during system startup (Slide 2.54)?",
          "o": [
            [
              "It allows selection of the kernel from multiple disks, versions, and kernel options",
              "Correct. Slide 2.54 states: 'Common bootstrap loader, GRUB, allows selection of kernel from multiple disks, versions, kernel options.'"
            ],
            [
              "It translates C++ source files into Java bytecode",
              "GRUB is a boot loader, not a Java compiler."
            ],
            [
              "It replaces the CPU's arithmetic logic unit (ALU) during floating-point operations",
              "GRUB only runs during the boot sequence to load the kernel."
            ],
            [
              "It provides a graphical web browser inside the Android runtime",
              "WebKit provides the browser framework in Android."
            ]
          ],
          "a": 0,
          "src": "Lecture 4 · Slide 2.54"
        },
        {
          "q": "Why must a kernel failure (crash) often write its memory state to a dedicated raw disk area containing <b>no file system</b> before rebooting?",
          "o": [
            [
              "Because magnetic disks cannot hold files larger than 1 KB",
              "Disks hold gigabytes or terabytes of files."
            ],
            [
              "Because a kernel failure in the file-system code makes it risky for the crashed kernel to try saving its state to a file on the file system",
              "Correct. Section 2.8.1 explains that if the kernel crashes due to a bug in the file-system code, attempting to use the file system to write a dump could corrupt disk data; instead, it writes to a raw disk area with no file system and gathers the crash dump after reboot."
            ],
            [
              "Because kernel memory is stored in nonvolatile ROM",
              "Kernel memory is in volatile RAM and would be lost on reboot if not written to disk."
            ],
            [
              "Because `top` and Task Manager forbid file-system access",
              "`top` and Task Manager are user-space monitoring utilities."
            ]
          ],
          "a": 1,
          "src": "Lecture 4 · Section 2.8.1"
        }
      ]
    }
  ],
  "exams": [
    {
      "title": "Chapter 1 Comprehensive Practice Paper (Silberschatz 9th Ed. & Dr. Khaled Wassif Slides)",
      "meta": "Operating Systems · Chapter 1: Introduction · Practice Exercises 1.1–1.11 & Exercises 1.12–1.30",
      "note": "All questions and model answers are extracted directly from Chapter 1 of the course slides and reference book.",
      "sections": [
        {
          "title": "Part A · Multiple-Choice Questions",
          "marks": "5 questions · 2 marks each",
          "items": [
            {
              "type": "mcq",
              "q": "Which of the following instructions is safe to execute in <b>user mode</b> (i.e., does NOT need to be a privileged instruction)?",
              "o": [
                "Set value of timer",
                "Turn off interrupts",
                "Read the clock",
                "Modify entries in the device-status table"
              ],
              "a": 2,
              "why": "Practice Exercise 1.6: Reading the clock does not alter hardware protection or state. Setting the timer, turning off interrupts, and modifying the device-status table must be privileged.",
              "ow": [
                "Setting the timer must be privileged so a user process cannot disable CPU time limits.",
                "Turning off interrupts must be privileged so a user process cannot prevent the OS from regaining control.",
                null,
                "Modifying the device-status table must be privileged to protect kernel I/O state."
              ]
            },
            {
              "type": "mcq",
              "q": "In the 9-bit resource bitmap <code>001011101</code> (where 0 = available and 1 = unavailable, indexed 0 to 8 from left to right), which resources are available?",
              "o": [
                "Resources 2, 4, 5, 6, and 8",
                "Resources 0, 1, 3, and 7",
                "Resources 1, 2, 3, and 4",
                "Resources 0, 2, 4, 6, and 8"
              ],
              "a": 1,
              "why": "Section 1.10.4 (Page 34): Bits at positions 0, 1, 3, and 7 are 0 (available), while positions 2, 4, 5, 6, and 8 are 1 (unavailable).",
              "ow": [
                "Positions 2, 4, 5, 6, and 8 have bit value 1, meaning unavailable.",
                null,
                "Position 2 and 4 are 1 (unavailable) while position 0 and 7 are 0 (available).",
                "Positions 2, 4, 6, and 8 have bit value 1 (unavailable)."
              ]
            },
            {
              "type": "mcq",
              "q": "Which computing environment delivers computing, storage, and applications as a service across a network as a logical extension of virtualization (e.g., Amazon EC2)?",
              "o": [
                "Real-time embedded systems",
                "Cloud computing",
                "Single-processor batch systems",
                "ROM firmware bootstrapping"
              ],
              "a": 1,
              "why": "Slide 1.53: Cloud computing delivers computing, storage, and apps as a service across a network and is a logical extension of virtualization (e.g., Amazon EC2).",
              "ow": [
                "Real-time embedded systems monitor hardware sensors under fixed time constraints.",
                null,
                "Single-processor batch systems do not deliver virtualized network services.",
                "ROM firmware bootstrapping initializes a local machine at power-on."
              ]
            }
          ]
        },
        {
          "title": "Part B · Written Practice & Review Questions",
          "marks": "4 questions · 5 marks each",
          "items": [
            {
              "type": "written",
              "q": "1. (Practice Exercise 1.2) We have stressed the need for an operating system to make efficient use of the computing hardware. When is it appropriate for the operating system to forsake this principle and to \"waste\" resources? Why is such a system not really wasteful?",
              "ans": "Single-user <b>personal computers (PCs), workstations, and handheld mobile devices</b> are designed to optimize <b>user convenience, ease of use, and responsiveness</b> rather than hardware utilization. Leaving CPU cycles or memory idle waiting for user input or spending resources on rich GUIs is not truly wasteful because the hardware is dedicated to maximizing the human user's productivity, whereas human time is far more expensive than idle PC cycles.",
              "why": "Chapter 1, Slide 1.7 & Practice Exercise 1.2."
            },
            {
              "type": "written",
              "q": "2. (Practice Exercise 1.5 & 1.8) How does the distinction between kernel mode and user mode function as a rudimentary protection system, and what is a use of CPUs that provide more than two modes?",
              "ans": "Hardware provides a <b>mode bit</b> (<code>0</code> = kernel mode, <code>1</code> = user mode). Privileged instructions (I/O, timer, interrupt control, memory management) can only execute in kernel mode; if a user-mode program attempts one, the hardware traps to the OS. CPUs with <b>multi-mode operation</b> provide a separate mode for a <b>Virtual Machine Manager (VMM)</b> so the VMM can manage multiple guest operating systems safely (Slide 1.33).",
              "why": "Chapter 1, Slide 1.33 & Practice Exercises 1.5, 1.8."
            },
            {
              "type": "written",
              "q": "3. (Exercise 1.15 & 1.16) Describe the differences between symmetric and asymmetric multiprocessing, list the three advantages of multiprocessor systems, and explain how clustered systems differ from multiprocessor systems.",
              "ans": "• <b>Asymmetric multiprocessing</b> assigns each processor a specific task (master-slave), whereas <b>Symmetric Multiprocessing (SMP)</b> treats all processors as peers performing all OS tasks while sharing physical memory.<br>• <b>Three advantages</b>: (1) Increased throughput, (2) Economy of scale, and (3) Increased reliability (graceful degradation / fault tolerance).<br>• <b>Clustered systems</b> connect multiple independent computer systems over a LAN sharing storage via a <b>Storage-Area Network (SAN)</b> and a <b>Distributed Lock Manager (DLM)</b> to provide high-availability service.",
              "why": "Chapter 1, Slides 1.25–1.28 & Exercises 1.15–1.16."
            },
            {
              "type": "written",
              "q": "4. (Exercise 1.19 & 1.20) What is the purpose of interrupts, how does an interrupt differ from a trap, and how does Direct Memory Access (DMA) reduce CPU overhead?",
              "ans": "An <b>interrupt</b> notifies the CPU of an asynchronous hardware event (such as I/O completion) and transfers control to an ISR via the interrupt vector. A <b>trap (exception)</b> is a synchronous software-generated interrupt caused by an error (division by zero) or a user system-call request. <b>DMA</b> reduces CPU overhead for high-speed devices by having the device controller transfer entire <b>blocks of data</b> directly to/from main memory without CPU intervention, generating only <b>one interrupt per block</b> instead of one per byte.",
              "why": "Chapter 1, Slides 1.12–1.14, 1.23 & Exercises 1.19–1.20."
            }
          ]
        }
      ]
    },
    {
      "title": "Chapter 2 Comprehensive Practice Paper (Silberschatz 9th Ed. & Dr. Khaled Wassif Slides)",
      "meta": "Operating Systems · Chapter 2: Operating-System Structures · Practice Exercises 2.1–2.11, Exercises 2.12–2.25 & Kernel Module Projects",
      "note": "Covers OS services, system calls, parameter passing, OS structures, iOS/Android, debugging/DTrace, SYSGEN, GRUB, and Linux kernel modules.",
      "sections": [
        {
          "title": "Part A · Multiple-Choice Questions",
          "marks": "5 questions · 2 marks each",
          "items": [
            {
              "type": "mcq",
              "q": "Which parameter-passing method stores parameters in a memory block/table and passes the block's address in a register (the approach taken by Linux and Solaris)?",
              "o": [
                "Register-only parameter passing",
                "Block (or table) parameter passing",
                "ROM BIOS hardcoded parameter passing",
                "Single-step trap parameter passing"
              ],
              "a": 1,
              "why": "Slide 2.18 & Figure 2.7: Linux and Solaris store system-call parameters in a memory block/table and pass the block address in a CPU register.",
              "ow": [
                "Register-only passing places the values directly in registers and is limited by the number of registers.",
                null,
                "ROM BIOS is firmware, not a system-call parameter-passing method.",
                "Single-step is a debugger CPU trap mode."
              ]
            },
            {
              "type": "mcq",
              "q": "Which mobile OS is developed by the Open Handset Alliance on a modified Linux kernel and translates Java bytecode to run on the Dalvik virtual machine?",
              "o": [
                "Apple iOS",
                "Google Android",
                "MS-DOS",
                "QNX Neutrino"
              ],
              "a": 1,
              "why": "Slides 2.47–2.48: Google Android is open-source, runs on a modified Linux kernel (with power management), and translates Java bytecode into executables for the Dalvik VM.",
              "ow": [
                "Apple iOS is closed-source, based on Mac OS X Darwin, and uses Objective-C with Cocoa Touch.",
                null,
                "MS-DOS is a 16-bit 8088 desktop OS.",
                "QNX Neutrino is an embedded microkernel RTOS."
              ]
            },
            {
              "type": "mcq",
              "q": "When unloading a compiled Linux kernel module (`simple.ko`) from the running kernel, which command is used?",
              "o": [
                "`sudo insmod simple.ko`",
                "`sudo rmmod simple`",
                "`sudo dmesg -c`",
                "`lsmod simple`"
              ],
              "a": 1,
              "why": "Chapter 2 Programming Project (Page 98): `sudo rmmod simple` removes the module from the kernel (without the `.ko` suffix) and triggers `simple_exit()`.",
              "ow": [
                "`insmod` loads the module into the kernel.",
                null,
                "`dmesg -c` clears the kernel log buffer.",
                "`lsmod` lists currently loaded modules."
              ]
            }
          ]
        },
        {
          "title": "Part B · Written & Systems Programming Questions",
          "marks": "4 questions · 5 marks each",
          "items": [
            {
              "type": "written",
              "q": "1. (Exercise 2.19 & 2.21) Why is the separation of mechanism and policy desirable, and what are the benefits and detriments of the microkernel approach?",
              "ans": "Separating <b>policy</b> (what will be done) from <b>mechanism</b> (how to do it) provides maximum flexibility when policies change later without altering core mechanisms.<br>In a <b>microkernel</b> (e.g., Mach), nonessential services move to user space and communicate via message passing. <b>Benefits</b>: easier to extend, easier to port to new architectures, more reliable, and more secure. <b>Detriment</b>: performance overhead of user-space to kernel-space communication.",
              "why": "Chapter 2, Slides 2.33, 2.40 & Exercises 2.19, 2.21."
            },
            {
              "type": "written",
              "q": "2. (Exercise 2.22 & 2.23) What are the advantages of Loadable Kernel Modules (LKMs), and how do Apple iOS and Google Android compare?",
              "ans": "<b>Loadable Kernel Modules</b> allow a core kernel to dynamically link services at boot/runtime; they are more flexible than layered systems (any module can call any module) and more efficient than microkernels (no message passing needed).<br><b>iOS vs. Android</b>: both are layered mobile stacks, but iOS is closed-source on the Mac OS X Darwin kernel (ARM) using Objective-C and Cocoa Touch, whereas Android is open-source on a modified Linux kernel using Java compiled to bytecode and translated for the Dalvik VM alongside SQLite, WebKit, and a smaller `libc`.",
              "why": "Chapter 2, Slides 2.42, 2.46–2.48 & Exercises 2.22–2.23."
            },
            {
              "type": "written",
              "q": "3. (Programming Project Part I) Write the complete C code for a basic Linux kernel module (`simple.c`) that logs `\"Loading Module\"` when loaded and `\"Removing Module\"` when unloaded.",
              "ans": "<pre>#include &lt;linux/init.h&gt;\n#include &lt;linux/kernel.h&gt;\n#include &lt;linux/module.h&gt;\n\nint simple_init(void) {\n    printk(KERN_INFO \"Loading Module\\n\");\n    return 0;\n}\n\nvoid simple_exit(void) {\n    printk(KERN_INFO \"Removing Module\\n\");\n}\n\nmodule_init(simple_init);\nmodule_exit(simple_exit);\n\nMODULE_LICENSE(\"GPL\");\nMODULE_DESCRIPTION(\"Simple Module\");\nMODULE_AUTHOR(\"SGG\");</pre>",
              "why": "Chapter 2 Programming Project Part I (Page 97)."
            },
            {
              "type": "written",
              "q": "4. (Programming Project Part II) Write the C code snippet using `<linux/list.h>` to safely traverse, unlink, and free all `struct birthday` elements in `birthday_list` inside `simple_exit()`.",
              "ans": "<pre>struct birthday *ptr, *next;\nlist_for_each_entry_safe(ptr, next, &amp;birthday_list, list) {\n    list_del(&amp;ptr-&gt;list);\n    kfree(ptr);\n}</pre>",
              "why": "Chapter 2 Programming Project Part II (Pages 100–101)."
            }
          ]
        }
      ]
    }
  ]
};
