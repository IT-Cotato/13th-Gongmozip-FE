const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.gongmozip.site").replace(
  /\/+$/,
  "",
);
const TEST_API_KEY = process.env.TEST_API_KEY;
const rawMembers = process.env.TEST_TEAM_MEMBERS;

const SCENARIOS = {
  "open-nomination": {
    description: "0 WANTS -> OPEN_NOMINATION",
    preferences: ["DOES_NOT_WANT", "DOES_NOT_WANT", "DOES_NOT_WANT", "DOES_NOT_WANT"],
  },
  "auto-assigned": {
    description: "1 WANTS -> AUTO_ASSIGNED",
    preferences: ["WANTS", "DOES_NOT_WANT", "DOES_NOT_WANT", "DOES_NOT_WANT"],
  },
  "candidate-vote": {
    description: "2+ WANTS -> CANDIDATE_VOTE",
    preferences: ["WANTS", "WANTS", "DOES_NOT_WANT", "DOES_NOT_WANT"],
  },
};

const selectedScenarioNames = getArgValue("scenarios")
  ?.split(",")
  .map((name) => name.trim())
  .filter(Boolean) ?? ["open-nomination", "candidate-vote"];

const preferredCategory = getArgValue("category") ?? "IT_AI_TECH";

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

async function main() {
  if (!TEST_API_KEY) {
    throw new Error("TEST_API_KEY is required.");
  }

  if (!rawMembers) {
    throw new Error(
      'TEST_TEAM_MEMBERS is required. Example: TEST_TEAM_MEMBERS=\'[{"memberId":1,"profileId":11},{"memberId":2,"profileId":12},{"memberId":3,"profileId":13},{"memberId":4,"profileId":14}]\'',
    );
  }

  const members = JSON.parse(rawMembers);

  if (!Array.isArray(members) || members.length < 1) {
    throw new Error("TEST_TEAM_MEMBERS must be a non-empty array.");
  }

  validateMembers(members);

  for (const scenarioName of selectedScenarioNames) {
    const scenario = SCENARIOS[scenarioName];

    if (!scenario) {
      throw new Error(`Unknown scenario: ${scenarioName}`);
    }

    const body = {
      preferredCategory,
      members: members.map((member, index) => ({
        memberId: member.memberId,
        profileId: member.profileId,
        leaderPreference:
          scenario.preferences[index] ?? scenario.preferences[scenario.preferences.length - 1],
        extroversionType: member.extroversionType ?? defaultExtroversionType(index),
        extroversionScore: member.extroversionScore ?? defaultExtroversionScore(index),
      })),
    };

    const result = await createTeam(body);
    console.log(`${scenarioName}: ${scenario.description}`);
    console.log(JSON.stringify(result, null, 2));
  }
}

async function createTeam(body) {
  const response = await fetch(`${API_BASE_URL}/api/test/teams`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Test-Api-Key": TEST_API_KEY,
    },
    body: JSON.stringify(body),
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(
      `POST /api/test/teams failed (${response.status}): ${JSON.stringify(data, null, 2)}`,
    );
  }

  return data;
}

function validateMembers(members) {
  members.forEach((member, index) => {
    if (!Number.isInteger(member.memberId) || !Number.isInteger(member.profileId)) {
      throw new Error(`memberId/profileId must be integers at members[${index}].`);
    }
  });
}

function getArgValue(name) {
  const prefix = `--${name}=`;
  return process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length);
}

function defaultExtroversionType(index) {
  return ["I", "A", "E", "A"][index % 4];
}

function defaultExtroversionScore(index) {
  return [2.1, 3, 4.2, 3.5][index % 4];
}
