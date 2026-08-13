const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
const AdmZip = require("adm-zip");

admin.initializeApp();

const GITHUB_TOKEN = defineSecret("GITHUB_TOKEN");

const ADMIN_UID = "VM9V5M67iHO66p4SOFw43RgB3ml2";
const GITHUB_OWNER = "ssadnankabir-star";
const GITHUB_REPO = "Bio-data";
const GITHUB_BRANCH = "main";

const ALLOWED_EXACT = new Set([
  "index.html",
  "admin.html",
  "manifest.webmanifest",
  "service-worker.js",
  "firebase.json",
  "firestore.rules"
]);

const ALLOWED_PREFIXES = [
  "js/",
  "css/",
  "assets/",
  "config/"
];

const BLOCKED_NAMES = new Set([
  ".git",
  ".github",
  "node_modules",
  "functions",
  ".env",
  ".firebaserc"
]);

function cors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
}

function normalizePath(input) {
  return String(input || "")
    .replace(/\\/g, "/")
    .replace(/^\.\/+/, "")
    .replace(/^\/+/, "");
}

function isAllowedPath(path) {
  if (!path || path.includes("..") || path.startsWith("/")) return false;
  const first = path.split("/")[0];
  if (BLOCKED_NAMES.has(first)) return false;
  if (ALLOWED_EXACT.has(path)) return true;
  return ALLOWED_PREFIXES.some(prefix => path.startsWith(prefix));
}

async function githubRequest(path, options = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${GITHUB_TOKEN.value()}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "sadnan-profile-updater",
      ...(options.headers || {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || `GitHub API error ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

async function getExistingSha(path) {
  try {
    const data = await githubRequest(
      `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}?ref=${GITHUB_BRANCH}`
    );
    return data.sha || null;
  } catch (error) {
    if (error.status === 404) return null;
    throw error;
  }
}

async function upsertFile(path, buffer) {
  const sha = await getExistingSha(path);
  const body = {
    message: `Admin update: ${path}`,
    content: buffer.toString("base64"),
    branch: GITHUB_BRANCH
  };
  if (sha) body.sha = sha;

  return githubRequest(
    `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(path).replace(/%2F/g, "/")}`,
    {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(body)
    }
  );
}

exports.applyGithubUpdate = onRequest(
  {
    region: "asia-south1",
    secrets: [GITHUB_TOKEN],
    timeoutSeconds: 120,
    memory: "512MiB",
    maxInstances: 2
  },
  async (req, res) => {
    cors(res);

    if (req.method === "OPTIONS") {
      return res.status(204).send("");
    }
    if (req.method !== "POST") {
      return res.status(405).json({error: "POST required."});
    }

    try {
      const authHeader = req.headers.authorization || "";
      if (!authHeader.startsWith("Bearer ")) {
        return res.status(401).json({error: "Missing Firebase ID token."});
      }

      const idToken = authHeader.slice(7);
      const decoded = await admin.auth().verifyIdToken(idToken);

      if (decoded.uid !== ADMIN_UID) {
        return res.status(403).json({error: "This Firebase user is not authorized."});
      }

      const zipBase64 = String(req.body?.zipBase64 || "");
      if (!zipBase64) {
        return res.status(400).json({error: "ZIP data is missing."});
      }

      const zipBuffer = Buffer.from(zipBase64, "base64");
      if (zipBuffer.length > 8 * 1024 * 1024) {
        return res.status(413).json({error: "ZIP exceeds 8 MB limit."});
      }

      const zip = new AdmZip(zipBuffer);
      const entries = zip.getEntries().filter(entry => !entry.isDirectory);

      if (!entries.length) {
        return res.status(400).json({error: "ZIP contains no files."});
      }
      if (entries.length > 30) {
        return res.status(400).json({error: "Too many files in update ZIP."});
      }

      const updates = [];

      for (const entry of entries) {
        const path = normalizePath(entry.entryName);

        if (!isAllowedPath(path)) {
          return res.status(400).json({error: `File is not allowed: ${path}`});
        }

        const data = entry.getData();
        if (data.length > 4 * 1024 * 1024) {
          return res.status(400).json({error: `File is too large: ${path}`});
        }

        await upsertFile(path, data);
        updates.push(path);
      }

      return res.json({
        ok: true,
        repository: `${GITHUB_OWNER}/${GITHUB_REPO}`,
        branch: GITHUB_BRANCH,
        updatedFiles: updates
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({error: error.message || "Update failed."});
    }
  }
);
