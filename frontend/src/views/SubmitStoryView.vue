<template>
  <div class="submit-story-page">
    <AppHeader />
    <main class="submit-story-container">
      <section class="submit-story-card">
        <h1 class="submit-story-title">Đăng Truyện Mới</h1>
        <form @submit.prevent="handleSubmit" class="submit-story-form">
          <StoryBasicInfoForm 
            v-model="story" 
            :default-author-name="authStore.user?.username" 
            :submitted="submitted"
            @validation-error="handleFileValidationError"
          />

          <StoryCategorySelector 
            :categories="categories" 
            v-model="story.the_loai_ids" 
            :submitted="submitted"
          />

          <StoryStatusSelects 
            v-model="story" 
            :submitted="submitted"
          />

          <div class="form-group">
            <label class="form-label">Nội dung chương mẫu</label>
            <ChapterContentEditor 
              v-model="story.chuong_mau" 
              :api-key="tinymceApiKey" 
            />
            <span v-if="submitted && (!story.chuong_mau || story.chuong_mau.trim() === '<p></p>')" class="error-message-inline">Nội dung chương mẫu không được để trống.</span>
          </div>
          
          <div class="form-group agree-group">
            <label class="agree-label">
              <input
                type="checkbox"
                v-model="agreeToSubmit"
                :class="{ 'is-invalid': submitted && !agreeToSubmit }"
              />
              Bạn muốn đăng truyện và xác nhận thông tin trên đã đúng.
            </label>
            <span v-if="submitted && !agreeToSubmit" class="error-message-inline">Bạn phải đồng ý xác nhận để đăng truyện.</span>
          </div>

          <button type="submit" class="submit-btn" :disabled="loading">
            <i class="fas fa-upload"></i>
            {{ loading ? 'Đang gửi...' : 'Gửi Truyện' }}
          </button>
          <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
        </form>
      </section>
    </main>
    <AppFooter />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/modules/auth/auth.store';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
import axios from '@/utils/axios'; 

import AppHeader from '@/components/layout/AppHeader.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import StoryBasicInfoForm from '@/components/forms/StoryBasicInfoForm.vue';
import StoryCategorySelector from '@/components/forms/StoryCategorySelector.vue';
import StoryStatusSelects from '@/components/forms/StoryStatusSelects.vue';
import ChapterContentEditor from '@/components/forms/ChapterContentEditor.vue';

const authStore = useAuthStore();
const toast = useToast();
const router = useRouter();

const tinymceApiKey = 'uaj7kxz5hqnxtzefohh4ix5gcm41m7bfzxbtg3oglrkv7s4a';

const story = ref({
  ten_truyen: '',
  tac_gia: authStore.user?.username || '', 
  mo_ta: '',
  the_loai_ids: [], 
  trang_thai: 'Đang ra', 
  tinh_trang: 'Đang viết', 
  trang_thai_viet: 'Bản nháp', 
  chuong_mau: '', 
  anh_bia: null, 
  user_id: authStore.user?.id,
});

const categories = ref([]);
const loading = ref(false);
const errorMessage = ref('');
const submitted = ref(false); 
const fileErrors = ref({ anh_bia: '' });
const agreeToSubmit = ref(false); // Biến mới cho checkbox xác nhận

const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/theloai'); 
    categories.value = response.data.data;
  } catch (error) {
    console.error('Lỗi khi tải danh sách thể loại:', error);
    toast.error('Không thể tải danh sách thể loại.');
  }
};

const handleFileValidationError = ({ field, message }) => {
  fileErrors.value[field] = message;
};

const validateForm = () => {
  let isValid = true;
  fileErrors.value.anh_bia = ''; 

  if (!story.value.ten_truyen) isValid = false;
  if (!story.value.tac_gia) isValid = false;
  if (!story.value.mo_ta) isValid = false;
  if (story.value.the_loai_ids.length === 0) isValid = false;
  if (!story.value.trang_thai) isValid = false;
  if (!story.value.tinh_trang) isValid = false;
  if (!story.value.trang_thai_viet) isValid = false;
  if (!story.value.chuong_mau || story.value.chuong_mau.trim() === '<p></p>') {
    isValid = false;
  }
  if (!story.value.anh_bia) {
    isValid = false;
    fileErrors.value.anh_bia = 'Ảnh bìa là bắt buộc.';
  } else {
    if (fileErrors.value.anh_bia) {
      isValid = false; 
    }
  }

  // Thêm kiểm tra cho checkbox xác nhận
  if (!agreeToSubmit.value) {
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  submitted.value = true; 
  
  if (!validateForm()) {
    toast.error('Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc!');
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  const formData = new FormData();
  formData.append('ten_truyen', story.value.ten_truyen);
  formData.append('tac_gia', story.value.tac_gia);
  formData.append('mo_ta', story.value.mo_ta);
  formData.append('trang_thai', story.value.trang_thai);
  formData.append('tinh_trang', story.value.tinh_trang);
  formData.append('trang_thai_viet', story.value.trang_thai_viet);
  formData.append('chuong_mau', story.value.chuong_mau);
  formData.append('user_id', story.value.user_id);
  
  if (story.value.anh_bia) {
    formData.append('anh_bia', story.value.anh_bia);
  }

  story.value.the_loai_ids.forEach(id => {
    formData.append('theloai_ids[]', id); 
  });

  try {
    const response = await axios.post('/api/truyen', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', 
      },
    });
    
    toast.success(response.data.message);
    router.push({ name: 'Home' }); 
  } catch (error) {
    console.error('Lỗi khi đăng truyện:', error);
    if (error.response && error.response.data && error.response.data.message) {
      errorMessage.value = error.response.data.message;
      toast.error(error.response.data.message);
    } else {
      errorMessage.value = 'Đã xảy ra lỗi khi đăng truyện. Vui lòng thử lại.';
      toast.error('Đã xảy ra lỗi khi đăng truyện. Vui lòng thử lại.');
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<style scoped>
/* Import font và icon từ ProfileSettingsView */
@import url("https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;700&family=Sora:wght@400;600&display=swap");
@import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css");

.submit-story-page {
  min-height: 100vh;
  background: #1a1d29; 
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.submit-story-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.submit-story-card {
  background: rgba(26, 29, 41, 0.9);
  backdrop-filter: blur(15px);
  border: 2px solid #4caf50; /* Màu viền xanh lá */
  border-radius: 1rem;
  padding: 2.5rem;
  box-shadow: 0 0 25px rgba(76, 175, 80, 0.25); /* Box shadow xanh lá */
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fade-in 0.8s ease-in;
}

.submit-story-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 0 35px rgba(76, 175, 80, 0.35);
}

.submit-story-title {
  font-family: "Sora", sans-serif;
  font-size: 2.25rem;
  font-weight: 700;
  color: #4caf50; /* Màu chữ xanh lá */
  margin-bottom: 2rem;
  text-align: center;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
}

.submit-story-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  color: #cccccc;
}

/* Các styles input chung (cho StoryBasicInfoForm) */
/* Cần đảm bảo các component con không có style cục bộ nào ghi đè */
.form-input {
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(76, 175, 80, 0.3); /* Viền màu xanh lá nhạt */
  border-radius: 0.5rem;
  color: #ffffff;
  font-family: "Manrope", sans-serif;
  font-size: 1rem;
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #4caf50; /* Viền màu xanh lá khi focus */
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.3);
}

.form-input.is-invalid {
  border-color: #ef4444; 
}

/* Styles cho checkbox xác nhận */
.agree-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.agree-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: "Manrope", sans-serif;
  font-size: 0.9rem;
  color: #ffffff;
}

.agree-label input {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #4caf50; /* Màu xanh lá cho checkbox */
}
.agree-label input.is-invalid {
  outline: 2px solid #ef4444; /* Viền đỏ cho checkbox lỗi */
}

/* Styles cho nút submit */
.submit-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(90deg, #4caf50, #66bb6a); /* Gradient xanh lá */
  color: #ffffff; 
  font-family: "Sora", sans-serif;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.submit-btn:hover {
  box-shadow: 0 0 15px rgba(76, 175, 80, 0.5);
}

.submit-btn::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.4s ease, height 0.4s ease;
}

.submit-btn:hover::after {
  width: 250px;
  height: 250px;
}

.submit-btn i {
  margin-right: 0.5rem;
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: linear-gradient(90deg, #333, #555);
  box-shadow: none;
  color: #cccccc;
}

/* Error messages */
.error-message {
  color: #ff6b6b;
  margin-top: 1rem;
  text-align: center;
}

.error-message-inline {
  color: #ff6b6b;
  font-size: 0.85rem;
  margin-top: 0.25rem;
  margin-left: 5px;
}

/* Animations */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .submit-story-container {
    padding: 1.5rem 1rem;
  }

  .submit-story-card {
    padding: 1.5rem;
  }

  .submit-story-title {
    font-size: 1.75rem;
  }
  
  .form-input {
    font-size: 0.9rem;
  }

  .submit-btn {
    padding: 0.5rem 1.5rem;
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .submit-story-card {
    padding: 1rem;
  }

  .submit-story-title {
    font-size: 1.5rem;
  }
  
  .form-group {
    gap: 0.3rem;
  }

  .form-label {
    font-size: 0.9rem;
  }

  .form-input {
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  .error-message-inline {
    font-size: 0.8rem;
  }

  .submit-btn {
    padding: 0.5rem 1rem;
    font-size: 0.85rem;
  }
}
</style>