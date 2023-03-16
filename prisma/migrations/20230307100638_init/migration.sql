-- CreateTable
CREATE TABLE "auth_agent" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "secret" TEXT NOT NULL,

    CONSTRAINT "auth_agent_pkey" PRIMARY KEY ("id")
);
