---
layout: post
title: '如何给 Kindle 电子书设置封面图片'
tags: [read]
---

对于一个完美主义者（或者可以说是强迫症患者）来说，Kindle 上缺少了封面的电子书是无法忍受的。不幸的是，我就是属于这一类人。

所以，让我们来谈谈如何给 Kindle 电子书设置封面图片。

## 一、使用 calibre 设置封面图

calibre 是一个开源的电子书管理工具，可以用来编辑、阅读和转换多种格式的电子书。

![calibre E-Book management]({{site.img_url}}/calibre.png){:.center}

用 calibre 来设置书籍的封面图是极其简单的：只需要选中一本书，然后点击编辑元数据按钮，然后在弹出的窗口中选择更换封面，最后保存即可。

## 二、手动设置

如果使用 calibre 设置后，Kindle 仍然无法显示封面图，则可以考虑采用下面的方法来手动设置。

Kindle 系统中的所有书籍封面会保存在 `\system\thumbnails` 目录下，其命名规则是 `thumbnail_XXXXXXXXXX_EBOK_portrait.jpg`，其中 10 位编码的占位符表示该书在亚马逊网站上的编号。

![Kindle 书籍封面所在目录]({{site.img_url}}/kindle-thumbnails.png){:.center}


比如我们想设置《你一定爱读的极简欧洲史》这本书的封面，则首先需要在亚马逊官网上找到该书的[详情页面](https://www.amazon.cn/dp/B00E192518/)，然后在地址栏上便可找到该书的编号 `B00E192518`。

![如何查找亚马逊电子书编号]({{site.img_url}}/kindle-amazon.png){:.center}

最后把找到的封面图片（文件名为 `thumbnail_B00E192518_EBOK_portrait.jpg`）保存到 `\system\thumbnails` 目录下，便完成了封面图的设置。
