const express = require("express");

const {
getSessions,
createSession,
updateSession,
deleteSession,
} = require("../controllers/sessionController");

const router = express.Router();

// GET /api/sessions
router.get("/", getSessions);

// POST /api/sessions
router.post("/", createSession);

// PUT /api/sessions/:id
router.put("/:id", updateSession);
// DELETE /api/sessions/:id
router.delete("/:id", deleteSession);
module.exports = router;