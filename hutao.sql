/*
 Navicat Premium Data Transfer

 Source Server         : localhost
 Source Server Type    : MySQL
 Source Server Version : 50643
 Source Host           : localhost:3306
 Source Schema         : hutao

 Target Server Type    : MySQL
 Target Server Version : 50643
 File Encoding         : 65001

 Date: 16/10/2019 00:34:42
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for student_user
-- ----------------------------
DROP TABLE IF EXISTS `student_user`;
CREATE TABLE `student_user`  (
  `student_no` varchar(12) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `student_name` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `card_herf` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`student_no`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

-- ----------------------------
-- Table structure for user_info
-- ----------------------------
DROP TABLE IF EXISTS `user_info`;
CREATE TABLE `user_info`  (
  `student_no` varchar(12) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_name` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `sex` enum('保密','男','女') CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '保密',
  `birthday` datetime(6) NULL DEFAULT NULL,
  `major` enum('信息科学与工程学院','物理与微电子科学学院') CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '信息科学与工程学院',
  PRIMARY KEY (`student_no`) USING BTREE,
  CONSTRAINT `user_info_ibfk_1` FOREIGN KEY (`student_no`) REFERENCES `student_user` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB CHARACTER SET = utf8 COLLATE = utf8_general_ci ROW_FORMAT = Compact;

SET FOREIGN_KEY_CHECKS = 1;
