const slugify = require("../ultils/slugify");
const StoryModel = require("../models/story.model");
const ChapterModel = require("../models/chapter.model");
const notificationService = require("../services/notification.sevices.js"); 

const uploadStory = async (req, res) => {
  try {
    const data = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Ảnh bìa là bắt buộc" });
    }

    if (
      !data.ten_truyen || 
      !data.tac_gia ||     
      !data.mo_ta ||
      !data.chuong_mau ||
      !data.theloai_ids || // Đã sửa từ data.the_loai_ids thành data.theloai_ids
      !Array.isArray(data.theloai_ids) || // Thêm kiểm tra Array.isArray
      data.theloai_ids.length === 0 // Thêm kiểm tra độ dài mảng
    ) {
      return res
        .status(400)
        .json({ message: "Các trường thông tin không được để trống" });
    }

    const anh_bia = file.filename;
    const now = new Date();
    const user_id = req.user.id;
    const userRole = req.user.role; 

    const slug = slugify(data.ten_truyen, { lower: true, strict: true });

    let trang_thai_kiem_duyet = "cho_duyet"; 
    if (userRole === "admin") {
      trang_thai_kiem_duyet = "duyet"; 
    }

    const storyId = await StoryModel.create({
      ten_truyen: data.ten_truyen,
      slug,
      tac_gia: data.tac_gia,
      mo_ta: data.mo_ta,
      trang_thai: data.trang_thai || "Đang ra", 
      tinh_trang: data.tinh_trang || "Đang viết",
      trang_thai_viet: data.trang_thai_viet || "Bản nháp",
      yeu_to_nhay_cam: data.yeu_to_nhay_cam || 0,
      link_nguon: data.link_nguon || null,
      muc_tieu: data.muc_tieu || null,
      doi_tuong_doc_gia: data.doi_tuong_doc_gia || null,
      thoi_gian_cap_nhat: now,
      anh_bia,
      trang_thai_kiem_duyet, 
      user_id,
      ghi_chu_admin: null,
      danh_gia_noi_dung: 0,
      danh_gia_van_phong: 0,
      danh_gia_sang_tao: 0,
    });

    if (Array.isArray(data.theloai_ids) && data.theloai_ids.length > 0) { // Đã sửa từ data.the_loai_ids thành data.theloai_ids
      await StoryModel.addGenresForStory(storyId, data.theloai_ids); // Đã sửa từ data.the_loai_ids thành data.theloai_ids
    }

    await ChapterModel.createSampleChapter({
      truyen_id: storyId,
      noi_dung: data.chuong_mau,
      thoi_gian_dang: now,
    });

    if (trang_thai_kiem_duyet === "cho_duyet") {
      await notificationService.sendNotificationToAdmins(
        `Truyện "${data.ten_truyen}" của tác giả ${data.tac_gia} cần được kiểm duyệt.`,
        `/admin/quan-ly-truyen/duyet/${storyId}` 
      );
    }

    res.status(201).json({
      message: `Tạo truyện thành công! Truyện đang ở trạng thái '${trang_thai_kiem_duyet}'.`,
      storyId,
      trang_thai_kiem_duyet: trang_thai_kiem_duyet,
    });
  } catch (err) {
    console.error("Lỗi khi upload truyện:", err);
    res.status(500).json({
      message: "Lỗi khi upload truyện",
      error: err.message,
    });
  }
};

module.exports = { uploadStory };