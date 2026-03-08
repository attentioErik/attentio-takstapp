// One-time bootstrap: ensures demo user has passwordHash set.
// Call once at http://localhost:3000/api/bootstrap, then delete this file.
import { NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';

export async function GET() {
  try {
    const [user] = await db.select().from(users).where(eq(users.id, DEMO_USER_ID)).limit(1);

    if (!user) {
      await db.insert(users).values({
        id: DEMO_USER_ID,
        email: 'demo@takstapp.no',
        name: 'Demo Bruker',
        company: 'Takstfirma AS',
        certifications: 'Statsautorisert takstmann',
        passwordHash: await bcrypt.hash('demo123', 10),
        isAdmin: true,
      });
      return NextResponse.json({ status: 'created' });
    }

    if (!user.passwordHash) {
      await db.update(users).set({
        passwordHash: await bcrypt.hash('demo123', 10),
        isAdmin: true,
      }).where(eq(users.id, DEMO_USER_ID));
      return NextResponse.json({ status: 'updated - password set' });
    }

    return NextResponse.json({ status: 'ok', isAdmin: user.isAdmin });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
