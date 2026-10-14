/* Site content and shared helpers. Edit projects, skills and levels here. */

// Paste a Cal.com or Calendly link to show the "Book a 20-minute call" button.
const BOOKING_URL = '';

// Shared state read by the 3D background and written by the scroll colour transitions.
const PageState = { dark: 0 };

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const cssv = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
const $ = id => document.getElementById(id);
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const projects = [
  { feature: true, cat: 'Bachelor thesis · Quantum software', title: 'Cognitive Optimizer',
    desc: 'A classical optimizer for quantum circuits that merges phase rotations and reuses an episodic memory of the transformation rule. Compared with memory enabled and disabled, tracking gate count, depth and CX count; consistency and regression checks passed.',
    tags: ['Python', 'Qiskit', 'VQE', 'Circuit optimization'], skills: ['quantum', 'python'],
    metrics: [['107', '/108', 'memory recalls on a 12-qubit VQE circuit'], ['33', '/34', 'on a 10-qubit synthetic circuit']] },
  { cat: 'Quantum simulation', title: 'Graphene Tight-Binding', desc: 'Real-space Hamiltonian of a graphene fragment, with eigenvalue spectrum and eigenstate analysis of its electronic states.',
    tags: ['Python', 'NumPy', 'Matplotlib'], skills: ['quantum', 'python', 'scientific'], repo: 'graphene-tight-binding', demo: true },
  { cat: 'Quantum simulation', title: 'Quantum Collagen Lattice', desc: 'Perturbation propagation through a collagen lattice, with a QAOA-based repair optimization built in IBM Quantum Composer.',
    tags: ['Qiskit', 'QAOA', 'IBM Quantum Composer'], skills: ['quantum', 'python'], repo: 'quantum-collagen-lattice-simulation' },
  { cat: 'C++ simulation architecture', title: 'BioMapX / Q-Chaperone', desc: 'Configurable molecular-modelling inputs (temperature, pressure, pH, time step, random seed) on a modular backend that separates simulation state, workloads and future hybrid HPC scheduling.',
    tags: ['C++', 'CMake', 'HPC'], skills: ['cpp', 'hpc', 'scientific'], status: 'In development' },
  { cat: 'Machine learning', title: 'Plant Intelligence', desc: 'A CNN for plant-health diagnostics, from image preprocessing and transfer learning to inference-API scaffolding.',
    tags: ['TensorFlow', 'scikit-learn', 'pandas'], skills: ['ml', 'python'], repo: 'Plant-intelligence-machine-learning-CNN-model-for-advanced-Plant-image-classification-' },
  { cat: 'Systems', title: 'Flashies', desc: 'A flashcard study app in modern C++, with RAII-managed resources and smart-pointer ownership.',
    tags: ['C++', 'RAII', 'Smart pointers'], skills: ['cpp'], repo: 'Flashies' },
  { cat: 'Compilers', title: 'Android XML Analyzer', desc: 'A Flex and Bison semantic analyzer with a full BNF grammar and Android-specific validation rules.',
    tags: ['C', 'Flex', 'Bison'], skills: ['cpp'], repo: 'android-xml-semantic-analyzer' },
];

const filters = [['all', 'All'], ['quantum', 'Quantum'], ['python', 'Python'], ['cpp', 'C and C++'], ['hpc', 'HPC'], ['scientific', 'Scientific computing'], ['ml', 'Machine learning']];

const skills = [
  ['Quantum', ['Qiskit', 'IBM Quantum Composer', 'VQE and QAOA circuits', 'Circuit optimization', 'Phase rotations']],
  ['C and C++', ['RAII', 'Memory management', 'Smart pointers', 'Multi-threading', 'Thread pools', 'CMake']],
  ['Python', ['NumPy and SciPy', 'Matplotlib and pyplot', 'TensorFlow', 'scikit-learn', 'pandas']],
  ['Rust', ['Ownership', 'Traits', 'Generics', 'Concurrency', 'Foreign Function Interface']],
  ['R', ['Probability distributions', 'Bayesian probability']],
  ['MATLAB', ['Simulink circuit noise simulation', 'Signal transforms', 'Data visualisation', 'Preprocessing']],
  ['SQL', ['Joins and subqueries', 'Window functions', 'CTEs and recursive queries', 'Indexing and query plans', 'Transactions (ACID)', 'Normalisation']],
  ['Tooling', ['Git', 'Linux', 'SSH workflows', 'VS Code', 'Claude Code']],
];

// Proficiency, 0–100. Edit these numbers to adjust the bars; the label follows the number.
const levels = { 'Python': 88, 'C and C++': 82, 'MATLAB': 62, 'Rust': 55, 'SQL': 55, 'R': 45 };
const levelName = v => v >= 80 ? 'Advanced' : v >= 65 ? 'Proficient' : v >= 50 ? 'Intermediate' : 'Foundational';

// "Ask about my work": the questions visitors can pick and their answers. Edit freely.
const faq = [
  { q: 'Has he worked with VQE or QAOA?',
    a: 'Yes. His bachelor thesis experiment, the Cognitive Optimizer, benchmarks a Qiskit circuit optimizer on a 12-qubit VQE circuit, where it recalled its transformation rule 107 times out of 108. His Quantum Collagen Lattice project uses a QAOA-based repair optimization built in IBM Quantum Composer.' },
  { q: 'What C++ experience does he have?',
    a: 'C++ is one of his main languages. He is building BioMapX / Q-Chaperone, a modular C++ simulation architecture for molecular modelling with configurable inputs and a backend designed for future hybrid HPC scheduling. He also wrote Flashies in modern C++, and works with RAII, smart pointers, memory management, multi-threading, thread pools and CMake.' },
  { q: 'What is his thesis about?',
    a: 'His thesis is “Beyond Neural: A Quantum Approach to Artificial Cognition”. Its experiment, the Cognitive Optimizer, merges phase rotations in quantum circuits and reuses an episodic memory of the transformation rule. On 12-qubit VQE and 10-qubit synthetic benchmarks it recalled the rule 107 of 108 and 33 of 34 times, with consistency and regression checks passing.' },
  { q: 'When does he graduate?',
    a: 'He expects to graduate in September 2026 with a BSc in Informatics and Telecommunications from the University of Ioannina, where his GPA is 8.57 out of 10.' },
  { q: 'Is he open to internships?',
    a: 'Yes. He is looking for quantum software internships and junior roles in quantum applications and hybrid computing, as well as junior scientific software, simulation or HPC engineering roles. The quickest way to reach him is papamichailnickolas@gmail.com.' },
];
