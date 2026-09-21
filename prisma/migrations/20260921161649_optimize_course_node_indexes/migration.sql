-- DropIndex
DROP INDEX "CourseNode_courseId_parentId_idx";

-- CreateIndex
CREATE INDEX "CourseNode_courseId_parentId_sortOrder_idx" ON "CourseNode"("courseId", "parentId", "sortOrder");
