import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import LoginView from "../views/LoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import StoryListView from "@/modules/storyText/views/StoryListView.vue";
import CategoryView from "@/views/CategoryView.vue";
import ProfileView from "@/views/ProfileView.vue";
import ProfileSettingsView from "@/views/ProfileSettingsView.vue";
import AdminUserManagementView from "@/views/admin/AdminUserManagementView.vue";

import { useAuthStore } from "@/modules/auth/auth.store";

const routes: Array<RouteRecordRaw> = [
    { path: "/", name: "Home", component: HomeView },
    { path: "/dang-nhap", name: "Login", component: LoginView },
    {
        path: "/dang-ky",
        name: "Register",
        component: RegisterView,
    },
    {
        path: "/truyen-chu",
        name: "StoryList",
        component: StoryListView,
    },
    {
        path: "/the-loai",
        name: "Categories",
        component: CategoryView,
    },
    {
        path: "/the-loai/:id",
        name: "StoriesByCategory",
        component: StoryListView,
        props: true,
    },
    {
        path: "/user/thong-tin-ca-nhan",
        name: "Profile",
        component: ProfileView,
        meta: { requiresAuth: true },
    },
    {
        path: "/user/cai-dat-thong-tin",
        name: "ProfileSettings",
        component: ProfileSettingsView,
        meta: { requiresAuth: true },
    },
    // Route cho ADMIN QUẢN LÝ NGƯỜI DÙNG
    {
        path: "/admin/quan-ly-nguoi-dung",
        name: "AdminManageUsers",
        component: AdminUserManagementView,
        meta: { requiresAuth: true, requiredRole: ["admin"] },
    },
    /*
    {
        path: "/user/truyen-theo-doi",
        name: "UserFollowedStories",
        component: () => import("@/views/UserFollowedStoriesView.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/user/lich-su-doc",
        name: "UserReadingHistory",
        component: () => import("@/views/UserReadingHistoryView.vue"),
        meta: { requiresAuth: true },
    },
    {
        path: "/dang-truyen",
        name: "SubmitStory",
        component: () => import("@/views/SubmitStoryView.vue"),
        meta: { requiresAuth: true, requiredRole: ['author', 'admin'] },
    },
    {
        path: "/admin/quan-ly-truyen",
        name: "AdminManageStories",
        component: () => import("@/views/AdminManageStoriesView.vue"),
        meta: { requiresAuth: true, requiredRole: ['admin'] },
    },
    {
        path: "/user/quan-ly-truyen",
        name: "AuthorManageStories",
        component: () => import("@/views/AuthorManageStoriesView.vue"),
        meta: { requiresAuth: true, requiredRole: ['author'] },
    },
    */
    // Thêm route catch-all cho 404 (Nếu bạn chưa có)
    {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: () => import("@/views/NotFoundView.vue"), 
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    if (!authStore.isInitialized) {
        try {
            await authStore.initialize();
        } catch (error) {
            console.error("Auth store initialization failed:", error);
            authStore.clearAuth(); 
            alert("Phiên đăng nhập đã hết hạn hoặc có lỗi. Vui lòng đăng nhập lại.");
            return next({ name: "Login" });
        }
    }

    // 2. Ngăn chặn truy cập /dang-nhap và /dang-ky khi đã đăng nhập
    const isAuthPage = to.name === "Login" || to.name === "Register";
    if (isAuthPage && authStore.isLoggedIn) {
        alert("Bạn đang đăng nhập. Vội thế nhà bạn có cỗ à.");
        return next(from.fullPath === "/truyen-chu" ? { name: "StoryList" } : { path: from.fullPath });
    }

    // 3. Xử lý các route yêu cầu xác thực và/hoặc quyền
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiredRoles = to.meta.requiredRole as string[] | undefined;

    if (requiresAuth && !authStore.isLoggedIn) {
        // Nếu route yêu cầu đăng nhập và chưa đăng nhập
        next({ name: "Login" });
    } else if (requiresAuth && authStore.isLoggedIn && requiredRoles) {
        if (!authStore.user || !requiredRoles.includes(authStore.user.role)) {
            alert("Bạn không có quyền truy cập vào trang này."); 
            next({ name: "Home" });
        } else {
            next(); 
        }
    } else {
        next();
    }
});

export default router;