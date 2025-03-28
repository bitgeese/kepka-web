import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-vercel-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "footer"
    ADD COLUMN "copyright" text;
    
    -- Set default value for existing rows
    UPDATE "footer"
    SET "copyright" = '© Jakub Kępka. All rights reserved.'
    WHERE "copyright" IS NULL;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "footer"
    DROP COLUMN "copyright";
  `)
} 