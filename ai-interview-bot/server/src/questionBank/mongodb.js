export const mongodb = [
  {
    format: "mcq",
    difficulty: "easy",
    topic: "Basics",
    question: "How does MongoDB store data?",
    options: [
      "As rows in tables",
      "As documents (JSON-like) inside collections",
      "As key-value pairs only",
      "As graphs of nodes",
    ],
    correctOption: 1,
    explanation:
      "MongoDB is a document database. Each record is a document stored in BSON, a binary form of JSON, and documents are grouped in collections.",
    hint: "Think of objects, not rows.",
  },
  {
    format: "mcq",
    difficulty: "easy",
    topic: "Mongoose",
    question: "Which Mongoose method finds a document by its _id?",
    options: ["findById()", "getById()", "selectOne()", "fetchId()"],
    correctOption: 0,
    explanation:
      "Model.findById(id) returns the document with that _id, or null if it does not exist.",
    hint: "The method name says what it does: find by id.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Schema",
    question: "What does unique: true do in a Mongoose schema?",
    options: [
      "It runs a Mongoose validator that rejects duplicates before saving",
      "It creates a unique index in MongoDB, so a duplicate insert fails with error code 11000",
      "It makes the field required",
      "It generates a unique value automatically",
    ],
    correctOption: 1,
    explanation:
      "unique is not a validator. It builds a unique index, and MongoDB itself rejects duplicates with a duplicate key error (code 11000), which you should handle in your error handler.",
    hint: "The check happens inside the database, not inside Mongoose.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Schema",
    question: "What does select: false on a schema field do?",
    options: [
      "The field is never saved",
      "The field is left out of query results unless you ask for it with +field",
      "The field is encrypted",
      "The field becomes read-only",
    ],
    correctOption: 1,
    explanation:
      "The field is still saved, but queries do not return it by default. It is useful for sensitive data like passwordHash. You can include it with .select('+passwordHash').",
    hint: "It hides the field from results, not from the database.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Aggregation",
    question: "Which aggregation stage filters documents?",
    options: ["$group", "$match", "$project", "$sort"],
    correctOption: 1,
    explanation:
      "$match works like find() and keeps only matching documents. $group groups them, $project chooses fields and $sort orders them.",
    hint: "It matches a condition.",
  },
  {
    format: "mcq",
    difficulty: "medium",
    topic: "Mongoose",
    question: "What does populate() do in Mongoose?",
    options: [
      "Inserts many documents at once",
      "Replaces a stored ObjectId reference with the actual document from the other collection",
      "Creates an index on a field",
      "Copies a collection",
    ],
    correctOption: 1,
    explanation:
      "If a field stores an ObjectId with a ref, populate() fetches the referenced document and puts it in place of the id in the result.",
    hint: "It fills in the details behind an id.",
  },
  {
    format: "mcq",
    difficulty: "hard",
    topic: "Indexes",
    question: "Which statement about MongoDB indexes is true?",
    options: [
      "Indexes make writes faster and use no extra space",
      "Indexes are created automatically for every field",
      "An index speeds up reads on that field but uses extra storage and makes writes a little slower",
      "Indexes only work on string fields",
    ],
    correctOption: 2,
    explanation:
      "An index lets MongoDB find documents without scanning the whole collection. The trade-off is extra storage and slightly slower inserts and updates, because the index must be updated too.",
    hint: "Every benefit has a cost.",
  },
  {
    format: "descriptive",
    difficulty: "medium",
    topic: "Mongoose",
    question:
      "What is the difference between find() and findOne() in Mongoose?",
    idealAnswer:
      "find() returns all documents that match the filter, as an array. If nothing matches, it returns an empty array. findOne() returns only the first matching document, or null if there is no match.",
    keywords: [
      ["array", "all", "multiple", "many"],
      ["first", "one", "single"],
      ["null"],
      ["empty array", "[]", "empty"],
    ],
    explanation:
      "A good answer says find returns an array (empty when nothing matches) and findOne returns one document or null.",
    hint: "Compare what each returns when nothing matches.",
  },
  {
    format: "descriptive",
    difficulty: "hard",
    topic: "Data Modeling",
    question:
      "What is the difference between embedding and referencing in MongoDB? When would you use each?",
    idealAnswer:
      "Embedding stores related data inside the same document, for example an address inside a user. It is fast to read because one query gets everything, and it suits small data that is always used together. Referencing stores the related data in another collection and keeps only its ObjectId, like orders pointing to a user. It suits large or growing data and data shared by many documents, but you need populate or a second query to read it.",
    keywords: [
      ["embed", "inside", "nested", "same document"],
      ["reference", "ref", "objectid", "separate collection"],
      ["one query", "fast", "together", "small"],
      ["large", "grow", "many", "shared", "populate"],
    ],
    explanation:
      "A good answer defines both approaches and gives the rule: embed small data used together, reference large, growing or shared data.",
    hint: "Think about whether the related data is small and always read together.",
  },
  {
    format: "practical",
    difficulty: "medium",
    topic: "Schema",
    question:
      "Write a Mongoose schema and model for a Product with name (required string), price (required number, minimum 0) and inStock (boolean, default true).",
    idealAnswer: `import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  inStock: { type: Boolean, default: true },
});

export const Product = mongoose.model("Product", productSchema);`,
    keywords: [["schema"], ["required"], ["min"], ["default"], ["model"]],
    explanation:
      "The schema defines the fields with their types and rules (required, min, default), and mongoose.model turns it into a model you can query.",
    hint: "Each field is an object with a type and a rule.",
  },
];
