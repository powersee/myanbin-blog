---
layout: post
title: '如何搭建一个基于 LDAP 认证的 GitLab 服务'
tags: [code]
---

本文主要介绍了如何在 CentOS 7 环境下安装 GitLab CE 服务，以及集成 LDAP 统一认证、开启 HTTPS 和 GitLab Pages 等一系列配置。关于前期工作 LDAP 服务的安装和配置，请阅读上一篇文章：

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

## 二、配置 LDAP

由于我们在[上一篇]({{site.baseurl}}{% link _posts/2018-01-02-openldap-in-centos-7.md %})中已经安装好了 LDAP 目录服务，所以在这里我们只需要按照下面的方法把相关配置信息添加到 `/etc/gitlab/gitlab.rb` 中即可：

```rb
### LDAP Settings
###! Docs: https://docs.gitlab.com/omnibus/settings/ldap.html
###! **Be careful not to break the indentation in the ldap_servers block. It is
###!   in yaml format and the spaces must be retained. Using tabs will not work.**

gitlab_rails['ldap_enabled'] = true

###! **remember to close this block with 'EOS' below**
gitlab_rails['ldap_servers'] = YAML.load <<-'EOS'
    main: # 'main' is the GitLab 'provider ID' of this LDAP server
      label: 'LDAP'
      host: 'localhost'
      port: 389
      uid: 'uid' # This should be the attribute, not the value that maps to uid.
      # Examples: 'america\\momo' or 'CN=Gitlab Git,CN=Users,DC=mydomain,DC=com'
      bind_dn: 'cn=Manager,dc=xinhua,dc=org'
      password: '{SSHA}5lOQVYTtgJriZzVQLCTF0NoXHT/flThg'
      # Encryption method. The "method" key is deprecated in favor of "encryption".
      #
      #   Examples: "start_tls" or "simple_tls" or "plain"
      #
      #   Deprecated values: "tls" was replaced with "start_tls" and "ssl" was
      #   replaced with "simple_tls".
      #
      encryption: 'plain' # "start_tls" or "simple_tls" or "plain"
#     verify_certificates: true
      active_directory: true
      allow_username_or_email_login: false
#     block_auto_created_users: false
      # Base where we can search for users
      #
      #   Ex. 'ou=People,dc=gitlab,dc=example' or 'DC=mydomain,DC=com'
      #
      base: 'ou=People,dc=xinhua,dc=org'
      # Filter LDAP users
      #
      #   Format: RFC 4515 https://tools.ietf.org/search/rfc4515
      #   Ex. (employeeType=developer)
      #
      #   Note: GitLab does not support omniauth-ldap's custom filter syntax.
      #
      #   Example for getting only specific users:
      #   '(&(objectclass=user)(|(samaccountname=momo)(samaccountname=toto)))'
      #
      user_filter: ''
#     ## EE only
#     group_base: ''
#     admin_group: ''
#     sync_ssh_keys: false
```

之后运行下面命令重启 GitLab 服务：

```sh
[root@localhost ~]# gitlab-ctl reconfigure
```

这样，就简单的配置好了 LDAP 目录服务。打开浏览器访问 `http://localhost/` 便会看到在登录界面上多了一个 LDAP 的登录方式：

![成功集成 LDAP 后的 GitLab 的登录界面]({{site.img_url}}/gitlab-login.png){:.center}


## 三、开启 HTTPS

GitLab 默认没有开启 HTTPS，如果需要开启的话，需要按照下面的步骤执行：

首先，在配置文件 `/etc/gitlab/gitlab.rb` 中将下面一行中的协议由 HTTP 改成 HTTPS，并设置从 HTTP 到 HTTPS 的重定向：

```rb
external_url "https://gitlab.example.com"

# Redirect HTTP requests to HTTPS
nginx['redirect_http_to_https'] = true
```

然后创建一个 SSL 目录，并将网站证书导入进去：

```sh
[root@localhost ~]# mkdir -p /etc/gitlab/ssl
[root@localhost ~]# chmod 700 /etc/gitlab/ssl
[root@localhost ~]# cp gitlab.xinhua.io.key gitlab.xinhua.iocom.crt /etc/gitlab/ssl/
```

注意上面的证书必须以配置中的域名（如本文中的 `gitlab.xinhua.io`）为文件名。

最后再执行 `gitlab-ctl reconfigure` 命令，即可通过 HTTPS 方式访问 GitLab 了。

## 四、开启 GitLab Pages 服务

GitLab Pages 是一个类似于 GitHub Pages 的静态网站托管服务。

## 五、参考资料

* [GitLab Omnibus Package installation on CentOS 7](https://about.gitlab.com/installation/#centos-7)
