# MOTION / LAB — 15 Interactive Website Effects

เว็บไซต์สาธิตลูกเล่น Front-end 15 เทคนิค เปิดใช้งานบน **GitHub Pages** ได้โดยตรง ไม่ต้องใช้ Node.js, npm, database, backend หรือระบบ build

## วิธีนำขึ้น GitHub Pages

1. แตกไฟล์ ZIP ที่ดาวน์โหลดมา
2. เข้า [GitHub](https://github.com/) แล้วสร้าง Repository ใหม่ เช่น `motion-lab`
3. เลือก **Add file → Upload files** อัปโหลด `index.html`, `styles.css`, `app.js`, `.nojekyll`, `README.md` และโฟลเดอร์ `assets` ลงไว้ใน **root** ของ Repository (ไม่ต้องอัปโหลดโฟลเดอร์ชั้นนอกซ้อนเข้าไป)
4. กด **Commit changes**
5. ไปที่ **Settings → Pages** ภายใต้ **Build and deployment** เลือก **Deploy from a branch**, Branch **main**, Folder **/(root)** แล้วกด **Save**
6. เมื่อ GitHub Pages Deploy เสร็จ จะได้ URL ลักษณะ `https://USERNAME.github.io/motion-lab/`

> หากเว็บไซต์หรือภาพยังไม่ขึ้นหลัง Deploy ให้รอสถานะ Pages เป็น Published แล้ว Refresh หน้าเว็บ

## วิธีเปิดดูบนเครื่อง

เปิด `index.html` เพื่อดูงานได้ทันที (บางเบราว์เซอร์จำกัดการโหลดรูป local จาก JavaScript) วิธีแนะนำคือใช้ VS Code + Live Server หรือเปิด Terminal ในโฟลเดอร์นี้แล้วรัน:

```sh
python3 -m http.server 8000
```

จากนั้นเปิด `http://localhost:8000`

## 15 ตัวอย่างและวิธีทดลอง

| # | เทคนิค | ทดลองโดย |
|---|---|---|
| 01 | Scrollytelling | เลื่อนหน้าเพื่อเผยวอลเปเปอร์ |
| 02 | Scroll-Controlled 3D | เลื่อนหน้าเพื่อหมุนกล่องวัสดุ |
| 03 | Parallax Depth | ขยับเมาส์หรือเลื่อนหน้า |
| 04 | Cinematic Transitions | คลิก NEXT SCENE |
| 05 | Pinned Story Sections | เลื่อนดูข้อความขณะที่ภาพติดอยู่กับที่ |
| 06 | Horizontal Scroll | เลื่อนแนวตั้งเพื่อเคลื่อนแกลเลอรีแนวนอน |
| 07 | 3D Product Viewer | ลากเมาส์/นิ้ว หรือกดลูกศรบนคีย์บอร์ด |
| 08 | Interactive Hotspots | คลิกจุดบวกบนภาพห้อง |
| 09 | Before / After Slider | ลากเส้นแบ่งซ้าย–ขวา |
| 10 | Morphing Animation | คลิก MORPH AGAIN |
| 11 | Magnetic Buttons | ขยับเมาส์เข้าใกล้ปุ่ม |
| 12 | Interactive Cursor | ชี้ไปที่แถวต่าง ๆ |
| 13 | Split Text Animation | คลิก REPLAY ANIMATION |
| 14 | Bento Grid Motion | เลือกการ์ด |
| 15 | Image Sequence Animation | เลื่อนหน้า หรือใช้ Timeline 48 เฟรม |

## โครงสร้างโปรเจกต์

```text
motion-lab/
├── index.html         # เนื้อหาและโครงสร้างเว็บ
├── styles.css         # UI, Animation, Responsive
├── app.js             # Interaction ทั้ง 15 แบบ
├── assets/
│   ├── room-*.svg     # ภาพจำลองห้องเวกเตอร์ 6 รูปแบบ
│   └── sequence/
│       ├── 000.webp   # เฟรม 1
│       └── ...        # เฟรม 48
├── .nojekyll
└── README.md
```

## ข้อควรทราบ

- ภาพห้องทั้งหมดเป็น **ภาพจำลองเวกเตอร์** สำหรับสาธิต ไม่ใช่ภาพผลงานลูกค้าจริง
- **3D Viewer** เป็นโมเดล CSS 3D ไม่ใช่ไฟล์ CAD / GLB แบบ Photorealistic
- **Image Sequence** คือภาพ WebP ที่ Render เป็นเฟรมจริง 48 เฟรมอยู่ในโปรเจกต์
- เอฟเฟกต์ที่ใช้เมาส์จะใช้การแตะ/ปุ่มทดแทนเท่าที่เหมาะสมในมือถือ
- เว็บไซต์ไม่มีระบบส่งข้อมูลและไม่มีระบบชำระเงิน
- ฟอนต์ DM Sans และ IBM Plex Sans Thai ใช้บริการ Google Fonts เป็นตัวเลือกเสริม ถ้าไม่มีอินเทอร์เน็ตจะใช้ฟอนต์สำรองของอุปกรณ์

**Design edition:** Wallpaper & Flooring / Showroom Demo
