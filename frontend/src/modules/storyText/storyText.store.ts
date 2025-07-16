import { defineStore } from "pinia";
import axios from "@/utils/axios";
import { getAdminStories, getStoryById, approveOrRejectStoryApi, updateStoryAdmin, deleteStoryAdmin } from "./storyText.api";
import { useAppToast } from "@/composables/useAppToast"; // Giả định useAppToast đã tồn tại

const { showSuccessToast, showErrorToast } = useAppToast(); 

interface StoryTextState {
  stories: any[]; // Dùng cho public stories (getPublicStories)
  story: any | null; // Dùng cho chi tiết truyện (fetchStoryById)
  chapters: any[];
  chapter: any | null;
  loading: boolean;
  error: string | null;
  
  // State riêng cho admin stories
  adminStories: any[];
  adminStoriesPagination: {
    total: number;
    current_page: number;
    total_pages: number;
  };
  adminStoriesLoading: boolean;
  adminStoriesError: string | null;
}

export const useStoryTextStore = defineStore("storyText", {
  state: (): StoryTextState => ({
    stories: [],
    story: null,
    chapters: [],
    chapter: null,
    loading: false,
    error: null,

    adminStories: [],
    adminStoriesPagination: {
      total: 0,
      current_page: 1,
      total_pages: 1,
    },
    adminStoriesLoading: false,
    adminStoriesError: null,
  }),

  getters: {
    getAdminStoriesLoading: (state) => state.adminStoriesLoading,
    getAdminStoriesError: (state) => state.adminStoriesError,
    getAdminStories: (state) => state.adminStories, // Getter cho danh sách truyện admin
  },

  actions: {
    async fetchStories() {
      try {
        this.loading = true;
        const res = await axios.get("/api/truyen/public"); 
        this.stories = res.data.data || [];
        this.error = null;
      } catch (err: any) {
        this.error = err.message || "Lỗi không xác định";
      } finally {
        this.loading = false;
      }
    },

    async fetchStoryById(id: number) {
      try {
        this.loading = true; // Có thể dùng biến loading riêng cho chi tiết
        const res = await getStoryById(id);
        if (res) {
          this.story = res; 
          this.error = null;
          return res; // Trả về dữ liệu truyện
        } else {
          this.error = "Không tìm thấy truyện hoặc dữ liệu không hợp lệ.";
          showErrorToast(this.error);
          return null; 
        }
      } catch (err: any) {
        console.error("Lỗi API khi lấy chi tiết truyện:", err);
        const errorMessage = err.response?.data?.message || err.message || "Không lấy được chi tiết truyện";
        this.error = errorMessage;
        showErrorToast(errorMessage);
        return null; 
      } finally {
        this.loading = false;
      }
    },

    async fetchChapters(storyId: number, page = 1) {
      try {
        this.loading = true;
        const res = await axios.get(
          `/api/chuong?storyId=${storyId}&page=${page}`
        );
        this.chapters = res.data.data || [];
        this.error = null;
      } catch (err: any) {
        this.error = err.message || "Không lấy được danh sách chương";
      } finally {
        this.loading = false;
      }
    },

    async fetchChapterDetail(chapterId: number) {
      try {
        this.loading = true;
        const res = await axios.get(`/api/chuong/${chapterId}`);
        this.chapter = res.data.data;
        this.error = null;
      } catch (err: any) {
        this.error = err.message || "Không lấy được nội dung chương";
      } finally {
        this.loading = false;
      }
    },

    clearData() {
      this.story = null;
      this.chapter = null;
      this.chapters = [];
      this.error = null;
    },

    // ACTIONS DÀNH CHO ADMIN
    async fetchAdminStories(params: {
      page?: number;
      limit?: number;
      trang_thai_kiem_duyet?: string;
      keyword?: string;
      author_id?: number;
      category_id?: number;
    }) {
      try {
        this.adminStoriesLoading = true;
        const result = await getAdminStories(params);
        this.adminStories = result.data || [];
        this.adminStoriesPagination = result.pagination;
        this.adminStoriesError = null;
      } catch (err: any) {
        console.error("Lỗi khi lấy truyện Admin:", err);
        const errorMessage = err.response?.data?.message || err.message || "Lỗi khi lấy danh sách truyện admin";
        this.adminStoriesError = errorMessage;
        showErrorToast(errorMessage); 
      } finally {
        this.adminStoriesLoading = false;
      }
    },

    async approveOrRejectStory(storyId: number, action: 'duyet' | 'tu_choi') {
      try {
        this.adminStoriesLoading = true; // Kích hoạt loading khi thực hiện thao tác
        const result = await approveOrRejectStoryApi(storyId, action);
        showSuccessToast(result.message); 
        // Sau khi duyệt/từ chối, fetch lại danh sách để cập nhật trạng thái
        this.fetchAdminStories({ ...this.adminStoriesPagination, current_page: this.adminStoriesPagination.current_page });
        return result;
      } catch (err: any) {
        console.error("Lỗi khi duyệt/từ chối truyện:", err);
        const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra khi xử lý truyện.";
        this.adminStoriesError = errorMessage;
        showErrorToast(errorMessage); 
        throw err;
      } finally {
        this.adminStoriesLoading = false;
      }
    },

    async updateStory(storyId: number, storyData: FormData) {
      try {
        this.adminStoriesLoading = true;
        const result = await updateStoryAdmin(storyId, storyData);
        showSuccessToast(result.message); 
        const index = this.adminStories.findIndex(story => story.id === storyId);
        if (index !== -1) {
          // Cập nhật lại truyện trong danh sách nếu tìm thấy
          // Hoặc đơn giản là fetch lại toàn bộ danh sách để đảm bảo dữ liệu mới nhất
          this.fetchAdminStories({ ...this.adminStoriesPagination, current_page: this.adminStoriesPagination.current_page });
        }
        return result;
      } catch (err: any) {
        console.error("Lỗi khi cập nhật truyện:", err);
        const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra khi cập nhật truyện.";
        this.adminStoriesError = errorMessage;
        showErrorToast(errorMessage); 
        throw err;
      } finally {
        this.adminStoriesLoading = false;
      }
    },

    async deleteStory(storyId: number) {
      try {
        this.adminStoriesLoading = true;
        const result = await deleteStoryAdmin(storyId);
        showSuccessToast(result.message); 
        // Lọc bỏ truyện đã xóa khỏi danh sách hiện tại
        this.adminStories = this.adminStories.filter(story => story.id !== storyId);
        this.adminStoriesPagination.total--;
        // Nếu trang hiện tại không còn truyện nào và không phải trang đầu tiên, quay lại trang trước
        if (this.adminStories.length === 0 && this.adminStoriesPagination.current_page > 1) {
          this.fetchAdminStories({ ...this.adminStoriesPagination, current_page: this.adminStoriesPagination.current_page - 1 });
        }
        return result;
      } catch (err: any) {
        console.error("Lỗi khi xóa truyện:", err);
        const errorMessage = err.response?.data?.message || err.message || "Có lỗi xảy ra khi xóa truyện.";
        this.adminStoriesError = errorMessage;
        showErrorToast(errorMessage); 
        throw err;
      } finally {
        this.adminStoriesLoading = false;
      }
    },
  },
});