---
layout: post
title: 'CentOS 7 环境下 OpenLDAP 的安装与配置'
tags: [code]
---


最近自主研发团队计划搭建一套基于 LDAP 统一认证的开发协作平台（包括 GitLab、Sinopia 等）。本文将主要介绍 LDAP 基本概念，在 CentOS 7 环境下 OpenLDAP 的安装步骤及配置，最后会介绍如何通过 phpLDAPadmin 来管理。关于 GitLab 和 Sinopia 的安装和配置，请阅读：

* [基于 LDAP 统一认证的 GitLab 的安装和配置]({% post_url 2017-12-22-installing-gitlab-under-ldap-authentication %})
* [使用 Sinopia 搭建 npm 私有服务器]({% post_url 2017-12-25-building-npm-server-with-sinopia %})

## 一、LDAP 基础教程

LDAP 全称 Lightweight Directory Access Protocol（轻量级目录访问协议），是一个提供了被称为目录服务的互联网协议。目录服务是一种特殊的数据库系统，其专门针对读取、浏览和搜索操作进行了特定的优化。目录一般用来包含描述性的，基于属性的信息并支持精细复杂的过滤能力。DNS 协议便是一种最被广泛使用的目录服务。

LDAP 中的信息是是按照树型结构组织，具体的信息存储在称之为条目（entry）的数据结构中。条目可能会具有必须的属性或可选属性，一个条目的属性必须要遵循 `/etc/openldap/schema/` 模式文件中定义的规则（一个条目所遵循的规则包含在该条目的 objectClass 属性中）。每个条目都可以通过一个识别名 dn 来全局的唯一确定。

## 二、OpenLDAP 的安装和配置

本文中相关操作系统及依赖包的版本如下：

* centos-release-7-4.1708.el7.centos.x86_64
* gcc-4.8.5-16.el7_4.1.x86_64
* openldap-clients-2.4.44-5.el7.x86_64
* openldap-servers-2.4.44-5.el7.x86_64

首先，需要切换到 root 账号来安装 OpenLDAP 的 Server 及 Client，并启动服务：

```
[xinhua@localhost ~]$ su -
[root@localhost ~]# yum install -y openldap-servers openldap-clients
[root@localhost ~]# cp /usr/share/openldap-servers/DB_CONFIG.example /var/lib/ldap/DB_CONFIG
[root@localhost ~]# chown ldap. /var/lib/ldap/DB_CONFIG
[root@localhost ~]# systemctl start slapd
[root@localhost ~]# systemctl enable slapd
```

第二步，我们使用 `slappasswd` 命令来生成一个密码，并使用 ldif 文件将其导入到 LDAP 中来配置管理员信息：

```
[root@localhost ~]# slappasswd
New password: 
Re-enter new password: 
{SSHA}KS/bFZ8KTmO56khHjJvM97l7zivH1MwG
[root@localhost ~]# vim chrootpw.ldif

# specify the password generated above for "olcRootPW" section
dn: olcDatabase={0}config,cn=config
changetype: modify
add: olcRootPW
olcRootPW: {SSHA}KS/bFZ8KTmO56khHjJvM97l7zivH1MwG

[root@localhost ~]# ldapadd -Y EXTERNAL -H ldapi:/// -f chrootpw.ldif
SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
modifying entry "olcDatabase={0}config,cn=config"
```

第三步，我们需要向 LDAP 中导入一些基本的 Schema：

```
[root@localhost ~]# ldapadd -Y EXTERNAL -H ldapi:/// -f /etc/openldap/schema/nis.ldif
```


第四步，我们来配置自己的 domain name，并导入到 LDAP 中：


```
[root@localhost ~]# slappasswd
New password: 
Re-enter new password: 
{SSHA}z/rsbmAjVtLlWeUB0xS5itLPI0VA1akD
[root@localhost ~]# vim chdomain.ldif

# replace to your own domain name for "dc=***,dc=***" section
# specify the password generated above for "olcRootPW" section
dn: olcDatabase={1}monitor,cn=config
changetype: modify
replace: olcAccess
olcAccess: {0}to * by dn.base="gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth"
  read by dn.base="cn=Manager,dc=xinhua,dc=org" read by * none

dn: olcDatabase={2}hdb,cn=config
changetype: modify
replace: olcSuffix
olcSuffix: dc=xinhua,dc=org

dn: olcDatabase={2}hdb,cn=config
changetype: modify
replace: olcRootDN
olcRootDN: cn=Manager,dc=xinhua,dc=org

dn: olcDatabase={2}hdb,cn=config
changetype: modify
add: olcRootPW
olcRootPW: {SSHA}z/rsbmAjVtLlWeUB0xS5itLPI0VA1akD

dn: olcDatabase={2}hdb,cn=config
changetype: modify
add: olcAccess
olcAccess: {0}to attrs=userPassword,shadowLastChange by
  dn="cn=Manager,dc=xinhua,dc=org" write by anonymous auth by self write by * none
olcAccess: {1}to dn.base="" by * read
olcAccess: {2}to * by dn="cn=Manager,dc=xinhua,dc=org" write by * read

[root@localhost ~]# ldapmodify -Y EXTERNAL -H ldapi:/// -f chdomain.ldif 
SASL/EXTERNAL authentication started
SASL username: gidNumber=0+uidNumber=0,cn=peercred,cn=external,cn=auth
SASL SSF: 0
modifying entry "olcDatabase={1}monitor,cn=config"

modifying entry "olcDatabase={2}hdb,cn=config"

modifying entry "olcDatabase={2}hdb,cn=config"

modifying entry "olcDatabase={2}hdb,cn=config"

[root@localhost ~]# vi basedomain.ldif

# replace to your own domain name for "dc=***,dc=***" section
dn: dc=xinhua,dc=org
objectClass: top
objectClass: dcObject
objectclass: organization
o: Xinhua News Agency
dc: xinhua

dn: cn=Manager,dc=xinhua,dc=org
objectClass: organizationalRole
cn: Manager

dn: ou=People,dc=xinhua,dc=org
objectClass: organizationalUnit
ou: People

dn: ou=Group,dc=xinhua,dc=org
objectClass: organizationalUnit
ou: Group

[root@localhost ~]# ldapadd -x -D cn=Manager,dc=xinhua,dc=org -W -f basedomain.ldif 
Enter LDAP Password: # directory manager's password
adding new entry "dc=xinhua,dc=org"

adding new entry "cn=Manager,dc=xinhua,dc=org"

adding new entry "ou=People,dc=xinhua,dc=org"

adding new entry "ou=Group,dc=xinhua,dc=org"
```

这样，我们就设置好了 LDAP 服务器。