# 白璃 · Codex macOS 动态背景

## 下载最新版 v1.2.3

**[⬇ 点击直接下载 macOS App（约 18.7 MB）](https://github.com/surunlang-creator/baili-codex-macos/raw/refs/heads/main/Codex-Baili-macOS-v1.2.3.zip)**

[版本更新说明](CHANGELOG-v1.2.3.md) · [SHA-256 校验](SHA256-v1.2.3.txt)

下载 ZIP 即可获取 App，不需要逐个下载仓库源码。旧版本已从当前文件列表清理，仍保留在 Git 提交历史中。

![白璃动态背景演示](baili-demo.gif)

## 安装与启动

1. 安装 Node.js 22.3 或更高版本，并确保已安装官方 ChatGPT/Codex（默认 `/Applications/ChatGPT.app`）。
2. 解压下载包，把 **Codex · 白璃动画.app** 拖到“应用程序”。
3. 保存工作并完全退出官方客户端，再打开白璃 App。

如果官方客户端已在运行，白璃启动器只会将它带到前台；这不会给普通进程补上皮肤。

## 功能

- 白璃开场动画与可切换的动态背景。
- 本地素材库：图片、视频封面、音乐列表。
- 背景强度、明暗模式、浏览器透明度控制。
- 音乐播放进度、音量、顺序／循环／随机播放。
- 默认使用无音轨背景副本，主动开启声音才使用原视频。

无音轨处理目前支持普通 MP4/MOV；分段 MP4 和其他容器暂不支持，视频编码还需宿主支持。AirPods 实际切换行为尚未实机验证。

## 使用前了解

这是非官方外观启动器。App 使用本地临时签名，未做 Apple 公证；仍依赖本机 Node.js，不是完全独立运行包。启动时会开启官方客户端的本机调试端口，同机程序可能连接并控制客户端。恢复外观不会关闭端口，需完全退出官方客户端。

素材存储在本机 IndexedDB。无音轨副本仅禁用非视频轨道，不用于音频隐私擦除。不要删除客户端数据目录以免丢失素材。

## 开发与来源

本项目基于 [chenyi380/baili-codex](https://github.com/chenyi380/baili-codex) 的 macOS 适配。仓库中的脚本供开发参考；普通用户请使用顶部 App 下载链接。

代码许可见 [LICENSE](LICENSE)，素材与第三方声明见 [ASSET-NOTICE.md](ASSET-NOTICE.md) 和 [NOTICE.md](NOTICE.md)。不代表 OpenAI 官方产品。
