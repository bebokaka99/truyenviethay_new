<template>
  <div class="story-table-section">
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <span>Đang tải dữ liệu...</span>
    </div>

    <div v-if="!loading && stories.length === 0" class="no-data-message">
      <i class="fas fa-box-open"></i>
      <span>Không tìm thấy truyện nào.</span>
    </div>

    <div v-if="!loading && stories.length > 0" class="table-responsive">
      <table class="story-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Ảnh bìa</th>
            <th>Tên truyện</th>
            <th>Tác giả</th>
            <th>Trạng thái duyệt</th>
            <th>Thời gian cập nhật</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="story in stories" :key="story.id">
            <td>{{ story.id }}</td>
            <td class="cover-image-cell">
              <img
                v-if="getFinalImageUrl(story.anh_bia)"
                :src="getFinalImageUrl(story.anh_bia)"
                alt="Ảnh bìa"
                class="story-cover-thumb"
                crossorigin="anonymous"
                @error="handleImageError"
              />
              <div v-else class="no-image-placeholder-small">
                <i class="fas fa-image"></i>
                <span>Không ảnh</span>
              </div>
            </td>
            <td>
              <router-link :to="`/truyen-chu/${story.slug}`" class="story-name-link">
                {{ story.ten_truyen }}
              </router-link>
            </td>
            <td>{{ story.ten_tac_gia || story.tac_gia }}</td>
            <td>
              <span :class="['status-badge', getStatusClass(story.trang_thai_kiem_duyet)]">
                {{ formatStatus(story.trang_thai_kiem_duyet) }}
              </span>
            </td>
            <td>{{ formatDate(story.thoi_gian_cap_nhat) }}</td>
            <td class="actions-cell">
              <button
                v-if="story.trang_thai_kiem_duyet === 'cho_duyet'"
                @click="emit('approve', story.id)"
                class="action-btn approve-btn"
                title="Duyệt truyện"
              >
                <i class="fas fa-check"></i>
              </button>
              <button
                v-if="story.trang_thai_kiem_duyet === 'cho_duyet'"
                @click="emit('reject', story.id)"
                class="action-btn reject-btn"
                title="Từ chối truyện"
              >
                <i class="fas fa-times"></i>
              </button>
              <button @click="emit('view-details', story.id)" class="action-btn view-details-btn" title="Xem chi tiết">
                <i class="fas fa-eye"></i> 
              </button>
              <button @click="emit('delete', story.id)" class="action-btn delete-btn" title="Xóa">
                <i class="fas fa-trash-alt"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

interface Story {
  id: number;
  ten_truyen: string;
  tac_gia: string;
  ten_tac_gia?: string;
  mo_ta: string;
  anh_bia: string; // CHỈ LÀ TÊN FILE: e.g., 'truyen_123.jpeg'
  slug: string;
  trang_thai_kiem_duyet: 'cho_duyet' | 'duyet' | 'tu_choi';
  thoi_gian_cap_nhat: string;
}

const props = defineProps({
  stories: {
    type: Array as () => Story[],
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['approve', 'reject', 'view-details', 'delete']);

const getFinalImageUrl = (imagePath: string | null) => {
  if (!imagePath) {
    return null;
  }
  return `http://localhost:3000/uploads_img/bia_truyen/${imagePath}`;
};

onMounted(() => {
  console.log('StoryTableSection: Verifying image paths from backend:');
  props.stories.forEach(story => {
    console.log(`- Story ID ${story.id}: Original anh_bia: "${story.anh_bia}"`);
    console.log(`- Story ID ${story.id}: Constructed URL: "${getFinalImageUrl(story.anh_bia)}"`);
  });
});

const getStatusClass = (status: string) => {
  switch (status) {
    case 'duyet':
      return 'status-approved';
    case 'cho_duyet':
      return 'status-pending';
    case 'tu_choi':
    default:
      return 'status-rejected';
  }
};

const formatStatus = (status: string) => {
  switch (status) {
    case 'duyet':
      return 'Đã duyệt';
    case 'cho_duyet':
      return 'Chờ duyệt';
    case 'tu_choi':
      return 'Từ chối';
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('vi-VN', options);
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.style.display = 'none';
  const parentCell = target.closest('.cover-image-cell');
  if (parentCell && !parentCell.querySelector('.no-image-placeholder-small')) {
    const placeholder = document.createElement('div');
    placeholder.className = 'no-image-placeholder-small';
    placeholder.innerHTML = '<i class="fas fa-image"></i> <span>Không ảnh</span>';
    parentCell.prepend(placeholder);
  }
};
</script>


<style scoped>
.story-table-section {
  background: rgba(36, 40, 52, 0.7);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  font-family: 'Manrope', sans-serif;
  color: #ffffff;
  position: relative;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 10;
  border-radius: 0.75rem;
  color: #22c55e;
  font-size: 1.2rem;
  font-weight: 600;
}

.spinner {
  border: 4px solid rgba(34, 197, 94, 0.3);
  border-top: 4px solid #22c55e;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.no-data-message {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
  color: #a0a0a0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.no-data-message .fas {
  font-size: 3rem;
  color: #6b7280;
}

.table-responsive {
  overflow-x: auto;
}

.story-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.story-table th,
.story-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(75, 85, 99, 0.5);
}

.story-table th {
  background-color: rgba(34, 197, 94, 0.1);
  color: #22c55e;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.9rem;
}

.story-table td {
  background-color: rgba(40, 44, 57, 0.5);
  color: #d1d5db;
  vertical-align: middle;
}

.story-table tbody tr:hover {
  background-color: rgba(34, 197, 94, 0.05);
}

.cover-image-cell {
  width: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80px;
}

.story-cover-thumb {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 0.5rem;
  border: 1px solid #22c55e;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.no-image-placeholder-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  font-size: 0.7rem;
  text-align: center;
  width: 60px;
  height: 80px;
  border: 1px dashed #4b5563;
  border-radius: 0.5rem;
  background-color: rgba(0, 0, 0, 0.1);
}

.no-image-placeholder-small .fas {
  font-size: 1.5rem;
  margin-bottom: 0.2rem;
}


.story-name-link {
  color: #4ade80;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.story-name-link:hover {
  color: #22c55e;
  text-decoration: underline;
}

.status-badge {
  padding: 0.3rem 0.6rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffffff;
  display: inline-block;
  text-align: center;
  min-width: 80px;
}

.status-approved {
  background-color: #22c55e;
}

.status-pending {
  background-color: #f59e0b;
}

.status-rejected {
  background-color: #ef4444;
}

.actions-cell {
  white-space: nowrap;
}

.action-btn {
  background: none;
  border: none;
  color: #d1d5db;
  font-size: 1.1rem;
  margin: 0 0.3rem;
  cursor: pointer;
  transition: color 0.3s ease, transform 0.2s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
}

.approve-btn {
  color: #22c55e;
}
.approve-btn:hover {
  color: #4ade80;
}

.reject-btn {
  color: #ef4444;
}
.reject-btn:hover {
  color: #f87171;
}

.view-details-btn { 
  color: #3b82f6; 
}
.view-details-btn:hover {
  color: #60a5fa;
}

.delete-btn {
  color: #ef4444;
}
.delete-btn:hover {
  color: #f87171;
}

@media (max-width: 1024px) {
  .story-table th,
  .story-table td {
    padding: 0.8rem;
    font-size: 0.9rem;
  }
  .story-cover-thumb, .no-image-placeholder-small {
    width: 50px;
    height: 70px;
  }
  .action-btn {
    font-size: 1rem;
    margin: 0 0.2rem;
  }
}

@media (max-width: 768px) {
  .story-table-section {
    padding: 1rem;
  }
  .story-table th,
  .story-table td {
    padding: 0.6rem;
    font-size: 0.8rem;
  }
  .story-cover-thumb, .no-image-placeholder-small {
    width: 40px;
    height: 60px;
  }
  .status-badge {
    padding: 0.2rem 0.4rem;
    font-size: 0.7rem;
    min-width: 60px;
  }
  .action-btn {
    font-size: 0.9rem;
    margin: 0 0.1rem;
  }
}

@media (max-width: 480px) {
  .story-table {
    font-size: 0.75rem;
  }
  .story-table th,
  .story-table td {
    padding: 0.5rem;
  }
  .story-cover-thumb, .no-image-placeholder-small {
    width: 30px;
    height: 45px;
  }
  .story-name-link {
    font-size: 0.8rem;
  }
  .action-btn {
    font-size: 0.8rem;
  }
}
</style>