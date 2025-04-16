# Jupyter LLM 扩展

Jupyter LLM 扩展是一个为 Jupyter Notebook 和 JupyterLab 开发的辅助应用程序，可以提供 AI 辅助的代码分析和执行功能。

## 项目简介

该项目旨在构建一个 AI 代码助手，作为本地 Jupyter 环境的辅助应用程序。它可以独立运行，但能与正在运行的 notebook 实例紧密交互，允许通过 LLM 辅助代码分析，并在专用 IPython 内核中执行代码。

### 主要功能

- 请求 AI 助手解释、调试或增强当前选择的代码单元
- 在辅助内核中执行代码，与用户的 notebook 内核隔离
- 在 notebook 界面内显示助手反馈、执行结果和建议
- 提供安全的原型设计环境

### 架构设计

该项目采用辅助微服务架构，包含以下组件：

1. **Jupyter 扩展**：提供用户界面集成
2. **后端服务**：处理 LLM 调用和代码执行
3. **IPython 内核**：执行用户代码的隔离环境

## 安装指南

### 使用 uv 安装环境

我们使用 uv 来管理项目环境，它提供了更快的依赖解析和虚拟环境管理。环境设置脚本使用清华大学PyPI镜像源（https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple）来加速包的下载和安装。

#### Windows 用户

```powershell
# 安装环境
.\setup_env.ps1

# 激活环境
.\.venv\Scripts\Activate.ps1
```

#### Linux/MacOS 用户

```bash
# 安装环境
chmod +x setup_env.sh
./setup_env.sh

# 激活环境
source .venv/bin/activate
```

### 启动应用程序

```bash
# 同时启动 Jupyter 和辅助应用
python launch.py

# 或者指定 Jupyter 类型和端口
python launch.py --jupyter lab --jupyter-port 8889 --sidecar-port 8001
```

## 项目结构

```
jupyter-llm-ext/
├── backend/         # 后端服务代码
│   └── src/         # 源代码
├── extension/       # Jupyter 扩展代码
├── examples/        # 示例 notebook
├── tests/           # 测试代码
├── requirements.txt # 依赖管理
├── setup.py         # 安装脚本
├── setup_env.ps1    # Windows 环境设置脚本
├── setup_env.sh     # Unix 环境设置脚本
└── launch.py        # 启动脚本
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

