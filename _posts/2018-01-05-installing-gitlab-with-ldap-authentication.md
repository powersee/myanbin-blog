---
layout: post
title: '如何搭建一个基于 LDAP 认证的 GitLab 服务'
tags: [code]
---

本文主要介绍了如何在 CentOS 7 环境下安装 GitLab CE 服务，以及集成 LDAP 统一认证、开启 HTTPS 和 GitLab Pages 等一系列配置。关于前期工作 LDAP 服务的安装和配置，请阅读上篇文章：

* [CentOS 7 环境下 OpenLDAP 的安装与配置]({{site.baseurl}}{% link _posts/2018-01-02-openldap-in-centos-7.md %})

## 一、安装 GitLab CE

GitLab 有 CE（社区版）和 EE（企业版）两个版本，我们使用的是 GitLab CE 10.3.1 的版本，并通过官方推荐的 Omnibus 包的方式进行安装。

首先，我们需要下载下面这些 GitLab 必需的依赖包：

```sh
[root@localhost ~]# yum install -y curl policycoreutils-python openssh-server postfix
[root@localhost ~]# systemctl enable sshd
[root@localhost ~]# systemctl start sshd
[root@localhost ~]# systemctl enable postfix
[root@localhost ~]# systemctl start postfix
```

由于官方的镜像在国内下载速度较慢，我们使用了清华大学的镜像先把安装包下载到本地，并进行手动安装

```sh
[root@localhost ~]# wget https://mirrors.tuna.tsinghua.edu.cn/gitlab-ce/yum/el7/gitlab-ce-10.3.1-ce.0.el7.x86_64.rpm
[root@localhost ~]# EXTERNAL_URL="http://gitlab.xinhua.io" rpm -i gitlab-ce-10.3.1-ce.0.el7.x86_64.rpm
```

这样，一个最基本 GitLab 便安装完成了。我们在浏览器中访问 `http://localhost/` 便会进入 GitLab 的登录界面。首次使用时，需要按照页面提示设置管理员 root 的密码。

下面，我们开始按需求配置 GitLab。

## 二、配置 LDAP 统一认证

## 三、开启 HTTPS

## 四、开启 GitLab Pages 服务


## 五、参考资料

* [GitLab Omnibus Package installation on CentOS 7](https://about.gitlab.com/installation/#centos-7)