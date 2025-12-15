    // app/admin/users/page.tsx
    import type { User } from "@/src/types/user";
    import AdminUserCard from "@/src/components/admin/users/AdminUserCard";
    import Pagination from "@/src/components/listings/Pagination";
    import { cookies } from "next/headers";
    import { UserStatus } from "@/src/types/user";

    export const dynamic = "force-dynamic";

    type UsersResponse = {
    data: User[];
    meta: { page: number; limit: number; total: number; totalPages: number };
    };

    export default async function AdminUsersPage({
    searchParams,
    }: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
    }) {
    // Next 15: searchParams là Promise → phải await
    const sp = await searchParams;

    const page = Number(Array.isArray(sp.page) ? sp.page[0] : sp.page) || 1;
    const limit = 10;

    const base = process.env.INTERNAL_API_BASE || "http://localhost:4000";

    const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
    });

    const url = `${base}/api/admin/users?${qs.toString()}`;

    // Next 15: cookies() async → phải await rồi serialize thủ công
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
        .getAll()
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

    const res = await fetch(url, {
        cache: "no-store",
        headers: cookieHeader ? { Cookie: cookieHeader } : {},
    });

    if (res.status === 403) {
        return (
        <main className="max-w-7xl mx-auto py-10 px-6">
            <p className="text-red-600">
            Bạn không có quyền truy cập khu vực quản trị người dùng.
            </p>
        </main>
        );
    }
    
    if (!res.ok) {
        console.error("admin users fetch error:", res.status, await res.text());
        return (
        <main className="max-w-7xl mx-auto py-10 px-6">
            <p className="text-red-600">Lỗi tải danh sách người dùng.</p>
        </main>
        );
    }

    const { data, meta } = (await res.json()) as UsersResponse;

    return (
        <main className="max-w-7xl mx-auto py-10 px-6">
        <h1 className="text-xl font-semibold text-black mb-6">Quản lý người dùng</h1>

        {data.length === 0 ? (
            <p className="text-gray-600">Không có người dùng nào.</p>
        ) : (
            <div className="space-y-3">
            {data.map((user) => (
                <AdminUserCard key={user.id} user={user}/>
            ))}
            </div>
        )}

        <Pagination page={meta.page} totalPages={meta.totalPages} />
        </main>
    );
    }
