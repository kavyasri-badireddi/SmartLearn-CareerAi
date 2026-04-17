import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requireOrgMember } from "@/lib/org-authz";
import {
  validateTemplateName,
  validateRegistryPath,
  validateCategory,
  validateDescription,
} from "@/lib/airuntime-templates/validation";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await ctx.params;
    const auth = requireAuth(req);
    await requireOrgMember(orgId, auth.userId);

    const templates = await prisma.aIRuntimeTemplate.findMany({
      where: {
        orgId,
        source: "custom",
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        source: true,
        isPrivate: true,
        orgId: true,
        createdBy: true,
        createdAt: true,
        registryPath: true,
        status: true,
        errorMessage: true,
      },
    });

    return NextResponse.json(templates);
  } catch (e: any) {
    const msg = e?.message || "Failed to list templates.";
    const status = msg.startsWith("UNAUTHORIZED") ? 401 : msg.startsWith("FORBIDDEN") ? 403 : 500;
    return jsonError(msg, status);
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ orgId: string }> }) {
  try {
    const { orgId } = await ctx.params;
    const auth = requireAuth(req);
    await requireOrgMember(orgId, auth.userId);

    const body = await req.json();

    const name = validateTemplateName(body?.name);
    const registryPath = validateRegistryPath(body?.registry_path);
    const category = validateCategory(body?.category);
    const description = validateDescription(body?.description);
    const isPrivate = typeof body?.is_private === "boolean" ? body.is_private : true;

    const registryUsername = body?.registry_username;
    const accessToken = body?.access_token;
    const wantsPrivateRegistry = !!(registryUsername || accessToken);
    if (wantsPrivateRegistry && (!registryUsername || !accessToken)) {
      return jsonError("VALIDATION: registry_username and access_token are required for private registries.", 400);
    }

    const activeCount = await prisma.aIRuntimeTemplate.count({
      where: { orgId, source: "custom", deletedAt: null },
    });
    if (activeCount >= 5) {
      return jsonError("VALIDATION: maximum limit of 5 custom templates per org reached.", 400);
    }

    const existing = await prisma.aIRuntimeTemplate.findFirst({
      where: { orgId, source: "custom", deletedAt: null, name },
      select: { id: true },
    });
    if (existing) {
      return jsonError("VALIDATION: a custom template with this name already exists in the org.", 409);
    }

    // NOTE: This repo doesn't yet integrate with Kubernetes; we store no credentials here.
    // If you want private registry support, we need a k8s Secret vault integration.
    if (wantsPrivateRegistry) {
      return jsonError(
        "NOT_IMPLEMENTED: private registry credentials require Kubernetes Secret integration (kubernetes.io/dockerconfigjson).",
        501,
      );
    }

    const created = await prisma.aIRuntimeTemplate.create({
      data: {
        name,
        description,
        category,
        registryPath,
        isPrivate,
        source: "custom",
        status: "pulling_image",
        orgId,
        createdBy: auth.userId,
      },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        source: true,
        isPrivate: true,
        orgId: true,
        createdBy: true,
        createdAt: true,
        registryPath: true,
        status: true,
      },
    });

    // Async validation is not implemented in this repo; mark ready for now.
    await prisma.aIRuntimeTemplate.update({
      where: { id: created.id },
      data: { status: "ready" },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    const msg = e?.message || "Failed to create template.";
    if (msg.startsWith("VALIDATION")) return jsonError(msg, 400);
    const status = msg.startsWith("UNAUTHORIZED") ? 401 : msg.startsWith("FORBIDDEN") ? 403 : 500;
    return jsonError(msg, status);
  }
}

