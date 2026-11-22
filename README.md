# 白璃 · Baili for Codex macOS

![Baili Codex demo](baili-demo.gif)

macOS 版 Codex 白璃动态外观与桌宠项目。

这是一个独立启动器：不会修改官方 ChatGPT/Codex.app，而是在启动官方应用时打开本机回环调试连接，并注入白璃动画层。

## 下载

下载并解压 [`Codex-Baili-macOS-under25.zip`](Codex-Baili-macOS-under25.zip)，将 `Codex · 白璃动画.app` 拖到“应用程序”文件夹，再双击启动。

## 功能

- 白璃启动动画与持续动态背景
- 右侧浏览器保持可点击
- 白璃设置面板
- 背景强度与动画透明度调节
- 右侧浏览器透明度调节
- 暗色 / 亮色 / 跟随系统
- 重播、暂停背景、跳过动画、恢复原外观
- 白璃桌宠资源

## 使用要求

- macOS
- 官方 ChatGPT/Codex 应用，默认路径为 `/Applications/ChatGPT.app`
- Node.js 22.3 或更高版本

首次运行前请完全退出官方 ChatGPT/Codex，再启动 `Codex · 白璃动画.app`。如果系统提示未知开发者，右键 App，选择“打开”。

## 安全说明

本项目是非官方外观启动器。启动时会给官方应用打开仅监听 `127.0.0.1` 的本地调试端口，用于注入动画。项目不会修改官方 App 文件，不会上传聊天内容，也不会关闭或重启正在运行的官方应用。

恢复外观不会关闭调试端口；需要完全退出 ChatGPT/Codex 后，再从官方入口启动，才能关闭该端口。

## 项目结构

- `skills/codex-white-dragon-animation/`：运行时和 macOS 平台适配源码
- `pets/baili/`：白璃桌宠资源
- `baili-demo.gif`：Codex 新聊天界面演示
- `Codex-Baili-macOS-under25.zip`：可下载 macOS App

## License

原创代码和文档采用 MIT。人物图像、音乐、视频、桌宠素材和第三方组件以 `ASSET-NOTICE.md` 及运行时声明为准。
