# 编辑器快捷键

## VS Code

| 快捷键 | 作用 |
|--------|------|
| `Shift + Alt + F` | 重新排列/格式化代码 |
| `Shift + Command + ↓` | 复制到下一行 |
| `Option + Command + ↓/↑` | 同时编辑多行 |
| `Shift + ←/→` | 同时编辑多列 |

## HBuilderX

| 快捷键 | 作用 |
|--------|------|
| `Win + K` | 重新排列/格式化代码 |

## macOS 通用

| 快捷键 | 作用 |
|--------|------|
| `Command + Option + Esc` | 重启某个程序 |
| `Option + Shift + .` | 访达中显示隐藏文件夹 |

## Vue VSCode Snippets

可以快速生成 Vue 代码的插件，推荐安装。

## Git 常用命令

```bash
# 查看状态
git status
git log --oneline -20

# 分支操作
git branch                    # 查看本地分支
git branch -a                 # 查看所有分支
git checkout 分支名           # 切换分支
git checkout -b 新分支        # 创建并切换

# 提交
git add .
git commit -m "提交信息"
git push
git pull

# 合并冲突
git stash                     # 临时保存改动
git stash pop                 # 恢复改动
git merge 分支名              # 合并分支
git rebase 分支名             # 变基合并

# 查看修改
git diff                      # 未暂存的改动
git diff --staged             # 已暂存的改动

# 撤销
git checkout 文件              # 撤销工作区改动
git reset HEAD 文件            # 撤销暂存
git reset --hard HEAD^         # 回退上一次提交（危险）

# 远程仓库
git remote -v                  # 查看远程仓库
git fetch                      # 拉取远程但不合并
git push origin 分支名         # 推送到指定分支
```

## Mac 终端常用快捷键

| 快捷键 | 作用 |
|--------|------|
| `Ctrl + A` | 移动到行首 |
| `Ctrl + E` | 移动到行尾 |
| `Ctrl + U` | 删除整行 |
| `Ctrl + K` | 从光标删除到行尾 |
| `Ctrl + W` | 删除光标前的一个单词 |
| `Ctrl + R` | 搜索历史命令 |
| `Command + K` | 清屏 |
| `Tab` | 自动补全 |
| `↑ / ↓` | 上下查看历史命令 |

## Claude Code 常用命令

```
/resume       选择之前的聊天记录
/effort       思考层度
/compact      压缩上下文
/clear        清空对话
```

## 提高 AI 编程效率的方法

| 需求 | 使用工具 |
|------|---------|
| 想知道"有哪些相关代码" | Explore agent |
| 想知道"怎么做"（方案未定） | Plan agent |
| 想知道"做完了安不安全" | `/security-review` |
| 其他（改代码、改样式、问问题）| 直接说 |
