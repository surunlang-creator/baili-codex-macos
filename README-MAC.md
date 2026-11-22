# 白璃 · Baili for Codex on macOS

这是 `chenyi380/baili-codex` 的 macOS 适配版。支持 macOS 上的 `/Applications/ChatGPT.app`（其内部签名基名为 Codex）或 `/Applications/Codex.app`。

要求：Node.js 22.3+，官方 ChatGPT/Codex 应用已安装。运行时不会修改官方 App 包。

1. 进入 `skills/codex-white-dragon-animation/assets/runtime`。
2. 双击 `Start-Codex.command`，首次按提示输入 `YES` 授权本机回环调试端口。
3. 若要创建桌面入口：`node shortcut.mjs --install`。
4. 预览使用 `Preview.command`，恢复使用 `Restore.command`。

如果应用路径不同：`BAILI_CODEX_APP=/path/to/ChatGPT.app node launcher.mjs --interactive`。
