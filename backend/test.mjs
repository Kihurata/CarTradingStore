import fetch from "node-fetch";

async function testListing() {
  try {
    const payload = {
      brand: "Toyota",
      model: "Camry",
      year: 2020,
      price_vnd: 1000000000,
      gearbox: "AT",
      fuel: "xang",
      body_type: "sedan",
      seats: 5,
      origin: "trong-nuoc",
      description: "Xe test từ fetch mini",
      address_line: "123 Street",
      province_id: 1,
      district_id: 1,
      title: "Tin test",
    };

    const res = await fetch("http://localhost:4000/api/listings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // nếu backend cần cookie login:
        // "Cookie": "__session=xxxx; jwt=yyyy"
      },
      body: JSON.stringify(payload),
    });

    console.log("Status:", res.status);

    const data = await res.text(); // dùng .json() nếu backend trả JSON
    console.log("Response:", data);

    if (res.ok) console.log("✅ Backend nhận request thành công!");
    else console.log("❌ Backend trả lỗi, cần debug");
  } catch (err) {
    console.error("❌ Lỗi khi gửi request:", err);
  }
}

testListing();
