<template>
  <div class="author-story-management-page"> <AppHeader /> <main class="author-story-management-container">
      <h1 class="page-title">Quản lý truyện của tôi</h1>

      <StoryFiltersSection
        :categories="categories"
        :showAuthorFilter="false"
        @apply-filters="handleApplyFilters"
        @clear-filters="handleClearFilters"
      />

      <div class="action-buttons-container">
        <router-link :to="{ name: 'SubmitStory' }" class="create-story-btn">
          <i class="fas fa-plus-circle"></i> Thêm truyện mới
        </router-link>
      </div>

      <StoryTableSection
        :stories="storyTextStore.authorStories"
        :loading="storyTextStore.authorStoriesLoading"
        :sortColumn="currentSortColumn"
        :sortDirection="currentSortDirection"
        :isAuthorView="true"
        @view-details="handleViewDetails"
        @edit="handleEditStory"
        @delete="handleDeleteStory"
        @requestSort="handleSortRequest"
      />

      <div v-if="storyTextStore.authorStoriesPagination.total_pages > 1" class="pagination-controls">
        <button
          @click="handlePageChange(storyTextStore.authorStoriesPagination.current_page - 1)"
          :disabled="storyTextStore.authorStoriesPagination.current_page === 1"
          class="pagination-button"
        >
          <i class="fas fa-chevron-left"></i> Trang trước
        </button>
        <span>Trang {{ storyTextStore.authorStoriesPagination.current_page }} / {{ storyTextStore.authorStoriesPagination.total_pages }}</span>
        <button
          @click="handlePageChange(storyTextStore.authorStoriesPagination.current_page + 1)"
          :disabled="storyTextStore.authorStoriesPagination.current_page === storyTextStore.authorStoriesPagination.total_pages"
          class="pagination-button"
        >
          Trang sau <i class="fas fa-chevron-right"></i>
        </button>
      </div>
    </main>

    <AppFooter /> </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { useStoryTextStore } from '@/modules/storyText/storyText.store';
import { useCategoryStore } from '@/modules/category/category.store';
import { useAuthStore } from '@/modules/auth/auth.store';
import StoryTableSection from '@/components/admin/StoryTableSection.vue';
import StoryFiltersSection from '@/components/admin/StoryFiltersSection.vue';
import { useRouter } from 'vue-router';
import { useAppToast } from '@/composables/useAppToast';
import AppHeader from "@/components/layout/AppHeader.vue"; // IMPORT HEADER
import AppFooter from "@/components/layout/AppFooter.vue"; // IMPORT FOOTER

const storyTextStore = useStoryTextStore();
const categoryStore = useCategoryStore();
const authStore = useAuthStore();
const router = useRouter();
const { showSuccessToast, showErrorToast } = useAppToast();

const categories = computed(() => categoryStore.categories);

// Filter and Pagination State
const currentPage = ref(1);
const currentLimit = ref(10); // Or whatever default limit you prefer
const currentKeyword = ref('');
const currentStatus = ref('');
const currentCategoryId = ref<number | null>(null);
const currentSortColumn = ref('thoi_gian_cap_nhat');
const currentSortDirection = ref('desc');

// Fetching Data
const fetchStories = async () => {
  await storyTextStore.fetchAuthorStories({
    page: currentPage.value,
    limit: currentLimit.value,
    keyword: currentKeyword.value,
    trang_thai_kiem_duyet: currentStatus.value,
    category_id: currentCategoryId.value,
    sort_by: currentSortColumn.value,
    order: currentSortDirection.value,
  });
};

onMounted(async () => { // Đổi thành async
  if (categories.value.length === 0) {
    await categoryStore.fetchAllCategories(); // SỬA TÊN HÀM TẠI ĐÂY
  }
  fetchStories();
});

// Watch for changes in pagination/filter/sort parameters to re-fetch
watch([currentPage, currentKeyword, currentStatus, currentCategoryId, currentSortColumn, currentSortDirection], () => {
  fetchStories();
});

// Handlers for Filters and Pagination
const handleApplyFilters = (filters: { keyword: string; trang_thai_kiem_duyet: string; category_id: number | null }) => {
  currentPage.value = 1; // Reset to first page on filter apply
  currentKeyword.value = filters.keyword;
  currentStatus.value = filters.trang_thai_kiem_duyet;
  currentCategoryId.value = filters.category_id;
};

const handleClearFilters = () => {
  currentPage.value = 1;
  currentKeyword.value = '';
  currentStatus.value = '';
  currentCategoryId.value = null;
};

const handlePageChange = (page: number) => {
  if (page > 0 && page <= storyTextStore.authorStoriesPagination.total_pages) {
    currentPage.value = page;
  }
};

const handleSortRequest = ({ column, direction }: { column: string; direction: 'asc' | 'desc' }) => {
  currentSortColumn.value = column;
  currentSortDirection.value = direction;
  currentPage.value = 1; // Reset to first page on sort
};

// Handlers for Story Actions
const handleViewDetails = (storyId: number) => {
  const story = storyTextStore.authorStories.find(s => s.id === storyId);
  if (story && story.slug) {
    router.push(`/truyen-chu/${story.slug}`);
  } else {
    showErrorToast("Không tìm thấy slug truyện để xem chi tiết.");
  }
};

const handleEditStory = (storyId: number) => {
  showSuccessToast(`Tính năng chỉnh sửa truyện ID: ${storyId} sẽ được triển khai sau.`);
};

const handleDeleteStory = async (storyId: number) => {
  if (confirm("Bạn có chắc chắn muốn xóa truyện này?")) {
    try {
      await storyTextStore.deleteStory(storyId);
    } catch (error) {
      console.error("Lỗi khi xóa truyện:", error);
    }
  }
};
</script>

<style scoped>
/* THÊM STYLE CỦA TRANG */
.author-story-management-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1a1d29; /* Đảm bảo nền khớp với các thành phần khác */
}

.author-story-management-container {
  flex-grow: 1; /* Đảm bảo nội dung chính chiếm không gian còn lại */
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  font-family: 'Manrope', sans-serif;
  color: #e0e0e0;
}

.page-title {
  font-size: 2.5rem;
  color: #22c55e;
  text-align: center;
  margin-bottom: 2rem;
  font-weight: 700;
  text-shadow: 0 0 10px rgba(34, 197, 94, 0.5);
}

.action-buttons-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.create-story-btn {
  background-color: #22c55e;
  color: white;
  padding: 0.8rem 1.5rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.3);
}

.create-story-btn:hover {
  background-color: #1a9f4d;
  transform: translateY(-2px);
}

.create-story-btn i {
  font-size: 1.1rem;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 2rem;
  gap: 1rem;
  font-size: 1rem;
  color: #e0e0e0;
}

.pagination-button {
  background-color: #2a2d3a;
  color: #22c55e;
  padding: 0.7rem 1.2rem;
  border: 1px solid #22c55e;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-button:hover:not(:disabled) {
  background-color: #22c55e;
  color: #ffffff;
}

.pagination-button:disabled {
  background-color: #3b4050;
  color: #6b7280;
  border-color: #6b7280;
  cursor: not-allowed;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .author-story-management-container {
    padding: 1rem;
  }
  .page-title {
    font-size: 2rem;
  }
  .action-buttons-container {
    justify-content: center;
  }
  .create-story-btn {
    padding: 0.7rem 1.2rem;
    font-size: 0.9rem;
  }
  .pagination-controls {
    flex-wrap: wrap;
    gap: 0.8rem;
  }
  .pagination-button {
    padding: 0.6rem 1rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .author-story-management-container {
    padding: 0.7rem;
  }
  .page-title {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
  }
  .create-story-btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
  .pagination-controls {
    font-size: 0.9rem;
    gap: 0.5rem;
  }
}
</style>