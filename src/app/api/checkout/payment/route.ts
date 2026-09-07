import { NextResponse } from "next/server";
import { arePaymentsEnabled } from "@/lib/payments";

export async function POST() {
  if (!arePaymentsEnabled()) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Płatności nie są jeszcze aktywne. Bramka płatnicza nie została podłączona.",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error:
        "Bramka płatnicza jest w trakcie wdrażania. Nie przyjmujemy jeszcze płatności.",
    },
    { status: 503 }
  );
}
