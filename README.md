# UI-TARS 启动器

基于 [ByteDance/UI-TARS-desktop](https://github.com/bytedance/UI-TARS-desktop) 开发的 agent-tars 快速启动配置工具。

通过图形界面帮助用户快速配置和管理 agent-tars 的启动参数，无需记忆复杂的命令行。

---

## 快速开始

### 方式一：直接使用（推荐）

下载已打包的 Windows 便携版，解压后即可运行：

| 版本 | GitHub | GitCode | 大小 |
|------|--------|---------|------|
| v1.0.1 | [下载](https://github.com/learning152/ui-tars-launcher/releases) | [下载](https://gitcode.com/CuiHuo/ui-tars-launcher/releases) | 121 MB |

**使用步骤**：

1. 下载并解压压缩包
2. 双击 `UI-TARS-Launcher.exe` 启动
3. 应用会自动检测环境（Node.js 和 agent-tars）
4. 如有缺失，点击"一键安装"即可自动安装
5. 创建配置，填写 API Key（点击 ? 图标获取帮助）
6. 点击"启动 UI-TARS"即可运行

**无需任何命令行操作！**

---

### 方式二：开发模式

```bash
# 克隆仓库
git clone https://github.com/learning152/ui-tars-launcher.git
cd ui-tars-launcher

# 安装依赖
npm install

# 启动开发模式
npm run electron:dev
```

---

### 打包发布

```bash
# 构建 React 应用
npm run build

# 构建 Electron 主进程
npm run build:electron

# 打包成 Windows 可执行文件
npm run dist
```

生成的安装包位于 `release/` 目录。

---

## 功能特性

### 核心功能

- **配置管理**: 新建、编辑、删除、复制配置
- **搜索过滤**: 按名称/模型搜索，按 Provider 过滤
- **一键启动**: 命令预览、进程分离启动
- **运行进程管理**: 实时查看运行中的进程、显示运行时长、支持停止进程
- **实时日志查看**: 查看启动日志、自动滚动、日志类型高亮、支持清空日志

### v1.0.1 新增

- **环境检测**: 自动检测 Node.js 和 agent-tars 安装状态
- **一键安装**: 内置 agent-tars 安装引导，无需手动输入命令
- **API Key 帮助**: 根据不同 Provider 显示 API Key 获取链接，支持一键复制
- **图标选择**: 40+ 预设图标供配置选择，支持自定义 emoji

### 便捷功能

- **持久化**: 自动保存、导入/导出 JSON
- **快捷键**: Ctrl+N (新建)、Delete (删除)、Enter (启动)、Esc (关闭)
- **统计**: 配置总数、默认配置、最近使用

---

## 技术栈

| 技术 | 版本 | 说明 |
|------|------|------|
| React | 18.3 | UI 框架 |
| TypeScript | 5.7 | 类型安全 |
| Electron | 33 | 桌面应用框架 |
| Ant Design | 5.22 | UI 组件库 |
| Zustand | 5.0 | 状态管理 |
| Vite | 6.0 | 构建工具 |

---

## 界面预览

![UI 预览](./docs/img/image.png)

---

## 目录结构

```
ui-tars-launcher/
├── docs/
│   └── img/                     # 图片资源
├── electron/
│   └── main.ts                  # Electron 主进程
├── src/
│   ├── components/              # React 组件
│   │   ├── ActionButtons.tsx       # 操作按钮组件
│   │   ├── ApiKeyHelpTooltip.tsx   # API Key 帮助提示组件
│   │   ├── ConfigEditor.tsx        # 配置编辑器组件
│   │   ├── EnvironmentChecker.tsx  # 环境检测和安装引导组件
│   │   ├── Header.tsx              # 头部组件
│   │   ├── IconPicker.tsx          # 图标选择器组件
│   │   ├── LogWindow.tsx           # 日志窗口组件
│   │   └── RunningPanel.tsx        # 运行进程面板组件
│   ├── data/                    # 数据文件
│   │   └── providerLinks.ts        # Provider API Key 获取链接数据
│   ├── hooks/                   # 自定义 Hooks
│   ├── styles/                  # 全局样式
│   │   └── global.css
│   ├── types.ts                 # 类型定义
│   ├── store.ts                 # Zustand 状态管理
│   ├── App.tsx                  # 根组件
│   └── main.tsx                 # 入口文件
├── preload.ts                   # IPC 预加载脚本
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 配置文件位置

配置文件保存在:
```
C:\Users\<用户名>\AppData\Roaming\ui-tars-launcher\configs.json
```

---

## 开发说明

### 添加新组件

1. 在 `src/components/` 创建组件文件
2. 在 `src/App.tsx` 中引入并使用

### 修改 IPC 通信

1. 修改 `electron/main.ts` 添加主进程处理器
2. 修改 `preload.ts` 暴露 API
3. 在 `src/store.ts` 中添加对应方法

---

## 许可证

MIT
