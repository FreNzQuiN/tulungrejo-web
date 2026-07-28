export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return Response.json([]);
  }

  return Response.json([
    {
      label: "Pamong",
      email: "pamong@tulungrejo.desa.id",
      password: "pamong123",
    },
    { label: "Kades", email: "kades@tulungrejo.desa.id", password: "kades123" },
    {
      label: "Jurnalis",
      email: "jurnalis@tulungrejo.desa.id",
      password: "jurnalis123",
    },
  ]);
}
