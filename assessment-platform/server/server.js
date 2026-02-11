import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { MongoClient, ObjectId } from "mongodb";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required. Set it in server/.env");
  process.exit(1);
}
console.log("Using MongoDB URI:", MONGODB_URI);

const SUBJECT_ID_MAP = {
  physics: process.env.SUBJECT_ID_PHYSICS,
  chemistry: process.env.SUBJECT_ID_CHEMISTRY,
  mathematics: process.env.SUBJECT_ID_MATHEMATICS
};

console.log("Subject ID Map:", SUBJECT_ID_MAP);

const client = new MongoClient(MONGODB_URI, { maxPoolSize: 10 });

async function connectDb() {
  await client.connect();
  return client.db("examprep");
}

function parseSubjectIds(subjects) {
  const ids = [];
  subjects.forEach(subject => {
    const id = SUBJECT_ID_MAP[subject];
    if (id) {
      ids.push({ subject, objectId: new ObjectId(id) });
    }
  });
  return ids;
}

function normalizeQuestion(doc) {
  const options = Array.isArray(doc?.question?.options) ? doc.question.options : [];
  const answerValue = doc?.answer?.answer;
  let correctAnswer = null;

  if (typeof answerValue === "number") {
    correctAnswer = answerValue;
  } else if (typeof answerValue === "string") {
    const index = options.indexOf(answerValue);
    correctAnswer = index >= 0 ? index : null;
  }

  return {
    id: String(doc._id),
    question: doc?.question?.body || "",
    options,
    correctAnswer,
    marks: doc?.meta?.marks ?? 4,
    type: "single"
  };
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/questions", async (req, res) => {
  try {
    const subjectsParam = String(req.query.subjects || "");
    const subjects = subjectsParam
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    if (subjects.length === 0) {
      return res.status(400).json({ error: "subjects query param is required" });
    }

    const count = Number.parseInt(String(req.query.count || "10"), 10) || 10;
    const difficulty = req.query.difficulty ? String(req.query.difficulty) : null;

    const db = req.app.locals.db;
    const collection = db.collection("questions");

    const subjectIds = parseSubjectIds(subjects);
    const response = {};

    for (const subject of subjects) {
      const match = {
        isPublic: true,
        $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }]
      };

      const subjectId = subjectIds.find(item => item.subject === subject);
      if (subjectId) {
        match["tags.subject_id"] = subjectId.objectId;
      }

      if (difficulty) {
        match["meta.difficulty"] = difficulty;
      }

      const pipeline = [
        { $match: match },
        { $sample: { size: count } }
      ];

      const docs = await collection.aggregate(pipeline).toArray();
      response[subject] = docs.map(normalizeQuestion);
    }

    res.json({ questions: response });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load questions" });
  }
});

connectDb()
  .then(db => {
    console.log("Connected to MongoDB");
    app.locals.db = db;
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  });
