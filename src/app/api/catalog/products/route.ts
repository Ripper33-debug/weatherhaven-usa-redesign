import { NextResponse } from "next/server";
import { listPublishedProducts } from "@/app/api/_lib/catalog-products";
import { guardApiRead } from "@/lib/api-guard";

export async function GET(request: Request) {
  const limited = guardApiRead(request);
  if (limited) return limited;

  const products = await listPublishedProducts();
  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
