import { NextResponse } from "next/server";
import axios from "axios";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { verifyJwt, getBearerToken } from "@/lib/auth";

const {
  PTERO_URL,
  PTERO_APP_KEY,
  PTERO_CLIENT_KEY,
  SYSTEM_PTERO_USER_ID,
  LOCATION_ID,
  EGG_ID,
  DOCKER_IMAGE,
  BOT_TAR_URL
} = process.env;

const appApi = axios.create({
  baseURL: `${PTERO_URL}/api/application`,
  headers: {
    Authorization: `Bearer ${PTERO_APP_KEY}`,
    Accept: "Application/vnd.pterodactyl.v1+json",
    "Content-Type": "application/json"
  }
});

const clientApi = axios.create({
  baseURL: `${PTERO_URL}/api/client`,
  headers: {
    Authorization: `Bearer ${PTERO_CLIENT_KEY}`,
    Accept: "Application/vnd.pterodactyl.v1+json",
    "Content-Type": "application/json"
  }
});

async function pickAllocation() {
  const nodes = await appApi.get(`/nodes?filter[location_id]=${LOCATION_ID}`);

  for (const node of nodes.data.data) {
    const allocs = await appApi.get(`/nodes/${node.attributes.id}/allocations`);
    const free = allocs.data.data.find(a => a.attributes.assigned === false);
    if (free) return free.attributes.id;
  }

  throw new Error("No free allocations available");
}

export async function POST(req) {
  try {
    const token = getBearerToken(req);
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = verifyJwt(token);
    const { name, type } = await req.json();

    const allocationId = await pickAllocation();

    const createRes = await appApi.post("/servers", {
      name,
      user: Number(SYSTEM_PTERO_USER_ID),
      egg: Number(EGG_ID),
      docker_image: DOCKER_IMAGE,
      startup: "npm start",
      environment: {},
      limits: { memory: 512, swap: 0, disk: 1024, io: 500, cpu: 50 },
      feature_limits: { databases: 0, allocations: 1, backups: 0 },
      allocation: { default: allocationId },
      deploy: { locations: [Number(LOCATION_ID)] },
      start_on_completion: false
    });

    const server = createRes.data.attributes;

    await clientApi.post(`/servers/${server.identifier}/command`, {
      command: `
rm -rf ./*
curl -L "${BOT_TAR_URL}" -o bot.tar.gz
tar -xzf bot.tar.gz
rm bot.tar.gz
npm install
`
    });

    await clientApi.post(`/servers/${server.identifier}/power`, {
      signal: "start"
    });

    await supabaseAdmin.from("bots").insert([
      {
        user_id: user.uid,
        name,
        type,
        ptero_server_id: server.id,
        ptero_identifier: server.identifier,
        status: "running"
      }
    ]);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
