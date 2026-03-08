import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { db, users } from '@/lib/db';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function assertAdmin(req: NextRequest) {
  const token = await getToken({ req });
  if (!token?.isAdmin) throw new Error('Forbidden');
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await assertAdmin(req);
    const { id } = await params;
    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.name) updates.name = body.name;
    if (body.email) updates.email = body.email;
    if (body.company !== undefined) updates.company = body.company;
    if (typeof body.isAdmin === 'boolean') updates.isAdmin = body.isAdmin;
    if (body.password) updates.passwordHash = await bcrypt.hash(body.password, 10);
    updates.updatedAt = new Date();

    const [updated] = await db.update(users).set(updates).where(eq(users.id, id)).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      company: users.company,
      isAdmin: users.isAdmin,
    });

    if (!updated) return NextResponse.json({ error: 'Ikke funnet' }, { status: 404 });
    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: 'Ikke tilgang' }, { status: 403 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await assertAdmin(req);
    const { id } = await params;
    await db.delete(users).where(eq(users.id, id));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Ikke tilgang' }, { status: 403 });
  }
}
