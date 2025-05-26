package org.example.frontend;

import java.io.File;
import java.util.Arrays;
import java.util.List;
import java.util.Scanner;

public class RenameFilesFromInput {

    // Danh sách các nhãn rượu, đã chuẩn hóa (bỏ dấu nháy và thay khoảng trắng bằng dấu _)
    private static final List<String> wineLabels = Arrays.asList(
            "Hunter_Laing", "Kill_Devil", "Cadenheads", "Merlot", "Glengoyne",
            "Shiraz", "Zinfandel", "Riesling", "Malbec", "Tempranillo"
    );

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);

        System.out.print("Nhập đường dẫn thư mục: ");
        String folderPath = scanner.nextLine().trim();

        File folder = new File(folderPath);

        if (!folder.exists() || !folder.isDirectory()) {
            System.out.println("Đường dẫn không hợp lệ hoặc không phải thư mục.");
            return;
        }

        File[] files = folder.listFiles(File::isFile);
        if (files == null || files.length == 0) {
            System.out.println("Không tìm thấy file nào trong thư mục.");
            return;
        }

        // Sắp xếp file theo tên để đảm bảo thứ tự (tuỳ chọn)
        Arrays.sort(files);

        int wineIndex = 0;
        int wineCount = 0;
        int fileIndex = 1;

        for (File file : files) {
            if (wineIndex >= wineLabels.size()) {
                System.out.println("Không đủ tên rượu cho tất cả các file.");
                break;
            }

            String extension = getFileExtension(file.getName());
            String baseName = wineLabels.get(wineIndex);

            // Tạo tên mới
            String newName = baseName + "_" + fileIndex + extension;

            File newFile = new File(file.getParent(), newName);

            // Kiểm tra nếu tên mới đã tồn tại, bạn có thể đổi số hoặc bỏ qua
            if (newFile.exists()) {
                System.out.println("File mới đã tồn tại, bỏ qua: " + newName);
                fileIndex++;
                wineCount++;
                if (wineCount == 5) {
                    wineIndex++;
                    wineCount = 0;
                    fileIndex = 1;
                }
                continue;
            }

            boolean success = file.renameTo(newFile);
            if (success) {
                System.out.println("Đã đổi tên: " + file.getName() + " -> " + newName);
            } else {
                System.out.println("Không thể đổi tên: " + file.getName());
            }

            wineCount++;
            fileIndex++;

            if (wineCount == 5) {
                wineIndex++;
                wineCount = 0;
                fileIndex = 1;
            }
        }

        scanner.close();
    }

    // Hàm lấy phần mở rộng của file (vd: ".jpg", ".txt")
    private static String getFileExtension(String fileName) {
        int lastDot = fileName.lastIndexOf(".");
        if (lastDot == -1) return "";
        return fileName.substring(lastDot);
    }
}
