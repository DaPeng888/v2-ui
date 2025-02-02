# v2-ui
python 重构 sprov-ui，一个船新的 v2ray 面板，给你一种船新的体验

# 运行截图
![1.png](1.png)
![2.png](2.png)

# 功能介绍
 - 系统状态监控
 - 支持多用户多协议，浏览器可视化操作，无需敲命令
 - 支持的协议：vmess、shadowsocks、dokodemo-door、socks、http
 - vmess 支持的传输配置：tcp、kcp、ws（tls）、http（tls）
 - 支持账号流量统计
 - 支持自定义 v2ray 配置模板
 - 支持 https 访问面板（需自备域名 + ssl 证书）
 - 更多高级配置项，详见面板
 
# 安装&升级
## 用户注意事项（必看）
v2-ui 与其它所有关于修改 v2ray 配置文件的工具完全不兼容（包括 sprov-ui），安装 v2-ui 后会导致 v2ray 配置文件被重写，导致原有 v2ray 账号丢失，如有必要，请自行提前做好备份，以免造成不必要的后果。
## 建议系统
 - CentOS 7+
 - Ubuntu 16+
 - Debian 9+
## 一键安装&升级
```
bash <(curl -Ls https://blog.sprov.xyz/v2-ui.sh)
```

# 面板其它操作
```
systemctl start v2-ui              #启动面板
systemctl stop v2-ui               #停止面板
systemctl restart v2-ui            #重启面板
systemctl enable v2-ui             #设置开机自启
systemctl disable v2-ui            #关闭开机自启
```
 
# 常见问题
## 没有 mtproto 协议？
>就目前来说，mtproto 已经不再建议使用，所以我就没有加了，除非 v2ray 之后优化了 mtproto，做了一个新的 mtproto 来，我才会加上此协议。如果确实需要的话，请自行在面板设置中修改v2ray配置模板。

## 用户名和密码忘记了
使用以下命令重置用户名和密码，默认都为 admin
```
/usr/local/v2-ui/v2-ui resetuser
```
## 面板设置修改错误导致面板无法启动
使用以下命令重置所有面板设置，默认面板端口修改为 65432，其它的也会重置为默认值，注意，这个命令不会重置用户名和密码。
```
/usr/local/v2-ui/v2-ui resetconfig
```
