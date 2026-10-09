-- Add indexes on hot foreign keys to eliminate full-table scans on project-scoped queries.

-- CreateIndex
CREATE INDEX "ProjectMember_projectId_idx" ON "ProjectMember"("projectId");

-- CreateIndex
CREATE INDEX "Element_projectId_idx" ON "Element"("projectId");

-- CreateIndex
CREATE INDEX "Relationship_projectId_idx" ON "Relationship"("projectId");

-- CreateIndex
CREATE INDEX "Relationship_fromId_idx" ON "Relationship"("fromId");

-- CreateIndex
CREATE INDEX "Relationship_toId_idx" ON "Relationship"("toId");

-- CreateIndex
CREATE INDEX "ChangeLog_projectId_createdAt_idx" ON "ChangeLog"("projectId", "createdAt");
