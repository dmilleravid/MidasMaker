import { apiBaseUrl } from "@/lib/config";
async function fetchProduct() {
  try {
    const res = await fetch(`${apiBaseUrl}/api/products`, { cache: "no-store" });
    return await res.json();
  } catch (e) {
    return { ok: false };
  }
}

export default async function ProductPage() {
  const data = await fetchProduct();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Product</h1>
      <pre className="mt-4 text-sm bg-gray-100 p-4 rounded">{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}


