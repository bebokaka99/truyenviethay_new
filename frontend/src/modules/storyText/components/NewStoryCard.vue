<template>
  <router-link :to="`/truyen/${story.slug}`" class="new-story-card">
    <div class="cover-wrapper">
      <img
        :src="story.anh_bia ? getImageUrl(story.anh_bia) : '/images/default-cover.jpg'"
        :alt="`Bìa truyện ${story.ten_truyen}`"
        class="cover"
        crossorigin="anonymous"
      />
      <div class="overlay">
        <span class="read-more-icon">Đọc ngay</span>
      </div>
    </div>

    <div class="card-content">
      <h3 class="title">{{ story.ten_truyen }}</h3>
      
      <div class="details-row">
        <span class="info-item">👁 {{ story.luot_xem }}</span>
        <span class="info-item">❤️ {{ story.luot_thich || 0 }}</span>
      </div>
      
      <div class="details-row">
        <span class="info-item chapter-count">Ch. {{ story.so_chuong || 0 }}</span>
        <span :class="['status-tag', getStatusClass(story.trang_thai)]">
          {{ getStatusText(story.trang_thai) }}
        </span>
      </div>

      <div class="categories">
        <span v-for="category in getTopCategories(story.the_loai)" :key="category.id" class="category-tag">
          {{ category.ten_the_loai }}
        </span>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({ story: Object });

const getImageUrl = (path) =>
  path.startsWith("http")
    ? path
    : `http://localhost:3000/uploads_img/bia_truyen/${path}`;

const getStatusText = (status) => {
  switch (status) {
    case 'completed': return 'Hoàn thành';
    case 'on-going': return 'Đang ra';
    case 'paused': return 'Tạm ngưng';
    default: return 'Không rõ';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 'completed': return 'status-completed';
    case 'on-going': return 'status-on-going';
    case 'paused': return 'status-paused';
    default: return '';
  }
};

const getTopCategories = (categories) => {
  if (!categories || !Array.isArray(categories)) return [];
  return categories.slice(0, 2);
};
</script>

<style scoped>
.new-story-card {
  background: #2a2d3e;
  border-radius: 8px;
  color: #e0e0e0;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 160px;
}

.new-story-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
}

.cover-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 145%;
  overflow: hidden;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.cover {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.new-story-card:hover .cover {
  transform: scale(1.03);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
}

.new-story-card:hover .overlay {
  opacity: 1;
}

.read-more-icon {
  background-color: #4caf50;
  color: white;
  padding: 6px 12px;
  border-radius: 18px;
  font-weight: bold;
  font-size: 0.85rem;
  opacity: 0;
  transform: translateY(15px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.new-story-card:hover .read-more-icon {
  opacity: 1;
  transform: translateY(0);
}

.card-content {
  padding: 8px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  text-align: center;
}

.title {
  margin: 0;
  font-size: 1rem;
  color: #4caf50;
  margin-bottom: 5px;
  min-height: 2.2em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.1em;
}

.details-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 4px;
  font-size: 0.75rem;
  color: #999;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 2px;
}

.chapter-count {
  font-weight: bold;
  color: #fdd835;
}

.status-tag {
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.65rem;
  font-weight: bold;
  color: #fff;
}

.status-completed {
  background-color: #4caf50;
}

.status-on-going {
  background-color: #ff9800;
}

.status-paused {
  background-color: #f44336;
}

.categories {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 3px;
  margin-top: 6px;
}

.category-tag {
  background-color: #3f51b5;
  color: white;
  padding: 2px 5px;
  border-radius: 3px;
  font-size: 0.6rem;
  white-space: nowrap;
}

.desc, .meta, .author {
  display: none;
}
</style>