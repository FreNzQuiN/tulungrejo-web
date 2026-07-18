import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

interface FieldFilterOptions {
  blok?: string | null;
  search?: string | null;
  take?: number;
  skip?: number;
}

export function buildFieldWhere(
  opts: FieldFilterOptions,
): Prisma.FieldsWhereInput {
  const where: Prisma.FieldsWhereInput = {};

  if (opts.blok) where.blok = opts.blok;
  if (opts.search) {
    where.OR = [
      { ownerName: { contains: opts.search } },
      { nop: { contains: opts.search } },
      { noBidang: { contains: opts.search } },
    ];
  }

  return where;
}

export async function findFields(opts: FieldFilterOptions) {
  const where = buildFieldWhere(opts);
  return prisma.fields.findMany({
    where,
    orderBy: [{ blok: "asc" }, { noBidang: "asc" }],
    take: opts.take,
    skip: opts.skip,
    select: {
      id: true,
      nop: true,
      noUrut: true,
      ownerName: true,
      ownerAddress: true,
      address: true,
      rw: true,
      rt: true,
      blok: true,
      noBidang: true,
      dusun: true,
      landArea: true,
      buildingArea: true,
      buildingCount: true,
      znt: true,
      jenisTanah: true,
      pendataanAt: true,
    },
  });
}
