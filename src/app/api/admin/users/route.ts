import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db, users } from '@/lib/db';
import bcrypt from 'bcryptjs';

async function assertAdmin(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.isAdmin) throw new Error('Forbidden');
}

export async function GET(req: NextRequest) {
  try {
    await assertAdmin(req);
    const all = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        company: users.company,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      })
      .from(users);
    return NextResponse.json({ users: all });
  } catch {
    return NextResponse.json({ error: 'Ikke tilgang' }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await assertAdmin(req);
    const body = await req.json();
    const { name, email, password, company, isAdmin } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Mangler felt' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [user] = await db
      .insert(users)
      .values({ name, email, company: company || null, passwordHash, isAdmin: isAdmin ?? false })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        company: users.company,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt,
      });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    if (msg.includes('unique')) {
      return NextResponse.json({ error: 'E-post er allerede i bruk' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Serverfeil' }, { status: 500 });
  }
}
