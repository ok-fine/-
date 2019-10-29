/*
 Navicat Premium Data Transfer

 Source Server         : 132.232.81.249
 Source Server Type    : MySQL
 Source Server Version : 50727
 Source Host           : 132.232.81.249:3306
 Source Schema         : hutao

 Target Server Type    : MySQL
 Target Server Version : 50727
 File Encoding         : 65001

 Date: 28/10/2019 17:28:29
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for artificial_check
-- ----------------------------
DROP TABLE IF EXISTS `artificial_check`;
CREATE TABLE `artificial_check` (
  `student_no` varchar(16) NOT NULL,
  `student_name` varchar(16) NOT NULL,
  `user_name` varchar(16) NOT NULL,
  `card_href` varchar(128) NOT NULL,
  `face_href` varchar(128) NOT NULL,
  PRIMARY KEY (`student_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for finished_item
-- ----------------------------
DROP TABLE IF EXISTS `finished_item`;
CREATE TABLE `finished_item` (
  `item_no` varchar(16) NOT NULL,
  PRIMARY KEY (`item_no`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for item_comment
-- ----------------------------
DROP TABLE IF EXISTS `item_comment`;
CREATE TABLE `item_comment` (
  `item_no` bigint(16) unsigned NOT NULL AUTO_INCREMENT,
  `buyer_no` varchar(16) NOT NULL,
  `buyer_comment` varchar(256) DEFAULT NULL,
  `seller_comment` varchar(256) DEFAULT NULL,
  PRIMARY KEY (`item_no`) USING BTREE,
  KEY `buyer_no` (`buyer_no`),
  CONSTRAINT `item_comment_ibfk_1` FOREIGN KEY (`buyer_no`) REFERENCES `user_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `item_comment_ibfk_3` FOREIGN KEY (`item_no`) REFERENCES `item_info` (`item_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for item_info
-- ----------------------------
DROP TABLE IF EXISTS `item_info`;
CREATE TABLE `item_info` (
  `item_no` bigint(16) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `student_no` varchar(16) NOT NULL DEFAULT '',
  `title` varchar(32) NOT NULL,
  `description` varchar(256) DEFAULT NULL,
  `price` int(16) NOT NULL DEFAULT '0',
  `publish_time` datetime DEFAULT NULL,
  `status` enum('已发布','已卖出','待收货','待付款') DEFAULT '已发布',
  `try` varchar(32) DEFAULT NULL,
  `campus` enum('南校区','北校区') DEFAULT '南校区',
  `dormitory` enum('天马园区','德智园区','望麓桥公寓','南校区宿舍','北校区宿舍') DEFAULT '天马园区',
  `buyer_no` varchar(16) DEFAULT NULL,
  PRIMARY KEY (`item_no`),
  KEY `item_info_ibfk_1` (`student_no`),
  KEY `item_no` (`item_no`,`student_no`),
  KEY `buyer_no` (`buyer_no`),
  CONSTRAINT `item_info_ibfk_1` FOREIGN KEY (`student_no`) REFERENCES `user_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `item_info_ibfk_2` FOREIGN KEY (`buyer_no`) REFERENCES `user_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=47 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of item_info
-- ----------------------------
BEGIN;
INSERT INTO `item_info` VALUES (0000000000000001, '2', '手机', '只要998，手机带回家', 998, '2019-10-22 15:48:21', '待付款', '2019年10月20日 15:48:21', '南校区', '天马园区', NULL);
INSERT INTO `item_info` VALUES (0000000000000002, '2', '衣服', '真好', 100, '2019-10-22 15:48:43', '待付款', '2019年10月20日 15:48:43', '北校区', '望麓桥公寓', NULL);
INSERT INTO `item_info` VALUES (0000000000000003, '2', '2手机', '2的手机', 10000, '2019-10-22 20:21:17', '已发布', '2019年10月20日 20:21:17', '南校区', '德智园区', NULL);
INSERT INTO `item_info` VALUES (0000000000000004, '3', '3手机', '3的手机', 2000, '2019-10-22 20:21:45', '已发布', '2019年10月20日 12:23:00', '北校区', '望麓桥公寓', NULL);
INSERT INTO `item_info` VALUES (0000000000000005, '1', '1的衣服', '1的衣服啊', 10, '2019-10-22 20:23:13', '待收货', '2019年10月18日 12:23:00', '南校区', '天马园区', '2');
INSERT INTO `item_info` VALUES (0000000000000006, '2', '哈哈的摩托车啊', '不知道说什么', 600, '2019-10-22 19:45:18', '已发布', '2019年09月20日 12:23:00', '南校区', '德智园区', NULL);
INSERT INTO `item_info` VALUES (0000000000000007, '2', '书', '哈哈哈', 190, '2019-10-22 22:17:56', '已卖出', '2018年09月20日 12:23:00', '北校区', '北校区宿舍', '3');
INSERT INTO `item_info` VALUES (0000000000000045, '3', 'auys', 'kahsbx', 128, NULL, '已发布', '2019-10-28 17:11:03', '南校区', '天马园区', NULL);
INSERT INTO `item_info` VALUES (0000000000000046, '3', '17ahsb', 'aksbj', 123, NULL, '已发布', '2019-10-28 17:13:06', '南校区', '天马园区', NULL);
COMMIT;

-- ----------------------------
-- Table structure for item_mes
-- ----------------------------
DROP TABLE IF EXISTS `item_mes`;
CREATE TABLE `item_mes` (
  `item_no` bigint(16) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `student_no` varchar(16) NOT NULL,
  `content` varchar(64) DEFAULT NULL,
  `mes_time` varchar(32) NOT NULL,
  PRIMARY KEY (`item_no`,`mes_time`,`student_no`) USING BTREE,
  KEY `student_no` (`student_no`),
  CONSTRAINT `item_mes_ibfk_1` FOREIGN KEY (`student_no`) REFERENCES `user_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `item_mes_ibfk_2` FOREIGN KEY (`item_no`) REFERENCES `item_info` (`item_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of item_mes
-- ----------------------------
BEGIN;
INSERT INTO `item_mes` VALUES (0000000000000001, '2', '可以少吗', '1571807280185');
INSERT INTO `item_mes` VALUES (0000000000000001, '2', '卖家你好啊', '1571807902881');
INSERT INTO `item_mes` VALUES (0000000000000001, '2', 'hehehe', '1571909136568');
COMMIT;

-- ----------------------------
-- Table structure for item_tag
-- ----------------------------
DROP TABLE IF EXISTS `item_tag`;
CREATE TABLE `item_tag` (
  `item_no` bigint(16) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `type` enum('学习用品','生活用品','箱包服饰','电子设备','美容美妆','其他') DEFAULT '学习用品',
  `grade` int(2) DEFAULT '10',
  PRIMARY KEY (`item_no`),
  CONSTRAINT `item_tag_ibfk_1` FOREIGN KEY (`item_no`) REFERENCES `item_info` (`item_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of item_tag
-- ----------------------------
BEGIN;
INSERT INTO `item_tag` VALUES (0000000000000001, '电子设备', 10);
INSERT INTO `item_tag` VALUES (0000000000000002, '生活用品', 9);
INSERT INTO `item_tag` VALUES (0000000000000003, '电子设备', 8);
INSERT INTO `item_tag` VALUES (0000000000000004, '电子设备', 7);
INSERT INTO `item_tag` VALUES (0000000000000005, '箱包服饰', 6);
INSERT INTO `item_tag` VALUES (0000000000000006, '其他', 5);
INSERT INTO `item_tag` VALUES (0000000000000007, '学习用品', 4);
COMMIT;

-- ----------------------------
-- Table structure for order_info
-- ----------------------------
DROP TABLE IF EXISTS `order_info`;
CREATE TABLE `order_info` (
  `order_no` bigint(16) unsigned zerofill NOT NULL AUTO_INCREMENT,
  `item_no` bigint(16) unsigned zerofill NOT NULL,
  `seller_no` varchar(16) NOT NULL,
  `buyer_no` varchar(16) NOT NULL,
  `exchange_time` datetime DEFAULT NULL,
  `address_no` bigint(16) DEFAULT NULL,
  PRIMARY KEY (`order_no`) USING BTREE,
  KEY `item_no` (`item_no`,`seller_no`),
  KEY `seller_no` (`seller_no`),
  KEY `buyer_no` (`buyer_no`,`address_no`),
  CONSTRAINT `order_info_ibfk_1` FOREIGN KEY (`seller_no`) REFERENCES `item_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_info_ibfk_2` FOREIGN KEY (`buyer_no`) REFERENCES `user_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `order_info_ibfk_3` FOREIGN KEY (`buyer_no`, `address_no`) REFERENCES `user_address` (`student_no`, `address_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of order_info
-- ----------------------------
BEGIN;
INSERT INTO `order_info` VALUES (0000000000000010, 0000000000000002, '2', '1', '2019-10-22 15:48:21', 1);
COMMIT;

-- ----------------------------
-- Table structure for student_user
-- ----------------------------
DROP TABLE IF EXISTS `student_user`;
CREATE TABLE `student_user` (
  `student_no` varchar(16) NOT NULL,
  `student_name` varchar(16) NOT NULL,
  `card_href` varchar(128) NOT NULL,
  `wechat_no` varchar(16) NOT NULL,
  PRIMARY KEY (`student_no`,`wechat_no`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of student_user
-- ----------------------------
BEGIN;
INSERT INTO `student_user` VALUES ('1', '111', '111', '');
INSERT INTO `student_user` VALUES ('2', '222', '222', '');
INSERT INTO `student_user` VALUES ('201726010227', '张祖瑜', '/home/ubuntu/湖桃/images/201726010227_1.JPG', '');
INSERT INTO `student_user` VALUES ('3', '333', '333', '');
COMMIT;

-- ----------------------------
-- Table structure for user_address
-- ----------------------------
DROP TABLE IF EXISTS `user_address`;
CREATE TABLE `user_address` (
  `student_no` varchar(16) NOT NULL,
  `address_no` bigint(16) NOT NULL,
  `address` varchar(64) NOT NULL,
  `name` varchar(16) NOT NULL,
  `telephone` varchar(16) NOT NULL,
  PRIMARY KEY (`student_no`,`address_no`) USING BTREE,
  CONSTRAINT `user_address_ibfk_2` FOREIGN KEY (`student_no`) REFERENCES `user_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user_address
-- ----------------------------
BEGIN;
INSERT INTO `user_address` VALUES ('1', 1, '南校区天马公寓2-2-739', '123', '13289998888');
COMMIT;

-- ----------------------------
-- Table structure for user_collect
-- ----------------------------
DROP TABLE IF EXISTS `user_collect`;
CREATE TABLE `user_collect` (
  `student_no` varchar(16) NOT NULL,
  `item_no` bigint(16) unsigned zerofill NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`student_no`,`item_no`) USING BTREE,
  KEY `item_no` (`item_no`),
  CONSTRAINT `user_collect_ibfk_1` FOREIGN KEY (`student_no`) REFERENCES `user_info` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `user_collect_ibfk_2` FOREIGN KEY (`item_no`) REFERENCES `item_info` (`item_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of user_collect
-- ----------------------------
BEGIN;
INSERT INTO `user_collect` VALUES ('2', 0000000000000001);
COMMIT;

-- ----------------------------
-- Table structure for user_info
-- ----------------------------
DROP TABLE IF EXISTS `user_info`;
CREATE TABLE `user_info` (
  `student_no` varchar(16) NOT NULL,
  `user_name` varchar(16) NOT NULL,
  `sex` enum('保密','男','女') DEFAULT '保密',
  `birthday` date DEFAULT NULL,
  `major` enum('信息科学与工程学院','物理与微电子科学学院') DEFAULT '信息科学与工程学院',
  `credit` int(8) DEFAULT '100',
  PRIMARY KEY (`student_no`) USING BTREE,
  CONSTRAINT `user_info_ibfk_1` FOREIGN KEY (`student_no`) REFERENCES `student_user` (`student_no`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPACT;

-- ----------------------------
-- Records of user_info
-- ----------------------------
BEGIN;
INSERT INTO `user_info` VALUES ('1', '123', '女', '2018-12-19', '信息科学与工程学院', 100);
INSERT INTO `user_info` VALUES ('2', '123', '保密', '2019-10-10', '信息科学与工程学院', 100);
INSERT INTO `user_info` VALUES ('201726010227', '小明', '保密', NULL, '信息科学与工程学院', 100);
INSERT INTO `user_info` VALUES ('3', '222', '男', '2019-04-17', '信息科学与工程学院', 100);
COMMIT;

-- ----------------------------
-- View structure for collected_item
-- ----------------------------
DROP VIEW IF EXISTS `collected_item`;
CREATE ALGORITHM=UNDEFINED DEFINER=`zzy`@`%` SQL SECURITY DEFINER VIEW `collected_item` AS select `user_collect`.`student_no` AS `collector_no`,`user_collect`.`item_no` AS `item_no`,`item_info`.`student_no` AS `seller_no`,`item_info`.`title` AS `title`,`item_info`.`description` AS `description`,`item_info`.`price` AS `price`,`item_info`.`publish_time` AS `publish_time`,`item_info`.`try` AS `try`,`item_info`.`campus` AS `campus`,`item_info`.`dormitory` AS `dormitory`,`user_info`.`user_name` AS `seller_name`,`user_info`.`credit` AS `seller_credit` from ((`user_collect` join `item_info` on((`user_collect`.`item_no` = `item_info`.`item_no`))) join `user_info` on((`item_info`.`student_no` = `user_info`.`student_no`)));

-- ----------------------------
-- View structure for published_item
-- ----------------------------
DROP VIEW IF EXISTS `published_item`;
CREATE ALGORITHM=UNDEFINED DEFINER=`zzy`@`%` SQL SECURITY DEFINER VIEW `published_item` AS select `user_info`.`student_no` AS `seller_no`,`user_info`.`user_name` AS `seller_name`,`user_info`.`credit` AS `seller_credit`,`item_info`.`item_no` AS `item_no`,`item_info`.`title` AS `title`,`item_info`.`description` AS `description`,`item_info`.`price` AS `price`,`item_info`.`publish_time` AS `publish_time`,`item_info`.`try` AS `try`,`item_info`.`campus` AS `campus`,`item_info`.`dormitory` AS `dormitory` from (`item_info` join `user_info` on((`item_info`.`student_no` = `user_info`.`student_no`))) where (`item_info`.`status` = '已发布');

-- ----------------------------
-- View structure for sold_item
-- ----------------------------
DROP VIEW IF EXISTS `sold_item`;
CREATE ALGORITHM=UNDEFINED DEFINER=`zzy`@`%` SQL SECURITY DEFINER VIEW `sold_item` AS select `item_info`.`item_no` AS `item_no`,`item_info`.`student_no` AS `seller_no`,`item_info`.`title` AS `title`,`item_info`.`description` AS `description`,`item_info`.`price` AS `price`,`item_info`.`status` AS `status`,`item_info`.`publish_time` AS `publish_time`,`item_info`.`try` AS `try`,`item_info`.`campus` AS `campus`,`item_info`.`dormitory` AS `dormitory`,`item_info`.`buyer_no` AS `buyer_no`,`user_info`.`user_name` AS `buyer_name`,`user_info`.`credit` AS `buyer_credit` from (`item_info` join `user_info` on((`item_info`.`buyer_no` = `user_info`.`student_no`))) where ((`item_info`.`status` = '已卖出') or (`item_info`.`status` = '待收货'));

SET FOREIGN_KEY_CHECKS = 1;
