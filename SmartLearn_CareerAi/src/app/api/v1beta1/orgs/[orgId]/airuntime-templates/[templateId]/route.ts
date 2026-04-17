import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { requireOrgMember } from "@/lib/org-authz";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ orgId: string; templateId: string }> }) {
  try {
    const { orgId, templateId } = await ctx.params;
    const auth = requireAuth(req);
    await requireOrgMember(orgId, auth.userId);

    const template = await prisma.aIRuntimeTemplate.findFirst({
      where: {
        id: templateId,
        orgId,
        source: "custom",
        deletedAt: null,
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
        errorMessage: true,
      },
    });

    if (!template) return jsonError("Not found.", 404);
    return NextResponse.json(template);
  } catch (e: any) {
    const msg = e?.message || "Failed to fetch template.";
    const status = msg.startsWith("UNAUTHORIZED") ? 401 : msg.startsWith("FORBIDDEN") ? 403 : 500;
    return jsonError(msg, status);
  }
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ orgId: string; templateId: string }> }) {
  try {
    const { orgId, templateId } = await ctx.params;
    const auth = requireAuth(req);
    await requireOrgMember(orgId, auth.userId);

    const template = await prisma.aIRuntimeTemplate.findFirst({
      where: { id: templateId, orgId, source: "custom", deletedAt: null },
      select: { id: true },
    });
    if (!template) return jsonError("Not found.", 404);

    await prisma.aIRuntimeTemplate.update({
      where: { id: templateId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch (e: any) {
    const msg = e?.message || "Failed to delete template.";
    const status = msg.startsWith("UNAUTHORIZED") ? 401 : msg.startsWith("FORBIDDEN") ? 403 : 500;
    return jsonError(msg, status);
  }
}

