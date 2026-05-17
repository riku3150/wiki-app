-- CreateTable
CREATE TABLE "WikiPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "editingBy" TEXT,
    "editingAt" TIMESTAMP(3),

    CONSTRAINT "WikiPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageLink" (
    "id" TEXT NOT NULL,
    "fromPageId" TEXT NOT NULL,
    "targetSlug" TEXT NOT NULL,

    CONSTRAINT "PageLink_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WikiPage_slug_key" ON "WikiPage"("slug");

-- CreateIndex
CREATE INDEX "PageLink_fromPageId_idx" ON "PageLink"("fromPageId");

-- AddForeignKey
ALTER TABLE "WikiPage" ADD CONSTRAINT "WikiPage_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WikiPage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageLink" ADD CONSTRAINT "PageLink_fromPageId_fkey" FOREIGN KEY ("fromPageId") REFERENCES "WikiPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
