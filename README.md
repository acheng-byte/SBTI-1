# SBTI 人格测试 · 二创增强版

> MBTI已经过时，SBTI来了。恋爱版 · 职场版 · 全新UI

## Fork 声明

本项目 Fork 自 **[pingfanfan/SBTI](https://github.com/pingfanfan/SBTI)**（MIT License），原始测试由 B站UP主 **[@蛆肉儿串儿](https://space.bilibili.com/417038183)**（UID: 417038183）原创。

在原版基础上新增：

- 🌹 **恋爱SBTI** — 专测恋爱人格，15维爱情模型
- 💼 **职场SBTI** — 专测职场人格，15维职场模型
- 🎴 **一键生成分享图** — Canvas 生成朋友圈卡片
- 📋 **历史记录** — 本地保存多次测试结果
- 👫 **双人对比** — 两人各测，看人格匹配度
- ✨ **全新UI** — 动效、动画、精品化视觉

## 在线体验

- 原版测试：[pingfanfan.github.io/SBTI](https://pingfanfan.github.io/SBTI/)

## 特性

- 🧠 **27种人格类型** — 25种标准类型 + 2种隐藏/兜底类型（原版保留）
- 🌹 **恋爱版独立题库** — 专为恋爱场景设计的15维度测评
- 💼 **职场版独立题库** — 专为职场场景设计的15维度测评
- 📊 **15个评估维度** — 自我、情感、态度、行动、社交五大模型
- 🎯 **曼哈顿距离匹配** — 基于15维向量的科学匹配算法
- 🍺 **隐藏彩蛋** — 酒鬼人格触发机制
- 📱 **移动端优先** — 响应式设计，手机体验友好
- 🔧 **易于定制** — 数据与代码分离，改 JSON 即可创建你自己的测试

## 项目结构

```
├── themes/
│   ├── original/            # 原版数据（完整保留）
│   ├── love/                # 恋爱SBTI数据
│   └── work/                # 职场SBTI数据
├── src/                     # 源代码
│   ├── engine.js            # 评分算法（纯函数，不变）
│   ├── quiz.js              # 答题流程控制
│   ├── result.js            # 结果页渲染
│   ├── share.js             # 分享图生成（新增）
│   ├── history.js           # 历史记录（新增）
│   ├── compare.js           # 双人对比（新增）
│   ├── chart.js             # 雷达图（Canvas API）
│   ├── utils.js             # 工具函数
│   ├── main.js              # 入口
│   └── style.css            # 样式（CSS变量多主题化）
├── docs/
│   └── analysis.md          # 数据分析报告
└── index.html
```

## 快速开始

```bash
# 克隆项目
git clone https://github.com/acheng-byte/SBTI-1.git
cd SBTI-1

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 定制你自己的测试

所有测试内容都在 `data/` 目录下，修改 JSON 文件即可定制，无需改动代码。

### 修改题目

编辑 `data/questions.json`，每道题的结构：

```json
{
  "id": "q1",
  "dim": "S1",
  "text": "你的题目文字",
  "options": [
    { "label": "选项A", "value": 1 },
    { "label": "选项B", "value": 2 },
    { "label": "选项C", "value": 3 }
  ]
}
```

- `dim` 指定该题属于哪个维度
- `value` 分值：1=低, 2=中, 3=高
- 每个维度需要恰好2道题

### 添加新人格类型

编辑 `data/types.json`，在 `standard` 数组中添加：

```json
{
  "code": "YOUR",
  "pattern": "HHH-HMH-MHH-HHH-MHM",
  "cn": "你的类型名",
  "intro": "一句话简介",
  "desc": "详细描述..."
}
```

`pattern` 是15个字母的L/M/H组合（按维度顺序：S1-S3, E1-E3, A1-A3, Ac1-Ac3, So1-So3），用 `-` 分隔每个模型。

### 调整评分参数

编辑 `data/config.json`：

```json
{
  "scoring": {
    "levelThresholds": { "L": [2, 3], "M": [4, 4], "H": [5, 6] },
    "fallbackThreshold": 60
  }
}
```

### 修改主题样式

编辑 `src/style.css` 顶部的 CSS 变量：

```css
:root {
  --bg: #f0f4f1;
  --accent: #4c6752;
  /* ... */
}
```

## 评分算法

1. **求和**：每维度2题分值相加（范围2-6）
2. **分级**：≤3 → L（低），4 → M（中），≥5 → H（高）
3. **向量化**：L=1, M=2, H=3，生成15维数值向量
4. **匹配**：计算用户向量与每种类型的曼哈顿距离
5. **排名**：距离升序 → 精准命中降序 → 相似度降序
6. **特殊覆盖**：酒鬼彩蛋 > 正常匹配 > 傻乐者兜底（<60%）

详见 [数据分析报告](docs/analysis.md)。

## 部署

### GitHub Pages（推荐）

Fork 本项目后，在 Settings → Pages → Source 选择 GitHub Actions 即可自动部署。

### Vercel / Netlify

直接连接 GitHub 仓库，零配置自动识别 Vite 项目。

### 手动部署

```bash
npm run build
# 将 dist/ 目录部署到任何静态服务器
```

## 技术栈

- [Vite](https://vitejs.dev/) — 构建工具
- 原生 JavaScript — 无框架依赖
- Canvas API — 雷达图渲染
- CSS Custom Properties — 主题化

## 致谢

- **原创测试**：B站UP主 [@蛆肉儿串儿](https://space.bilibili.com/417038183)（UID: 417038183）
- **原版代码**：[pingfanfan/SBTI](https://github.com/pingfanfan/SBTI)（MIT License）
- **原版体验**：[B站SBTI测试页面](https://www.bilibili.com/blackboard/era/VxiCX2CRqcqzPK9F.html)

## 声明

本测试仅供娱乐，请勿用于任何严肃场景。本项目为开源二创，遵循原项目 MIT 协议，完整保留原作者版权声明。如有侵权请联系删除。

## License

[MIT](LICENSE) — 原版权归 [pingfanfan](https://github.com/pingfanfan)，二创新增部分版权归本项目。
