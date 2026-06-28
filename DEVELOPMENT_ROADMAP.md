# Development Roadmap

Dokumen ini berisi rencana development untuk JalanKita Pekanbaru secara detail.

## ✅ Phase 1: Foundation & Auth (Completed)

- [x] Setup React + Vite + TypeScript
- [x] Install dan konfigurasi dependencies
- [x] Setup Tailwind CSS dengan design system
- [x] Create folder structure
- [x] Create Supabase integration
- [x] Create AuthContext & ProtectedRoute
- [x] Create Login page
- [x] Create Register page (Masyarakat only)
- [x] Create Toast notification system
- [x] Create Loading & Empty state components
- [x] Create utility functions & formatters
- [x] Create API services layer
- [x] Create custom hooks

## 🔄 Phase 2: Citizen Features (In Progress)

### Dashboard Masyarakat
- [ ] Display stats cards (total laporan, sedang diproses, selesai, ditolak)
- [ ] Display recent reports list
- [ ] Display activity timeline
- [ ] Display quick actions buttons

### Create Report Features
- [ ] Form validation dengan React Hook Form
- [ ] Maps integration untuk select lokasi
- [ ] GPS auto-detection
- [ ] Photo upload & preview (max 5 photos)
- [ ] Video upload (optional)
- [ ] Drag & drop upload
- [ ] Form submission with ticket generation
- [ ] Success confirmation dengan ticket number

### Reports List & Tracking
- [ ] List semua laporan user
- [ ] Filter by status
- [ ] Search by ticket number atau lokasi
- [ ] Detail laporan dengan full timeline
- [ ] Maps view laporan lokasi
- [ ] Tracking progress bar
- [ ] Rating & comment form (after complete)
- [ ] Before/After photo comparison

### Profile Management
- [ ] View profile info
- [ ] Edit profile
- [ ] Upload/change avatar
- [ ] Change password
- [ ] View activity history

## ⏳ Phase 3: Admin Dashboard (Planned)

### Admin Dashboard
- [ ] Dashboard dengan stats & charts
- [ ] Total laporan per status
- [ ] Maps view semua laporan
- [ ] Filter reports by various criteria

### Report Verification
- [ ] List laporan yang perlu verifikasi
- [ ] View laporan detail
- [ ] Verify atau reject laporan
- [ ] Add verification notes
- [ ] Change priority & category
- [ ] Assign ke Koordinator Lapangan

### User Management
- [ ] Create Koordinator account
- [ ] Create Teknisi account
- [ ] View all users
- [ ] Edit user info
- [ ] Deactivate/activate account
- [ ] Reset password
- [ ] Delete user

### Master Data Management
- [ ] CRUD Districts
- [ ] CRUD Subdistricts
- [ ] CRUD Damage Categories
- [ ] CRUD Severity Levels

## ⏳ Phase 4: Coordinator Dashboard (Planned)

### Dashboard Koordinator
- [ ] Display assigned reports
- [ ] Maps view dengan marker clustering
- [ ] Teknisi workload visualization

### Task Assignment
- [ ] Assign report ke Teknisi
- [ ] View available Teknisi
- [ ] Set deadline & priority
- [ ] Send instruction ke Teknisi

### Monitoring
- [ ] View task progress
- [ ] Real-time teknisi location (if available)
- [ ] Send messages/updates
- [ ] Reschedule if needed

## ⏳ Phase 5: Technician Dashboard (Planned)

### Task Management
- [ ] View daily tasks
- [ ] Accept/decline task
- [ ] View task detail & maps
- [ ] Navigation to location

### Progress Tracking
- [ ] Upload foto kondisi awal
- [ ] Update progress (0%, 10%, 25%, 50%, 75%, 100%)
- [ ] Upload progress photos
- [ ] Add work notes
- [ ] Upload foto hasil akhir
- [ ] Mark as completed

## ⏳ Phase 6: Advanced Features (Planned)

### Notifications & Realtime
- [ ] Setup Supabase Realtime
- [ ] Push notifications
- [ ] In-app toast notifications
- [ ] Email notifications (optional)
- [ ] SMS notifications (optional)

### Analytics & Reports
- [ ] Charts: reports per month
- [ ] Charts: reports per district
- [ ] Charts: damage category breakdown
- [ ] Charts: completion rate
- [ ] Export to PDF
- [ ] Export to Excel

### Audit & Compliance
- [ ] Activity logs
- [ ] Audit trail
- [ ] User action tracking
- [ ] Data integrity checks

### Additional Features
- [ ] Dark mode implementation
- [ ] Offline mode support
- [ ] Progressive Web App (PWA)
- [ ] Mobile app (React Native - optional)
- [ ] API documentation
- [ ] Admin API endpoints
- [ ] Third-party integrations

## 🛠️ Technical Implementation Details

### Maps Feature
```typescript
// Use Leaflet + OpenStreetMap
- Interactive map with markers
- Marker clustering when zoomed out
- Color-coded markers by status
- Popup with report summary
- Fullscreen map modal
- Current location detection
- Reverse geocoding for address
```

### Realtime Notifications
```typescript
// Use Supabase Realtime
- Subscribe to reports table changes
- Subscribe to notifications table
- Automatic UI refresh
- Toast notifications on status change
- Sound alerts (optional)
```

### File Upload
```typescript
// Use Supabase Storage
- Upload to specific buckets:
  - avatars/ for profile pictures
  - report-images/ for report photos
  - report-videos/ for report videos
  - technician-progress/ for work progress
- Automatic URL generation
- Image compression/optimization
- Duplicate prevention
```

### Authentication Flow
```typescript
// Login
1. User input email & password
2. Supabase verify credentials
3. JWT token generated
4. Store in localStorage
5. Redirect to dashboard

// Register (Citizen only)
1. User input details
2. Create auth user
3. Create profile in users table
4. Auto-set role = 'citizen'
5. Redirect to login

// Auto Login
1. Check localStorage for token
2. Verify token validity
3. Fetch user profile
4. Redirect to appropriate dashboard
```

## 📅 Timeline Estimate

- **Phase 1**: 2-3 hari (✅ Done)
- **Phase 2**: 3-4 hari (🔄 In Progress)
- **Phase 3**: 3-4 hari
- **Phase 4**: 2-3 hari
- **Phase 5**: 2-3 hari
- **Phase 6**: 2-3 hari

**Total**: ~15-20 hari development + testing

## 🎯 Success Criteria

- [ ] All core workflows functional
- [ ] No TypeScript errors
- [ ] Responsive on mobile & desktop
- [ ] Performance optimized (load time < 3s)
- [ ] Accessible (WCAG 2.1 AA)
- [ ] All forms validated
- [ ] Error handling comprehensive
- [ ] Documentation complete
- [ ] Ready for presentation

## 📝 Notes

- Use real data dari Pekanbaru (kecamatan, kelurahan, jalan)
- Follow design system konsisten
- Test di berbagai browser
- Optimize images & code
- Security best practices (RLS, validation)
- Error handling comprehensive
- Loading states jelas
- Empty states informatif
