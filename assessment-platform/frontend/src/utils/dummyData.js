export const dummyQuestions = [
  {
    _id: 'q1',
    type: 0,
    question: {
      body: { text: 'What is the SI unit of force?', latexes: [] }
    },
    options: [
      { d: { text: 'Newton', latexes: [] }, v: 0 },
      { d: { text: 'Joule', latexes: [] }, v: 1 },
      { d: { text: 'Watt', latexes: [] }, v: 2 },
      { d: { text: 'Pascal', latexes: [] }, v: 3 }
    ],
    answer: {
      answer: [0],
      explanation: { text: 'Newton is the SI unit of force, defined as kg⋅m/s². It represents the force required to accelerate 1 kg of mass at 1 m/s².', latexes: [] }
    },
    meta: { difficulty: 0 }
  },
  {
    _id: 'q2',
    type: 1,
    question: {
      body: { text: 'Which of the following are noble gases?', latexes: [] }
    },
    options: [
      { d: { text: 'Helium', latexes: [] }, v: 0 },
      { d: { text: 'Oxygen', latexes: [] }, v: 1 },
      { d: { text: 'Neon', latexes: [] }, v: 2 },
      { d: { text: 'Nitrogen', latexes: [] }, v: 3 }
    ],
    answer: {
      answer: [0, 2],
      explanation: { text: 'Helium and Neon are noble gases from Group 18. They have complete outer electron shells and are chemically inert.', latexes: [] }
    },
    meta: { difficulty: 1 }
  },
  {
    _id: 'q3',
    type: 3,
    question: {
      body: { text: 'The speed of light in vacuum is _______ m/s.', latexes: [] }
    },
    answer: {
      answer: ['3×10^8', '300000000', '3e8'],
      explanation: { text: 'The speed of light in vacuum is approximately 3 × 10⁸ m/s or 300,000,000 m/s.', latexes: [] }
    },
    meta: { difficulty: 0 }
  },
  {
    _id: 'q4',
    type: 4,
    question: {
      body: { text: 'Energy can be created or destroyed.', latexes: [] }
    },
    answer: {
      answer: [false],
      explanation: { text: 'False. According to the Law of Conservation of Energy, energy cannot be created or destroyed, only transformed from one form to another.', latexes: [] }
    },
    meta: { difficulty: 1 }
  },
  {
    _id: 'q5',
    type: 5,
    question: {
      body: { text: 'Assertion and Reason Question', latexes: [] }
    },
    assertion: 'The velocity of electromagnetic waves depends on electric and magnetic properties of the medium.',
    reason: 'Velocity of electromagnetic waves in free space is constant.',
    options: [
      { d: { text: 'Both Assertion and Reason are true and Reason is the correct explanation of Assertion.', latexes: [] }, v: 0 },
      { d: { text: 'Both Assertion and Reason are true, but Reason is not the correct explanation of Assertion.', latexes: [] }, v: 1 },
      { d: { text: 'Assertion is true, but Reason is false.', latexes: [] }, v: 2 },
      { d: { text: 'Assertion is false, but Reason is true.', latexes: [] }, v: 3 }
    ],
    answer: {
      answer: [1],
      explanation: { text: 'Both statements are true. The velocity does depend on medium properties, and it is constant in free space. However, the reason does not explain the assertion.', latexes: [] }
    },
    meta: { difficulty: 2 }
  },
  {
    _id: 'q6',
    type: 0,
    question: {
      body: { text: 'What is the chemical formula for water?', latexes: [] }
    },
    options: [
      { d: { text: 'H₂O', latexes: [] }, v: 0 },
      { d: { text: 'CO₂', latexes: [] }, v: 1 },
      { d: { text: 'O₂', latexes: [] }, v: 2 },
      { d: { text: 'H₂O₂', latexes: [] }, v: 3 }
    ],
    answer: {
      answer: [0],
      explanation: { text: 'Water is composed of two hydrogen atoms and one oxygen atom (H₂O). It is essential for all known forms of life.', latexes: [] }
    },
    meta: { difficulty: 0 }
  },
  {
    _id: 'q7',
    type: 4,
    question: {
      body: { text: 'The acceleration due to gravity on Earth is approximately 9.8 m/s².', latexes: [] }
    },
    answer: {
      answer: [true],
      explanation: { text: 'True. The standard acceleration due to gravity on Earth is approximately 9.8 m/s² at sea level.', latexes: [] }
    },
    meta: { difficulty: 0 }
  },
  {
    _id: 'q8',
    type: 1,
    question: {
      body: { text: 'Which of these are states of matter?', latexes: [] }
    },
    options: [
      { d: { text: 'Solid', latexes: [] }, v: 0 },
      { d: { text: 'Liquid', latexes: [] }, v: 1 },
      { d: { text: 'Gas', latexes: [] }, v: 2 },
      { d: { text: 'Energy', latexes: [] }, v: 3 }
    ],
    answer: {
      answer: [0, 1, 2],
      explanation: { text: 'Solid, Liquid, and Gas are the three classical states of matter. Energy is not a state of matter; it is a property.', latexes: [] }
    },
    meta: { difficulty: 0 }
  },
  {
    _id: 'q9',
    type: 3,
    question: {
      body: { text: 'The atomic number of Carbon is _______.', latexes: [] }
    },
    answer: {
      answer: ['6', 'six'],
      explanation: { text: 'Carbon has 6 protons in its nucleus, making its atomic number 6.', latexes: [] }
    },
    meta: { difficulty: 1 }
  },
  {
    _id: 'q10',
    type: 5,
    question: {
      body: { text: 'Assertion and Reason Question', latexes: [] }
    },
    assertion: 'Light exhibits both wave and particle nature.',
    reason: 'Photons have momentum but no mass.',
    options: [
      { d: { text: 'Both Assertion and Reason are true and Reason is the correct explanation of Assertion.', latexes: [] }, v: 0 },
      { d: { text: 'Both Assertion and Reason are true, but Reason is not the correct explanation of Assertion.', latexes: [] }, v: 1 },
      { d: { text: 'Assertion is true, but Reason is false.', latexes: [] }, v: 2 },
      { d: { text: 'Assertion is false, but Reason is true.', latexes: [] }, v: 3 }
    ],
    answer: {
      answer: [0],
      explanation: { text: 'Both are true and the reason explains the assertion. The particle nature is demonstrated by photons having momentum despite being massless.', latexes: [] }
    },
    meta: { difficulty: 2 }
  }
];
