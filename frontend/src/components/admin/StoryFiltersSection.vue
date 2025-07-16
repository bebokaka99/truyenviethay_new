<template>
  <div class="story-filters-section">
    <div class="filter-group">
      <label for="statusFilter" class="filter-label"><i class="fas fa-filter icon"></i> Trạng thái duyệt:</label>
      <select id="statusFilter" v-model="internalFilters.trang_thai_kiem_duyet" class="filter-select">
        <option value="">Tất cả</option>
        <option value="cho_duyet">Chờ duyệt</option>
        <option value="duyet">Đã duyệt</option>
        <option value="tu_choi">Từ chối</option>
      </select>
    </div>

    <div class="filter-group">
      <label for="categoryFilter" class="filter-label"><i class="fas fa-tags icon"></i> Thể loại:</label>
      <select id="categoryFilter" v-model="internalFilters.category_id" class="filter-select">
        <option value="">Tất cả</option>
        <option v-for="category in categories" :key="category.id_theloai" :value="category.id_theloai">
          {{ category.ten_theloai }}
        </option>
      </select>
    </div>

    <div class="filter-group search-group">
      <label for="keywordSearch" class="filter-label"><i class="fas fa-search icon"></i> Tìm kiếm:</label>
      <input
        type="text"
        id="keywordSearch"
        v-model="internalFilters.keyword"
        placeholder="Tên truyện hoặc tác giả"
        class="filter-input"
        @keyup.enter="applyFilters"
      />
    </div>

    <div class="filter-actions">
      <button @click="applyFilters" class="apply-btn">
        <i class="fas fa-check-circle"></i> Áp dụng
      </button>
      <button @click="clearFilters" class="clear-btn">
        <i class="fas fa-times-circle"></i> Xóa bộ lọc
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, PropType } from 'vue';

interface Filters {
  trang_thai_kiem_duyet: string;
  keyword: string;
  author_id: number | null;
  category_id: number | null;
}

interface Category {
  id_theloai: number;
  ten_theloai: string;
  slug: string;
}

const props = defineProps({
  initialFilters: {
    type: Object as PropType<Filters>,
    default: () => ({
      trang_thai_kiem_duyet: '',
      keyword: '',
      author_id: null,
      category_id: null,
    }),
  },
  categories: {
    type: Array as PropType<Category[]>,
    required: true,
  },
});

const emit = defineEmits(['applyFilters', 'clearFilters']);

const internalFilters = ref<Filters>({ ...props.initialFilters });

watch(() => props.initialFilters, (newFilters) => {
  internalFilters.value = { ...newFilters };
}, { deep: true });

const applyFilters = () => {
  emit('applyFilters', internalFilters.value);
};

const clearFilters = () => {
  internalFilters.value = {
    trang_thai_kiem_duyet: '',
    keyword: '',
    author_id: null,
    category_id: null,
  };
  emit('clearFilters');
};
</script>

<style scoped>
.story-filters-section {
  background: rgba(36, 40, 52, 0.7);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.75rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: flex-end;
  font-family: 'Manrope', sans-serif;
  color: #ffffff;
}

.filter-group {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 1rem;
  font-weight: 600;
  color: #e0e0e0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label .icon {
  color: #22c55e;
}

.filter-select,
.filter-input {
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid #4b5563;
  color: #ffffff;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.1);
}

.filter-select:focus,
.filter-input:focus {
  border-color: #22c55e;
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 10px rgba(34, 197, 94, 0.3);
  outline: none;
}

.filter-select option {
  background-color: #242834; 
  color: #ffffff;
}

.filter-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.apply-btn,
.clear-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  border: none;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.apply-btn {
  background: linear-gradient(90deg, #22c55e, #4ade80);
  color: #1a1d29;
}

.apply-btn:hover {
  background: linear-gradient(90deg, #4ade80, #22c55e);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(34, 197, 94, 0.4);
}

.clear-btn {
  background: #6b7280;
  color: #ffffff;
}

.clear-btn:hover {
  background: #4b5563;
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(75, 85, 99, 0.4);
}

@media (max-width: 768px) {
  .story-filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 1rem;
  }
  .filter-group {
    min-width: unset;
    width: 100%;
  }
  .filter-actions {
    flex-direction: column;
    gap: 0.75rem;
  }
  .apply-btn, .clear-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>