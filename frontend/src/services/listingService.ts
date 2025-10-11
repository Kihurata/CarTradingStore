// frontend/src/services/listingService.ts
import { Listing, CreateListingRequest } from "@/src/types/listing";

export async function getListings(): Promise<Listing[]> {
  try {
    console.log("Fetching listings from /api/listings");
    
    const res = await fetch("/api/listings", {
      cache: "no-store",
      credentials: "include",
    });
    
    console.log("Listings response status:", res.status);
    
    if (!res.ok) {
      throw new Error(`Lấy danh sách xe thất bại: ${res.status}`);
    }

    const data = await res.json();
    console.log("Listings data received:", data);
    
    return data.data as Listing[];
  } catch (error) {
    console.error("Error fetching listings:", error);
    throw error;
  }
}

export async function getListing(id: string): Promise<Listing> {
  try {
    const res = await fetch(`/api/listings/${id}`, {
      cache: "no-store",
      credentials: "include",
    });
    
    if (!res.ok) {
      throw new Error(`Lấy thông tin xe thất bại: ${res.status}`);
    }
    
    const data = await res.json();
    return data.data as Listing;
  } catch (error) {
    console.error("Error fetching listing:", error);
    throw error;
  }
}

export async function createListing(listingData: CreateListingRequest, imageFiles: File[] = []): Promise<Listing> {
  let token: string | null = null;
  
  // Lấy token từ localStorage (chỉ chạy trên client)
  if (typeof window !== 'undefined') {
    token = localStorage.getItem("token");
    console.log("Token from localStorage:", token);
  }

  // Kiểm tra token
  if (!token) {
    throw new Error("Bạn cần đăng nhập để đăng tin. Vui lòng đăng nhập và thử lại.");
  }

  // Validate dữ liệu đầu vào
  if (!listingData.giaBan || isNaN(parseInt(listingData.giaBan.replace(/\D/g, '')))) {
    throw new Error("Giá bán không hợp lệ. Vui lòng nhập số tiền hợp lệ.");
  }

  console.log("Creating listing with data:", listingData);
  console.log("Image files count:", imageFiles.length);

  // Tạo FormData để gửi cả dữ liệu và file
  const formData = new FormData();
  
  // Append các trường dữ liệu
  Object.keys(listingData).forEach(key => {
    const value = listingData[key as keyof CreateListingRequest];
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value as string);
    }
  });

  // Append các file ảnh
  imageFiles.forEach((file, index) => {
    formData.append('images', file);
  });

  const headers: HeadersInit = {
    'Authorization': `Bearer ${token}`
  };

  try {
    console.log("Sending request to /api/listings...");
    
    const res = await fetch("/api/listings", {
      method: "POST",
      headers,
      body: formData,
      credentials: "include",
    });

    console.log("Response status:", res.status);
    
    if (!res.ok) {
      let errorMessage = "Tạo tin đăng thất bại";
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.error || errorMessage;
        console.log("Error details from backend:", errorData);
        
        // Xử lý lỗi token cụ thể
        if (res.status === 401 || errorMessage.includes('token') || errorMessage.includes('unauthorized')) {
          // Xóa token không hợp lệ
          if (typeof window !== 'undefined') {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
          errorMessage = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        }
      } catch (parseError) {
        console.log("Parse error:", parseError);
        const text = await res.text();
        console.log("Raw response:", text);
        errorMessage = `HTTP Error: ${res.status} ${res.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const responseData = await res.json();
    console.log("Success response from backend:", responseData);
    
    return responseData.data as Listing;
  } catch (error) {
    console.error("Create listing error:", error);
    throw error;
  }
}