import { apiBaseUrl } from "@/lib/config";
async function fetchOrder() {
  try {
    const res = await fetch(`${apiBaseUrl}/api/orders`, { cache: "no-store" });
    return await res.json();
  } catch (e) {
    return { ok: false };
  }
}

export default async function OrderPage() {
  const data = await fetchOrder();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Order</h1>
      <pre className="mt-4 text-sm bg-gray-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}


