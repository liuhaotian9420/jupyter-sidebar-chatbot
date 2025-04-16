# UV 配置指南

本项目使用 UV（Ultra Velocity）作为 Python 包安装和环境管理工具，替代传统的 pip 和 venv。UV 提供了更快的依赖解析和包安装速度。

## 为什么使用清华大学镜像源

为了加速中国大陆用户的包下载速度，本项目默认使用清华大学开源软件镜像站（TUNA）提供的 PyPI 镜像。这可以显著提高依赖安装速度。

## UV 配置方法

### 全局配置

要全局配置 UV 使用清华镜像源，可以创建以下配置文件：

**Windows:**
```
%USERPROFILE%\.uv\config.toml
```

**Linux/macOS:**
```
~/.uv/config.toml
```

配置内容：
```toml
[pip]
index-url = "https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple"
```

### 项目配置

本项目已在根目录提供了 `.uv/config.toml` 文件，指定使用清华镜像源。当你在项目目录中运行 UV 命令时，会自动使用此配置。

### 命令行指定

如果需要临时使用清华镜像源，可以在命令行中添加 `--index-url` 参数：

```bash
uv pip install package-name --index-url https://mirrors.tuna.tsinghua.edu.cn/pypi/web/simple
```

## 验证配置

要验证 UV 是否正在使用清华镜像源，可以运行以下命令安装一个小型包并观察下载 URL：

```bash
uv pip install --verbose httpx
```

输出中应显示正在从清华镜像源下载包。 