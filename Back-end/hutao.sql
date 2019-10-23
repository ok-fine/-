/*
 Navicat Premium Data Transfer

 Source Server         : local
 Source Server Type    : MySQL
 Source Server Version : 80017
 Source Host           : localhost:3306
 Source Schema         : hutao

 Target Server Type    : MySQL
 Target Server Version : 80017
 File Encoding         : 65001

 Date: 23/10/2019 13:20:38
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for item_info
-- ----------------------------
DROP TABLE IF EXISTS `item_info`;
CREATE TABLE `item_info` (
  `item_no` varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `student_no` varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `title` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `description` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `price` int(16) NOT NULL DEFAULT '0',
  `publish_time` datetime NOT NULL,
  `status` enum('已发布','已卖出','待收货') CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '已发布',
  `try` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  PRIMARY KEY (`item_no`),
  KEY `item_info_ibfk_1` (`student_no`),
  CONSTRAINT `item_info_ibfk_1` FOREIGN KEY (`student_no`) REFERENCES `user_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of item_info
-- ----------------------------
BEGIN;
INSERT INTO `item_info` VALUES ('1', '1', '手机', '无', 100000, '2019-10-22 15:48:21', '', '2019年10月20日 15:48:21');
INSERT INTO `item_info` VALUES ('2', '2', '衣服', '真好', 100, '2019-10-22 15:48:43', '', '2019年10月20日 15:48:43');
INSERT INTO `item_info` VALUES ('3', '2', '2手机', '2的手机', 10000, '2019-10-22 20:21:17', '', '2019年10月20日 20:21:17');
INSERT INTO `item_info` VALUES ('4', '3', '3手机', '3的手机', 2000, '2019-10-22 20:21:45', '', '2019年10月20日 12:23:00');
INSERT INTO `item_info` VALUES ('5', '1', '1的衣服', '1的衣服啊', 10, '2019-10-22 20:23:13', '', '2019年10月18日 12:23:00');
INSERT INTO `item_info` VALUES ('6', '2', '哈哈的摩托车啊', '不知道说什么', 600, '2019-10-22 19:45:18', '', '2019年09月20日 12:23:00');
INSERT INTO `item_info` VALUES ('7', '2', '不知道社么衣服', '哈哈哈', 190, '2019-10-22 22:17:56', '', '2018年09月20日 12:23:00');
COMMIT;

-- ----------------------------
-- Table structure for item_mes
-- ----------------------------
DROP TABLE IF EXISTS `item_mes`;
CREATE TABLE `item_mes` (
  `item_no` varchar(16) NOT NULL,
  `student_no` varchar(16) NOT NULL,
  `content` varchar(64) DEFAULT NULL,
  `mes_time` varchar(32) NOT NULL,
  PRIMARY KEY (`item_no`,`mes_time`,`student_no`) USING BTREE,
  KEY `student_no` (`student_no`),
  CONSTRAINT `item_mes_ibfk_1` FOREIGN KEY (`student_no`) REFERENCES `user_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `item_mes_ibfk_2` FOREIGN KEY (`item_no`) REFERENCES `item_info` (`item_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of item_mes
-- ----------------------------
BEGIN;
INSERT INTO `item_mes` VALUES ('1', '2', '可以少吗', '1571807280185');
INSERT INTO `item_mes` VALUES ('1', '2', '卖家你好啊', '1571807902881');
COMMIT;

-- ----------------------------
-- Table structure for item_tag
-- ----------------------------
DROP TABLE IF EXISTS `item_tag`;
CREATE TABLE `item_tag` (
  `campus` enum('南校区','北校区') CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `item_no` varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`item_no`),
  CONSTRAINT `item_no` FOREIGN KEY (`item_no`) REFERENCES `item_info` (`item_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of item_tag
-- ----------------------------
BEGIN;
INSERT INTO `item_tag` VALUES ('南校区', '1');
INSERT INTO `item_tag` VALUES ('北校区', '2');
INSERT INTO `item_tag` VALUES ('南校区', '3');
INSERT INTO `item_tag` VALUES ('北校区', '4');
INSERT INTO `item_tag` VALUES ('南校区', '5');
INSERT INTO `item_tag` VALUES ('南校区', '6');
INSERT INTO `item_tag` VALUES ('北校区', '7');
COMMIT;

-- ----------------------------
-- Table structure for student_user
-- ----------------------------
DROP TABLE IF EXISTS `student_user`;
CREATE TABLE `student_user` (
  `student_no` varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `student_name` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `card_herf` varchar(128) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`student_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of student_user
-- ----------------------------
BEGIN;
INSERT INTO `student_user` VALUES ('1', '111', '111');
INSERT INTO `student_user` VALUES ('2', '222', '222');
INSERT INTO `student_user` VALUES ('3', '333', '333');
COMMIT;

-- ----------------------------
-- Table structure for user_address
-- ----------------------------
DROP TABLE IF EXISTS `user_address`;
CREATE TABLE `user_address` (
  `student_no` varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `address` varchar(64) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  PRIMARY KEY (`student_no`,`address`),
  CONSTRAINT `user_address_ibfk_2` FOREIGN KEY (`student_no`) REFERENCES `user_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user_collect
-- ----------------------------
DROP TABLE IF EXISTS `user_collect`;
CREATE TABLE `user_collect` (
  `student_no` varchar(16) NOT NULL,
  `item_no` varchar(16) NOT NULL,
  PRIMARY KEY (`student_no`,`item_no`) USING BTREE,
  KEY `item_no` (`item_no`),
  CONSTRAINT `user_collect_ibfk_1` FOREIGN KEY (`student_no`) REFERENCES `user_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_collect_ibfk_2` FOREIGN KEY (`item_no`) REFERENCES `item_info` (`item_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user_collect
-- ----------------------------
BEGIN;
INSERT INTO `user_collect` VALUES ('2', '1');
COMMIT;

-- ----------------------------
-- Table structure for user_info
-- ----------------------------
DROP TABLE IF EXISTS `user_info`;
CREATE TABLE `user_info` (
  `student_no` varchar(16) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `user_name` varchar(32) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `sex` enum('保密','男','女') CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '保密',
  `birthday` date DEFAULT NULL,
  `major` enum('信息科学与工程学院','物理与微电子科学学院') CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT '信息科学与工程学院',
  `credit` int(8) NOT NULL DEFAULT '100',
  PRIMARY KEY (`student_no`) USING BTREE,
  CONSTRAINT `user_info_ibfk_1` FOREIGN KEY (`student_no`) REFERENCES `student_user` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of user_info
-- ----------------------------
BEGIN;
INSERT INTO `user_info` VALUES ('1', '12', '保密', NULL, '信息科学与工程学院', 0);
INSERT INTO `user_info` VALUES ('2', '123', '保密', NULL, '信息科学与工程学院', 0);
INSERT INTO `user_info` VALUES ('3', '222', '保密', NULL, '信息科学与工程学院', 0);
COMMIT;

-- ----------------------------
-- View structure for item
-- ----------------------------
DROP VIEW IF EXISTS `item`;
CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `item` AS select `item_info`.`item_no` AS `item_no_1`,`item_info`.`student_no` AS `student_no`,`item_info`.`title` AS `title`,`item_info`.`description` AS `description`,`item_info`.`price` AS `price`,`item_info`.`publish_time` AS `publish_time`,`item_info`.`status` AS `status`,`item_tag`.`campus` AS `campus`,`item_tag`.`item_no` AS `item_no`,`item_info`.`try` AS `try` from (`item_tag` join `item_info` on((`item_tag`.`item_no` = `item_info`.`item_no`))) order by `item_info`.`try` desc;

SET FOREIGN_KEY_CHECKS = 1;
