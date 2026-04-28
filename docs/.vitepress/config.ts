import { defineConfig } from 'vitepress'

export default defineConfig({
  title: '罗大为 · 技术笔记',
  description: '全栈工程师技术笔记 · 业务梳理 · 部署 SOP',
  lang: 'zh-CN',
  lastUpdated: true,
  cleanUrls: true,

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
  ],

  themeConfig: {
    siteTitle: '罗大为 · 技术笔记',

    nav: [
      { text: '前端', link: '/frontend/javascript' },
      { text: '后端', link: '/backend/nodejs' },
      { text: '部署运维', link: '/devops/deployment' },
      { text: '桌面开发', link: '/desktop/electron' },
      { text: '业务梳理', link: '/business/overview' },
      { text: '工作流', link: '/workflow/standards' },
    ],

    sidebar: {
      '/frontend/': [
        {
          text: '前端',
          items: [
            { text: 'JavaScript 基础', link: '/frontend/javascript' },
            { text: 'CSS 布局', link: '/frontend/css' },
            { text: 'TypeScript', link: '/frontend/typescript' },
            { text: 'Vue 2 / Vue 3', link: '/frontend/vue' },
            { text: 'UniApp', link: '/frontend/uniapp' },
            { text: 'React 对比', link: '/frontend/react' },
            { text: 'RxJS', link: '/frontend/rxjs' },
          ],
        },
      ],
      '/backend/': [
        {
          text: '后端',
          items: [
            { text: 'Node.js & Mongoose', link: '/backend/nodejs' },
            { text: 'NestJS', link: '/backend/nestjs' },
            { text: 'Express & Koa', link: '/backend/express-koa' },
            { text: 'Go 语言', link: '/backend/go' },
          ],
        },
      ],
      '/devops/': [
        {
          text: '部署运维',
          items: [
            { text: '服务器部署完整流程', link: '/devops/deployment' },
            { text: 'Nginx 配置', link: '/devops/nginx' },
            { text: 'Docker 部署', link: '/devops/docker' },
            { text: 'Linux 常用命令', link: '/devops/linux' },
          ],
        },
      ],
      '/desktop/': [
        {
          text: '桌面开发',
          items: [
            { text: 'Electron 上手指南', link: '/desktop/electron' },
          ],
        },
      ],
      '/business/': [
        {
          text: '业务梳理',
          items: [
            { text: '业务整体概览', link: '/business/overview' },
            { text: '采购与入库', link: '/business/purchase' },
            { text: '库存管理', link: '/business/inventory' },
            { text: '寄售与托管', link: '/business/consignment' },
            { text: '数据库字段含义', link: '/business/fields' },
          ],
        },
      ],
      '/workflow/': [
        {
          text: '工作流',
          items: [
            { text: '代码规范', link: '/workflow/standards' },
            { text: '编辑器快捷键', link: '/workflow/shortcuts' },
            { text: '发测试流程', link: '/workflow/deploy-test' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/luodawei' },
    ],

    footer: {
      message: '基于 VitePress 构建',
      copyright: 'Copyright © 2025-2026 罗大为',
    },

    search: {
      provider: 'local',
    },

    outline: {
      level: [2, 3],
      label: '本页目录',
    },

    docFooter: {
      prev: '上一篇',
      next: '下一篇',
    },

    lastUpdatedText: '最后更新',

    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },
})
