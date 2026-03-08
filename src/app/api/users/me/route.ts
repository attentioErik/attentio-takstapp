import { NextRequest, NextResponse } from 'next/server';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';

const DEMO_USER_ID = 'a0000000-0000-0000-0000-000000000001';

export async function GET() {
  try {
    let [user] = await db.select().from(users).where(eq(users.id, DEMO_USER_ID)).limit(1);
    if (!user) {
      [user] = await db
        .insert(users)
        .values({
          id: DEMO_USER_ID,
          email: 'demo@takstapp.no',
          name: 'Demo Bruker',
          company: 'Takstfirma AS',
          certifications: 'Statsautorisert takstmann',
        })
        .returning();
    }
    return NextResponse.json({ user });
  } catch (error) {
    console.error('GET /api/users/me error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const [user] = await db
      .update(users)
      .set({
        name: body.name,
        email: body.email,
        company: body.company,
        phone: body.phone,
        certifications: body.certifications,
        logoUrl: body.logoUrl,
        updatedAt: new Date(),
      })
      .where(eq(users.id, DEMO_USER_ID))
      .returning();
    return NextResponse.json({ user });
  } catch (error) {
    console.error('PATCH /api/users/me error:', error);
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}
