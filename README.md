# Jupyter Sidebar Chatbot

Jupyter Sidebar Chatbot 是一个为 Jupyter Notebook 和 JupyterLab 开发的实验性扩展，提供聊天机器人风格的界面，用于 AI 辅助的代码分析和执行功能。

## 项目简介

该项目旨在构建一个聊天机器人风格的 AI 代码助手，作为 Jupyter 环境的侧边栏扩展。它能与正在运行的 notebook 实例紧密交互，提供直观的对话式界面，允许通过 LLM 辅助代码分析，并在专用 IPython 内核中执行代码。

### 主要功能

- 通过聊天界面与 AI 助手交互，解释、调试或增强代码
- 在侧边栏中提供直观的聊天机器人体验
- 在辅助内核中执行代码，与用户的 notebook 内核隔离
- 在聊天界面内显示助手反馈、执行结果和建议
- 提供安全的原型设计环境

### 架构设计

该项目采用辅助微服务架构，包含以下组件：

1. **Jupyter 扩展**：提供侧边栏聊天界面集成
2. **后端服务**：处理 LLM 调用和代码执行
3. **IPython 内核**：执行用户代码的隔离环境

## 当前进展

- [x] 完成项目架构设计和文档
- [x] 实现 JupyterLab 扩展基础框架
- [x] 添加侧边栏聊天界面
- [ ] 开发后端服务
- [ ] 集成 LLM 服务
- [ ] 实现代码执行功能

## 项目结构

```
jupyter-sidebar-chatbot/
├── backend/         # 后端服务代码（开发中）
│   └── src/         # 源代码目录
├── jupyter-lab-extension/  # 前端扩展
│   ├── src/         # TypeScript 源代码
│   ├── style/       # CSS 样式
│   └── package.json # Node.js 依赖
├── PROJECT.md       # 英文项目文档
└── README.md        # 中文文档
```

## 开发环境设置

### 安装依赖

```bash
# 安装 Node.js 依赖
cd jupyter-lab-extension
npm install

# 安装 Python 依赖
cd ..
pip install -r requirements.txt
```

### 开发 JupyterLab 扩展

```bash
# 在 jupyter-lab-extension 目录下
npm run build
jupyter labextension install .
```

### 启动开发服务器

```bash
# 启动 JupyterLab
jupyter lab

# 启动后端服务（开发中）
python backend/src/app.py
```

## 开发指南

### 运行测试

```bash
# 运行所有测试
pytest

# 运行特定测试
pytest tests/test_kernel_manager.py
```

### 贡献代码

1. Fork 仓库
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

本项目采用 MIT 许可证。详情请参阅 LICENSE 文件。
