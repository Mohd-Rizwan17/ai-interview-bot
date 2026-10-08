export const hr = [
  {
    format: "descriptive",
    difficulty: "easy",
    topic: "Introduction",
    question: "Tell me about yourself.",
    idealAnswer:
      "I am a fresher MERN stack developer. I have learned React, Node.js, Express and MongoDB, and I have built projects that use them. I enjoy solving problems and learning new tools. I am looking for a junior developer role where I can contribute to the team and keep growing.",
    keywords: [
      ["mern", "react", "node", "javascript", "developer", "full stack"],
      ["project", "built", "build"],
      ["learn", "learned", "learning", "skill"],
      ["role", "opportunity", "grow", "contribute"],
    ],
    explanation:
      "This is a sample answer. Use your own details. Keep it short: who you are, what you can do with proof (projects), and what you want next.",
    hint: "Say who you are, what you have built, and what you want next.",
  },
  {
    format: "descriptive",
    difficulty: "easy",
    topic: "Strengths",
    question: "What are your strengths? Give an example.",
    idealAnswer:
      "One of my strengths is that I learn new things quickly. For example, when I needed to add authentication in a project, I had not used JWT before. I read the documentation, built a small version first and then added it to the project. It worked and now I can use it confidently.",
    keywords: [
      ["strength", "good at", "i am able", "quickly", "skill"],
      ["example", "for example", "project", "when i"],
      ["result", "worked", "completed", "helped", "improved", "finished"],
    ],
    explanation:
      "This is a sample answer. A strong answer names one real strength and backs it with a short true example and its result.",
    hint: "Do not just list qualities. Prove one with a small story.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Weakness",
    question: "What is your biggest weakness?",
    idealAnswer:
      "Earlier I used to spend too much time perfecting small UI details, so my tasks took longer. I am working on it by setting a time limit for each task. I first finish a working version and then improve it if time remains. I can see that I now complete work faster.",
    keywords: [
      ["weakness", "struggle", "used to", "sometimes", "tend to"],
      ["improve", "working on", "learning", "practice", "fix", "now"],
      ["example", "for example", "task", "project", "when"],
      ["result", "better", "progress", "faster"],
    ],
    explanation:
      "This is a sample answer. Be honest, choose a real but not critical weakness, and show clearly what you are doing to improve it.",
    hint: "A weakness plus the steps you take to fix it.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Motivation",
    question: "Why should we hire you?",
    idealAnswer:
      "I have practical skills in React, Node.js, Express and MongoDB, and I have built full projects instead of only studying theory. I learn fast and I am ready to take feedback. I want to bring that energy to your team and add value from my first project.",
    keywords: [
      ["skill", "mern", "react", "node", "technology"],
      ["project", "built", "experience", "practical"],
      ["learn", "quickly", "willing", "eager", "adapt", "feedback"],
      ["team", "company", "contribute", "value", "help"],
    ],
    explanation:
      "This is a sample answer. Connect your skills and real projects to what the company needs. Do not run down other candidates.",
    hint: "Skills, proof, attitude, and what the company gains.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Motivation",
    question: "Why do you want to join our company?",
    idealAnswer:
      "I read about your products and the technology you use, and it matches my skills in the MERN stack. I like that your team works on real problems for real users. I believe I can learn a lot here and contribute to the team as well.",
    keywords: [
      [
        "product",
        "mission",
        "culture",
        "technology",
        "work",
        "research",
        "read",
      ],
      ["skill", "match", "fit", "role", "position"],
      ["learn", "grow", "contribute", "opportunity"],
      ["team", "users", "company"],
    ],
    explanation:
      "This is a sample answer. Research the company before the interview and mention something specific. A generic answer sounds weak.",
    hint: "Show that you know something about the company.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Teamwork",
    question: "How do you handle a disagreement with a teammate?",
    idealAnswer:
      "I first listen to understand their point of view. Then I talk calmly and explain my reason with facts, not feelings. If we still disagree, we look for a middle path or ask a senior to decide. My focus is on the goal of the project, not on who is right.",
    keywords: [
      ["listen", "understand", "hear"],
      ["discuss", "talk", "calm", "respect", "communicate"],
      ["solution", "compromise", "agree", "common", "decision", "middle"],
      ["goal", "project", "team"],
    ],
    explanation:
      "This is a sample answer. Interviewers look for: listening, respectful talk, a solution and focus on the team goal.",
    hint: "Listen first, then solve. Do not make it a fight.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Career",
    question: "Where do you see yourself in five years?",
    idealAnswer:
      "In five years I want to grow into a strong developer who can design features end to end. I will keep learning new technologies and take more responsibility, maybe even lead a small module. I want to do this while adding real value to the company that gives me this chance.",
    keywords: [
      ["grow", "learn", "skill", "improve", "experience"],
      ["senior", "lead", "responsibility", "expert", "mentor"],
      ["company", "team", "contribute", "value"],
    ],
    explanation:
      "This is a sample answer. Show ambition that fits the company. Avoid saying you will leave or start your own thing.",
    hint: "Growth and responsibility inside the company.",
  },
  {
    format: "descriptive",
    difficulty: "hard",
    topic: "Problem Solving",
    question:
      "Describe a difficult bug or problem you faced in a project and how you solved it.",
    idealAnswer:
      "In one project my API returned data correctly in Postman but the page showed nothing. I checked the browser network tab and the console, and found a CORS error. I read the documentation, added the cors middleware with the client URL and credentials enabled, and tested again. It fixed the issue, and now I always check the network tab first when the frontend and backend disagree.",
    keywords: [
      ["problem", "bug", "issue", "error"],
      [
        "debug",
        "console",
        "checked",
        "tried",
        "tested",
        "documentation",
        "steps",
        "search",
      ],
      ["solved", "fixed", "solution", "resolved", "worked"],
      ["learned", "learn", "lesson", "next time", "now i"],
    ],
    explanation:
      "This is a sample answer. Use a real example. A good structure is: the problem, what you did step by step, the result, and what you learned.",
    hint: "Problem, steps you took, result, lesson.",
  },
  {
    format: "descriptive",
    difficulty: "hard",
    topic: "Pressure",
    question: "How do you manage tight deadlines?",
    idealAnswer:
      "I break the work into small tasks and prioritize what is most important first. I plan my time and focus on one task at a time. If I see a risk, I inform my team early instead of waiting for the last day. I make sure the core feature works properly before adding extras, because quality should not drop.",
    keywords: [
      ["prioritize", "priority", "important", "plan", "break"],
      ["communicate", "inform", "update", "ask", "tell"],
      ["focus", "time", "schedule", "deadline"],
      ["quality", "test", "working", "core"],
    ],
    explanation:
      "This is a sample answer. Show a calm process: plan, prioritize, communicate early and protect quality.",
    hint: "Plan, prioritize, communicate, protect quality.",
  },
];
