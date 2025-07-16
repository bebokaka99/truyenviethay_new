import axios from "@/utils/axios";

export const getPublicStories = async ({ page = 1, limit = 20, sort_by = "thoi_gian_cap_nhat", order = "DESC", keyword = "" }) => {
  const res = await axios.get(`/api/truyen/public`, {
    params: { page, limit, sort_by, order, keyword },
  });
  return res.data;
};

// API cho Admin: Lấy tất cả truyện với phân trang, lọc, tìm kiếm
export const getAdminStories = async ({
  page = 1,
  limit = 10,
  trang_thai_kiem_duyet = "",
  keyword = "",
  author_id = null,
  category_id = null,
}) => {
  const res = await axios.get(`/api/truyen`, {
    params: { page, limit, trang_thai_kiem_duyet, keyword, author_id, category_id },
  });
  return res.data;
};

// API cho Admin: Lấy thông tin chi tiết truyện theo ID
export const getStoryById = async (storyId: number) => {
  const res = await axios.get(`/api/truyen/${storyId}`);
  return res.data;
};

// API cho Admin: Duyệt hoặc từ chối truyện
export const approveOrRejectStoryApi = async (storyId: number, action: 'duyet' | 'tu_choi') => {
  const res = await axios.put(`/api/truyen/${storyId}/duyet-truyen`, { action });
  return res.data;
};

// API cho Admin: Cập nhật thông tin truyện
export const updateStoryAdmin = async (storyId: number, storyData: FormData) => {
  const res = await axios.put(`/api/truyen/${storyId}`, storyData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// API cho Admin: Xóa truyện
export const deleteStoryAdmin = async (storyId: number) => {
  const res = await axios.delete(`/api/truyen/${storyId}`);
  return res.data;
};