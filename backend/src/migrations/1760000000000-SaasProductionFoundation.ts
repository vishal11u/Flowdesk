import { MigrationInterface, QueryRunner } from 'typeorm';

export class SaasProductionFoundation1760000000000
  implements MigrationInterface
{
  name = 'SaasProductionFoundation1760000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS organizations (
        id SERIAL PRIMARY KEY,
        name varchar NOT NULL,
        slug varchar NOT NULL UNIQUE,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS "organizationId" integer,
      ADD COLUMN IF NOT EXISTS "refreshTokenHash" varchar
    `);

    await queryRunner.query(`
      ALTER TABLE clients
      ADD COLUMN IF NOT EXISTS phone varchar,
      ADD COLUMN IF NOT EXISTS company varchar,
      ADD COLUMN IF NOT EXISTS niche varchar NOT NULL DEFAULT 'b2b_saas_support',
      ADD COLUMN IF NOT EXISTS status varchar NOT NULL DEFAULT 'lead',
      ADD COLUMN IF NOT EXISTS source varchar,
      ADD COLUMN IF NOT EXISTS "pipelineStage" varchar,
      ADD COLUMN IF NOT EXISTS notes text,
      ADD COLUMN IF NOT EXISTS metadata jsonb,
      ADD COLUMN IF NOT EXISTS "organizationId" integer
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_clients_org_email"
      ON clients ("organizationId", email)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS integration_connections (
        id SERIAL PRIMARY KEY,
        "organizationId" integer NOT NULL,
        channel varchar NOT NULL,
        status varchar NOT NULL,
        "externalAccountId" varchar,
        settings jsonb,
        "credentialsRef" jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        "organizationId" integer,
        "userId" integer,
        method varchar NOT NULL,
        path varchar NOT NULL,
        "statusCode" integer NOT NULL,
        ip varchar,
        metadata jsonb,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      ALTER TABLE messages
      ADD CONSTRAINT "FK_messages_client"
      FOREIGN KEY ("clientId") REFERENCES clients(id) ON DELETE CASCADE
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'ALTER TABLE messages DROP CONSTRAINT IF EXISTS "FK_messages_client"',
    );
    await queryRunner.query('DROP TABLE IF EXISTS audit_logs');
    await queryRunner.query('DROP TABLE IF EXISTS integration_connections');
    await queryRunner.query('DROP INDEX IF EXISTS "IDX_clients_org_email"');
    await queryRunner.query(
      'ALTER TABLE clients DROP COLUMN IF EXISTS "organizationId"',
    );
    await queryRunner.query('ALTER TABLE users DROP COLUMN IF EXISTS "organizationId"');
    await queryRunner.query('DROP TABLE IF EXISTS organizations');
  }
}
