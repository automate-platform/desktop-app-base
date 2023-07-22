## I. Mô tả
Hiện các BU, đặc biệt BUL và PM các dự án đang phải monitoring task, quản lý KPI, resource, productivity rất khó khăn trên Jira.

Các thao tác trên Jira đôi khi rất khó khăn và mất thời gian để thực hiện, do đó đơn vị FHN.DPS đã tạo mộ tool Extension để giải quyết các vấn đề này, góp phần giảm thiểu effort manager.

## II. Mục tiêu, chức năng
Tool này addin luôn trên jira giúp quản lý các điểm sau:

KPI(các chỉ số KPI mà dự án định nghĩa) để manager có thể tracking chất lương task realtime để có action một cách kịp thời.
Productivity: quản lý producvitity của member, từ đó đưa ra các điều chỉnh phù hợp khi assign task.
Report về resource allocation.
Monitoring task: cho phép checking các task over dua date cũng như các task bị change dua date.
Quản lý billable, KPI report: tra cứu thông tin của dự án, cho phép manager có thể checking thông tin của nhiều dự án.
Daily report và logwork: Giúp member nắm bắt được các task mình được assign. Giúp member thực hiện daily report và log work để data dùng cho KPI tool được đảm bảo một cách chuẩn nhất có thể.

## III. Phạm vi áp dụng
Áp dụng cho các dự án quản lý trên Jira.

Các BUL hoặc PM cần một công cụ có thể nhanh chóng tracking được các thông tin của các dự án đang phải monitoring.


## History
### 02-07-2021
* Fix bug không hiển thị log trên Jira 9
* Add thêm style "To do" của task khi mở Task monitoring
* Thêm config style task của Daily report

