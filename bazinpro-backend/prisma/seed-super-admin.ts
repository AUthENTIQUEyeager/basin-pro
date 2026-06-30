// Script pour créer le premier compte Super Admin
// Exécuter avec : npx ts-node prisma/seed-super-admin.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@authentique-studio.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMoiImmediatement123!';

  const existing = await prisma.utilisateur.findUnique({ where: { email } });
  if (existing) {
    console.log('Super Admin déjà existant :', email);
    return;
  }

  // Boutique technique pour rattacher le compte Super Admin (obligatoire car FK)
  const boutiqueAdmin = await prisma.boutique.create({
    data: {
      nom: 'Authentique Studio — Administration',
      abonnementStatut: 'ACTIF',
      abonnementFin: new Date('2099-12-31'),
    },
  });

  const hash = await bcrypt.hash(password, 12);

  const admin = await prisma.utilisateur.create({
    data: {
      boutiqueId: boutiqueAdmin.id,
      nom: 'Studio',
      prenom: 'Admin',
      email,
      passwordHash: hash,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Super Admin créé :', admin.email);
  console.log('⚠️  Pensez à changer le mot de passe après la première connexion.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
