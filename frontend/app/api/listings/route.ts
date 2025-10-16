<<<<<<< Updated upstream
// frontend/app/api/listings/route.ts
=======
// app/api/listings/route.ts

>>>>>>> Stashed changes
export async function GET(req: Request) {
  try {
    // Parse URL an toàn
    const url = new URL(req.url, 'http://localhost:3000'); // Thêm base URL
    const searchParams = url.searchParams.toString();
    const qs = searchParams ? `?${searchParams}` : '';
    
    const target = `${process.env.INTERNAL_API_BASE}/api/listings${qs}`;
    
    console.log("Proxying GET to:", target);

    const res = await fetch(target, {
      headers: {
        cookie: req.headers.get("cookie") ?? "",
        authorization: req.headers.get("authorization") ?? "",
      },
      cache: "no-store",
    });

<<<<<<< Updated upstream
    if (!res.ok) {
      console.error("Backend responded with error:", res.status);
      return new Response(JSON.stringify({ error: "Failed to fetch listings" }), {
        status: res.status,
        headers: { "content-type": "application/json" },
      });
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy GET error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}

export async function POST(req: Request) {
  const target = `${process.env.INTERNAL_API_BASE}/api/listings`;
  console.log("Proxying POST to:", target);
  
  try {
    // Kiểm tra xem có phải là FormData không
    const contentType = req.headers.get('content-type') || '';
    
    let body: any;
    let headers: HeadersInit = {
      'cookie': req.headers.get("cookie") ?? "",
    };

    // Forward authorization header
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      headers['authorization'] = authHeader;
    }

    if (contentType.includes('multipart/form-data')) {
      // Xử lý FormData (có file upload)
      const formData = await req.formData();
      body = formData;
      
      // KHÔNG set Content-Type cho multipart, browser sẽ tự set với boundary
      delete headers['Content-Type'];
    } else {
      // Xử lý JSON data
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(await req.json());
    }

    console.log("Forwarding request with headers:", headers);

    const res = await fetch(target, {
      method: "POST",
      headers,
      body,
    });

    console.log("Backend response status:", res.status);
    
    const responseText = await res.text();
    console.log("Backend response text:", responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      data = { error: "Invalid JSON response", raw: responseText };
    }

    return new Response(JSON.stringify(data), {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy POST error:", error);
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      details: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
=======
  const body = await res.text();
  return new Response(body, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
}

export async function POST(req: Request) {
  console.log("Incoming cookie:", req.headers.get("cookie"));
  const target = `${process.env.INTERNAL_API_BASE}/api/listings`;

  // Forward form-data body, cookie, và Content-Type (với boundary)
  const formData = await req.arrayBuffer();
  const cookieHeader = req.headers.get("cookie") ?? "";
  const contentType = req.headers.get("content-type") ?? "";

  const res = await fetch(target, {
    method: "POST",
    body: formData,
    headers: {
      cookie: cookieHeader,
      ...(contentType ? { "content-type": contentType } : {}), // ✅ Forward Content-Type để multer parse đúng
    },
  });

  const resBody = await res.text();
  console.log("Proxy POST /listings response:", res.status, resBody); // log response
  return new Response(resBody, {
    status: res.status,
    headers: { "content-type": res.headers.get("content-type") ?? "application/json" },
  });
>>>>>>> Stashed changes
}