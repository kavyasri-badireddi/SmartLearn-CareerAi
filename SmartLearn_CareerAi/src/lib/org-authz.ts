import { prisma } from "@/lib/prisma";

export async function requireOrgMember(orgId: string, userId: string) {
  const membership = await prisma.organizationMember.findUnique({
    where: { orgId_userId: { orgId, userId } },
  });
  if (!membership) {
    throw new Error("FORBIDDEN: Not a member of this organization.");
  }
  return membership;
}

export async function requireOrgAdmin(orgId: string, userId: string) {
  const membership = await requireOrgMember(orgId, userId);
  if (membership.role !== "admin") {
    throw new Error("FORBIDDEN: Organization admin required.");
  }
  return membership;
}

