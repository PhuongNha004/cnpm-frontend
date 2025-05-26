package org.example.frontend;

import java.awt.*;
import java.awt.event.*;
import java.awt.image.*;
import java.io.*;
import javax.swing.*;
import javax.imageio.ImageIO;
import java.util.logging.*;

public class ResizeImagesGUI {
    private static final Logger logger = Logger.getLogger(ResizeImagesGUI.class.getName());

    public static void main(String[] args) {
        // Giao diện cơ bản
        JFrame frame = new JFrame("Resize Images");
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        frame.setSize(400, 200);
        frame.setLayout(new FlowLayout());

        // Thêm nút chọn thư mục
        JButton button = new JButton("Chọn thư mục chứa ảnh");
        frame.add(button);

        // Thêm label để hiển thị kết quả
        JLabel label = new JLabel("Chưa chọn thư mục.");
        frame.add(label);

        // Sự kiện nút bấm chọn thư mục
        button.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                JFileChooser fileChooser = new JFileChooser();
                fileChooser.setFileSelectionMode(JFileChooser.DIRECTORIES_ONLY);
                int result = fileChooser.showOpenDialog(frame);

                if (result == JFileChooser.APPROVE_OPTION) {
                    File selectedDirectory = fileChooser.getSelectedFile();
                    label.setText("Đang xử lý thư mục: " + selectedDirectory.getAbsolutePath());
                    processImagesInDirectory(selectedDirectory);
                }
            }
        });

        frame.setVisible(true);
    }

    private static void processImagesInDirectory(File folder) {
        File[] files = folder.listFiles();

        if (files != null) {
            for (File file : files) {
                if (file.isFile() && isImageFile(file)) {
                    try {
                        // Đọc ảnh
                        BufferedImage originalImage = ImageIO.read(file);

                        // Kiểm tra xem ảnh có được đọc thành công không
                        if (originalImage == null) {
                            logger.warning("Không thể đọc file ảnh (Ảnh bị hỏng hoặc không thể xử lý): " + file.getName());
                            continue; // Bỏ qua ảnh không thể đọc được
                        }

                        // Thay đổi kích thước ảnh thành 500x700
                        BufferedImage resizedImage = resizeImage(originalImage, 500, 700);

                        // Lưu lại ảnh với kích thước mới
                        String fileExtension = getFileExtension(file);
                        File outputFile = new File(file.getParent(), "resized_" + file.getName());
                        ImageIO.write(resizedImage, fileExtension, outputFile);

                        logger.info("Đã thay đổi kích thước: " + file.getName());
                    } catch (IOException e) {
                        logger.severe("Lỗi khi xử lý file: " + file.getName() + " - " + e.getMessage());
                    }
                }
            }
        }
    }



    // Kiểm tra xem file có phải là ảnh không
    private static boolean isImageFile(File file) {
        String[] imageExtensions = { "jpg", "jpeg", "png", "gif", "bmp", "tiff" };
        String fileName = file.getName().toLowerCase();
        for (String ext : imageExtensions) {
            if (fileName.endsWith(ext)) {
                return true;
            }
        }
        return false;
    }

    // Thay đổi kích thước ảnh
    private static BufferedImage resizeImage(BufferedImage originalImage, int targetWidth, int targetHeight) {
        Image scaledImage = originalImage.getScaledInstance(targetWidth, targetHeight, Image.SCALE_SMOOTH);
        BufferedImage resizedImage = new BufferedImage(targetWidth, targetHeight, BufferedImage.TYPE_INT_ARGB);

        Graphics2D g2d = resizedImage.createGraphics();
        g2d.drawImage(scaledImage, 0, 0, null);
        g2d.dispose();

        return resizedImage;
    }

    // Lấy phần mở rộng của file (jpg, png, v.v.)
    private static String getFileExtension(File file) {
        String fileName = file.getName();
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex > 0) {
            return fileName.substring(dotIndex + 1);
        }
        return "jpg"; // Mặc định là jpg nếu không xác định được
    }
}
