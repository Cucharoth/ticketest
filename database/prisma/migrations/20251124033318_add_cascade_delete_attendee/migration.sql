-- DropForeignKey
ALTER TABLE "attendee_event" DROP CONSTRAINT "attendee_event_attendee_id_fkey";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "notification_attendee_id_fkey";

-- AddForeignKey
ALTER TABLE "attendee_event" ADD CONSTRAINT "attendee_event_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_attendee_id_fkey" FOREIGN KEY ("attendee_id") REFERENCES "attendee"("id") ON DELETE CASCADE ON UPDATE CASCADE;
