-- CreateTable
CREATE TABLE "attendee_event" (
    "id" UUID NOT NULL,
    "event_id" UUID NOT NULL,
    "attendee_id" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendee_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendee" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "cellphone" VARCHAR(18) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "attendee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "date" TIMESTAMPTZ NOT NULL,
    "place" VARCHAR(255) NOT NULL,
    "ticket_max" INTEGER NOT NULL,
    "tickets_left" INTEGER NOT NULL,
    "ticket_sold" INTEGER NOT NULL,
    "typeId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_type" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "event_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" UUID NOT NULL,
    "message" TEXT NOT NULL,
    "send_date" TIMESTAMPTZ NOT NULL,
    "attendee_id" UUID NOT NULL,
    "type" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_type" (
    "id" UUID NOT NULL,
    "type" VARCHAR NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "notification_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_event" (
    "id" UUID NOT NULL,
    "event_id" UUID,
    "ticket_event" UUID,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ticket_event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket" (
    "id" UUID NOT NULL,
    "price" DECIMAL NOT NULL,
    "typeId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_type" (
    "id" UUID NOT NULL,
    "type" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "ticket_type_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "attendee_email_key" ON "attendee"("email");

-- AddForeignKey
ALTER TABLE "attendee_event" ADD CONSTRAINT "attendee_event_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendee_event" ADD CONSTRAINT "attendee_event_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event" ADD CONSTRAINT "event_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "event_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "attendee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_type_fkey" FOREIGN KEY ("type") REFERENCES "notification_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket_event" ADD CONSTRAINT "ticket_event_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "event"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ticket" ADD CONSTRAINT "ticket_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "ticket_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
